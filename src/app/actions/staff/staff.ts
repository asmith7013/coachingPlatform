"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Document, Types } from "mongoose";
import { 
  executeSmartQuery,
  sanitizeFilters,
  createItem,
  updateItem,
  deleteItem
} from "@/lib/server-utils";
import { 
  getStaffMemberModelAndSchema,
  getNYCPSStaffModelAndSchema,
  getTeachingLabStaffModelAndSchema,
  determineStaffType,
  type StaffType
} from "@/lib/server-utils/staff";
import { bulkUploadToDB } from "@/lib/server-utils/bulkUpload";
import { 
  StaffMemberZodSchema, 
  StaffMemberInputZodSchema,
  NYCPSStaffZodSchema, 
  NYCPSStaffInputZodSchema,
  TeachingLabStaffZodSchema,
  TeachingLabStaffInputZodSchema
} from "@/lib/zod-schema/core/staff";
import { StaffMemberModel, NYCPSStaffModel, TeachingLabStaffModel } from "@/models/core/staff.model";
import { connectToDB } from "@/lib/db";
import { handleServerError } from "@/lib/error/handleServerError";
import { handleValidationError } from "@/lib/error/handleValidationError";

// Types for returned documents
export type StaffMember = z.infer<typeof StaffMemberZodSchema>;
export type NYCPSStaff = z.infer<typeof NYCPSStaffZodSchema>;
export type TeachingLabStaff = z.infer<typeof TeachingLabStaffZodSchema>;

// Types for input data
export type StaffMemberInput = z.infer<typeof StaffMemberInputZodSchema>;
export type NYCPSStaffInput = z.infer<typeof NYCPSStaffInputZodSchema>;
export type TeachingLabStaffInput = z.infer<typeof TeachingLabStaffInputZodSchema>;

