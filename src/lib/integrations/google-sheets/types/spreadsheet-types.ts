import { z } from 'zod';

import { 
  DailyClassEventInput, 
  ZearnCompletionInput, 
  AssessmentCompletionInput,
  AttendanceStatusType,
} from '@zod-schema/313/core';
import { SyncResultZodSchema } from '@zod-schema/integrations/google-sheets-export';
import { CollectionResponse } from '@core-types/response';

// =====================================
// RAW SPREADSHEET TYPES
// =====================================

/**
 * Raw spreadsheet row as received from Google Sheets
 * All values come as strings initially
 */
export interface RawSpreadsheetRow {
  [columnName: string]: string;
}

/**
 * Headers array from the spreadsheet
 */
export type SpreadsheetHeaders = string[];

// =====================================
// VALIDATED ROW DATA
// =====================================

/**
 * Validated and typed row data after column mapping and parsing
 */
export interface ValidatedRowData {
  date: string;
  studentId: number;
  firstName: string;
  lastName: string;
  teacher: string;
  section: string;
  classLengthMin: number;
  attendance: AttendanceStatusType;
  instructionReceivedMin?: number;
  zearnCompletions: string; // Comma-separated lesson codes
  masteryAttempts: string;   // Comma-separated lesson codes
  mastery1: MasteryDetail | null;
  mastery2: MasteryDetail | null;
  mastery3: MasteryDetail | null;
  teacherInterventionMin: number;
  interventionNotes?: string;
  behaviorNotes?: string;
}

export type SyncResult = z.infer<typeof SyncResultZodSchema>;
/**
 * Individual mastery check detail
 */
export interface MasteryDetail {
  lesson: string;
  attempts: number;
  mastered: boolean;
}

// =====================================
// RESULT TYPES
// =====================================

/**
 * Result using existing response patterns
 */
export type SpreadsheetNormalizationResult = CollectionResponse<{
  dailyEvents: DailyClassEventInput[];
  lessonCompletions: (ZearnCompletionInput | AssessmentCompletionInput)[];
}>;

/**
 * Batch processing result matching the expected structure for sync-sheets action
 */
export interface BatchSpreadsheetResult {
  success: boolean;
  message?: string;
  data: {
    dailyEvents: DailyClassEventInput[];
    lessonCompletions: (ZearnCompletionInput | AssessmentCompletionInput)[];
  };
  metadata: {
    totalRows: number;
    successfulRows: number;
    failedRows: number;
    zearnCompletionsCreated: number;
    snorklCompletionsCreated: number;
    dailyEventsCreated: number;
  };
  errors: Array<{
    row?: number;
    studentName?: string;
    item?: unknown;
    error: string;
  }>;
}

// =====================================
// COLUMN MAPPING TYPES
// =====================================

/**
 * Column aliases for handling variations in spreadsheet headers
 */
export interface ColumnAliases {
  [normalizedColumnName: string]: string[];
}

/**
 * Result of column mapping
 */
export interface ColumnMappingResult {
  success: boolean;
  columnIndexes: Record<string, number>;
  missingColumns: string[];
} 