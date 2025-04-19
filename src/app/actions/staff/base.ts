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
  StaffMemberZodSchema,
  StaffMemberInputZodSchema,
} from "@/lib/zod-schema/core/staff";
import { StaffMemberModel } from "@/models/core/staff.model";
import { connectToDB } from "@/lib/db";
import { handleServerError } from "@/lib/error/handleServerError";
import { handleValidationError } from "@/lib/error/handleValidationError";

// Types for returned documents
export type StaffMemberDoc = z.infer<typeof StaffMemberZodSchema>;

// Types for input data
export type StaffMemberInput = z.infer<typeof StaffMemberInputZodSchema>;

/** Fetch Staff Members */
export async function fetchStaff({
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
    
    console.log("Fetching staff with params:", { page, limit, filters, sortBy, sortOrder });

    // Sanitize filters
    const sanitizedFilters = sanitizeFilters(filters);

    // Execute smart query with appropriate schema for validation
    const result = await executeSmartQuery(
      StaffMemberModel,
      sanitizedFilters,
      StaffMemberZodSchema,
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

// Create a new staff member
export async function createStaff(data: StaffMemberInput) {
  try {
    await connectToDB();
    
    const staff = await createItem(
      StaffMemberModel,
      StaffMemberInputZodSchema,
      data,
      ["/dashboard/staff"]
    );
    
    return staff;
  } catch (error) {
    console.error("Error creating staff:", error);
    if (error instanceof z.ZodError) {
      throw handleValidationError(error);
    }
    throw handleServerError(error);
  }
}

// Update an existing staff member
export async function updateStaff(id: string, data: Partial<StaffMemberInput>) {
  try {
    await connectToDB();
    
    const staff = await updateItem(
      StaffMemberModel,
      StaffMemberInputZodSchema,
      id,
      data,
      ["/dashboard/staff"]
    );
    
    return staff;
  } catch (error) {
    console.error("Error updating staff:", error);
    if (error instanceof z.ZodError) {
      throw handleValidationError(error);
    }
    throw handleServerError(error);
  }
}

// Delete a staff member
export async function deleteStaff(id: string) {
  try {
    await connectToDB();
    
    const staff = await deleteItem(
      StaffMemberModel,
      StaffMemberZodSchema,
      id,
      ["/dashboard/staff"]
    );
    
    return staff;
  } catch (error) {
    console.error("Error deleting staff:", error);
    throw handleServerError(error);
  }
} 