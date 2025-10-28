"use server";

import { z, ZodType } from "zod";
import { revalidatePath } from "next/cache";
import { ScopeAndSequenceModel } from "@mongoose-schema/313/scope-and-sequence.model";
import {
  ScopeAndSequenceZodSchema,
  ScopeAndSequenceInputZodSchema,
  ScopeAndSequence,
  ScopeAndSequenceInput
} from "@zod-schema/313/scope-and-sequence";
import { createCrudActions } from "@server/crud/crud-factory";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";

// =====================================
// CRUD OPERATIONS (using factory)
// =====================================

const scopeAndSequenceCrud = createCrudActions({
  model: ScopeAndSequenceModel as unknown as Parameters<typeof createCrudActions>[0]['model'],
  schema: ScopeAndSequenceZodSchema as ZodType<ScopeAndSequence>,
  inputSchema: ScopeAndSequenceInputZodSchema as ZodType<ScopeAndSequenceInput>,
  name: 'ScopeAndSequence',
  revalidationPaths: ['/roadmaps/scope-and-sequence'],
  sortFields: ['grade', 'unitNumber', 'lessonNumber', 'createdAt', 'updatedAt'],
  defaultSortField: 'unitNumber',
  defaultSortOrder: 'asc'
});

// Export CRUD operations
export const createScopeAndSequence = scopeAndSequenceCrud.create;
export const updateScopeAndSequence = scopeAndSequenceCrud.update;
export const deleteScopeAndSequence = scopeAndSequenceCrud.delete;
export const fetchScopeAndSequence = scopeAndSequenceCrud.fetch;
export const fetchScopeAndSequenceById = scopeAndSequenceCrud.fetchById;

// =====================================
// CUSTOM OPERATIONS
// =====================================

/**
 * Upsert a scope and sequence entry by unitLessonId
 * Updates if exists, creates if not
 */
export async function upsertScopeAndSequence(data: {
  grade: string;
  unit: string;
  unitLessonId: string;
  unitNumber: number;
  lessonNumber: number;
  lessonName: string;
  section?: string;
  scopeSequenceTag?: string;
}) {
  return withDbConnection(async () => {
    try {
      // Validate input
      const validatedData = ScopeAndSequenceInputZodSchema.parse({
        ...data,
        ownerIds: []
      });

      // Upsert by compound key: grade + unitLessonId + scopeSequenceTag
      const result = await ScopeAndSequenceModel.findOneAndUpdate(
        {
          grade: data.grade,
          unitLessonId: data.unitLessonId,
          scopeSequenceTag: data.scopeSequenceTag || null
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

      return {
        success: true,
        data: result.toObject(),
        message: `Saved ${data.unitLessonId}: ${data.lessonName}`
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error)
        };
      }
      console.error('💥 Error upserting scope and sequence:', error);
      return {
        success: false,
        error: handleServerError(error, 'upsertScopeAndSequence')
      };
    }
  });
}

/**
 * Bulk upsert scope and sequence entries
 */
export async function bulkUpsertScopeAndSequence(
  entries: Array<{
    grade: string;
    unit: string;
    unitLessonId: string;
    unitNumber: number;
    lessonNumber: number;
    lessonName: string;
    section?: string;
    scopeSequenceTag?: string;
  }>
) {
  return withDbConnection(async () => {
    try {
      console.log(`📊 [BULK UPSERT] Starting bulk upsert of ${entries.length} entries`);

      const results = {
        created: [] as string[],
        updated: [] as string[],
        failed: [] as { unitLessonId: string; error: string }[]
      };

      let processedCount = 0;

      for (const entry of entries) {
        processedCount++;
        console.log(`🔄 [${processedCount}/${entries.length}] Processing: ${entry.unitLessonId}`);

        try {
          // Validate the data first
          console.log(`   ✓ Validating data for ${entry.unitLessonId}...`);
          const validatedData = ScopeAndSequenceInputZodSchema.parse({
            ...entry,
            ownerIds: []
          });

          console.log(`   ✓ Looking for existing entry with grade: ${entry.grade}, unitLessonId: ${entry.unitLessonId}, tag: ${entry.scopeSequenceTag || 'none'}`);
          const existingEntry = await ScopeAndSequenceModel.findOne({
            grade: entry.grade,
            unitLessonId: entry.unitLessonId,
            scopeSequenceTag: entry.scopeSequenceTag || null
          });

          if (existingEntry) {
            console.log(`   📝 Updating existing entry: ${entry.unitLessonId}`);
            const updated = await ScopeAndSequenceModel.findByIdAndUpdate(
              existingEntry._id,
              {
                $set: {
                  ...validatedData,
                  updatedAt: new Date().toISOString()
                }
              },
              { new: true, runValidators: true }
            );

            if (updated) {
              results.updated.push(entry.unitLessonId);
              console.log(`   ✅ Successfully updated: ${entry.unitLessonId}`);
            } else {
              throw new Error('Update returned null');
            }
          } else {
            console.log(`   ✨ Creating new entry: ${entry.unitLessonId}`);
            const created = await ScopeAndSequenceModel.create({
              ...validatedData,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });

            if (created) {
              results.created.push(entry.unitLessonId);
              console.log(`   ✅ Successfully created: ${entry.unitLessonId}`);
            } else {
              throw new Error('Create returned null');
            }
          }
        } catch (itemError) {
          console.error(`   ❌ Error processing entry ${entry.unitLessonId}:`, itemError);

          // Log detailed error information
          if (itemError instanceof Error) {
            console.error(`   📋 Error name: ${itemError.name}`);
            console.error(`   📋 Error message: ${itemError.message}`);
            console.error(`   📋 Error stack:`, itemError.stack);
          }

          results.failed.push({
            unitLessonId: entry.unitLessonId || 'unknown',
            error: itemError instanceof Error ? itemError.message : 'Unknown error'
          });
        }
      }

      console.log(`📊 [BULK UPSERT] Completed processing ${processedCount} entries`);
      console.log(`📊 [BULK UPSERT] Results: Created: ${results.created.length}, Updated: ${results.updated.length}, Failed: ${results.failed.length}`);

      if (results.failed.length > 0) {
        console.error(`⚠️  [BULK UPSERT] Failed entries:`, results.failed);
      }

      revalidatePath('/roadmaps/scope-and-sequence');

      return {
        success: true,
        data: results,
        message: `Created: ${results.created.length}, Updated: ${results.updated.length}, Failed: ${results.failed.length}`
      };
    } catch (error) {
      console.error('💥 Error in bulk upsert:', error);
      return {
        success: false,
        error: handleServerError(error, 'bulkUpsertScopeAndSequence')
      };
    }
  });
}

