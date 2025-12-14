import { validateArraySafe } from '@data-processing/validation/zod-validation';
import { createCollectionResponse } from '@/lib/server/api/responses/action-response-helper';
import { handleServerError } from '@error/handlers/server';
import { 
  DailyClassEventInputZodSchema,
  ZearnCompletionInputZodSchema,
  AssessmentCompletionInputZodSchema,
  DailyClassEventInput,
  ZearnCompletionInput,
  AssessmentCompletionInput
} from '@zod-schema/scm/core';
import { SpreadsheetColumnMapper, SpreadsheetRowValidator } from '../validators/spreadsheet-validator';
import { createDailyClassEvent, createZearnCompletions, createSnorklCompletions } from '../parsers/row-parser';
import { 
  SpreadsheetHeaders, 
  RawSpreadsheetRow, 
  SpreadsheetNormalizationResult, 
  BatchSpreadsheetResult 
} from '../types/spreadsheet-types';

export class SpreadsheetProcessor {
  private mapper: SpreadsheetColumnMapper;
  private validator: SpreadsheetRowValidator;
  
  constructor(headers: SpreadsheetHeaders) {
    this.mapper = new SpreadsheetColumnMapper(headers);
    this.validator = new SpreadsheetRowValidator(this.mapper);
  }
  
  /**
   * Process single row using existing validation patterns
   */
  public processRow(row: RawSpreadsheetRow, headers: SpreadsheetHeaders): SpreadsheetNormalizationResult {
    try {
      const validatedData = this.validator.validateRow(row, headers);
      if (!validatedData) {
        return createCollectionResponse([], 'Row validation failed');
      }
      
      // Create events using existing parsers
      const dailyEvent = createDailyClassEvent(validatedData);
      const zearnCompletions = createZearnCompletions(validatedData);
      const snorklCompletions = createSnorklCompletions(validatedData);
      
      // Validate using existing schemas
      const validatedDaily = validateArraySafe(DailyClassEventInputZodSchema, [dailyEvent]);
      const validatedZearn = validateArraySafe(ZearnCompletionInputZodSchema, zearnCompletions);
      const validatedSnorkl = validateArraySafe(AssessmentCompletionInputZodSchema, snorklCompletions);
      
      return createCollectionResponse([{
        dailyEvents: validatedDaily,
        lessonCompletions: [...validatedZearn, ...validatedSnorkl]
      }], 'Row processed successfully');
      
    } catch (error) {
      return createCollectionResponse([], handleServerError(error, 'SpreadsheetRowProcessing'));
    }
  }
  
  /**
   * Process multiple rows matching the expected structure for sync-sheets action
   */
  public processRows(rows: RawSpreadsheetRow[], headers: SpreadsheetHeaders): BatchSpreadsheetResult {
    try {
      const headerValidation = this.mapper.validateHeaders();
      if (!headerValidation.success) {
        return {
          success: false,
          message: `Missing required columns: ${headerValidation.missingColumns.join(', ')}`,
          data: {
            dailyEvents: [],
            lessonCompletions: []
          },
          metadata: {
            totalRows: rows.length,
            successfulRows: 0,
            failedRows: rows.length,
            zearnCompletionsCreated: 0,
            snorklCompletionsCreated: 0,
            dailyEventsCreated: 0
          },
          errors: headerValidation.missingColumns.map(col => ({
            error: `Missing required column: ${col}`
          }))
        };
      }
      
      const allDailyEvents: DailyClassEventInput[] = [];
      const allLessonCompletions: (ZearnCompletionInput | AssessmentCompletionInput)[] = [];
      const errors: Array<{ row?: number; studentName?: string; item?: unknown; error: string }> = [];
      
      let successfulRows = 0;
      let zearnCompletionsCreated = 0;
      let snorklCompletionsCreated = 0;
      
      rows.forEach((row, index) => {
        try {
          const result = this.processRow(row, headers);
          if (result.success && result.items.length > 0) {
            const data = result.items[0];
            allDailyEvents.push(...data.dailyEvents);
            allLessonCompletions.push(...data.lessonCompletions);
            
            // Count completions by type
            data.lessonCompletions.forEach(completion => {
              if (completion.completionType === 'zearn') {
                zearnCompletionsCreated++;
              } else {
                snorklCompletionsCreated++;
              }
            });
            
            successfulRows++;
          } else {
            errors.push({
              row: index + 2, // +2 for header row and 1-based indexing
              studentName: row.Name || row.name || 'Unknown',
              error: result.message || `Failed to process row ${index + 1}`
            });
          }
        } catch (error) {
          errors.push({
            row: index + 2,
            studentName: row.Name || row.name || 'Unknown',
            error: handleServerError(error, `Row ${index + 1}`)
          });
        }
      });
      
      return {
        success: errors.length === 0,
        message: `Processed ${successfulRows} of ${rows.length} rows successfully`,
        data: {
          dailyEvents: allDailyEvents,
          lessonCompletions: allLessonCompletions
        },
        metadata: {
          totalRows: rows.length,
          successfulRows,
          failedRows: errors.length,
          zearnCompletionsCreated,
          snorklCompletionsCreated,
          dailyEventsCreated: allDailyEvents.length
        },
        errors
      };
      
    } catch (error) {
      return {
        success: false,
        message: handleServerError(error, 'SpreadsheetBatchProcessing'),
        data: {
          dailyEvents: [],
          lessonCompletions: []
        },
        metadata: {
          totalRows: rows.length,
          successfulRows: 0,
          failedRows: rows.length,
          zearnCompletionsCreated: 0,
          snorklCompletionsCreated: 0,
          dailyEventsCreated: 0
        },
        errors: [{ error: handleServerError(error) }]
      };
    }
  }
} 