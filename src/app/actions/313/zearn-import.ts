"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { handleValidationError } from "@/lib/error/handlers/validation";
import { handleServerError } from "@/lib/error/handlers/server";
import { withDbConnection } from "@/lib/server/db/ensure-connection";
import { ZearnImportService } from "@/lib/integrations/google-sheets/services/zearn-import-service";
import { ZearnImportRecordInputZodSchema, ZearnImportRecordInput } from "@zod-schema/313/zearn-import";
import { EntityResponse } from "@/lib/types/core/response";

const ZearnImportConfigSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID required"),
  completions: z.array(ZearnImportRecordInputZodSchema),
  userEmail: z.string().email("Valid email required")
});

type ZearnImportResult = {
  success: boolean;
  rowsAdded: number;
  sheetName: string;
  data: ZearnImportRecordInput[];
};

export async function importZearnData(
  config: unknown
): Promise<EntityResponse<ZearnImportResult>> {
  return withDbConnection(async () => {
    try {
      const validatedConfig = ZearnImportConfigSchema.parse(config);
      
      const importService = new ZearnImportService(validatedConfig.spreadsheetId);
      const result = await importService.importZearnCompletions(
        validatedConfig.completions,
        validatedConfig.userEmail
      );
      
      revalidatePath("/dashboard/zearn-import");
      
      return {
        success: true,
        data: result,
        message: `Successfully imported ${result.rowsAdded} Zearn completion records`
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error),
          data: null as unknown as ZearnImportResult
        };
      }
      
      return {
        success: false,
        error: handleServerError(error, "ZearnImport"),
        data: null as unknown as ZearnImportResult
      };
    }
  });
} 