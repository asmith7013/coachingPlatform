"use server";

import { z } from "zod";
import { LookForModel } from "@/models/look-fors";
import { LookForZodSchema } from "@/lib/zod-schema/look-fors/look-for";
import { handleServerError } from "@/lib/error/handleServerError";
import { handleValidationError } from "@/lib/error/handleValidationError";
import { 
  executePaginatedQuery,
  sanitizeFilters,
  createItem,
  updateItem,
  deleteItem
} from "@/lib/server-utils";
import { bulkUpload } from "@/lib/server-utils/bulkUpload";

// Types
export type LookFor = z.infer<typeof LookForZodSchema>;
export type LookForCreate = Omit<LookFor, "_id" | "createdAt" | "updatedAt">;
export type LookForUpdate = Partial<LookForCreate>;

// Fetch look-fors with pagination, filtering, and sorting
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

    // Execute paginated query
    const result = await executePaginatedQuery(LookForModel, sanitizedFilters, {
      page,
      limit,
      sortBy,
      sortOrder
    });

    return {
      items: result.items,
      total: result.total,
      empty: result.empty
    };
  } catch (error) {
    console.error("Error fetching look-fors:", error);
    throw handleServerError(error);
  }
}

// Create a new look-for
export async function createLookFor(data: LookForCreate) {
  return createItem(LookForModel, LookForZodSchema, data, ["/look-fors", "/look-fors/[id]"]);
}

// Update a look-for
export async function updateLookFor(id: string, data: LookForUpdate) {
  return updateItem(LookForModel, LookForZodSchema, id, data, ["/look-fors", "/look-fors/[id]"]);
}

// Delete a look-for
export async function deleteLookFor(id: string) {
  return deleteItem(LookForModel, LookForZodSchema, id, ["/look-fors", "/look-fors/[id]"]);
}

// Upload look-fors data
export async function uploadLookFors(data: LookForCreate[]) {
  try {
    const result = await bulkUpload(data, LookForModel, LookForZodSchema, ["/look-fors"]);
    
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