/**
 * Fetch scope and sequence by grade
 */
export async function fetchScopeAndSequenceByGrade(grade: string) {
  return withDbConnection(async () => {
    try {
      const entries = await ScopeAndSequenceModel
        .find({ grade })
        .sort({ unitNumber: 1, lessonNumber: 1 })
        .exec();

      return {
        success: true,
        data: entries.map(entry => entry.toObject())
      };
    } catch (error) {
      console.error('💥 Error fetching scope and sequence by grade:', error);
      return {
        success: false,
        error: handleServerError(error, 'fetchScopeAndSequenceByGrade')
      };
    }
  });
}

/**
 * Fetch scope and sequence by unit
 */
export async function fetchScopeAndSequenceByUnit(grade: string, unitNumber: number) {
  return withDbConnection(async () => {
    try {
      const entries = await ScopeAndSequenceModel
        .find({ grade, unitNumber })
        .sort({ lessonNumber: 1 })
        .exec();

      return {
        success: true,
        data: entries.map(entry => entry.toObject())
      };
    } catch (error) {
      console.error('💥 Error fetching scope and sequence by unit:', error);
      return {
        success: false,
        error: handleServerError(error, 'fetchScopeAndSequenceByUnit')
      };
    }
  });
}

/**
 * Update roadmap and target skills for a lesson
 * Uses direct MongoDB update to properly handle array fields
 */
export async function updateLessonSkills(
  id: string,
  data: {
    roadmapSkills?: string[];
    targetSkills?: string[];
  }
) {
  return withDbConnection(async () => {
    try {
      console.log(`🔄 [updateLessonSkills] Starting update for lesson ID: ${id}`);
      console.log(`   📝 Roadmap skills to set:`, data.roadmapSkills);
      console.log(`   📝 Target skills to set:`, data.targetSkills);

      // Build update object
      const updateFields: Record<string, unknown> = {
        updatedAt: new Date().toISOString()
      };

      if (data.roadmapSkills !== undefined) {
        updateFields.roadmapSkills = data.roadmapSkills;
      }

      if (data.targetSkills !== undefined) {
        updateFields.targetSkills = data.targetSkills;
      }

      console.log(`   🔧 Update fields:`, JSON.stringify(updateFields, null, 2));

      // First, fetch the document to see its current state
      const beforeDoc = await ScopeAndSequenceModel.findById(id);
      if (!beforeDoc) {
        console.error(`   ❌ Lesson with ID ${id} not found`);
        return {
          success: false,
          error: `Lesson with ID ${id} not found`
        };
      }

      console.log(`   📋 BEFORE update - roadmapSkills:`, beforeDoc.roadmapSkills);
      console.log(`   📋 BEFORE update - targetSkills:`, beforeDoc.targetSkills);

      // Direct MongoDB update using $set
      const updatedDoc = await ScopeAndSequenceModel.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: false } // Disable validators to allow empty arrays
      );

      if (!updatedDoc) {
        console.error(`   ❌ Update returned null`);
        return {
          success: false,
          error: `Update failed for lesson with ID ${id}`
        };
      }

      console.log(`   ✅ Successfully updated lesson`);
      console.log(`   📊 AFTER update - roadmapSkills:`, updatedDoc.roadmapSkills);
      console.log(`   📊 AFTER update - targetSkills:`, updatedDoc.targetSkills);
      console.log(`   📊 AFTER update - updatedAt:`, updatedDoc.get('updatedAt'));

      revalidatePath('/roadmaps/scope-and-sequence');

      return {
        success: true,
        data: updatedDoc.toObject(),
        message: `Skills updated successfully`
      };
    } catch (error) {
      console.error('💥 [updateLessonSkills] Error:', error);
      return {
        success: false,
        error: handleServerError(error, 'updateLessonSkills')
      };
    }
  });
}
