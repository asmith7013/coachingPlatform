"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { handleValidationError } from "@/lib/error/handle-validation-error";
import { handleServerError } from "@/lib/error/handle-server-error";
import { withDbConnection } from "@/lib/data-server/db/ensure-connection";

// Import services
import { 
  findPotentialVisitsToImport, 
  importSelectedVisits
} from "@/lib/integrations/monday/services/import-service";

import { syncVisitWithMondayService } from "@/lib/integrations/monday/services/sync-service";

// Import repository functions
import { 
  testConnection,
  fetchMondayBoard,
  fetchMondayBoards,
  fetchMondayUserByEmail
} from "@/lib/integrations/monday/client";

// Types
import type { 
  ImportItem,
  ImportPreview,
  ImportResult,
  MondayConnectionTestResult
} from "@/lib/integrations/monday/types";
import { VisitInputZodSchema } from "@/lib/data-schema/zod-schema/visits/visit";

// Re-export types for components
export type { ImportItem, ImportPreview };

/**
 * Test Monday.com API connection
 */
export async function testMondayConnection(): Promise<MondayConnectionTestResult> {
  try {
    return await testConnection();
  } catch (error) {
    return {
      success: false,
      error: handleServerError(error)
    };
  }
}

/**
 * Find potential visits to import from a Monday.com board
 */
export async function findVisitsToImport(boardId: string): Promise<ImportPreview[]> {
  return withDbConnection(async () => {
    try {
      // Validate input
      const { boardId: validBoardId } = z.object({
        boardId: z.string().min(1, "Board ID is required")
      }).parse({ boardId });
      
      return await findPotentialVisitsToImport(validBoardId);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(handleValidationError(error));
      }
      throw new Error(handleServerError(error));
    }
  });
}

/**
 * Import selected visits from Monday.com
 */
export async function importSelectedVisitsFromMonday(
  selectedItems: ImportItem[] | string[]
): Promise<ImportResult> {
  return withDbConnection(async () => {
    try {
      // Validate input
      if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
        return {
          success: false,
          imported: 0,
          errors: { general: "No items selected for import" },
          message: "No items selected for import"
        };
      }
      
      const result = await importSelectedVisits(selectedItems);
      
      // Revalidate paths
      revalidatePath("/dashboard/visits");
      
      return result;
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: { general: handleServerError(error) },
        message: `Import failed: ${handleServerError(error)}`
      };
    }
  });
}

/**
 * Get Monday.com board by ID
 */
export async function getMondayBoard(boardId: string, itemLimit = 20) {
  try {
    // Validate input
    const { boardId: validBoardId, itemLimit: validItemLimit } = z.object({
      boardId: z.string().min(1, "Board ID is required"),
      itemLimit: z.number().int().positive().default(20)
    }).parse({ boardId, itemLimit });
    
    return await fetchMondayBoard(validBoardId, validItemLimit);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: handleValidationError(error)
      };
    }
    return {
      success: false,
      error: handleServerError(error)
    };
  }
}

/**
 * Get all Monday.com boards
 */
export async function getMondayBoards() {
  try {
    return await fetchMondayBoards();
  } catch (error) {
    return {
      success: false,
      error: handleServerError(error)
    };
  }
}

/**
 * Get Monday.com user by email
 */
export async function getMondayUserByEmail(email: string) {
  try {
    // Validate input
    const { email: validEmail } = z.object({
      email: z.string().email("Valid email is required")
    }).parse({ email });
    
    return await fetchMondayUserByEmail(validEmail);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: handleValidationError(error)
      };
    }
    return {
      success: false,
      error: handleServerError(error)
    };
  }
}

/**
 * Sync a visit with Monday.com
 */
export async function syncVisitWithMonday(visitId: string) {
  return withDbConnection(async () => {
    try {
      // Validate input
      const { visitId: validVisitId } = z.object({
        visitId: z.string().min(1, "Visit ID is required")
      }).parse({ visitId });
      
      const result = await syncVisitWithMondayService(validVisitId);
      
      // Revalidate paths if successful
      if (result.success) {
        revalidatePath("/dashboard/visits");
      }
      
      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error)
        };
      }
      return {
        success: false,
        error: handleServerError(error)
      };
    }
  });
}

export async function completeAndImportVisit(data: unknown): Promise<{
  success: boolean;
  error?: string;
  data?: unknown;
}> {
  return withDbConnection(async () => {
    try {
      // Validate the input data
      const validatedData = VisitInputZodSchema.parse(data);
      
      // Import the visit
      const result = await importSelectedVisits([{
        id: validatedData.mondayItemId as string,
        completeData: validatedData
      }]);
      
      // Revalidate paths
      revalidatePath("/dashboard/visits");
      
      return {
        success: result.success,
        data: result
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
        error: handleServerError(error)
      };
    }
  });
}