import { 
  getSheetMetadata, 
  fetchSheetData, 
  appendSheetData
} from '../client';
import { handleServerError } from '@error/handlers/server';
import { ExportResult } from '@zod-schema/integrations/google-sheets-export';
import { GoogleSheetsSyncService } from './sync-service';
import { SyncResult } from '../types/spreadsheet-types';


interface DuplicateDetail {
  existing: string;
  new: string;
  studentId: string;
}



export class GoogleSheetsExportService {
  private static readonly DAILY_SHEET_PREFIX = 'Daily - ';
  private static readonly COMBINED_DATA_SHEET = 'Combined Data';
  private static readonly DEBUG_LOG_SHEET = 'Full Export Log';

  constructor(private spreadsheetId: string) {}

  async exportAndResetDailyData(
    userEmail: string, 
    syncToMongoDB = false
  ): Promise<ExportResult & { syncResult?: SyncResult }> {
    try {
      // Step 1: Find all Daily sheets
      const dailySheets = await this.findDailySheets();
      
      if (dailySheets.length === 0) {
        throw new Error(`No sheets found starting with "${GoogleSheetsExportService.DAILY_SHEET_PREFIX}"`);
      }

      // Step 2: Process each sheet
      const processedSheets = [];
      let totalRowsExported = 0;
      const allDuplicateDetails: DuplicateDetail[] = [];

      for (const sheet of dailySheets) {
        try {
          const result = await this.processSheet(sheet, new Date(), userEmail);
          processedSheets.push({
            name: sheet.properties?.title || 'Unknown Sheet',
            rowsExported: result.rowsExported,
            duplicatesFound: result.duplicatesFound
          });
          
          totalRowsExported += result.rowsExported;
          if (result.duplicateDetails) {
            allDuplicateDetails.push(...result.duplicateDetails);
          }
        } catch (error) {
          processedSheets.push({
            name: sheet.properties?.title || 'Unknown Sheet',
            rowsExported: 0,
            duplicatesFound: false,
            error: handleServerError(error)
          });
        }
      }

      const exportResult: ExportResult = {
        totalRowsExported,
        processedSheets,
        duplicatesFound: allDuplicateDetails.length > 0,
        duplicateDetails: allDuplicateDetails
      };

      // Optional MongoDB sync using API-safe service
      if (syncToMongoDB && totalRowsExported > 0) {
        try {
          console.log('‼️ Syncing data to MongoDB...');
          
          // Use the API-safe service instead of importing server action
          const syncResult = await GoogleSheetsSyncService.syncSheetsData(
            this.spreadsheetId, 
            'Combined Data!A:Z'
          );
          
          return { 
            ...exportResult, 
            syncResult
          };
        } catch (error) {
          console.warn('Export succeeded but MongoDB sync failed:', error);
          return { 
            ...exportResult, 
            syncResult: {
              success: false,
              error: handleServerError(error)
            }
          };
        }
      }

      return exportResult;
    } catch (error) {
      throw new Error(handleServerError(error, 'GoogleSheetsExport'));
    }
  }

  private async findDailySheets() {
    const metadata = await getSheetMetadata(this.spreadsheetId);
    if (!metadata.success || !metadata.data) {
      throw new Error(`Failed to get spreadsheet metadata: ${metadata.error}`);
    }

    return metadata.data.sheets?.filter(sheet => 
      sheet.properties?.title?.startsWith(GoogleSheetsExportService.DAILY_SHEET_PREFIX)
    ) || [];
  }

  private async processSheet(sheet: unknown, exportDate: Date, userEmail: string) {
    const sheetTitle = (sheet as { properties?: { title?: string } })?.properties?.title || 'Unknown Sheet';
    
    // Step 1: Export to Combined Data
    const exportResult = await this.exportToCombinedData(sheetTitle, exportDate);
    
    // Step 2: Log to Debug Sheet
    await this.logToDebugSheet(sheetTitle, exportDate, userEmail);
    
    // Step 3: Reset sheet (commented out for safety - uncomment when ready)
    // await this.resetSheetForNextDay(sheetTitle);
    
    return exportResult;
  }

