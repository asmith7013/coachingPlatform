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
  createItem,
  updateItem,
  deleteItem,
} from "@/lib/server-utils";
import { fetchPaginatedResource, type FetchParams, getDefaultFetchParams } from "@/lib/server-utils/fetchPaginatedResource";
import { sanitizeSortBy } from "@/lib/server-utils/sanitizeSortBy";
import { bulkUploadToDB } from "@/lib/server-utils/bulkUpload";
import { uploadFileWithProgress } from "@/lib/server-utils/fileUpload";
import { connectToDB } from "@/lib/db";

// Valid sort fields for look-fors
const validSortFields = ['lookForIndex', 'topic', 'description', 'category', 'createdAt', 'updatedAt'];

// Define type alias for inferred input type
type InferLookForInput = z.infer<typeof LookForInputZodSchema>;

// Types
export type { LookFor, LookForInput };

/** Fetch Look-Fors */
export async function fetchLookFors(params: FetchParams = {}) {
  try {
    // Sanitize sortBy to ensure it's a valid field name
    const safeSortBy = sanitizeSortBy(params.sortBy, validSortFields, 'lookForIndex');
    
    const fetchParams = getDefaultFetchParams({
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