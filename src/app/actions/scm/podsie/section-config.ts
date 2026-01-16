"use server";

import { z, ZodType } from "zod";
import { revalidatePath } from "next/cache";
import { SectionConfigModel } from "@mongoose-schema/scm/podsie/section-config.model";
import {
  SectionConfigZodSchema,
  SectionConfigInputZodSchema,
  SectionConfig,
  SectionConfigInput,
  SectionConfigQuery,
  SectionConfigQuerySchema,
  AssignmentContent,
  SectionOption,
  PodsieQuestionMap,
  YoutubeLink
} from "@zod-schema/scm/podsie/section-config";
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
  assignmentContent?: AssignmentContent[];
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
 * @deprecated This function uses the old schema and needs refactoring for the new assignmentContent structure
 * Updates if an assignment with the same podsieAssignmentId already exists
 */
export async function addPodsieAssignment(
  school: string,
  classSection: string,
  assignment: any // eslint-disable-line @typescript-eslint/no-explicit-any
) {
  return withDbConnection(async () => {
    try {
      // NOTE: This function still uses old schema with podsieAssignments array
      // Needs refactoring to work with new assignmentContent structure

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
 * @deprecated This function uses the old schema and needs refactoring for the new assignmentContent structure
 */
export async function updatePodsieAssignment(
  school: string,
  classSection: string,
  unitLessonId: string,
  updates: any // eslint-disable-line @typescript-eslint/no-explicit-any
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
 * @deprecated This function uses the old schema and needs refactoring for the new assignmentContent structure
 */
export async function getPodsieAssignment(
  school: string,
  classSection: string,
  unitLessonId: string
) {
  return withDbConnection(async () => {
    try {
      interface SectionConfigWithAssignment {
        podsieAssignments?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
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

// =====================================
// NEW SCHEMA OPERATIONS
// =====================================

/**
 * Add or update assignment content in a section config
 * Uses the new assignmentContent schema structure
 */
export async function addAssignmentContent(
  school: string,
  classSection: string,
  assignment: {
    scopeAndSequenceId: string;
    unitLessonId: string;
    lessonName: string;
    section?: string;
    subsection?: number;
    grade?: string;
    activityType: 'sidekick' | 'mastery-check' | 'assessment';
    podsieAssignmentId: string;
    podsieQuestionMap: PodsieQuestionMap[];
    totalQuestions: number;
    variations?: number;
    q1HasVariations?: boolean;
    hasZearnLesson?: boolean;
    active?: boolean;
  }
): Promise<{ success: boolean; data?: SectionConfig; error?: string }> {
  try {
    return await withDbConnection(async () => {
      // Find the section config
      const config = await SectionConfigModel.findOne({ school, classSection });

      if (!config) {
        return {
          success: false,
          error: 'Section config not found. Please create it first.'
        };
      }

      // Get assignmentContent as a plain array
      const assignmentContentArray = config.assignmentContent as unknown as AssignmentContent[];

      // Check if assignment content with this scopeAndSequenceId already exists
      const existingIndex = assignmentContentArray.findIndex(
        (a: AssignmentContent) => a.scopeAndSequenceId?.toString() === assignment.scopeAndSequenceId
      );

      if (existingIndex >= 0) {
        // Assignment content exists, check if activity with this podsieAssignmentId exists
        const existingAssignment = assignmentContentArray[existingIndex];
        const activityIndex = existingAssignment.podsieActivities?.findIndex(
          (a) => a.podsieAssignmentId === assignment.podsieAssignmentId
        ) ?? -1;

        if (activityIndex >= 0) {
          // Update existing activity
          if (existingAssignment.podsieActivities) {
            existingAssignment.podsieActivities[activityIndex] = {
              activityType: assignment.activityType,
              podsieAssignmentId: assignment.podsieAssignmentId,
              podsieQuestionMap: assignment.podsieQuestionMap,
              totalQuestions: assignment.totalQuestions,
              variations: assignment.variations ?? 3,
              q1HasVariations: assignment.q1HasVariations ?? false,
              active: assignment.active ?? true
            };
          }
        } else {
          // Add new activity to existing assignment
          if (!existingAssignment.podsieActivities) {
            existingAssignment.podsieActivities = [];
          }
          existingAssignment.podsieActivities.push({
            activityType: assignment.activityType,
            podsieAssignmentId: assignment.podsieAssignmentId,
            podsieQuestionMap: assignment.podsieQuestionMap,
            totalQuestions: assignment.totalQuestions,
            variations: assignment.variations ?? 3,
            q1HasVariations: assignment.q1HasVariations ?? false,
            active: assignment.active ?? true
          });
        }

        // Update the assignment in the config
        config.assignmentContent = assignmentContentArray as never;
      } else {
        // Add new assignment content
        assignmentContentArray.push({
          scopeAndSequenceId: assignment.scopeAndSequenceId,
          unitLessonId: assignment.unitLessonId,
          lessonName: assignment.lessonName,
          section: assignment.section,
          subsection: assignment.subsection,
          grade: assignment.grade,
          podsieActivities: [
            {
              activityType: assignment.activityType,
              podsieAssignmentId: assignment.podsieAssignmentId,
              podsieQuestionMap: assignment.podsieQuestionMap,
              totalQuestions: assignment.totalQuestions,
              variations: assignment.variations ?? 3,
              q1HasVariations: assignment.q1HasVariations ?? false,
              active: assignment.active ?? true
            }
          ],
          zearnActivity: assignment.hasZearnLesson
            ? { active: true }
            : undefined,
          active: true
        });
        config.assignmentContent = assignmentContentArray as never;
      }

      await config.save();

      revalidatePath('/scm/roadmaps/section-configs');
      revalidatePath('/scm/podsie/progress');

      return {
        success: true,
        data: JSON.parse(JSON.stringify(config.toJSON())) as SectionConfig
      };
    });
  } catch (error) {
    return {
      success: false,
      error: handleServerError(error, 'Failed to add assignment content')
    };
  }
}

/**
 * Update question map for an existing Podsie activity
 */
export async function updatePodsieQuestionMap(
  school: string,
  classSection: string,
  podsieAssignmentId: string,
  questionMap: PodsieQuestionMap[]
): Promise<{ success: boolean; error?: string }> {
  try {
    return await withDbConnection(async () => {
      const config = await SectionConfigModel.findOne({ school, classSection });

      if (!config) {
        return { success: false, error: 'Section config not found' };
      }

      const assignmentContentArray = config.assignmentContent as unknown as AssignmentContent[];

      // Find the assignment content that contains this Podsie activity
      let found = false;
      for (const content of assignmentContentArray) {
        if (content.podsieActivities) {
          const activityIndex = content.podsieActivities.findIndex(
            (a) => a.podsieAssignmentId === podsieAssignmentId
          );
          if (activityIndex >= 0) {
            content.podsieActivities[activityIndex].podsieQuestionMap = questionMap;
            content.podsieActivities[activityIndex].totalQuestions = questionMap.length;
            found = true;
            break;
          }
        }
      }

      if (!found) {
        return { success: false, error: 'Podsie activity not found' };
      }

      config.assignmentContent = assignmentContentArray as never;
      await config.save();

      revalidatePath('/scm/roadmaps/section-configs');
      revalidatePath('/scm/podsie/progress');

      return { success: true };
    });
  } catch (error) {
    return {
      success: false,
      error: handleServerError(error, 'Failed to update question map')
    };
  }
}

/**
 * Get assignment content from a section config
 * Returns array in new assignmentContent format
 */
export async function getAssignmentContent(
  school: string,
  classSection: string
): Promise<{ success: boolean; data?: AssignmentContent[]; error?: string }> {
  try {
    return await withDbConnection(async () => {
      const config = await SectionConfigModel.findOne({ school, classSection }).lean();

      if (!config) {
        return { success: true, data: [] };
      }

      // Serialize to ensure proper type conversion
      const serialized = JSON.parse(JSON.stringify(config.assignmentContent || []));

      return {
        success: true,
        data: serialized as AssignmentContent[]
      };
    });
  } catch (error) {
    return {
      success: false,
      error: handleServerError(error, 'Failed to fetch assignment content')
    };
  }
}

/**
 * Update subsections for multiple lessons in a section config
 * Creates assignmentContent entries if they don't exist
 * Used by calendar page to manage subsections via drag-drop UI
 */
export async function updateLessonSubsections(
  school: string,
  classSection: string,
  updates: Array<{
    scopeAndSequenceId: string;
    unitLessonId: string;
    lessonName: string;
    section: string;
    subsection: number | null; // null to clear subsection
    grade: string;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    return await withDbConnection(async () => {
      // Find or create the section config
      let config = await SectionConfigModel.findOne({ school, classSection });

      if (!config) {
        // Create a new config if it doesn't exist
        const gradeLevel = updates[0]?.grade || '6';
        config = new SectionConfigModel({
          school,
          classSection,
          gradeLevel,
          active: true,
          assignmentContent: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      // Get assignmentContent as a mutable array
      const assignmentContentArray = (config.assignmentContent as unknown as AssignmentContent[]) || [];

      // Process each update
      for (const update of updates) {
        // Helper to normalize ObjectId/string to comparable string
        const normalizeId = (id: unknown): string => {
          if (!id) return '';
          // Handle ObjectId, string, or object with $oid property
          if (typeof id === 'object' && id !== null) {
            if ('$oid' in id) return String((id as { $oid: string }).$oid);
            if ('str' in id) return String((id as { str: string }).str);
          }
          return String(id);
        };

        const updateId = normalizeId(update.scopeAndSequenceId);

        // Find existing entry by scopeAndSequenceId - prefer entries WITH Podsie activities
        let existingIndex = assignmentContentArray.findIndex(
          (a: AssignmentContent) =>
            normalizeId(a.scopeAndSequenceId) === updateId &&
            a.podsieActivities && a.podsieActivities.length > 0
        );

        // If not found with Podsie, try without that constraint
        if (existingIndex < 0) {
          existingIndex = assignmentContentArray.findIndex(
            (a: AssignmentContent) => normalizeId(a.scopeAndSequenceId) === updateId
          );
        }

        // Fallback: search by unitLessonId - prefer entries WITH Podsie activities
        if (existingIndex < 0) {
          existingIndex = assignmentContentArray.findIndex(
            (a: AssignmentContent) =>
              a.unitLessonId === update.unitLessonId &&
              a.podsieActivities && a.podsieActivities.length > 0
          );
        }

        // Final fallback: any entry with matching unitLessonId
        if (existingIndex < 0) {
          existingIndex = assignmentContentArray.findIndex(
            (a: AssignmentContent) => a.unitLessonId === update.unitLessonId
          );
        }

        if (existingIndex >= 0) {
          // Update existing entry's subsection
          if (update.subsection === null) {
            // Clear subsection (set to undefined)
            delete (assignmentContentArray[existingIndex] as Record<string, unknown>).subsection;
          } else {
            assignmentContentArray[existingIndex].subsection = update.subsection;
          }
          // Also update scopeAndSequenceId if it was missing (migrate old data)
          if (!assignmentContentArray[existingIndex].scopeAndSequenceId) {
            assignmentContentArray[existingIndex].scopeAndSequenceId = update.scopeAndSequenceId;
          }
        } else {
          // Create new assignmentContent entry with subsection
          const newEntry: AssignmentContent = {
            scopeAndSequenceId: update.scopeAndSequenceId,
            unitLessonId: update.unitLessonId,
            lessonName: update.lessonName,
            section: update.section,
            grade: update.grade,
            podsieActivities: [],
            active: true
          };

          if (update.subsection !== null) {
            newEntry.subsection = update.subsection;
          }

          assignmentContentArray.push(newEntry);
        }
      }

      config.assignmentContent = assignmentContentArray as never;
      (config as unknown as Record<string, unknown>).updatedAt = new Date().toISOString();
      await config.save();

      revalidatePath('/scm/content/calendar');
      revalidatePath('/scm/podsie/progress');

      return { success: true };
    });
  } catch (error) {
    console.error('[updateLessonSubsections] Error:', error);
    return {
      success: false,
      error: handleServerError(error, 'Failed to update lesson subsections')
    };
  }
}

// =====================================
// YOUTUBE LINK OPERATIONS
// =====================================

/**
 * Get YouTube links and active URL for a section
 */
export async function getYoutubeLinks(
  school: string,
  classSection: string
): Promise<{ success: boolean; data?: { youtubeLinks: YoutubeLink[]; activeYoutubeUrl?: string }; error?: string }> {
  return withDbConnection(async () => {
    try {
      const config = await SectionConfigModel.findOne(
        { school, classSection },
        { youtubeLinks: 1, activeYoutubeUrl: 1 }
      ).lean();

      if (!config) {
        return { success: true, data: { youtubeLinks: [], activeYoutubeUrl: undefined } };
      }

      // Serialize to ensure proper types
      const serialized = JSON.parse(JSON.stringify(config));

      return {
        success: true,
        data: {
          youtubeLinks: (serialized.youtubeLinks as YoutubeLink[]) || [],
          activeYoutubeUrl: serialized.activeYoutubeUrl as string | undefined
        }
      };
    } catch (error) {
      console.error('💥 Error fetching YouTube links:', error);
      return {
        success: false,
        error: handleServerError(error, 'Failed to fetch YouTube links')
      };
    }
  });
}

/**
 * Add a new YouTube link to a section
 */
export async function addYoutubeLink(
  school: string,
  classSection: string,
  link: YoutubeLink
): Promise<{ success: boolean; data?: YoutubeLink[]; error?: string }> {
  return withDbConnection(async () => {
    try {
      const result = await SectionConfigModel.findOneAndUpdate(
        { school, classSection },
        {
          $push: { youtubeLinks: link },
          $set: { updatedAt: new Date().toISOString() }
        },
        { new: true }
      ).lean();

      if (!result) {
        return { success: false, error: 'Section config not found' };
      }

      revalidatePath('/scm/podsie/progress');

      // Serialize to ensure proper types
      const serialized = JSON.parse(JSON.stringify(result));

      return {
        success: true,
        data: serialized.youtubeLinks as YoutubeLink[]
      };
    } catch (error) {
      console.error('💥 Error adding YouTube link:', error);
      return {
        success: false,
        error: handleServerError(error, 'Failed to add YouTube link')
      };
    }
  });
}

/**
 * Remove a YouTube link from a section
 */
export async function removeYoutubeLink(
  school: string,
  classSection: string,
  url: string
): Promise<{ success: boolean; data?: YoutubeLink[]; error?: string }> {
  return withDbConnection(async () => {
    try {
      // First check if this URL is active, if so clear it
      const config = await SectionConfigModel.findOne({ school, classSection }).lean();
      const configJson = config ? JSON.parse(JSON.stringify(config)) : null;
      const isActiveUrl = configJson?.activeYoutubeUrl === url;

      const result = await SectionConfigModel.findOneAndUpdate(
        { school, classSection },
        {
          $pull: { youtubeLinks: { url } },
          $set: {
            updatedAt: new Date().toISOString(),
            ...(isActiveUrl ? { activeYoutubeUrl: null } : {})
          }
        },
        { new: true }
      ).lean();

      if (!result) {
        return { success: false, error: 'Section config not found' };
      }

      revalidatePath('/scm/podsie/progress');

      // Serialize to ensure proper types
      const serialized = JSON.parse(JSON.stringify(result));

      return {
        success: true,
        data: serialized.youtubeLinks as YoutubeLink[]
      };
    } catch (error) {
      console.error('💥 Error removing YouTube link:', error);
      return {
        success: false,
        error: handleServerError(error, 'Failed to remove YouTube link')
      };
    }
  });
}

/**
 * Set the active YouTube URL for a section
 */
export async function setActiveYoutubeUrl(
  school: string,
  classSection: string,
  url: string | null
): Promise<{ success: boolean; error?: string }> {
  return withDbConnection(async () => {
    try {
      const result = await SectionConfigModel.findOneAndUpdate(
        { school, classSection },
        {
          $set: {
            activeYoutubeUrl: url,
            updatedAt: new Date().toISOString()
          }
        },
        { new: true }
      );

      if (!result) {
        return { success: false, error: 'Section config not found' };
      }

      revalidatePath('/scm/podsie/progress');

      return { success: true };
    } catch (error) {
      console.error('💥 Error setting active YouTube URL:', error);
      return {
        success: false,
        error: handleServerError(error, 'Failed to set active YouTube URL')
      };
    }
  });
}

/**
 * Copy YouTube links from another section
 */
export async function copyYoutubeLinksFromSection(
  school: string,
  classSection: string,
  sourceSchool: string,
  sourceClassSection: string
): Promise<{ success: boolean; data?: YoutubeLink[]; error?: string }> {
  return withDbConnection(async () => {
    try {
      // Get source section's YouTube links
      const sourceConfig = await SectionConfigModel.findOne(
        { school: sourceSchool, classSection: sourceClassSection },
        { youtubeLinks: 1 }
      ).lean();

      if (!sourceConfig) {
        return { success: false, error: 'Source section not found' };
      }

      // Serialize to ensure proper types
      const sourceJson = JSON.parse(JSON.stringify(sourceConfig));
      const sourceLinks = (sourceJson.youtubeLinks as YoutubeLink[]) || [];

      if (sourceLinks.length === 0) {
        return { success: false, error: 'Source section has no YouTube links' };
      }

      // Get target section's current links to avoid duplicates
      const targetConfig = await SectionConfigModel.findOne(
        { school, classSection },
        { youtubeLinks: 1 }
      ).lean();

      const targetJson = targetConfig ? JSON.parse(JSON.stringify(targetConfig)) : null;
      const existingUrls = new Set(
        ((targetJson?.youtubeLinks as YoutubeLink[]) || []).map((l: YoutubeLink) => l.url)
      );

      // Filter out duplicates
      const newLinks = sourceLinks.filter((l: YoutubeLink) => !existingUrls.has(l.url));

      if (newLinks.length === 0) {
        return { success: false, error: 'All links from source section already exist' };
      }

      // Add new links
      const result = await SectionConfigModel.findOneAndUpdate(
        { school, classSection },
        {
          $push: { youtubeLinks: { $each: newLinks } },
          $set: { updatedAt: new Date().toISOString() }
        },
        { new: true }
      ).lean();

      if (!result) {
        return { success: false, error: 'Target section not found' };
      }

      revalidatePath('/scm/podsie/progress');

      // Serialize to ensure proper types
      const serialized = JSON.parse(JSON.stringify(result));

      return {
        success: true,
        data: serialized.youtubeLinks as YoutubeLink[]
      };
    } catch (error) {
      console.error('💥 Error copying YouTube links:', error);
      return {
        success: false,
        error: handleServerError(error, 'Failed to copy YouTube links')
      };
    }
  });
}
