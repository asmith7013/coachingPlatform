"use server";

import { z } from "zod";
import { 
  executeSmartQuery,
  sanitizeFilters,
  createItem,
  updateItem,
  deleteItem,
} from "@/lib/server-utils";
import { 
  TeachingLabStaffZodSchema,
  TeachingLabStaffInputZodSchema,
} from "@/lib/zod-schema/core/staff";
import { TeachingLabStaffModel } from "@/models/core/staff.model";
import { connectToDB } from "@/lib/db";
import { handleServerError } from "@/lib/error/handleServerError";
import { handleValidationError } from "@/lib/error/handleValidationError";

// Types for returned documents
export type TeachingLabStaffDoc = z.infer<typeof TeachingLabStaffZodSchema>;

// Types for input data
export type TeachingLabStaffInput = z.infer<typeof TeachingLabStaffInputZodSchema>;

/** Fetch Teaching Lab Staff */
export async function fetchTeachingLabStaff({
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
    await connectToDB();
    
    console.log("Fetching Teaching Lab staff with params:", { page, limit, filters, sortBy, sortOrder });

    // Sanitize filters
    const sanitizedFilters = sanitizeFilters(filters);

    // Execute smart query with appropriate schema for validation
    const result = await executeSmartQuery(
      TeachingLabStaffModel,
      sanitizedFilters,
      TeachingLabStaffZodSchema,
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