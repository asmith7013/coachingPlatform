"use server";

import { z } from "zod";
import { withDbConnection } from "@data-server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";
import { 
  staffActions, 
  nycpsStaffActions, 
  tlStaffActions 
} from "./factories";
import { determineStaffType } from "@/lib/data-utilities/transformers/domain/staff-utils";
import { bulkUploadToDB } from "@data-server/crud/bulk-operations";
import { uploadFileWithProgress } from "@data-server/file-handling/file-upload";
import type { QueryParams } from "@core-types/query";
import { NYCPSStaffModel, TeachingLabStaffModel, StaffMemberModel } from "@mongoose-schema/core";

// Type imports - reuse the existing Zod schemas
import {
  StaffMemberInputZodSchema,
  NYCPSStaffInputZodSchema,
  TeachingLabStaffInputZodSchema,
  NYCPSStaffZodSchema,
  TeachingLabStaffZodSchema
} from "@/lib/data-schema/zod-schema/core/staff";
type StaffMemberInput = z.infer<typeof StaffMemberInputZodSchema>;
type NYCPSStaffInput = z.infer<typeof NYCPSStaffInputZodSchema>;
type TeachingLabStaffInput = z.infer<typeof TeachingLabStaffInputZodSchema>;

// Base Staff operations
export async function fetchStaffMembers(params: QueryParams = {}) {
  return withDbConnection(() => staffActions.fetch(params));
}

export async function createStaffMember(data: StaffMemberInput) {
  return withDbConnection(() => staffActions.create(data));
}

export async function updateStaffMember(id: string, data: Partial<StaffMemberInput>) {
  return withDbConnection(() => staffActions.update(id, data));
}

export async function deleteStaffMember(id: string) {
  return withDbConnection(() => staffActions.delete(id));
}

export async function fetchStaffMemberById(id: string) {
  return withDbConnection(() => staffActions.fetchById(id));
}

// NYCPS Staff operations
export async function fetchNYCPSStaff(params: QueryParams = {}) {
  return withDbConnection(() => nycpsStaffActions.fetch(params));
}

export async function createNYCPSStaff(data: NYCPSStaffInput) {
  return withDbConnection(() => nycpsStaffActions.create(data));
}

export async function updateNYCPSStaff(id: string, data: Partial<NYCPSStaffInput>) {
  return withDbConnection(() => nycpsStaffActions.update(id, data));
}

export async function deleteNYCPSStaff(id: string) {
  return withDbConnection(() => nycpsStaffActions.delete(id));
}

export async function fetchNYCPSStaffById(id: string) {
  return withDbConnection(() => nycpsStaffActions.fetchById(id));
}

// Teaching Lab Staff operations
export async function fetchTeachingLabStaff(params: QueryParams = {}) {
  return withDbConnection(() => tlStaffActions.fetch(params));
}

export async function createTeachingLabStaff(data: TeachingLabStaffInput) {
  return withDbConnection(() => tlStaffActions.create(data));
}

export async function updateTeachingLabStaff(id: string, data: Partial<TeachingLabStaffInput>) {
  return withDbConnection(() => tlStaffActions.update(id, data));
}

export async function deleteTeachingLabStaff(id: string) {
  return withDbConnection(() => tlStaffActions.delete(id));
}

export async function fetchTeachingLabStaffById(id: string) {
  return withDbConnection(() => tlStaffActions.fetchById(id));
}

// Upload NYCPS Staff via file
export const uploadNYCPSStaffFile = async (file: File): Promise<string> => {
  try {
    const result = await uploadFileWithProgress(file, "/api/staff/bulk-upload");
    return result.message;
  } catch (error) {
    throw handleServerError(error);
  }
};

