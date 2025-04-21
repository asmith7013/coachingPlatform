"use server";

import { StaffMemberModel } from "@/models/core/staff.model";
import { 
  createItem,
  updateItem,
  deleteItem
} from "@/lib/server-utils";
import { fetchPaginatedResource, type FetchParams, getDefaultFetchParams } from "@/lib/server-utils/fetchPaginatedResource";
import { 
  StaffMemberZodSchema, 
  StaffMemberInputZodSchema,
  type StaffMember,
  type StaffMemberInput
} from "@/lib/zod-schema/core/staff";
import { handleServerError } from "@/lib/error/handleServerError";
import { connectToDB } from "@/lib/db";

// Types
export type { StaffMember, StaffMemberInput };

/** Fetch Staff Members */
export async function fetchStaffMembers(params: FetchParams = {}) {
  try {
    const fetchParams = getDefaultFetchParams({
      ...params,
      sortBy: params.sortBy ?? "staffName",
      sortOrder: params.sortOrder ?? "asc"
    });

    console.log("Fetching staff members with params:", fetchParams);

    return fetchPaginatedResource(
      StaffMemberModel,
      StaffMemberZodSchema,
      fetchParams
    );
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

/** Create Staff Member */
export async function createStaffMember(data: StaffMemberInput) {
  try {
    await connectToDB();
    return createItem(StaffMemberModel, StaffMemberInputZodSchema, data, ["/dashboard/staff"]);
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

/** Update Staff Member */
export async function updateStaffMember(id: string, data: Partial<StaffMemberInput>) {
  try {
    await connectToDB();
    return updateItem(StaffMemberModel, StaffMemberInputZodSchema, id, data, ["/dashboard/staff"]);
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

/** Delete Staff Member */
export async function deleteStaffMember(id: string) {
  try {
    await connectToDB();
    return deleteItem(StaffMemberModel, StaffMemberZodSchema, id, ["/dashboard/staff"]);
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

/** Fetch Base Staff */
export async function fetchBaseStaff(params: FetchParams = {}) {
  try {
    const fetchParams = getDefaultFetchParams({
      ...params,
      sortBy: params.sortBy ?? "staffName",
      sortOrder: params.sortOrder ?? "asc"
    });

    console.log("Fetching base staff with params:", fetchParams);

    return fetchPaginatedResource(
      StaffMemberModel,
      StaffMemberZodSchema,
      fetchParams
    );
  } catch (error) {
    throw new Error(handleServerError(error));
  }
} 