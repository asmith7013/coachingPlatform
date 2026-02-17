"use server";

import { z } from "zod";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";
import {
  staffActions,
  nycpsStaffActions,
  tlStaffActions,
} from "@actions/staff/factories";
import { determineStaffType } from "@domain-types/staff";
import { bulkUploadToDB } from "@server/crud/bulk-operations";
import { uploadFileWithProgress } from "@server/file-handling/file-upload";
import type { QueryParams } from "@core-types/query";
import {
  NYCPSStaffModel,
  TeachingLabStaffModel,
  StaffMemberModel,
} from "@mongoose-schema/core";

// Type imports - reuse the existing Zod schemas
import {
  StaffMemberInputZodSchema,
  NYCPSStaffInputZodSchema,
  TeachingLabStaffInputZodSchema,
  NYCPSStaffZodSchema,
  TeachingLabStaffZodSchema,
} from "@zod-schema/core/staff";
type StaffMemberInput = z.infer<typeof StaffMemberInputZodSchema>;
type NYCPSStaffInput = z.infer<typeof NYCPSStaffInputZodSchema>;
type TeachingLabStaffInput = z.infer<typeof TeachingLabStaffInputZodSchema>;

// Base Staff operations - SIMPLIFIED to match school pattern
export async function fetchStaffMembers(params: QueryParams) {
  return withDbConnection(() => staffActions.fetch(params));
}

export async function createStaffMember(data: StaffMemberInput) {
  return withDbConnection(() => staffActions.create(data));
}

export async function updateStaffMember(
  id: string,
  data: Partial<StaffMemberInput>,
) {
  return withDbConnection(() => staffActions.update(id, data));
}

export async function deleteStaffMember(id: string) {
  return withDbConnection(() => staffActions.delete(id));
}

export async function fetchStaffMemberById(id: string) {
  return withDbConnection(() => staffActions.fetchById(id));
}

// NYCPS Staff operations - SIMPLIFIED to match school pattern
export async function fetchNYCPSStaff(params: QueryParams) {
  return withDbConnection(() => nycpsStaffActions.fetch(params));
}

export async function createNYCPSStaff(data: NYCPSStaffInput) {
  return withDbConnection(() => nycpsStaffActions.create(data));
}

export async function updateNYCPSStaff(
  id: string,
  data: Partial<NYCPSStaffInput>,
) {
  return withDbConnection(() => nycpsStaffActions.update(id, data));
}

export async function deleteNYCPSStaff(id: string) {
  return withDbConnection(() => nycpsStaffActions.delete(id));
}

export async function fetchNYCPSStaffById(id: string) {
  return withDbConnection(() => nycpsStaffActions.fetchById(id));
}

// Teaching Lab Staff operations - SIMPLIFIED to match school pattern
export async function fetchTeachingLabStaff(params: QueryParams) {
  return withDbConnection(() => tlStaffActions.fetch(params));
}

export async function createTeachingLabStaff(data: TeachingLabStaffInput) {
  return withDbConnection(() => tlStaffActions.create(data));
}

export async function updateTeachingLabStaff(
  id: string,
  data: Partial<TeachingLabStaffInput>,
) {
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
    return result.message || "No message";
  } catch (error) {
    throw handleServerError(error);
  }
};

// Specialized operations
export async function fetchStaffBySchool(schoolId: string) {
  return withDbConnection(async () => {
    try {
      // Get raw data for both staff types
      const nycpsPromise = NYCPSStaffModel.find({ schools: schoolId }).exec();
      const tlPromise = TeachingLabStaffModel.find({
        schools: schoolId,
      }).exec();

      // Execute in parallel
      const [nycpsStaff, tlStaff] = await Promise.all([
        nycpsPromise,
        tlPromise,
      ]);

      // Validate and combine results
      const validatedNYCPSStaff = nycpsStaff.map((staff) =>
        NYCPSStaffZodSchema.parse(staff),
      );
      const validatedTLStaff = tlStaff.map((staff) =>
        TeachingLabStaffZodSchema.parse(staff),
      );

      const combinedStaff = [...validatedNYCPSStaff, ...validatedTLStaff];

      return {
        success: true,
        items: combinedStaff,
        total: combinedStaff.length,
      };
    } catch (error) {
      return {
        success: false,
        items: [],
        total: 0,
        error: handleServerError(error),
      };
    }
  });
}

