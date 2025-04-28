"use server";

import { z } from "zod";
import { SchoolModel } from "@/lib/data-schema/mongoose-schema/core";
import { SchoolInputZodSchema, SchoolZodSchema } from "@zod-schema/core/school";
import { handleServerError } from "@/lib/error/handle-server-error";
import { handleValidationError } from "@/lib/error/handle-validation-error";
import { createCrudActions } from "@/lib/data-server/crud/crud-action-factory";
import { withDbConnection } from "@/lib/data-server/db/ensure-connection";
import { uploadFileWithProgress } from "@/lib/data-server/file-handling/file-upload";
import { bulkUploadToDB } from "@data-server/crud/bulk-operations";
import { SchoolInput } from "@domain-types/school";

// Create standard CRUD actions for Schools
export const schoolActions = createCrudActions({
  model: SchoolModel,
  fullSchema: SchoolZodSchema,
  inputSchema: SchoolInputZodSchema,
  revalidationPaths: ["/dashboard/schools"],
  options: {
    validSortFields: ['schoolName', 'district', 'createdAt', 'updatedAt'],
    defaultSortField: 'schoolName',
    defaultSortOrder: 'asc',
    entityName: 'School'
  }
});

// Export the generated actions with connection handling
export async function fetchSchools(params = {}) {
  return withDbConnection(() => schoolActions.fetch(params));
}

export async function createSchool(data: SchoolInput) {
  return withDbConnection(() => schoolActions.create(data));
}

export async function updateSchool(id: string, data: Partial<SchoolInput>) {
  return withDbConnection(() => schoolActions.update(id, data));
}

export async function deleteSchool(id: string) {
  return withDbConnection(() => schoolActions.delete(id));
}

export async function fetchSchoolById(id: string) {
  return withDbConnection(() => schoolActions.fetchById(id));
}

// Specialized actions
export async function fetchSchoolsByDistrict(district: string) {
  return withDbConnection(async () => {
    try {
      const schools = await SchoolModel.find({ district })
        .sort({ schoolName: 1 })
        .lean()
        .exec();
      
      return {
        success: true,
        items: schools.map(school => SchoolZodSchema.parse(school)),
        total: schools.length
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

// File upload actions
export const uploadSchoolFile = async (file: File): Promise<string> => {
  try {
    const result = await uploadFileWithProgress(file, "/api/schools/bulk-upload");
    return result.message;
  } catch (error) {
    throw handleServerError(error);
  }
};

export async function uploadSchools(data: SchoolInput[]) {
  return withDbConnection(async () => {
    try {
      const result = await bulkUploadToDB(
        data, 
        SchoolModel, 
        SchoolInputZodSchema, 
        ["/dashboard/schools"]
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