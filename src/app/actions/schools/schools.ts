"use server";

import { z } from "zod";
import { SchoolModel } from "@/models/core";
import { SchoolInputZodSchema, SchoolZodSchema, SchoolInput } from "@/lib/zod-schema/core/school";
import { handleServerError } from "@/lib/error/handleServerError";
import { handleValidationError } from "@/lib/error/handleValidationError";
import { 
  executeSmartQuery,
  sanitizeFilters,
  createItem,
  updateItem,
  deleteItem
} from "@/lib/server-utils";
import { bulkUploadToDB } from "@/lib/server-utils/bulkUpload";
import { uploadFileWithProgress } from "@/lib/server-utils/fileUpload";

// Types
export type School = z.infer<typeof SchoolZodSchema>;
// export type SchoolCreate = Omit<School, "_id" | "createdAt" | "updatedAt">;
export type SchoolCreate = z.infer<typeof SchoolInputZodSchema>;
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

    // Execute paginated query with SchoolZodSchema for validation
    const result = await executeSmartQuery(
      SchoolModel,
      sanitizedFilters,
      SchoolZodSchema,
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

/** Create School */
export async function createSchool(data: SchoolInput) {
  return createItem(SchoolModel, SchoolInputZodSchema, data, ["/schools", "/schools/[id]"]);
}

/** Update School */
export async function updateSchool(id: string, data: SchoolUpdate) {
  return updateItem(SchoolModel, SchoolInputZodSchema, id, data, ["/schools", "/schools/[id]"]);
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
    const result = await bulkUploadToDB(data, SchoolModel, SchoolInputZodSchema, ["/schools"]);
    
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