import { 
  RawSpreadsheetRow, 
  SpreadsheetHeaders, 
  SpreadsheetNormalizationResult,
  BatchSpreadsheetResult
} from './types/spreadsheet-types';
import { SpreadsheetProcessor } from './processors/spreadsheet-processor';

/**
 * Normalize a single row to events with comprehensive error handling
 */
export function normalizeRowToEvents(
  rawRow: RawSpreadsheetRow,
  headers: SpreadsheetHeaders
): SpreadsheetNormalizationResult {
  const processor = new SpreadsheetProcessor(headers);
  return processor.processRow(rawRow, headers);
}

/**
 * Process multiple rows with comprehensive error tracking
 */
export function normalizeMultipleRows(
  rawRows: RawSpreadsheetRow[],
  headers: SpreadsheetHeaders
): BatchSpreadsheetResult {
  const processor = new SpreadsheetProcessor(headers);
  return processor.processRows(rawRows, headers);
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
    'First Name',
    'Last Name',
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
