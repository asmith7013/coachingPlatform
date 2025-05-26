"use server";

import { z, ZodType } from "zod";
import { RubricModel, RubricScoreModel } from "@mongoose-schema/look-fors/rubric.model";
import { 
  RubricZodSchema,
  RubricScoreZodSchema,   
  RubricInputZodSchema,
  RubricInput,
  Rubric
} from "@zod-schema/look-fors/rubric";
import { createCrudActions } from "@server/crud/crud-action-factory";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { QueryParams } from "@/lib/types/core/query";

// Create standard CRUD actions for Rubrics
export const rubricActions = createCrudActions({
  model: RubricModel,
  fullSchema: RubricZodSchema as ZodType<Rubric>,
  inputSchema: RubricInputZodSchema as ZodType<RubricInput>,
  revalidationPaths: ["/dashboard/rubrics"],
  options: {
    validSortFields: ['score', 'createdAt'],
    defaultSortField: 'score',
    defaultSortOrder: 'asc',
    entityName: 'Rubric'
  }
});

// Export the generated actions with connection handling
export async function fetchRubrics(params: QueryParams) {
  return withDbConnection(() => rubricActions.fetch(params));
}

export async function createRubric(data: RubricInput) {
  return withDbConnection(() => rubricActions.create(data));
}

export async function updateRubric(id: string, data: Partial<RubricInput>) {
  return withDbConnection(() => rubricActions.update(id, data));
}

export async function deleteRubric(id: string) {
  return withDbConnection(() => rubricActions.delete(id));
}

export async function fetchRubricById(id: string) {
  return withDbConnection(() => rubricActions.fetchById(id));
}

// Add any specialized actions beyond basic CRUD
export async function fetchRubricScoresByStaff(staffId: string) {
  return withDbConnection(async () => {
    try {
      // Create custom query for specialized action
      const results = await RubricScoreModel.find({ staffId })
        .sort({ date: -1 })
        .lean()
        .exec();
      
      // Type the response items properly
      return {
        success: true,
        items: results.map(item => RubricScoreZodSchema.parse(item)) as z.infer<typeof RubricScoreZodSchema>[],
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