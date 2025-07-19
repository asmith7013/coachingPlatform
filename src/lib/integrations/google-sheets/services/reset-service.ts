import { handleServerError } from '@error/handlers/server';
import { 
  updateSheetRange, 
  clearSheetRange, 
  fetchSheetData
} from '../client';
import { 
  SheetResetRequest, 
  ResetResult, 
  BatchResetResult, 
  ResetOperation 
} from '../types/spreadsheet-types';

/**
 * Google Sheets Reset Service
 * Handles resetting daily sheets for next day operations
 * 
 * This service is API-safe and can be used by both server actions and API routes
 */
export class GoogleSheetsResetService {
  constructor(private spreadsheetId: string) {}

  /**
   * Reset sheet for next day by updating formulas and clearing intervention data
   */
  async resetSheetForNextDay(worksheetId: number, sheetName: string): Promise<ResetResult> {
    const operations: ResetOperation[] = [];
    
    try {
      // Operation 1: Update date formula in K1
      const dateOperation = await this.updateDateFormula(worksheetId, sheetName);
      operations.push(dateOperation);

      // Operation 2: Convert filter to static values and refresh
      const filterOperation = await this.convertFilterToStaticValues(worksheetId, sheetName);
      operations.push(filterOperation);

      // Operation 3: Set reset formulas for specific ranges
      const formulaOperation = await this.setResetFormulas(worksheetId, sheetName);
      operations.push(formulaOperation);

      // Operation 4: Clear intervention columns
      const clearOperation = await this.clearInterventionColumns(worksheetId, sheetName);
      operations.push(clearOperation);

      const success = operations.every(op => op.success);

      return {
        success,
        sheetName,
        operations,
        error: success ? undefined : 'Some reset operations failed'
      };
    } catch (error) {
      return {
        success: false,
        sheetName,
        operations,
        error: handleServerError(error)
      };
    }
  }

  /**
   * Reset multiple sheets in batch
   */
  async resetMultipleSheets(resetRequests: SheetResetRequest[]): Promise<BatchResetResult> {
    const results: ResetResult[] = [];
    let successfulResets = 0;

    for (const request of resetRequests) {
      try {
        const result = await this.resetSheetForNextDay(request.worksheetId, request.sheetName);
        results.push(result);
        if (result.success) {
          successfulResets++;
        }
      } catch (error) {
        results.push({
          success: false,
          sheetName: request.sheetName,
          operations: [],
          error: handleServerError(error)
        });
      }
    }

    return {
      totalSheets: resetRequests.length,
      successfulResets,
      failedResets: resetRequests.length - successfulResets,
      results
    };
  }

  /**
   * Update K1 cell to =TODAY() formula
   */
  private async updateDateFormula(worksheetId: number, sheetName: string): Promise<ResetOperation> {
    try {
      const range = `${sheetName}!O1`;
      const values = [['=TODAY()']];
      
      const result = await updateSheetRange(this.spreadsheetId, range, values);
      
      return {
        operation: 'updateDate',
        success: result.success,
        details: result.success ? 'Date formula updated to =TODAY()' : result.error
      };
    } catch (error) {
      return {
        operation: 'updateDate',
        success: false,
        details: handleServerError(error)
      };
    }
  }

  /**
   * Convert dynamic filter to static values and refresh with new students
   * Steps:
   * 1. Get current filter results from B3:F range
   * 2. Restore filter formula: =filter(Roster!A2:E,Roster!A2:A=M1)
   * 3. Force recalculation to get updated results
   * 4. Convert to static values
   */
  private async convertFilterToStaticValues(worksheetId: number, sheetName: string): Promise<ResetOperation> {
    try {
      // Step 1: Set the filter formula to refresh roster data
      const filterRange = `${sheetName}!B3`;
      const filterFormula = [['=filter(Roster!A2:E,Roster!A2:A=O1)']];
      
      const filterResult = await updateSheetRange(this.spreadsheetId, filterRange, filterFormula);
      if (!filterResult.success) {
        return {
          operation: 'convertFilter',
          success: false,
          details: `Failed to set filter formula: ${filterResult.error}`
        };
      }

      // Step 2: Wait a moment for the formula to calculate
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Get the calculated results
      const dataRange = `${sheetName}!B3:F50`;
      const dataResult = await fetchSheetData(this.spreadsheetId, dataRange);
      
      if (!dataResult.success) {
        return {
          operation: 'convertFilter',
          success: false,
          details: `Failed to fetch filter results: ${dataResult.error}`
        };
      }

      // Step 4: Convert to static values (paste values only)
      const staticResult = await updateSheetRange(this.spreadsheetId, dataRange, dataResult.data);
      
      return {
        operation: 'convertFilter',
        success: staticResult.success,
        details: staticResult.success 
          ? `Filter converted to static values (${dataResult.data.length} rows)`
          : staticResult.error
      };
    } catch (error) {
      return {
        operation: 'convertFilter',
        success: false,
        details: handleServerError(error)
      };
    }
  }

  /**
   * Set reset formulas for specific ranges:
   * - A3:A50 = =$K$1 (date reference)
   * - G3:G50 = ✅ (attendance checkmark)
   * - O3:O50 = =$H$1 (teacher reference)
   */
  private async setResetFormulas(worksheetId: number, sheetName: string): Promise<ResetOperation> {
    try {
      const operations = [];
      
      // Set date references A3:A50
      const dateRange = `${sheetName}!A3:A50`;
      const dateFormulas = Array(48).fill(null).map(() => ['=$K$1']);
      const dateResult = await updateSheetRange(this.spreadsheetId, dateRange, dateFormulas);
      operations.push(`Date formulas: ${dateResult.success ? 'success' : 'failed'}`);

      // Set attendance checkmarks G3:G50
      const attendanceRange = `${sheetName}!G3:G50`;
      const attendanceValues = Array(48).fill(null).map(() => ['✅']);
      const attendanceResult = await updateSheetRange(this.spreadsheetId, attendanceRange, attendanceValues);
      operations.push(`Attendance checkmarks: ${attendanceResult.success ? 'success' : 'failed'}`);

      // Set teacher references O3:O50
      const teacherRange = `${sheetName}!O3:O50`;
      const teacherFormulas = Array(48).fill(null).map(() => ['=$H$1']);
      const teacherResult = await updateSheetRange(this.spreadsheetId, teacherRange, teacherFormulas);
      operations.push(`Teacher references: ${teacherResult.success ? 'success' : 'failed'}`);

      const success = dateResult.success && attendanceResult.success && teacherResult.success;

      return {
        operation: 'setFormulas',
        success,
        details: operations.join(', ')
      };
    } catch (error) {
      return {
        operation: 'setFormulas',
        success: false,
        details: handleServerError(error)
      };
    }
  }

  /**
   * Clear intervention columns (H3:K50)
   */
  private async clearInterventionColumns(worksheetId: number, sheetName: string): Promise<ResetOperation> {
    try {
      const range = `${sheetName}!H3:K50`;
      const result = await clearSheetRange(this.spreadsheetId, range);
      
      return {
        operation: 'clearInterventions',
        success: result.success,
        details: result.success 
          ? 'Intervention columns cleared (H3:K50)'
          : result.error
      };
    } catch (error) {
      return {
        operation: 'clearInterventions',
        success: false,
        details: handleServerError(error)
      };
    }
  }

  /**
   * Get reset service status and capabilities
   */
  async getResetCapabilities() {
    return {
      supportedOperations: [
        'updateDate',
        'convertFilter', 
        'setFormulas',
        'clearInterventions'
      ],
      batchResetSupported: true,
      maxBatchSize: 50
    };
  }
} 