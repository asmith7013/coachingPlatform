"use server";

import { z } from "zod";
import { 
  StaffMemberZodSchema, 
  StaffMemberInputZodSchema,
  NYCPSStaffZodSchema, 
  NYCPSStaffInputZodSchema,
  TeachingLabStaffZodSchema,
  TeachingLabStaffInputZodSchema
} from "@zod-schema/core/staff";
import { StaffMemberModel, NYCPSStaffModel, TeachingLabStaffModel } from "@mongoose-schema/core/staff.model";
import { createCrudActions } from "@data-server/crud/crud-action-factory";
import { withDbConnection } from "@data-server/db/ensure-connection";
import { handleServerError } from "@error/handle-server-error";
import { handleValidationError } from "@error/handle-validation-error";
import { determineStaffType } from "@data-utilities/transformers/staff-utils";
import { bulkUploadToDB } from "@data-server/crud/bulk-operations";

// Define types using the existing Zod schemas
type StaffMemberInput = z.infer<typeof StaffMemberInputZodSchema>;
type NYCPSStaffInput = z.infer<typeof NYCPSStaffInputZodSchema>;
type TeachingLabStaffInput = z.infer<typeof TeachingLabStaffInputZodSchema>;

// Create standard CRUD actions for general staff
export const staffActions = createCrudActions({
  model: StaffMemberModel,
  fullSchema: StaffMemberZodSchema,
  inputSchema: StaffMemberInputZodSchema,
  revalidationPaths: ["/dashboard/staff"],
  options: {
    validSortFields: ['staffName', 'email', 'createdAt', 'updatedAt'],
    defaultSortField: 'staffName',
    defaultSortOrder: 'asc',
    entityName: 'Staff Member'
  }
});

// Create standard CRUD actions for NYCPS staff
export const nycpsStaffActions = createCrudActions({
  model: NYCPSStaffModel,
  fullSchema: NYCPSStaffZodSchema,
  inputSchema: NYCPSStaffInputZodSchema,
  revalidationPaths: ["/dashboard/staff"],
  options: {
    validSortFields: ['staffName', 'email', 'createdAt', 'updatedAt'],
    defaultSortField: 'staffName',
    defaultSortOrder: 'asc',
    entityName: 'NYCPS Staff'
  }
});

// Create standard CRUD actions for Teaching Lab staff
export const tlStaffActions = createCrudActions({
  model: TeachingLabStaffModel,
  fullSchema: TeachingLabStaffZodSchema,
  inputSchema: TeachingLabStaffInputZodSchema,
  revalidationPaths: ["/dashboard/staff"],
  options: {
    validSortFields: ['staffName', 'email', 'createdAt', 'updatedAt'],
    defaultSortField: 'staffName',
    defaultSortOrder: 'asc',
    entityName: 'Teaching Lab Staff'
  }
});

// Export the generated actions with connection handling
export async function fetchStaffMembers(params = {}) {
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

// NYCPS Staff actions
export async function fetchNYCPSStaff(params = {}) {
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

// Teaching Lab Staff actions
export async function fetchTeachingLabStaff(params = {}) {
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

// Specialized actions
export async function fetchStaffBySchool(schoolId: string) {
  return withDbConnection(async () => {
    try {
      // Find staff in different collections that belong to the school
      const nycpsStaff = await NYCPSStaffModel.find({ schools: schoolId })
        .lean()
        .exec();
      
      const tlStaff = await TeachingLabStaffModel.find({ schools: schoolId })
        .lean()
        .exec();
      
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