// Upload staff data based on type
export async function uploadStaff(
  data: (StaffMemberInput | NYCPSStaffInput | TeachingLabStaffInput)[],
) {
  return withDbConnection(async () => {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        return {
          success: false,
          error: "No data provided or invalid format",
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
        tl: [],
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

      // Process each batch using the same pattern as schools
      const results = [];

      if (staffByType.standard.length > 0) {
        const result = await bulkUploadToDB(
          staffByType.standard,
          StaffMemberModel,
          StaffMemberInputZodSchema,
          ["/dashboard/staff"],
        );
        results.push(result);
      }

      if (staffByType.nycps.length > 0) {
        const result = await bulkUploadToDB(
          staffByType.nycps,
          NYCPSStaffModel,
          NYCPSStaffInputZodSchema,
          ["/dashboard/staff"],
        );
        results.push(result);
      }

      if (staffByType.tl.length > 0) {
        const result = await bulkUploadToDB(
          staffByType.tl,
          TeachingLabStaffModel,
          TeachingLabStaffInputZodSchema,
          ["/dashboard/staff"],
        );
        results.push(result);
      }

      // Combine all results
      const allItems = results.flatMap((result) => result.items || []);
      const hasErrors = results.some((result) => !result.success);

      return {
        success: !hasErrors,
        items: allItems,
        total: allItems.length,
        error: hasErrors ? "Some staff members failed to upload" : undefined,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error),
        };
      }
      return {
        success: false,
        error: handleServerError(error),
      };
    }
  });
}

// Remaining specialized functions (simplified)
export async function linkStaffToSchool(staffId: string, schoolId: string) {
  return withDbConnection(async () => {
    try {
      const staff = await StaffMemberModel.findById(staffId);
      if (!staff) {
        return { success: false, error: "Staff member not found" };
      }

      const schools = staff.schools || [];
      if (!schools.includes(schoolId)) {
        schools.push(schoolId);
        staff.schools = schools;
        await staff.save();
      }

      return { success: true, data: staff };
    } catch (error) {
      return { success: false, error: handleServerError(error) };
    }
  });
}

export async function checkStaffExistenceByEmail(email: string) {
  try {
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return {
        success: false,
        data: { exists: false },
        error: "Invalid email format",
      };
    }

    const result = await withDbConnection(async () => {
      const [nycpsStaff, tlStaff] = await Promise.all([
        NYCPSStaffModel.findOne({
          email: { $regex: new RegExp(`^${email}$`, "i") },
        }).select("_id staffName email"),
        TeachingLabStaffModel.findOne({
          email: { $regex: new RegExp(`^${email}$`, "i") },
        }).select("_id staffName email"),
      ]);

      return nycpsStaff || tlStaff;
    });

    if (result) {
      return {
        success: true,
        data: {
          exists: true,
          staffId: result._id.toString(),
          message: `Staff member found: ${result.staffName}`,
        },
      };
    } else {
      return {
        success: true,
        data: {
          exists: false,
          message: `No staff member found with email: ${email}`,
        },
      };
    }
  } catch (error) {
    return {
      success: false,
      data: { exists: false },
      error: handleServerError(error),
    };
  }
}

// Bulk creation with school linking (simplified)
export async function bulkCreateStaffWithSchoolLink(
  staffData: NYCPSStaffInput[],
  schoolId: string,
) {
  return withDbConnection(async () => {
    try {
      if (!Array.isArray(staffData) || staffData.length === 0) {
        return {
          success: false,
          items: [],
          total: 0,
          error: "No staff data provided or invalid format",
        };
      }

      // Add school ID to each staff member's schoolIds array
      const staffWithSchool = staffData.map((staff) => ({
        ...staff,
        schoolIds: Array.isArray(staff.schoolIds)
          ? [...staff.schoolIds, schoolId]
          : [schoolId],
      }));

      // Use the simplified uploadStaff function
      const result = await uploadStaff(staffWithSchool);

      return {
        success: result.success,
        items: result.items || [],
        total: result.total || 0,
        error: result.error,
        message: result.success
          ? `Created ${result.total} staff members`
          : undefined,
      };
    } catch (error) {
      return {
        success: false,
        items: [],
        total: 0,
        error: handleServerError(error),
      };
    }
  });
}
