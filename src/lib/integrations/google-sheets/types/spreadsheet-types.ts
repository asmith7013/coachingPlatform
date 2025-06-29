import { 
  DailyClassEventInput, 
  ZearnCompletionInput, 
  SnorklCompletionInput,
  Teachers,
  Sections,
  AttendanceStatusType
} from '@zod-schema/313/core';

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
  studentName: string;
  teacher: Teachers;
  section: Sections;
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
 * Result of normalizing a single row
 */
export interface NormalizationResult {
  success: boolean;
  data: {
    dailyEvents: DailyClassEventInput[];
    lessonCompletions: (ZearnCompletionInput | SnorklCompletionInput)[];
  };
  errors?: NormalizationError[];
  metadata: {
    zearnCompletionsCreated: number;
    snorklCompletionsCreated: number;
    dailyEventsCreated: number;
  };
}

/**
 * Error details for normalization failures
 */
export interface NormalizationError {
  type: 'validation' | 'parsing' | 'missing_column';
  message: string;
  field?: string;
}

/**
 * Result of processing multiple rows
 */
export interface BatchNormalizationResult {
  success: boolean;
  data: {
    dailyEvents: DailyClassEventInput[];
    lessonCompletions: (ZearnCompletionInput | SnorklCompletionInput)[];
  };
  errors: Array<{
    row: number;
    studentName?: string;
    errors: NormalizationError[];
  }>;
  metadata: {
    totalRows: number;
    successfulRows: number;
    failedRows: number;
    zearnCompletionsCreated: number;
    snorklCompletionsCreated: number;
    dailyEventsCreated: number;
  };
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