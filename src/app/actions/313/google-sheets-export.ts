"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { handleValidationError } from "@/lib/error/handlers/validation";
import { handleServerError } from "@/lib/error/handlers/server";
import { withDbConnection } from "@/lib/server/db/ensure-connection";
import { GoogleSheetsExportService } from "@/lib/integrations/google-sheets/services/export-service";
import { EmailService } from "@/lib/integrations/google-sheets/services/email-service";
import { ExportConfigZodSchema, ExportResult } from "@/lib/schema/zod-schema/integrations/google-sheets-export";
import { EntityResponse } from "@/lib/types/core/response";

export async function exportAndResetDailySheets(
  config: unknown
): Promise<EntityResponse<ExportResult>> {
  return withDbConnection(async () => {
    try {
      // Validate input
      const validatedConfig = ExportConfigZodSchema.parse(config);
      
      // Create export service
      const exportService = new GoogleSheetsExportService(validatedConfig.spreadsheetId);
      
      // Perform export with optional sync
      const result = await exportService.exportAndResetDailyData(
        validatedConfig.userEmail,
        // validatedConfig.syncToMongoDB
        true
      );
      
      // Send email if duplicates found
      if (result.duplicatesFound) {
        const emailService = new EmailService();
        const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${validatedConfig.spreadsheetId}`;
        await emailService.sendDuplicateAlert(result, validatedConfig.userEmail, spreadsheetUrl);
      }
      
      // Revalidate paths if needed
      revalidatePath("/dashboard/integrations");
      
      return {
        success: true,
        data: result,
        message: `Export completed: ${result.totalRowsExported} rows exported from ${result.processedSheets.length} sheets${result.syncResult ? ` (MongoDB sync: ${result.syncResult.success ? 'success' : 'failed'})` : ''}`
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error),
          data: null as unknown as ExportResult
        };
      }
      
      return {
        success: false,
        error: handleServerError(error, "GoogleSheetsExport"),
        data: null as unknown as ExportResult
      };
    }
  });
}

export async function testGoogleSheetsConnection(spreadsheetId: string) {
  try {
    const validatedId = z.string().min(1, "Spreadsheet ID required").parse(spreadsheetId);
    
    const _exportService = new GoogleSheetsExportService(validatedId);
    // Test by getting metadata - need to add this method to the service
    // const metadata = await exportService.getSheetMetadata(validatedId);
    
    return {
      success: true,
      message: "Connection test functionality needs to be implemented"
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: handleValidationError(error)
      };
    }
    
    return {
      success: false,
      error: handleServerError(error, "GoogleSheetsConnectionTest")
    };
  }
} 