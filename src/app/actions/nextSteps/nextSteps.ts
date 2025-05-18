"use server";

import { z } from "zod";
import { NextStepModel } from "@mongoose-schema/look-fors/next-step.model";
import { NextStepZodSchema, NextStepInputZodSchema } from "@zod-schema/look-fors/next-step";
import { createCrudActions } from "@data-server/crud/crud-action-factory";
import { withDbConnection } from "@data-server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";

type NextStepInput = z.infer<typeof NextStepInputZodSchema>;

// Create standard CRUD actions for Next Steps
export const nextStepActions = createCrudActions({
  model: NextStepModel,
  fullSchema: NextStepZodSchema,
  inputSchema: NextStepInputZodSchema,
  revalidationPaths: ["/dashboard/look-fors", "/dashboard/nextSteps"],
  options: {
    validSortFields: ['teacher', 'school', 'createdAt'],
    defaultSortField: 'createdAt',
    defaultSortOrder: 'desc',
    entityName: 'Next Step'
  }
});

// Export the generated actions with connection handling
export async function fetchNextSteps(params = {}) {
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