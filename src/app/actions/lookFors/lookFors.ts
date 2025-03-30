"use server";

import { z } from "zod";
import { LookForModel } from "@/models/look-fors";
import { 
  LookForZodSchema, 
  LookForInputZodSchema,
  type LookFor,
  type LookForInput
} from "@/lib/zod-schema/look-fors/look-for";
import { handleServerError } from "@/lib/error/handleServerError";
import { handleValidationError } from "@/lib/error/handleValidationError";
import { 
  executePaginatedQuery,
  sanitizeFilters,
  createItem,
  updateItem,
  deleteItem
} from "@/lib/server-utils";
import { bulkUploadToDB } from "@/lib/server-utils/bulkUpload";
import { uploadFileWithProgress } from "@/lib/server-utils/fileUpload";

// Define type alias for inferred input type
type InferLookForInput = z.infer<typeof LookForInputZodSchema>;

// Types
export type { LookFor, LookForInput };

/** Fetch Look-Fors */
export async function fetchLookFors({
  page = 1,
  limit = 10,
  filters = {},
  sortBy = "name",
  sortOrder = "asc",
}: {
  page?: number;
  limit?: number;
  filters?: Record<string, unknown>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
} = {}) {
  try {
    console.log("Fetching look-fors with params:", { page, limit, filters, sortBy, sortOrder });

    // Sanitize filters
    const sanitizedFilters = sanitizeFilters(filters);

    // Execute paginated query with LookForZodSchema for validation
    const result = await executePaginatedQuery(
      LookForModel,
      sanitizedFilters,
      LookForZodSchema, // Use full schema for returned documents
      {
        page,
        limit,
        sortBy,
        sortOrder
      }
    );

    return result;
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

// Create a new look-for
export async function createLookFor(data: InferLookForInput) {
  return createItem(LookForModel, LookForInputZodSchema, data, ["/look-fors", "/look-fors/[id]"]);
}

// Update a look-for
export async function updateLookFor(id: string, data: Partial<InferLookForInput>) {
  return updateItem(LookForModel, LookForInputZodSchema, id, data, ["/look-fors", "/look-fors/[id]"]);
}

// Delete a look-for
export async function deleteLookFor(id: string) {
  return deleteItem(LookForModel, LookForZodSchema, id, ["/look-fors", "/look-fors/[id]"]);
}

// Upload look-fors via file
export const uploadLookForFile = async (file: File): Promise<string> => {
  try {
    const result = await uploadFileWithProgress(file, "/api/look-fors/bulk-upload");
    return result.message;
  } catch (error) {
    throw handleServerError(error);
  }
};

// Upload look-fors data
export async function uploadLookFors(data: InferLookForInput[]) {
  try {
    const result = await bulkUploadToDB(data, LookForModel, LookForInputZodSchema, ["/look-fors"]);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error
      };
    }

    return {
      success: true,
      items: result.items
    };
  } catch (error) {
    console.error("Error uploading look-fors:", error);
    if (error instanceof z.ZodError) {
      throw handleValidationError(error);
    }
    throw handleServerError(error);
  }
}