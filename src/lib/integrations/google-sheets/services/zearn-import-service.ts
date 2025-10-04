import { appendSheetData } from '../client';
import { ZearnImportRecordInput } from '@zod-schema/313/zearn-import';
import { handleServerError } from '@error/handlers/server';

export class ZearnImportService {
  private static readonly ZEARN_SHEET_NAME = '🅩 Zearn Completions';
  
  constructor(private spreadsheetId: string) {}
  
  async importZearnCompletions(
    completions: ZearnImportRecordInput[],
    userEmail: string
  ) {
    try {
      // Transform to spreadsheet rows - each lesson completion becomes one row
    const rows = completions.map(completion => {
      // Extract just the date portion from lessonCompletionDate
      let dateOnly = completion.lessonCompletionDate;
      try {
        // If it's a parseable date, format it as MM/DD/YYYY
        const parsedDate = new Date(completion.lessonCompletionDate as string);
        if (!isNaN(parsedDate.getTime())) {
          dateOnly = parsedDate.toLocaleDateString('en-US');
        }
      } catch {
        // If parsing fails, keep original string
      }
      
      return [
        completion.date,
        completion.section,
        completion.teacher,
        completion.studentID,
        completion.firstName,
        completion.lastName,
        completion.lessonTitle,
        dateOnly, // Date without time
        completion.weekRange || '',
        completion.weeklyMinutes || '',
        new Date().toISOString(), // importedAt
        userEmail // importedBy
      ];
    });

      // // Transform to spreadsheet rows - each lesson completion becomes one row
      // const rows = completions.map(completion => [
      //   completion.date,
      //   completion.section,
      //   completion.teacher,
      //   completion.studentID,
      //   completion.firstName,
      //   completion.lastName,
      //   completion.lessonTitle,
      //   completion.lessonCompletionDate,
      //   completion.weekRange || '',
      //   completion.weeklyMinutes || '',
      //   new Date().toISOString(), // importedAt
      //   userEmail // importedBy
      // ]);
      
      const result = await appendSheetData(
        this.spreadsheetId,
        `${ZearnImportService.ZEARN_SHEET_NAME}!A:L`,
        rows as (string | number | boolean)[][]
      );
      
      if (!result.success) {
        throw new Error(`Failed to append Zearn data: ${result.error}`);
      }
      
      return {
        success: true,
        rowsAdded: rows.length,
        sheetName: ZearnImportService.ZEARN_SHEET_NAME,
        data: completions
      };
    } catch (error) {
      throw new Error(handleServerError(error, 'ZearnImport'));
    }
  }
} 