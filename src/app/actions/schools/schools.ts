"use server";

import { z } from "zod";
import { SchoolModel } from "@/lib/data-schema/mongoose-schema/core";
import { SchoolInputZodSchema, SchoolZodSchema, SchoolInput } from "@zod-schema/core/school";
import { handleServerError } from "@/lib/core/error/handle-server-error";
import { handleValidationError } from "@/lib/core/error/handle-validation-error";
import { 
  createItem,
  updateItem,
  deleteItem,
} from "@data-server/crud/crud-operations";
import { fetchPaginatedResource, type FetchParams, getDefaultFetchParams } from "@/lib/data-utilities/pagination/paginated-query";
import { sanitizeSortBy } from "@/lib/data-utilities/pagination/sort-utils";
import { bulkUploadToDB } from "@data-server/crud/bulk-operations";
import { uploadFileWithProgress } from "@/lib/data-server/file-handling/file-upload";
import { connectToDB } from "@/lib/data-server/db/connection";

// Valid sort fields for schools
const validSortFields = ['schoolName', 'createdAt', 'updatedAt', 'district'];

// Types
export type School = z.infer<typeof SchoolZodSchema>;
// export type SchoolCreate = Omit<School, "_id" | "createdAt" | "updatedAt">;
export type SchoolCreate = z.infer<typeof SchoolInputZodSchema>;
export type SchoolUpdate = Partial<SchoolCreate>;
/** Fetch Schools */
export async function fetchSchools(params: FetchParams = {}) {
  try {
    // Sanitize sortBy to ensure it's a valid field name
    const safeSortBy = sanitizeSortBy(params.sortBy, validSortFields, 'schoolName');
    
    const fetchParams = getDefaultFetchParams({
      ...params,
      sortBy: safeSortBy,
      sortOrder: params.sortOrder ?? "asc"
    });

    console.log("Fetching schools with params:", fetchParams);

    return fetchPaginatedResource(
      SchoolModel,
      SchoolZodSchema,
      fetchParams
    );
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

/** Create School */
export async function createSchool(data: SchoolInput) {
  try {
    await connectToDB();
    const doc = await createItem(SchoolModel, SchoolInputZodSchema, data, ["/schools", "/schools/[id]"]);
    return doc;
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

/** Update School */
export async function updateSchool(id: string, data: SchoolUpdate) {
  try {
    await connectToDB();
    return updateItem(SchoolModel, SchoolInputZodSchema, id, data, ["/schools", "/schools/[id]"]);
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

/** Delete School */
export async function deleteSchool(id: string) {
  try {
    await connectToDB();
    return deleteItem(SchoolModel, SchoolZodSchema, id, ["/schools", "/schools/[id]"]);
  } catch (error) {
    throw new Error(handleServerError(error));
  }
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
    await connectToDB();
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