"use server";

import { z } from "zod";
import { NYCPSStaffModel } from "@/models/core/staff.model";
import { 
  NYCPSStaffZodSchema, 
  NYCPSStaffInputZodSchema,
  type NYCPSStaff,
  type NYCPSStaffInput
} from "@/lib/zod-schema/core/staff";
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
export type { NYCPSStaff, NYCPSStaffInput };

/** Fetch NYCPS Staff */
export async function fetchNYCPSStaff({
  page = 1,
  limit = 10,
  filters = {},
  sortBy = "staffName",
  sortOrder = "asc",
}: {
  page?: number;
  limit?: number;
  filters?: Record<string, unknown>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
} = {}) {
  try {
    console.log("Fetching NYCPS staff with params:", { page, limit, filters, sortBy, sortOrder });

    // Sanitize filters
    const sanitizedFilters = sanitizeFilters(filters);

    // Execute smart query with NYCPSStaffZodSchema for validation
    const result = await executeSmartQuery(
      NYCPSStaffModel,
      sanitizedFilters,
      NYCPSStaffZodSchema,
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

/** Create NYCPS Staff */
export async function createNYCPSStaff(data: NYCPSStaffInput) {
  return createItem(
    NYCPSStaffModel, 
    NYCPSStaffInputZodSchema, 
    data, 
    ["/dashboard/staff", "/dashboard/staff/[id]"]
  );
}

/** Update NYCPS Staff */
export async function updateNYCPSStaff(id: string, data: Partial<NYCPSStaffInput>) {
  return updateItem(
    NYCPSStaffModel, 
    NYCPSStaffInputZodSchema, 
    id, 
    data, 
    ["/dashboard/staff", "/dashboard/staff/[id]"]
  );
}

/** Delete NYCPS Staff */
export async function deleteNYCPSStaff(id: string) {
  return deleteItem(
    NYCPSStaffModel, 
    NYCPSStaffZodSchema, 
    id, 
    ["/dashboard/staff", "/dashboard/staff/[id]"]
  );
}

/** Upload NYCPS Staff via file */
export const uploadNYCPSStaffFile = async (file: File): Promise<string> => {
  try {
    const result = await uploadFileWithProgress(file, "/api/staff/bulk-upload");
    return result.message;
  } catch (error) {
    throw handleServerError(error);
  }
};

/** Upload NYCPS Staff data */
export async function uploadNYCPSStaff(data: NYCPSStaffInput[]) {
  try {
    const result = await bulkUploadToDB(
      data, 
      NYCPSStaffModel, 
      NYCPSStaffInputZodSchema, 
      ["/dashboard/staff"]
    );
    
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
    console.error("Error uploading NYCPS staff:", error);
    if (error instanceof z.ZodError) {
      throw handleValidationError(error);
    }
    throw handleServerError(error);
  }
} 