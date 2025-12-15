import { z } from "zod";
import { LessonCompletionModel, DailyClassEventModel } from "@/lib/schema/mongoose-schema/scm/core";
import { 
  DailyClassEventInputZodSchema,
  ZearnCompletionInputZodSchema,
  AssessmentCompletionInputZodSchema
} from "@/lib/schema/zod-schema/scm/core";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";
import { fetchSheetData, rowsToObjects } from "@/lib/integrations/google-sheets/client";
import { normalizeMultipleRows, validateHeaders } from "@/lib/integrations/google-sheets/data-processor";
import { SyncResult } from "../types/spreadsheet-types";

/**
 * API-safe service for syncing Google Sheets data to MongoDB
 * This service can be imported by both server actions and API routes
 */
export class GoogleSheetsSyncService {
  
  /**
   * Sync lesson data from Google Sheets to MongoDB
   * Note: This method does NOT use "use server" directive and can be imported anywhere
   */
  static async syncSheetsData(spreadsheetId: string, range: string = 'Full Data!A:Z'): Promise<SyncResult> {
    try {
      console.log('🔄 Starting Google Sheets sync...');
      
      // Fetch data from Google Sheets
      const sheetResult = await fetchSheetData(spreadsheetId, range);
      if (!sheetResult.success) {
        return {
          success: false,
          error: `Failed to fetch sheet data: ${sheetResult.error}`,
        };
      }
      
      if (sheetResult.data.length === 0) {
        return {
          success: true,
          error: 'No data found in sheet',
          processed: 0,
        };
      }

      // Extract headers and data rows
      const [headers] = sheetResult.data;
      
      // Validate headers first
      const headerValidation = validateHeaders(headers);
      if (!headerValidation.success) {
        return {
          success: false,
          error: `Invalid sheet structure: ${headerValidation.suggestions}`,
        };
      }
      
      // Convert rows to objects
      const rawRows = rowsToObjects<Record<string, string>>(sheetResult.data);
      
      console.log(`📊 Found ${rawRows.length} rows to process`);
      
      if (rawRows.length === 0) {
        return {
          success: true,
          error: 'No data rows to sync',
          processed: 0,
        };
      }
      
      // Process all rows using the new data processor
      const result = normalizeMultipleRows(rawRows, headers);
      
      console.log(`⚡ Processing result: ${result.metadata.successfulRows} successful, ${result.metadata.failedRows} failed`);
      console.log(`📈 Generated ${result.data.dailyEvents.length} daily events and ${result.data.lessonCompletions.length} lesson completions`);
      
      // Insert data into database
      let insertedDailyEvents = 0;
      let insertedLessonCompletions = 0;
      const insertErrors = [];
      
      // Insert daily events
      if (result.data.dailyEvents.length > 0) {
        try {
          const validatedDailyEvents = result.data.dailyEvents.map(event => 
            DailyClassEventInputZodSchema.parse(event)
          );
          
          const dailyEventResult = await DailyClassEventModel.insertMany(validatedDailyEvents, { 
            ordered: false 
          });
          
          insertedDailyEvents = dailyEventResult.length;
          console.log(`✅ Successfully inserted ${insertedDailyEvents} daily events`);
          
        } catch (error) {
          if (error && typeof error === 'object' && 'insertedDocs' in error) {
            const insertedDocs = (error as unknown as { insertedDocs: unknown[] }).insertedDocs;
            insertedDailyEvents = insertedDocs?.length || 0;
            console.log(`⚠️ Partial success: inserted ${insertedDailyEvents} daily events with some duplicates`);
          } else {
            console.error('❌ Daily events insert error:', error);
            insertErrors.push({
              type: 'daily_events',
              error: error instanceof Error ? error.message : 'Unknown insert error'
            });
          }
        }
      }
      
      // Insert lesson completions
      if (result.data.lessonCompletions.length > 0) {
        try {
          const validatedCompletions = result.data.lessonCompletions.map(completion => {
            if (completion.completionType === 'zearn') {
              return ZearnCompletionInputZodSchema.parse(completion);
            } else {
              return AssessmentCompletionInputZodSchema.parse(completion);
            }
          });
          
          const completionResult = await LessonCompletionModel.insertMany(validatedCompletions, { 
            ordered: false 
          });
          
          insertedLessonCompletions = completionResult.length;
          console.log(`✅ Successfully inserted ${insertedLessonCompletions} lesson completions`);
          
        } catch (error) {
          if (error && typeof error === 'object' && 'insertedDocs' in error) {
            const insertedDocs = (error as unknown as { insertedDocs: unknown[] }).insertedDocs;
            insertedLessonCompletions = insertedDocs?.length || 0;
            console.log(`⚠️ Partial success: inserted ${insertedLessonCompletions} lesson completions with some duplicates`);
          } else {
            console.error('❌ Lesson completions insert error:', error);
            insertErrors.push({
              type: 'lesson_completions',
              error: error instanceof Error ? error.message : 'Unknown insert error'
            });
          }
        }
      }
      
      return {
        success: result.success && insertErrors.length === 0,
        processed: result.metadata.totalRows,
        successfulRows: result.metadata.successfulRows,
        failedRows: result.metadata.failedRows,
        dailyEventsCreated: insertedDailyEvents,
        lessonCompletionsCreated: insertedLessonCompletions,
        zearnCompletions: result.metadata.zearnCompletionsCreated,
        snorklCompletions: result.metadata.snorklCompletionsCreated,
        error: insertErrors.length > 0 ? `Insert errors: ${insertErrors.map(e => e.error).join(', ')}` : undefined,
      };
      
    } catch (error) {
      console.error('❌ Sync failed:', error);
      
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error),
        };
      }
      
      return {
        success: false,
        error: handleServerError(error),
      };
    }
  }

  /**
   * Get sync status information
   */
  static async getSyncStatus() {
    try {
      // Get counts from both collections
      const dailyEventsCount = await DailyClassEventModel.countDocuments();
      const lessonCompletionsCount = await LessonCompletionModel.countDocuments();
      
      // Get latest records to determine last sync
      const latestDailyEvent = await DailyClassEventModel.findOne().sort({ updatedAt: -1 });
      const latestCompletion = await LessonCompletionModel.findOne().sort({ updatedAt: -1 });
      
      const lastSyncDate = latestDailyEvent?.updatedAt > latestCompletion?.updatedAt 
        ? latestDailyEvent.updatedAt 
        : latestCompletion?.updatedAt;
      
      return {
        success: true,
        data: {
          dailyEventsCount,
          lessonCompletionsCount,
          totalRecords: dailyEventsCount + lessonCompletionsCount,
          lastSync: lastSyncDate?.toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error),
      };
    }
  }
} 