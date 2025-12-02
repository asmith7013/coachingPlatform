"use server";

import { z, ZodType } from "zod";
import { revalidatePath } from "next/cache";
import { SectionConfigModel } from "@mongoose-schema/313/section-config.model";
import {
  SectionConfigZodSchema,
  SectionConfigInputZodSchema,
  SectionConfig,
  SectionConfigInput,
  SectionConfigQuery,
  SectionConfigQuerySchema,
  PodsieAssignment,
  SectionOption
} from "@zod-schema/313/section-config";
import { createCrudActions } from "@server/crud/crud-factory";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";

// =====================================
// CRUD OPERATIONS (using factory)
// =====================================

const sectionConfigCrud = createCrudActions({
  model: SectionConfigModel as unknown as Parameters<typeof createCrudActions>[0]['model'],
  schema: SectionConfigZodSchema as ZodType<SectionConfig>,
  inputSchema: SectionConfigInputZodSchema as ZodType<SectionConfigInput>,
  name: 'SectionConfig',
  revalidationPaths: ['/roadmaps/ramp-up-progress', '/roadmaps/scope-and-sequence'],
  sortFields: ['school', 'classSection', 'gradeLevel', 'createdAt', 'updatedAt'],
  defaultSortField: 'classSection',
  defaultSortOrder: 'asc'
});

// Export CRUD operations
export const createSectionConfig = sectionConfigCrud.create;
export const updateSectionConfig = sectionConfigCrud.update;
export const deleteSectionConfig = sectionConfigCrud.delete;
export const fetchSectionConfigs = sectionConfigCrud.fetch;
export const fetchSectionConfigById = sectionConfigCrud.fetchById;

// =====================================
// CUSTOM OPERATIONS
// =====================================

/**
 * Fetch section configs by query
 * Supports filtering by school, classSection, teacher, gradeLevel, and active status
 */
export async function fetchSectionConfigsByQuery(query: SectionConfigQuery) {
  return withDbConnection(async () => {
    try {
      // Validate query
      const validatedQuery = SectionConfigQuerySchema.parse(query);

      // Build MongoDB filter
      const filter: Record<string, unknown> = {};
      if (validatedQuery.school) filter.school = validatedQuery.school;
      if (validatedQuery.classSection) filter.classSection = validatedQuery.classSection;
      if (validatedQuery.teacher) filter.teacher = validatedQuery.teacher;
      if (validatedQuery.gradeLevel) filter.gradeLevel = validatedQuery.gradeLevel;
      if (validatedQuery.active !== undefined) filter.active = validatedQuery.active;

      const results = await SectionConfigModel.find(filter)
        .sort({ school: 1, classSection: 1 })
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
      console.error('💥 Error fetching section configs:', error);
      return {
        success: false,
        error: handleServerError(error, "Failed to fetch section configs")
      };
    }
  });
}

/**
 * Get section config for a specific school and class section
 * Returns null if not found
 */
export async function getSectionConfig(school: string, classSection: string) {
  return withDbConnection(async () => {
    try {
      const result = await SectionConfigModel.findOne({
        school,
        classSection,
        active: true
      }).lean();

      // Serialize the result to ensure it's JSON-compatible
      const serializedResult = result ? JSON.parse(JSON.stringify(result)) : null;

      return {
        success: true,
        data: serializedResult
      };
    } catch (error) {
      console.error('💥 Error fetching section config:', error);
      return {
        success: false,
        error: handleServerError(error, "Failed to fetch section config")
      };
    }
  });
}

/**
 * Upsert a section config
 * Updates if exists for the same school + classSection, creates if not
 */
export async function upsertSectionConfig(data: {
  school: string;
  classSection: string;
  teacher?: string;
  gradeLevel: string;
  scopeSequenceTag?: string;
  groupId?: string;
  active?: boolean;
  podsieAssignments?: PodsieAssignment[];
  notes?: string;
}) {
  return withDbConnection(async () => {
    try {
      // Validate input
      const validatedData = SectionConfigInputZodSchema.parse({
        ...data,
        ownerIds: []
      });

      // Upsert by compound key: school + classSection
      const result = await SectionConfigModel.findOneAndUpdate(
        {
          school: data.school,
          classSection: data.classSection
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

      revalidatePath('/roadmaps/ramp-up-progress');
      revalidatePath('/roadmaps/scope-and-sequence');

      return {
        success: true,
        data: result.toObject(),
        message: `Saved config for ${data.school} ${data.classSection}`
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error)
        };
      }
      console.error('💥 Error upserting section config:', error);
      return {
        success: false,
        error: handleServerError(error, "Failed to save section config")
      };
    }
  });
}

/**
 * Add a Podsie assignment to a section config
 * Updates if an assignment with the same podsieAssignmentId already exists
 */