  private async exportToCombinedData(sheetTitle: string, exportDate: Date) {
    // Read with one extra column to prevent truncation
    const dataResult = await fetchSheetData(this.spreadsheetId, `${sheetTitle}!A3:J50`);
    if (!dataResult.success) {
      throw new Error(`Failed to read data from ${sheetTitle}: ${dataResult.error}`);
    }

    // Filter for rows with data and pad to 9 columns if truncated
    const dataRows = dataResult.data
      .filter(row => row[4] && row[4].toString().trim() !== '') // First Name column (E=4)
      .map(row => {
        // Ensure row has 9 columns (pad if truncated by API)
        const paddedRow = [...row];
        while (paddedRow.length < 9) paddedRow.push('');
        return [...paddedRow.slice(0, 9), exportDate.toISOString(), sheetTitle];
      });

    if (dataRows.length === 0) {
      return { rowsExported: 0, duplicatesFound: false, duplicateDetails: [] };
    }

    // Check for duplicates - pass the sheet title
    const duplicateResult = await this.checkForDuplicates(dataRows, exportDate, sheetTitle);

    // Append to Combined Data sheet
    const appendResult = await appendSheetData(
      this.spreadsheetId, 
      `${GoogleSheetsExportService.COMBINED_DATA_SHEET}!A:L`, 
      dataRows
    );

    if (!appendResult.success) {
      throw new Error(`Failed to append data: ${appendResult.error}`);
    }

    return {
      rowsExported: dataRows.length,
      duplicatesFound: duplicateResult.found,
      duplicateDetails: duplicateResult.details
    };
  }

  private async checkForDuplicates(newDataRows: (string | number | boolean)[][], exportDate: Date, sheetName: string) {
    const exportDateStr = exportDate.toLocaleDateString();
    
    // Read existing Combined Data
    const existingResult = await fetchSheetData(
      this.spreadsheetId, 
      `${GoogleSheetsExportService.COMBINED_DATA_SHEET}!A:L`
    );

    if (!existingResult.success) {
      return { found: false, details: [] };
    }

    const duplicates: DuplicateDetail[] = [];
    
    // Check each new row against existing data
    newDataRows.forEach(newRow => {
      // Correct column indexes based on your table structure:
      // A=Date(0), B=Section(1), C=Teacher(2), D=Student ID(3), E=First Name(4), F=Last Name(5)
      const newStudentId = newRow[3]?.toString() || ''; // Student ID is column D (index 3)
      const newFirstName = newRow[4]?.toString() || ''; // First Name is column E (index 4)  
      const newLastName = newRow[5]?.toString() || ''; // Last Name is column F (index 5)

      existingResult.data.forEach(existingRow => {
        const existingStudentId = existingRow[3]?.toString() || ''; // Student ID column D
        const existingFirstName = existingRow[4]?.toString() || ''; // First Name column E
        const existingLastName = existingRow[5]?.toString() || ''; // Last Name column F
        const existingExportDate = existingRow[existingRow.length - 2]?.toString() || ''; // Export Date column
        const existingSheetName = existingRow[existingRow.length - 1]?.toString() || 'Unknown Sheet'; // Last column is sheet name

        if (existingExportDate && new Date(existingExportDate).toLocaleDateString() === exportDateStr) {
          if (newStudentId === existingStudentId || 
              (newFirstName === existingFirstName && newLastName === existingLastName)) {
            duplicates.push({
              existing: `${existingFirstName} ${existingLastName} - Export ${existingExportDate} (from ${existingSheetName})`,
              new: `${newFirstName} ${newLastName} - Export ${exportDateStr} (from ${sheetName})`,
              studentId: newStudentId
            });
          }
        }
      });
    });

    return { found: duplicates.length > 0, details: duplicates };
  }

  private async logToDebugSheet(sheetTitle: string, exportDate: Date, userEmail: string) {
    // Read all data from current sheet
    const dataResult = await fetchSheetData(this.spreadsheetId, `${sheetTitle}!A:K`);
    if (!dataResult.success) return;

    // Add metadata columns
    const debugRows = dataResult.data
      .filter(row => row.some(cell => cell && cell.toString().trim() !== ''))
      .map((row, index) => [...row, exportDate.toISOString(), userEmail, index + 1]);

    if (debugRows.length > 0) {
      await appendSheetData(
        this.spreadsheetId, 
        `${GoogleSheetsExportService.DEBUG_LOG_SHEET}!A:N`, 
        debugRows
      );
    }
  }

  // Commented out for safety - uncomment when ready to implement reset functionality
  // private async resetSheetForNextDay(sheetTitle: string) {
  //   // Implementation for sheet reset functionality
  // }
} 