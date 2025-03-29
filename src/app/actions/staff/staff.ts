"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { 
  executePaginatedQuery,
  sanitizeFilters,
  createItem,
  updateItem,
} from "@/lib/server-utils";
import { 
  getStaffModelAndSchema, 
  determineStaffType,
  type StaffType,
  type StaffUnion
} from "@/lib/server-utils/staff";
import { bulkUpload } from "@/lib/server-utils/bulkUpload";
import { StaffMemberZodSchema, NYCPSStaffZodSchema, TeachingLabStaffZodSchema } from "@/lib/zod-schema/core/staff";
import { StaffMemberModel, NYCPSStaffModel, TeachingLabStaffModel } from "@/models/core/staff.model";

// Types
export type StaffMember = z.infer<typeof StaffMemberZodSchema>;
export type NYCPSStaff = z.infer<typeof NYCPSStaffZodSchema>;
export type TeachingLabStaff = z.infer<typeof TeachingLabStaffZodSchema>;

export type StaffMemberCreate = Omit<StaffMember, "_id" | "createdAt" | "updatedAt">;
export type NYCPSStaffCreate = Omit<NYCPSStaff, "_id" | "createdAt" | "updatedAt">;
export type TeachingLabStaffCreate = Omit<TeachingLabStaff, "_id" | "createdAt" | "updatedAt">;

export type StaffMemberUpdate = Partial<StaffMemberCreate>;
export type NYCPSStaffUpdate = Partial<NYCPSStaffCreate>;
export type TeachingLabStaffUpdate = Partial<TeachingLabStaffCreate>;

// Fetch staff with pagination, filtering, and sorting
export async function fetchStaff(
  page: number = 1,
  limit: number = 10,
  filters: Record<string, unknown> = {},
  sortBy: string = "staffName",
  sortOrder: "asc" | "desc" = "asc",
  type: StaffType = "all"
) {
  try {
    const { model } = getStaffModelAndSchema(type);
    const sanitizedFilters = sanitizeFilters(filters);
    const result = await executePaginatedQuery<StaffUnion>(
      model,
      sanitizedFilters,
      { page, limit, sortBy, sortOrder }
    );

    return {
      items: result.items,
      total: result.total,
      isEmpty: result.empty,
    };
  } catch (error) {
    console.error("Error fetching staff:", error);
    throw error;
  }
}

// Create a new staff member
export async function createStaff(data: unknown) {
  try {
    const staffType = determineStaffType(data);
    const { model, schema } = getStaffModelAndSchema(staffType);
    
    const validatedData = schema.parse(data);
    const staff = await model.create(validatedData);
    
    revalidatePath("/staff");
    return staff;
  } catch (error) {
    console.error("Error creating staff:", error);
    throw error;
  }
}

// Create a new NYCPS staff member
export async function createNYCPSStaff(data: NYCPSStaffCreate) {
  return createItem(NYCPSStaffModel, NYCPSStaffZodSchema, data, ["/dashboard/staff"]);
}

// Create a new Teaching Lab staff member
export async function createTeachingLabStaff(data: TeachingLabStaffCreate) {
  return createItem(TeachingLabStaffModel, TeachingLabStaffZodSchema, data, ["/dashboard/staff"]);
}

// Update a staff member
export async function updateStaff(id: string, data: unknown) {
  try {
    const staffType = determineStaffType(data);
    const { model, schema } = getStaffModelAndSchema(staffType);
    
    const validatedData = schema.parse(data);
    const staff = await model.findByIdAndUpdate(id, validatedData, { new: true });
    
    if (!staff) {
      throw new Error("Staff not found");
    }
    
    revalidatePath("/staff");
    return staff;
  } catch (error) {
    console.error("Error updating staff:", error);
    throw error;
  }
}

// Update an NYCPS staff member
export async function updateNYCPSStaff(id: string, data: NYCPSStaffUpdate) {
  return updateItem(NYCPSStaffModel, NYCPSStaffZodSchema, id, data, ["/dashboard/staff"]);
}

// Update a Teaching Lab staff member
export async function updateTeachingLabStaff(id: string, data: TeachingLabStaffUpdate) {
  return updateItem(TeachingLabStaffModel, TeachingLabStaffZodSchema, id, data, ["/dashboard/staff"]);
}

// Delete a staff member
export async function deleteStaff(id: string) {
  try {
    const staff = await StaffMemberModel.findById(id);
    if (!staff) {
      throw new Error("Staff not found");
    }
    
    const staffType = determineStaffType(staff);
    const { model } = getStaffModelAndSchema(staffType);
    
    await model.findByIdAndDelete(id);
    revalidatePath("/staff");
  } catch (error) {
    console.error("Error deleting staff:", error);
    throw error;
  }
}

// Upload staff data
export async function bulkUploadStaff(data: unknown[]) {
  try {
    const staffType = determineStaffType(data[0]);
    const { model, schema } = getStaffModelAndSchema(staffType);
    
    return await bulkUpload<StaffUnion>(
      data as Omit<StaffUnion, "_id" | "createdAt" | "updatedAt">[],
      model,
      schema,
      ["/staff"]
    );
  } catch (error) {
    console.error("Error bulk uploading staff:", error);
    throw error;
  }
} 