// Specialized operations
export async function fetchStaffBySchool(schoolId: string) {
  return withDbConnection(async () => {
    try {
      // Get raw data for both staff types
      const nycpsPromise = NYCPSStaffModel.find({ schools: schoolId }).lean().exec();
      const tlPromise = TeachingLabStaffModel.find({ schools: schoolId }).lean().exec();
      
      // Execute in parallel
      const [nycpsStaff, tlStaff] = await Promise.all([nycpsPromise, tlPromise]);
      
      // Validate and combine results
      const validatedNYCPSStaff = nycpsStaff.map(staff => NYCPSStaffZodSchema.parse(staff));
      const validatedTLStaff = tlStaff.map(staff => TeachingLabStaffZodSchema.parse(staff));
      
      const combinedStaff = [...validatedNYCPSStaff, ...validatedTLStaff];
      
      return {
        success: true,
        items: combinedStaff,
        total: combinedStaff.length
      };
    } catch (error) {
      return {
        success: false,
        items: [],
        total: 0,
        error: handleServerError(error)
      };
    }
  });
}

// Upload staff data based on type
export async function uploadStaff(data: (StaffMemberInput | NYCPSStaffInput | TeachingLabStaffInput)[]) {
  return withDbConnection(async () => {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        return {
          success: false,
          error: "No data provided or invalid format"
        };
      }
      
      // Group items by staff type
      const staffByType: {
        standard: StaffMemberInput[];
        nycps: NYCPSStaffInput[];
        tl: TeachingLabStaffInput[];
      } = {
        standard: [],
        nycps: [],
        tl: []
      };
      
      // Determine the type of each staff record
      for (const item of data) {
        const type = determineStaffType(item);
        if (type === "nycps") {
          staffByType.nycps.push(item as NYCPSStaffInput);
        } else if (type === "tl") {
          staffByType.tl.push(item as TeachingLabStaffInput);
        } else {
          staffByType.standard.push(item as StaffMemberInput);
        }
      }
      
      // Process each batch
      const results = {
        standard: { success: true, items: [] as StaffMemberInput[], total: 0, error: "" },
        nycps: { success: true, items: [] as NYCPSStaffInput[], total: 0, error: "" },
        tl: { success: true, items: [] as TeachingLabStaffInput[], total: 0, error: "" }
      };
      
      // Process standard staff
      if (staffByType.standard.length > 0) {
        const result = await bulkUploadToDB(
          staffByType.standard,
          StaffMemberModel,
          StaffMemberInputZodSchema,
          ["/dashboard/staff"]
        );
        results.standard = {
          success: result.success,
          items: result.items || [],
          total: result.items?.length || 0,
          error: result.message || result.error || (result.errors?.[0]?.error || "")
        };
      }
      
      // Process NYCPS staff
      if (staffByType.nycps.length > 0) {
        const result = await bulkUploadToDB(
          staffByType.nycps,
          NYCPSStaffModel,
          NYCPSStaffInputZodSchema,
          ["/dashboard/staff"]
        );
        results.nycps = {
          success: result.success,
          items: result.items || [],
          total: result.items?.length || 0,
          error: result.message || result.error || (result.errors?.[0]?.error || "")
        };
      }
      
      // Process TL staff
      if (staffByType.tl.length > 0) {
        const result = await bulkUploadToDB(
          staffByType.tl,
          TeachingLabStaffModel,
          TeachingLabStaffInputZodSchema,
          ["/dashboard/staff"]
        );
        results.tl = {
          success: result.success,
          items: result.items || [],
          total: result.items?.length || 0,
          error: result.message || result.error || (result.errors?.[0]?.error || "")
        };
      }
      
      // Combine all results
      const allItems = [
        ...(results.standard.items || []),
        ...(results.nycps.items || []),
        ...(results.tl.items || [])
      ];
      
      const allErrors = [
        results.standard.error,
        results.nycps.error,
        results.tl.error
      ].filter(Boolean).join(", ");
      
      return {
        success: !allErrors,
        items: allItems,
        total: allItems.length,
        error: allErrors || ""
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error)
        };
      }
      return {
        success: false,
        error: handleServerError(error)
      };
    }
  });
} 