// MongoDB document types
interface StaffMemberDocument extends Document {
  _id: Types.ObjectId;
  staffName: string;
  email?: string;
  schools: string[];
  owners: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface NYCPSStaffDocument extends StaffMemberDocument {
  gradeLevelsSupported: string[];
  subjects: string[];
  specialGroups: string[];
  rolesNYCPS?: string[];
  pronunciation?: string;
  notes?: Array<{
    date: string;
    type: string;
    heading: string;
    subheading: string[];
  }>;
  experience?: Array<{
    type: string;
    years: number;
  }>;
}

interface TeachingLabStaffDocument extends StaffMemberDocument {
  adminLevel: string;
  assignedDistricts: string[];
  rolesTL?: string[];
}

/** Fetch Staff */
export async function fetchStaff({
  page = 1,
  limit = 10,
  filters = {},
  sortBy = "staffName",
  sortOrder = "asc",
  type = "all",
}: {
  page?: number;
  limit?: number;
  filters?: Record<string, unknown>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  type?: StaffType;
} = {}) {
  try {
    await connectToDB();
    
    console.log("Fetching staff with params:", { page, limit, filters, sortBy, sortOrder, type });

    // Sanitize filters
    const sanitizedFilters = sanitizeFilters(filters);

    // Get appropriate model and schema based on type
    let result;
    if (type === "nycps") {
      const { model, schema } = getNYCPSStaffModelAndSchema();
      result = await executeSmartQuery(
        model,
        sanitizedFilters,
        schema,
        { 
          page, 
          limit, 
          sortBy, 
          sortOrder
        }
      );
    } else if (type === "tl") {
      const { model, schema } = getTeachingLabStaffModelAndSchema();
      result = await executeSmartQuery(
        model,
        sanitizedFilters,
        schema,
        { 
          page, 
          limit, 
          sortBy, 
          sortOrder
        }
      );
    } else {
      const { model, schema } = getStaffMemberModelAndSchema();
      result = await executeSmartQuery(
        model,
        sanitizedFilters,
        schema,
        { 
          page, 
          limit, 
          sortBy, 
          sortOrder
        }
      );
    }

    return result;
  } catch (error) {
    throw new Error(handleServerError(error));
  }
}

// Create a new staff member
export async function createStaff(data: unknown) {
  try {
    await connectToDB();
    const staffType = determineStaffType(data);
    
    // Use appropriate model and schema based on type
    if (staffType === "nycps") {
      const { model } = getNYCPSStaffModelAndSchema();
      const validatedData = NYCPSStaffInputZodSchema.parse(data);
      const staff = await model.create(validatedData);
      revalidatePath("/staff");
      return staff;
    } else if (staffType === "tl") {
      const { model } = getTeachingLabStaffModelAndSchema();
      const validatedData = TeachingLabStaffInputZodSchema.parse(data);
      const staff = await model.create(validatedData);
      revalidatePath("/staff");
      return staff;
    } else {
      const { model } = getStaffMemberModelAndSchema();
      const validatedData = StaffMemberInputZodSchema.parse(data);
      const staff = await model.create(validatedData);
      revalidatePath("/staff");
      return staff;
    }
  } catch (error) {
    console.error("Error creating staff:", error);
    throw error;
  }
}

// Create a new NYCPS staff member
export async function createNYCPSStaff(data: NYCPSStaffInput) {
  return createItem<NYCPSStaffDocument, typeof NYCPSStaffInputZodSchema>(
    NYCPSStaffModel,
    NYCPSStaffInputZodSchema,
    data,
    ["/dashboard/staff"]
  );
}

// Create a new TeachingLab staff member
export async function createTeachingLabStaff(data: TeachingLabStaffInput) {
  return createItem<TeachingLabStaffDocument, typeof TeachingLabStaffInputZodSchema>(
    TeachingLabStaffModel,
    TeachingLabStaffInputZodSchema,
    data,
    ["/dashboard/staff"]
  );
}

// Update an existing staff member
export async function updateStaff(id: string, data: unknown) {
  try {
    await connectToDB();
    const staffType = determineStaffType(data);
    
    // Use appropriate model and schema based on type
    if (staffType === "nycps") {
      const { model } = getNYCPSStaffModelAndSchema();
      const validatedData = NYCPSStaffInputZodSchema.parse(data);
      const staff = await model.findByIdAndUpdate(id, validatedData, { new: true });
      revalidatePath("/staff");
      return staff;
    } else if (staffType === "tl") {
      const { model } = getTeachingLabStaffModelAndSchema();
      const validatedData = TeachingLabStaffInputZodSchema.parse(data);
      const staff = await model.findByIdAndUpdate(id, validatedData, { new: true });
      revalidatePath("/staff");
      return staff;
    } else {
      const { model } = getStaffMemberModelAndSchema();
      const validatedData = StaffMemberInputZodSchema.parse(data);
      const staff = await model.findByIdAndUpdate(id, validatedData, { new: true });
      revalidatePath("/staff");
      return staff;
    }
  } catch (error) {
    console.error("Error updating staff:", error);
    throw error;
  }
}

// Update an existing NYCPS staff member
export async function updateNYCPSStaff(id: string, data: NYCPSStaffInput) {
  return updateItem<NYCPSStaffDocument, typeof NYCPSStaffInputZodSchema>(
    NYCPSStaffModel,
    NYCPSStaffInputZodSchema,
    id,
    data,
    ["/dashboard/staff"]
  );
}

// Update an existing TeachingLab staff member
export async function updateTeachingLabStaff(id: string, data: TeachingLabStaffInput) {
  return updateItem<TeachingLabStaffDocument, typeof TeachingLabStaffInputZodSchema>(
    TeachingLabStaffModel,
    TeachingLabStaffInputZodSchema,
    id,
    data,
    ["/dashboard/staff"]
  );
}

// Delete a staff member
export async function deleteStaff(id: string) {
  try {
    await connectToDB();
    const staff = await StaffMemberModel.findByIdAndDelete(id);
    revalidatePath("/staff");
    return staff;
  } catch (error) {
    console.error("Error deleting staff:", error);
    throw error;
  }
}

// Delete an NYCPS staff member
export async function deleteNYCPSStaff(id: string) {
  return deleteItem<NYCPSStaffDocument, typeof NYCPSStaffZodSchema>(
    NYCPSStaffModel,
    NYCPSStaffZodSchema,
    id,
    ["/dashboard/staff"]
  );
}

// Delete a TeachingLab staff member
export async function deleteTeachingLabStaff(id: string) {
  return deleteItem<TeachingLabStaffDocument, typeof TeachingLabStaffZodSchema>(
    TeachingLabStaffModel,
    TeachingLabStaffZodSchema,
    id,
    ["/dashboard/staff"]
  );
}

// Upload staff data
export async function uploadStaff(data: StaffMemberInput[] | NYCPSStaffInput[] | TeachingLabStaffInput[]) {
  try {
    await connectToDB();
    const staffType = determineStaffType(data[0]);
    
    if (staffType === "nycps") {
      const { model, schema } = getNYCPSStaffModelAndSchema();
      return await bulkUploadToDB(data, model, schema, ["/dashboard/staff"]);
    } else if (staffType === "tl") {
      const { model, schema } = getTeachingLabStaffModelAndSchema();
      return await bulkUploadToDB(data, model, schema, ["/dashboard/staff"]);
    } else {
      const { model, schema } = getStaffMemberModelAndSchema();
      return await bulkUploadToDB(data, model, schema, ["/dashboard/staff"]);
    }
  } catch (error) {
    console.error("Error uploading staff:", error);
    if (error instanceof z.ZodError) {
      throw handleValidationError(error);
    }
    throw handleServerError(error);
  }
} 