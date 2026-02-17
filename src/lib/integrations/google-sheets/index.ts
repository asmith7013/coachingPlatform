// Google Sheets integration exports
export * from "./client";
export * from "./data-processor";
export * from "./types/spreadsheet-types";

// Services
export { GoogleSheetsExportService } from "./services/export-service";
export { GoogleSheetsSyncService } from "./services/sync-service";
export { GoogleSheetsResetService } from "./services/reset-service";

// Main data processing functions
export {
  normalizeRowToEvents,
  normalizeMultipleRows,
  validateHeaders,
} from "./data-processor";

// Row validation and parsing utilities
export { validateAndParseRow, mapColumns } from "./validators/row-validator";

// Main processor class
export { SpreadsheetProcessor } from "./processors/spreadsheet-processor";

// Type exports
export type {
  SpreadsheetNormalizationResult,
  BatchSpreadsheetResult,
  RawSpreadsheetRow,
  SpreadsheetHeaders,
  SheetResetRequest,
  ResetResult,
  BatchResetResult,
  ResetOperation,
  SyncResult,
} from "./types/spreadsheet-types";

// Validator exports
export {
  SpreadsheetColumnMapper,
  SpreadsheetRowValidator,
} from "./validators/spreadsheet-validator";

// Event creation functions
export {
  createDailyClassEvent,
  createZearnCompletions,
  createSnorklCompletions,
} from "./parsers/row-parser";

// Import types for function signatures
import { SpreadsheetProcessor } from "./processors/spreadsheet-processor";
import {
  SpreadsheetNormalizationResult,
  BatchSpreadsheetResult,
  RawSpreadsheetRow,
  SpreadsheetHeaders,
} from "./types/spreadsheet-types";

/**
 * Simplified API following existing patterns
 */
export function createSpreadsheetProcessor(
  headers: SpreadsheetHeaders,
): SpreadsheetProcessor {
  return new SpreadsheetProcessor(headers);
}

/**
 * Quick processing functions for common use cases
 */
export function processSpreadsheetRow(
  row: RawSpreadsheetRow,
  headers: SpreadsheetHeaders,
): SpreadsheetNormalizationResult {
  const processor = createSpreadsheetProcessor(headers);
  return processor.processRow(row, headers);
}

export function processSpreadsheetRows(
  rows: RawSpreadsheetRow[],
  headers: SpreadsheetHeaders,
): BatchSpreadsheetResult {
  const processor = createSpreadsheetProcessor(headers);
  return processor.processRows(rows, headers);
}
