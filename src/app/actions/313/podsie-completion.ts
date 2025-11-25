"use server";

import { z, ZodType } from "zod";
import { revalidatePath } from "next/cache";
import { PodsieCompletionModel } from "@mongoose-schema/313/podsie-completion.model";
import {
  PodsieCompletionZodSchema,
  PodsieCompletionInputZodSchema,
  PodsieCompletion,
  PodsieCompletionInput,
  PodsieCompletionQuery,
  PodsieCompletionQuerySchema
} from "@zod-schema/313/podsie-completion";
import { createCrudActions } from "@server/crud/crud-factory";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";

// =====================================
// CRUD OPERATIONS (using factory)
// =====================================

const podsieCompletionCrud = createCrudActions({
  model: PodsieCompletionModel as unknown as Parameters<typeof createCrudActions>[0]['model'],
  schema: PodsieCompletionZodSchema as ZodType<PodsieCompletion>,
  inputSchema: PodsieCompletionInputZodSchema as ZodType<PodsieCompletionInput>,
  name: 'PodsieCompletion',
  revalidationPaths: ['/roadmaps/scope-and-sequence', '/roadmaps/ramp-up-progress'],
  sortFields: ['school', 'classSection', 'unitLessonId', 'createdAt', 'updatedAt'],
  defaultSortField: 'unitLessonId',
  defaultSortOrder: 'asc'
});

// Export CRUD operations
export const createPodsieCompletion = podsieCompletionCrud.create;
export const updatePodsieCompletion = podsieCompletionCrud.update;
export const deletePodsieCompletion = podsieCompletionCrud.delete;
export const fetchPodsieCompletion = podsieCompletionCrud.fetch;
export const fetchPodsieCompletionById = podsieCompletionCrud.fetchById;

// =====================================
// CUSTOM OPERATIONS
// =====================================

/**
 * Fetch Podsie completion configs by query
 * Supports filtering by school, classSection, unitLessonId, and active status
 */
export async function fetchPodsieCompletionByQuery(query: PodsieCompletionQuery) {
  return withDbConnection(async () => {
    try {
      // Validate query
      const validatedQuery = PodsieCompletionQuerySchema.parse(query);

      // Build MongoDB filter
      const filter: Record<string, unknown> = {};
      if (validatedQuery.school) filter.school = validatedQuery.school;
      if (validatedQuery.classSection) filter.classSection = validatedQuery.classSection;
      if (validatedQuery.unitLessonId) filter.unitLessonId = validatedQuery.unitLessonId;
      if (validatedQuery.active !== undefined) filter.active = validatedQuery.active;

      const results = await PodsieCompletionModel.find(filter)
        .sort({ unitLessonId: 1 })
        .lean();

      return {
        success: true,
        data: results
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error)
        };
      }
      console.error('💥 Error fetching Podsie completion configs:', error);
      return {
        success: false,
        error: handleServerError(error, "Failed to fetch Podsie completion configs")
      };
    }
  });
}

/**
 * Upsert a Podsie completion config
 * Updates if exists for the same school + classSection + unitLessonId, creates if not
 */
export async function upsertPodsieCompletion(data: {
  school: string;
  classSection: string;
  unitLessonId: string;
  grade?: string;
  lessonName?: string;
  scopeAndSequenceId?: string;
  podsieAssignmentId: string;
  podsieQuestionMap?: Array<{ questionNumber: number; questionId: string }>;
  totalQuestions?: number;
  active?: boolean;
  notes?: string;
}) {
  return withDbConnection(async () => {
    try {
      // Validate input
      const validatedData = PodsieCompletionInputZodSchema.parse({
        ...data,
        ownerIds: []
      });

      // Upsert by compound key: school + classSection + unitLessonId
      const result = await PodsieCompletionModel.findOneAndUpdate(
        {
          school: data.school,
          classSection: data.classSection,
          unitLessonId: data.unitLessonId
        },
        {
          $set: {
            ...validatedData,
            updatedAt: new Date().toISOString()
          },
          $setOnInsert: {
            createdAt: new Date().toISOString()
          }
        },
        { upsert: true, new: true, runValidators: true }
      );

      revalidatePath('/roadmaps/scope-and-sequence');
      revalidatePath('/roadmaps/ramp-up-progress');

      return {
        success: true,
        data: result.toObject(),
        message: `Saved Podsie config for ${data.school} ${data.classSection} - ${data.unitLessonId}`
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error)
        };
      }
      console.error('💥 Error upserting Podsie completion config:', error);
      return {
        success: false,
        error: handleServerError(error, "Failed to save Podsie completion config")
      };
    }
  });
}

/**
 * Get Podsie completion config for a specific section and lesson
 * Returns null if not found
 */
export async function getPodsieConfigForSection(
  school: string,
  classSection: string,
  unitLessonId: string
) {
  return withDbConnection(async () => {
    try {
      const result = await PodsieCompletionModel.findOne({
        school,
        classSection,
        unitLessonId,
        active: true
      }).lean();

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('💥 Error fetching Podsie config:', error);
      return {
        success: false,
        error: handleServerError(error, "Failed to fetch Podsie config")
      };
    }
  });
}

/**
 * Bulk upsert Podsie completion configs
 * Useful for importing configs for an entire section
 */
export async function bulkUpsertPodsieCompletion(
  configs: Array<{
    school: string;
    classSection: string;
    unitLessonId: string;
    grade?: string;
    lessonName?: string;
    scopeAndSequenceId?: string;
    podsieAssignmentId: string;
    podsieQuestionMap?: Array<{ questionNumber: number; questionId: string }>;
    totalQuestions?: number;
    active?: boolean;
    notes?: string;
  }>
) {
  return withDbConnection(async () => {
    try {
      const results = {
        created: 0,
        updated: 0,
        failed: [] as Array<{ unitLessonId: string; error: string }>
      };

      for (const config of configs) {
        const result = await upsertPodsieCompletion(config);
        if (result.success) {
          // Check if it was created or updated by trying to count
          const existing = await PodsieCompletionModel.countDocuments({
            school: config.school,
            classSection: config.classSection,
            unitLessonId: config.unitLessonId
          });
          if (existing === 1) {
            results.created++;
          } else {
            results.updated++;
          }
        } else {
          results.failed.push({
            unitLessonId: config.unitLessonId,
            error: result.error || "Unknown error"
          });
        }
      }

      revalidatePath('/roadmaps/scope-and-sequence');
      revalidatePath('/roadmaps/ramp-up-progress');

      return {
        success: true,
        data: results,
        message: `Processed ${configs.length} configs: ${results.created} created, ${results.updated} updated, ${results.failed.length} failed`
      };
    } catch (error) {
      console.error('💥 Error bulk upserting Podsie completion configs:', error);
      return {
        success: false,
        error: handleServerError(error, "Failed to bulk upsert Podsie completion configs")
      };
    }
  });
}
