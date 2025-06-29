// Google Sheets integration exports
export * from './client';
export * from './data-processor';
export * from './types/spreadsheet-types';

// Main data processing functions
export { 
  normalizeRowToEvents, 
  normalizeMultipleRows, 
  validateHeaders 
} from './data-processor';

// Row validation and parsing utilities
export { 
  validateAndParseRow, 
  mapColumns 
} from './validators/row-validator';

// Event creation functions
export { 
  createDailyClassEvent, 
  createZearnCompletions, 
  createSnorklCompletions 
} from './parsers/row-parser';

// Google Sheets client
export {
  fetchSheetData,
  rowsToObjects
} from './client';

// Types
export type {
  RawSpreadsheetRow,
  SpreadsheetHeaders,
  ValidatedRowData,
  MasteryDetail,
  NormalizationResult,
  NormalizationError,
  BatchNormalizationResult,
  ColumnAliases,
  ColumnMappingResult
} from './types/spreadsheet-types';