export async function addPodsieAssignment(
  school: string,
  classSection: string,
  assignment: PodsieAssignment
) {
  return withDbConnection(async () => {
    try {
      // First, try to update existing assignment with same podsieAssignmentId
      const updateResult = await SectionConfigModel.findOneAndUpdate(
        {
          school,
          classSection,
          'podsieAssignments.podsieAssignmentId': assignment.podsieAssignmentId
        },
        {
          $set: {
            'podsieAssignments.$': assignment,
            updatedAt: new Date().toISOString()
          }
        },
        { new: true, runValidators: true }
      );

      // If found and updated, return success
      if (updateResult) {
        revalidatePath('/roadmaps/ramp-up-progress');
        revalidatePath('/roadmaps/scope-and-sequence');

        return {
          success: true,
          data: updateResult.toObject(),
          message: `Updated assignment ${assignment.unitLessonId} in ${school} ${classSection}`
        };
      }

      // Otherwise, push as new assignment
      const pushResult = await SectionConfigModel.findOneAndUpdate(
        { school, classSection },
        {
          $push: { podsieAssignments: assignment },
          $set: { updatedAt: new Date().toISOString() }
        },
        { new: true, runValidators: true }
      );

      if (!pushResult) {
        return {
          success: false,
          error: "Section config not found"
        };
      }

      revalidatePath('/roadmaps/ramp-up-progress');
      revalidatePath('/roadmaps/scope-and-sequence');

      return {
        success: true,
        data: pushResult.toObject(),
        message: `Added assignment ${assignment.unitLessonId} to ${school} ${classSection}`
      };
    } catch (error) {
      console.error('💥 Error adding Podsie assignment:', error);
      return {
        success: false,
        error: handleServerError(error, "Failed to add Podsie assignment")
      };
    }
  });
}

/**
 * Update a Podsie assignment in a section config
 */
export async function updatePodsieAssignment(
  school: string,
  classSection: string,
  unitLessonId: string,
  updates: Partial<PodsieAssignment>
) {
  return withDbConnection(async () => {
    try {
      const result = await SectionConfigModel.findOneAndUpdate(
        {
          school,
          classSection,
          'podsieAssignments.unitLessonId': unitLessonId
        },
        {
          $set: {
            'podsieAssignments.$': { ...updates, unitLessonId },
            updatedAt: new Date().toISOString()
          }
        },
        { new: true, runValidators: true }
      );

      if (!result) {
        return {
          success: false,
          error: "Assignment not found"
        };
      }

      revalidatePath('/roadmaps/ramp-up-progress');
      revalidatePath('/roadmaps/scope-and-sequence');

      return {
        success: true,
        data: result.toObject(),
        message: `Updated assignment ${unitLessonId}`
      };
    } catch (error) {
      console.error('💥 Error updating Podsie assignment:', error);
      return {
        success: false,
        error: handleServerError(error, "Failed to update Podsie assignment")
      };
    }
  });
}

/**
 * Remove a Podsie assignment from a section config
 */
export async function removePodsieAssignment(
  school: string,
  classSection: string,
  unitLessonId: string
) {
  return withDbConnection(async () => {
    try {
      const result = await SectionConfigModel.findOneAndUpdate(
        { school, classSection },
        {
          $pull: { podsieAssignments: { unitLessonId } },
          $set: { updatedAt: new Date().toISOString() }
        },
        { new: true }
      );

      if (!result) {
        return {
          success: false,
          error: "Section config not found"
        };
      }

      revalidatePath('/roadmaps/ramp-up-progress');
      revalidatePath('/roadmaps/scope-and-sequence');

      return {
        success: true,
        data: result.toObject(),
        message: `Removed assignment ${unitLessonId}`
      };
    } catch (error) {
      console.error('💥 Error removing Podsie assignment:', error);
      return {
        success: false,
        error: handleServerError(error, "Failed to remove Podsie assignment")
      };
    }
  });
}

/**
 * Get all active sections as dropdown options
 * Includes metadata for easy display
 */
export async function getSectionOptions(): Promise<{ success: boolean; data?: SectionOption[]; error?: string }> {
  return withDbConnection(async () => {
    try {
      interface SectionConfigDoc {
        school: string;
        classSection: string;
        teacher?: string;
        gradeLevel: string;
        scopeSequenceTag?: string;
        podsieAssignments?: unknown[];
      }

      const configs = await SectionConfigModel.find({ active: true })
        .sort({ school: 1, classSection: 1 })
        .lean<SectionConfigDoc[]>();

      const options: SectionOption[] = configs.map(config => ({
        school: String(config.school),
        classSection: String(config.classSection),
        teacher: config.teacher ? String(config.teacher) : undefined,
        gradeLevel: String(config.gradeLevel),
        scopeSequenceTag: config.scopeSequenceTag ? String(config.scopeSequenceTag) : undefined,
        assignmentCount: config.podsieAssignments?.length || 0
      }));

      return {
        success: true,
        data: options
      };
    } catch (error) {
      console.error('💥 Error fetching section options:', error);
      return {
        success: false,
        error: handleServerError(error, "Failed to fetch section options")
      };
    }
  });
}

/**
 * Get Podsie assignment for a specific lesson in a section
 */
export async function getPodsieAssignment(
  school: string,
  classSection: string,
  unitLessonId: string
) {
  return withDbConnection(async () => {
    try {
      interface SectionConfigWithAssignment {
        podsieAssignments?: PodsieAssignment[];
      }

      const config = await SectionConfigModel.findOne(
        {
          school,
          classSection,
          'podsieAssignments.unitLessonId': unitLessonId
        },
        {
          'podsieAssignments.$': 1
        }
      ).lean<SectionConfigWithAssignment>();

      const assignment = config?.podsieAssignments?.[0];

      return {
        success: true,
        data: assignment || null
      };
    } catch (error) {
      console.error('💥 Error fetching Podsie assignment:', error);
      return {
        success: false,
        error: handleServerError(error, "Failed to fetch Podsie assignment")
      };
    }
  });
}
