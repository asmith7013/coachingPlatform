"use server";

import { z } from "zod";
import { NYCPSStaffModel } from "@mongoose-schema/core/staff.model";
import { 
  NYCPSStaffZodSchema, 
  NYCPSStaffInputZodSchema,
  type NYCPSStaffInput
} from "@zod-schema/core/staff";
import { handleServerError } from "@error/handle-server-error";
import { handleValidationError } from "@error/handle-validation-error";
import { 
  createItem,
  updateItem,
  deleteItem,
} from "@data-server/crud/crud-operations";
import { fetchPaginatedResource } from "@data-utilities/pagination/paginated-query";
import { type FetchParams, getDefaultFetchParams } from "@core-types/api";
import { bulkUploadToDB } from "@data-server/crud/bulk-operations";
import { uploadFileWithProgress } from "@data-server/file-handling/file-upload";
import { connectToDB } from "@data-server/db/connection";

/** Fetch NYCPS Staff */
export async function fetchNYCPSStaff(params: FetchParams = {}) {
  try {
    const fetchParams = getDefaultFetchParams({
      ...params,
      sortBy: params.sortBy ?? "staffName",
      sortOrder: params.sortOrder ?? "asc"
    });

    console.log("Fetching NYCPS staff with params:", fetchParams);

    return fetchPaginatedResource(
      NYCPSStaffModel,
      NYCPSStaffZodSchema,
      fetchParams
    );
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

/** Create NYCPS Staff */
export async function createNYCPSStaff(data: NYCPSStaffInput) {
  try {
    await connectToDB();
    const doc = await createItem(
      NYCPSStaffModel, 
      NYCPSStaffInputZodSchema, 
      data, 
      ["/dashboard/staff", "/dashboard/staff/[id]"]
    );
    return doc;
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

/** Update NYCPS Staff */
export async function updateNYCPSStaff(id: string, data: Partial<NYCPSStaffInput>) {
  try {
    await connectToDB();
    return updateItem(
      NYCPSStaffModel, 
      NYCPSStaffInputZodSchema, 
      id, 
      data, 
      ["/dashboard/staff", "/dashboard/staff/[id]"]
    );
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

/** Delete NYCPS Staff */
export async function deleteNYCPSStaff(id: string) {
  try {
    await connectToDB();
    return deleteItem(
      NYCPSStaffModel, 
      NYCPSStaffZodSchema, 
      id, 
      ["/dashboard/staff", "/dashboard/staff/[id]"]
    );
  } catch (error) {
    throw new Error(handleServerError(error));
  }
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
    await connectToDB();
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