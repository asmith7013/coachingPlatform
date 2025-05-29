"use server";

import { z, ZodType } from "zod";
import { NextStepModel } from "@mongoose-schema/look-fors/next-step.model";
import { NextStep, NextStepZodSchema, NextStepInputZodSchema } from "@zod-schema/look-fors/next-step";
import { createCrudActions } from "@server/crud";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";
import { bulkUploadToDB } from "@server/crud/bulk-operations";
import { uploadFileWithProgress } from "@server/file-handling/file-upload";
import type { QueryParams } from "@core-types/query";

// Type definitions
type NextStepInput = z.infer<typeof NextStepInputZodSchema>;

// Create standard CRUD actions for Next Steps
const nextStepActions = createCrudActions({
  model: NextStepModel,
  schema: NextStepZodSchema as ZodType<NextStep>,
  inputSchema: NextStepInputZodSchema,
  name: "Next Step",
  revalidationPaths: ["/dashboard/nextSteps"],
  sortFields: ['nextStepText', 'createdAt', 'updatedAt'],
  defaultSortField: 'createdAt',
  defaultSortOrder: 'desc'
});

// Export the generated actions with connection handling
export async function fetchNextSteps(params: QueryParams) {
  return withDbConnection(() => nextStepActions.fetch(params));
}

export async function createNextStep(data: NextStepInput) {
  return withDbConnection(() => nextStepActions.create(data));
}

export async function updateNextStep(id: string, data: Partial<NextStepInput>) {
  return withDbConnection(() => nextStepActions.update(id, data));
}

export async function deleteNextStep(id: string) {
  return withDbConnection(() => nextStepActions.delete(id));
}

export async function fetchNextStepById(id: string) {
  return withDbConnection(() => nextStepActions.fetchById(id));
}

// File upload actions
export const uploadNextStepFile = async (file: File): Promise<string> => {
  try {
    const result = await uploadFileWithProgress(file, "/api/nextSteps/bulk-upload");
    return result.message || "No message";
  } catch (error) {
    throw handleServerError(error);
  }
};

export async function uploadNextSteps(data: NextStepInput[]) {
  return withDbConnection(async () => {
    try {
      const result = await bulkUploadToDB(
        data, 
        NextStepModel, 
        NextStepInputZodSchema, 
        ["/dashboard/nextSteps"]
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

// Add specialized actions
export async function fetchNextStepsByTeacher(teacherId: string) {
  return withDbConnection(async () => {
    try {
      const results = await NextStepModel.find({ teacher: teacherId })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      
      return {
        success: true,
        items: results.map(item => NextStepZodSchema.parse(item)),
        total: results.length
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

export async function fetchNextStepsBySchool(schoolId: string) {
  return withDbConnection(async () => {
    try {
      const results = await NextStepModel.find({ school: schoolId })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      
      return {
        success: true,
        items: results.map(item => NextStepZodSchema.parse(item)),
        total: results.length
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

export async function fetchNextStepsByLookFor(lookForId: string) {
  return withDbConnection(async () => {
    try {
      const results = await NextStepModel.find({ lookFor: lookForId })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      
      return {
        success: true,
        items: results.map(item => NextStepZodSchema.parse(item)),
        total: results.length
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