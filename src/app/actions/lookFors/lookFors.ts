"use server";

import { z } from "zod";
import { LookForModel } from "@mongoose-schema/look-fors";
import { 
  LookForZodSchema, 
  LookForInputZodSchema,
  type LookFor,
  type LookForInput
} from "@zod-schema/look-fors/look-for";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";
import { 
  createItem,
  updateItem,
  deleteItem,
} from "@data-server/crud/crud-operations";
import { fetchPaginatedResource } from "@data-utilities/pagination/paginated-query";
import { type QueryParams, buildQueryParams } from "@core-types/pagination";
import { sanitizeSortBy } from "@data-utilities/pagination/sort-utils";
import { bulkUploadToDB } from "@data-server/crud/bulk-operations";
import { uploadFileWithProgress } from "@data-server/file-handling/file-upload";
import { connectToDB } from "@data-server/db/connection";

// Valid sort fields for look-fors
const validSortFields = ['lookForIndex', 'topic', 'description', 'category', 'createdAt', 'updatedAt'];

// Define type alias for inferred input type
type InferLookForInput = z.infer<typeof LookForInputZodSchema>;

// Types
export type { LookFor, LookForInput };

/** Fetch Look-Fors */
export async function fetchLookFors(params: QueryParams = {}) {
  try {
    // Sanitize sortBy to ensure it's a valid field name
    const safeSortBy = sanitizeSortBy(params.sortBy, validSortFields, 'lookForIndex');
    
    const fetchParams = buildQueryParams({
      ...params,
      sortBy: safeSortBy,
      sortOrder: params.sortOrder ?? "asc"
    });

    console.log("Fetching look-fors with params:", fetchParams);

    return fetchPaginatedResource(
      LookForModel,
      LookForZodSchema,
      fetchParams
    );
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

// Create a new look-for
export async function createLookFor(data: InferLookForInput) {
  try {
    await connectToDB();
    return createItem(LookForModel, LookForInputZodSchema, data, ["/look-fors", "/look-fors/[id]"]);
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

// Update a look-for
export async function updateLookFor(id: string, data: Partial<InferLookForInput>) {
  try {
    await connectToDB();
    return updateItem(LookForModel, LookForInputZodSchema, id, data, ["/look-fors", "/look-fors/[id]"]);
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

// Delete a look-for
export async function deleteLookFor(id: string) {
  try {
    await connectToDB();
    return deleteItem(LookForModel, LookForZodSchema, id, ["/look-fors", "/look-fors/[id]"]);
  } catch (error) {
    throw new Error(handleServerError(error));
  }
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
    await connectToDB();
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