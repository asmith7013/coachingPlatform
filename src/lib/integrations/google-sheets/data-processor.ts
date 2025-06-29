import { z } from 'zod';
import { 
  DailyClassEventInputZodSchema,
  ZearnCompletionInputZodSchema,
  SnorklCompletionInputZodSchema,
  DailyClassEventInput,
  ZearnCompletionInput,
  SnorklCompletionInput
} from '@zod-schema/313/core';
import { handleValidationError } from '@error/handlers/validation';
import { handleServerError } from '@error/handlers/server';
import { 
  RawSpreadsheetRow, 
  SpreadsheetHeaders, 
  NormalizationResult,
  BatchNormalizationResult,
  NormalizationError
} from './types/spreadsheet-types';
import { validateAndParseRow } from './validators/row-validator';
import { 
  createDailyClassEvent, 
  createZearnCompletions, 
  createSnorklCompletions 
} from './parsers/row-parser';

/**
 * Normalize a single row to events with comprehensive error handling
 */
export function normalizeRowToEvents(
  rawRow: RawSpreadsheetRow,
  headers: SpreadsheetHeaders
): NormalizationResult {
  try {
    // Step 1: Validate and parse row
    const validatedData = validateAndParseRow(rawRow, headers);
    
    // Step 2: Create events (these functions handle their own validation)
    const dailyEvent = createDailyClassEvent(validatedData);
    const zearnCompletions = createZearnCompletions(validatedData);
    const snorklCompletions = createSnorklCompletions(validatedData);
    
    // Step 3: Final validation using existing schemas
    const validatedDailyEvent = DailyClassEventInputZodSchema.parse(dailyEvent);
    const validatedZearn = zearnCompletions.map(c => ZearnCompletionInputZodSchema.parse(c));
    const validatedSnorkl = snorklCompletions.map(c => SnorklCompletionInputZodSchema.parse(c));
    
    return {
      success: true,
      data: {
        dailyEvents: [validatedDailyEvent],
        lessonCompletions: [...validatedZearn, ...validatedSnorkl],
      },
      metadata: {
        zearnCompletionsCreated: validatedZearn.length,
        snorklCompletionsCreated: validatedSnorkl.length,
        dailyEventsCreated: 1,
      },
    };
    
  } catch (error) {
    return {
      success: false,
      data: {
        dailyEvents: [],
        lessonCompletions: [],
      },
      errors: [{
        type: error instanceof z.ZodError ? 'validation' : 'parsing',
        message: error instanceof z.ZodError 
          ? handleValidationError(error)
          : error instanceof Error ? error.message : 'Unknown error occurred',
      }],
      metadata: {
        zearnCompletionsCreated: 0,
        snorklCompletionsCreated: 0,
        dailyEventsCreated: 0,
      },
    };
  }
}

/**
 * Process multiple rows with comprehensive error tracking
 */
export function normalizeMultipleRows(
  rawRows: RawSpreadsheetRow[],
  headers: SpreadsheetHeaders
): BatchNormalizationResult {
  const allDailyEvents: DailyClassEventInput[] = [];
  const allLessonCompletions: (ZearnCompletionInput | SnorklCompletionInput)[] = [];
  const processingErrors: Array<{
    row: number;
    studentName?: string;
    errors: NormalizationError[];
  }> = [];

  let successfulRows = 0;
  let totalZearnCompletions = 0;
  let totalSnorklCompletions = 0;
  let totalDailyEvents = 0;

  for (const [index, row] of rawRows.entries()) {
    try {
      const result = normalizeRowToEvents(row, headers);
      
      if (result.success) {
        allDailyEvents.push(...result.data.dailyEvents);
        allLessonCompletions.push(...result.data.lessonCompletions);
        successfulRows++;
        totalZearnCompletions += result.metadata.zearnCompletionsCreated;
        totalSnorklCompletions += result.metadata.snorklCompletionsCreated;
        totalDailyEvents += result.metadata.dailyEventsCreated;
      } else {
        processingErrors.push({
          row: index + 2, // +2 for header row and 1-based indexing
          studentName: row.Name || row.name || 'Unknown',
          errors: result.errors || [],
        });
      }
    } catch (error) {
      processingErrors.push({
        row: index + 2,
        studentName: row.Name || row.name || 'Unknown',
        errors: [{
          type: 'parsing' as const,
          message: handleServerError(error),
        }],
      });
    }
  }

  return {
    success: processingErrors.length === 0,
    data: {
      dailyEvents: allDailyEvents,
      lessonCompletions: allLessonCompletions,
    },
    errors: processingErrors,
    metadata: {
      totalRows: rawRows.length,
      successfulRows,
      failedRows: processingErrors.length,
      zearnCompletionsCreated: totalZearnCompletions,
      snorklCompletionsCreated: totalSnorklCompletions,
      dailyEventsCreated: totalDailyEvents,
    },
  };
}

/**
 * Validate headers before processing
 */
export function validateHeaders(headers: SpreadsheetHeaders): {
  success: boolean;
  missingRequired: string[];
  suggestions?: string;
} {
  const requiredColumns = [
    'Date',
    'Student ID', 
    'Name',
    'Teacher',
    'Section',
    'Class length (min)',
    'Attendance'
  ];

  const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
  const missingRequired: string[] = [];

  for (const required of requiredColumns) {
    const normalized = required.toLowerCase();
    if (!normalizedHeaders.includes(normalized)) {
      missingRequired.push(required);
    }
  }

  return {
    success: missingRequired.length === 0,
    missingRequired,
    suggestions: missingRequired.length > 0 
      ? `Missing required columns: ${missingRequired.join(', ')}. Available columns: ${headers.join(', ')}`
      : undefined
  };
}
