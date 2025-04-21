"use server";

import { z } from "zod";
import { TeachingLabStaffModel } from "@/models/core/staff.model";
import { 
  TeachingLabStaffZodSchema, 
  TeachingLabStaffInputZodSchema,
  type TeachingLabStaff,
  type TeachingLabStaffInput
} from "@/lib/zod-schema/core/staff";
import { handleServerError } from "@/lib/error/handleServerError";
import { handleValidationError } from "@/lib/error/handleValidationError";
import { 
  createItem,
  updateItem,
  deleteItem,
} from "@/lib/server-utils";
import { fetchPaginatedResource, type FetchParams, getDefaultFetchParams } from "@/lib/server-utils/fetchPaginatedResource";
import { connectToDB } from "@/lib/db";

// Types
export type { TeachingLabStaff, TeachingLabStaffInput };

/** Fetch Teaching Lab Staff */
export async function fetchTeachingLabStaff(params: FetchParams = {}) {
  try {
    const fetchParams = getDefaultFetchParams({
      ...params,
      sortBy: params.sortBy ?? "staffName",
      sortOrder: params.sortOrder ?? "asc"
    });

    console.log("Fetching Teaching Lab staff with params:", fetchParams);

    return fetchPaginatedResource(
      TeachingLabStaffModel,
      TeachingLabStaffZodSchema,
      fetchParams
    );
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

// Create a new Teaching Lab staff member
export async function createTeachingLabStaff(data: TeachingLabStaffInput) {
  try {
    await connectToDB();
    
    const staff = await createItem(
      TeachingLabStaffModel,
      TeachingLabStaffInputZodSchema,
      data,
      ["/dashboard/staff"]
    );
    
    return staff;
  } catch (error) {
    console.error("Error creating Teaching Lab staff:", error);
    if (error instanceof z.ZodError) {
      throw handleValidationError(error);
    }
    throw handleServerError(error);
  }
}

// Update an existing Teaching Lab staff member
export async function updateTeachingLabStaff(id: string, data: Partial<TeachingLabStaffInput>) {
  try {
    await connectToDB();
    
    const staff = await updateItem(
      TeachingLabStaffModel,
      TeachingLabStaffInputZodSchema,
      id,
      data,
      ["/dashboard/staff"]
    );
    
    return staff;
  } catch (error) {
    console.error("Error updating Teaching Lab staff:", error);
    if (error instanceof z.ZodError) {
      throw handleValidationError(error);
    }
    throw handleServerError(error);
  }
}

// Delete a Teaching Lab staff member
export async function deleteTeachingLabStaff(id: string) {
  try {
    await connectToDB();
    
    const staff = await deleteItem(
      TeachingLabStaffModel,
      TeachingLabStaffZodSchema,
      id,
      ["/dashboard/staff"]
    );
    
    return staff;
  } catch (error) {
    console.error("Error deleting Teaching Lab staff:", error);
    throw handleServerError(error);
  }
} 