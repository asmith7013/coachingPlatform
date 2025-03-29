"use server";

import { z } from "zod";
import { SchoolModel } from "@/models/core";
import { SchoolZodSchema } from "@/lib/zod-schema/core/school";
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
import { uploadFileWithProgress } from "@/lib/server-utils/fileUpload";

// Types
export type School = z.infer<typeof SchoolZodSchema>;
export type SchoolCreate = Omit<School, "_id" | "createdAt" | "updatedAt">;
export type SchoolUpdate = Partial<SchoolCreate>;

/** Fetch Schools */
export async function fetchSchools({
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
    console.log("Fetching schools with params:", { page, limit, filters, sortBy, sortOrder });

    // Sanitize filters
    const sanitizedFilters = sanitizeFilters(filters);

    // Execute paginated query
    const result = await executePaginatedQuery(SchoolModel, sanitizedFilters, {
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
    console.error("Error fetching schools:", error);
    throw handleServerError(error);
  }
}

/** Create School */
export async function createSchool(data: SchoolCreate) {
  return createItem(SchoolModel, SchoolZodSchema, data, ["/schools", "/schools/[id]"]);
}

/** Update School */
export async function updateSchool(id: string, data: SchoolUpdate) {
  return updateItem(SchoolModel, SchoolZodSchema, id, data, ["/schools", "/schools/[id]"]);
}

/** Delete School */
export async function deleteSchool(id: string) {
  return deleteItem(SchoolModel, SchoolZodSchema, id, ["/schools", "/schools/[id]"]);
}

/** Upload Schools via file */
export const uploadSchoolFile = async (file: File): Promise<string> => {
  try {
    const result = await uploadFileWithProgress(file, "/api/schools/bulk-upload");
    return result.message;
  } catch (error) {
    throw handleServerError(error);
  }
};

/** Upload schools data */
export async function uploadSchools(data: SchoolCreate[]) {
  try {
    const result = await bulkUpload(data, SchoolModel, SchoolZodSchema, ["/schools"]);
    
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
    console.error("Error uploading schools:", error);
    if (error instanceof z.ZodError) {
      throw handleValidationError(error);
    }
    throw handleServerError(error);
  }
}