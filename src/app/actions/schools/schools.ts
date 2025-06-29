"use server";

import { z, ZodType } from "zod";
import { SchoolModel } from "@mongoose-schema/core/school.model";
import { School, SchoolInputZodSchema, SchoolZodSchema } from "@zod-schema/core/school";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";
import { createCrudActions } from "@server/crud";
import { withDbConnection } from "@server/db/ensure-connection";
import { uploadFileWithProgress } from "@server/file-handling/file-upload";
import { bulkUploadToDB } from "@server/crud/bulk-operations";
import { SchoolInput } from "@domain-types/school";
import { QueryParams } from "@core-types/query";
import { parseSchoolSlug, createSchoolSlug } from '@data-processing/transformers/utils/school-slug-utils';

// Create standard CRUD actions for Schools
const schoolActions = createCrudActions({
  model: SchoolModel,
  schema: SchoolZodSchema as ZodType<School>,
  inputSchema: SchoolInputZodSchema as ZodType<SchoolInput>,
  name: "School",
  revalidationPaths: ["/dashboard/schools"],
  sortFields: ['schoolName', 'district', 'createdAt', 'updatedAt'],
  defaultSortField: 'schoolName',
  defaultSortOrder: 'asc'
});

// Export the generated actions with connection handling
export async function fetchSchools(params: QueryParams) {
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

/**
 * Convert school slug to ObjectID for efficient database operations
 * Follows our schema-driven approach with proper validation
 * 
 * NEW APPROACH: Instead of trying to reverse-engineer the original district/school values,
 * we find all schools and check which one would generate the same slug.
 */
export async function getSchoolIdFromSlug(slug: string): Promise<string | null> {
  "use server";
  
  const slugData = parseSchoolSlug(slug);
  if (!slugData) return null;
  
  return withDbConnection(async () => {
    try {
      // Get all schools and find the one that would generate this slug
      const schools = await SchoolModel.find({}, { district: 1, schoolNumber: 1 });
      
      for (const school of schools) {
        const schoolSlug = createSchoolSlug(school.district, school.schoolNumber);
        if (schoolSlug === slug) {
          return school._id.toString();
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error looking up school ID from slug:', error);
      handleServerError(error, 'getSchoolIdFromSlug');
      return null;
    }
  });
}

// File upload actions
export const uploadSchoolFile = async (file: File): Promise<string> => {
  try {
    const result = await uploadFileWithProgress(file, "/api/schools/bulk-upload");
    return result.message || "No message";
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
