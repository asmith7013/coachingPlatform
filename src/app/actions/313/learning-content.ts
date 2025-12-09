"use server";

import { z } from "zod";
import { withDbConnection } from "@server/db/ensure-connection";
import { LearningContentModel } from "@mongoose-schema/313/podsie/learning-content.model";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";
import {
  LearningContentQuerySchema,
  type LearningContent,
  type LearningContentQuery,
} from "@zod-schema/313/podsie/learning-content";

// =====================================
// GET LEARNING CONTENT
// =====================================

/**
 * Get learning content for a specific unit section
 *
 * @param query - The query parameters (scopeSequenceTag, grade, unit, lessonSection)
 * @returns The learning content if found, or null if not found
 */
export async function getLearningContent(
  query: LearningContentQuery
): Promise<{ success: true; data: LearningContent | null } | { success: false; error: string }> {
  return withDbConnection(async () => {
    try {
      // Validate query
      const validatedQuery = LearningContentQuerySchema.parse(query);

      const result = await LearningContentModel.findOne({
        scopeSequenceTag: validatedQuery.scopeSequenceTag,
        grade: validatedQuery.grade,
        unit: validatedQuery.unit,
        lessonSection: validatedQuery.lessonSection,
        active: true,
      }).lean();

      if (!result) {
        return { success: true, data: null };
      }

      // Serialize to ensure JSON-compatible
      const serialized = JSON.parse(JSON.stringify(result)) as LearningContent;

      return { success: true, data: serialized };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: handleValidationError(error) };
      }
      console.error("Error fetching learning content:", error);
      return { success: false, error: handleServerError(error, "Failed to fetch learning content") };
    }
  });
}

// =====================================
// SAVE LEARNING CONTENT
// =====================================

/**
 * Save (upsert) learning content for a specific unit section
 *
 * @param query - The identifying keys (scopeSequenceTag, grade, unit, lessonSection)
 * @param content - The markdown content to save
 * @returns The saved learning content
 */
export async function saveLearningContent(
  query: LearningContentQuery,
  content: string
): Promise<{ success: true; data: LearningContent } | { success: false; error: string }> {
  return withDbConnection(async () => {
    try {
      // Validate query
      const validatedQuery = LearningContentQuerySchema.parse(query);

      // Upsert the learning content
      const result = await LearningContentModel.findOneAndUpdate(
        {
          scopeSequenceTag: validatedQuery.scopeSequenceTag,
          grade: validatedQuery.grade,
          unit: validatedQuery.unit,
          lessonSection: validatedQuery.lessonSection,
        },
        {
          $set: {
            content,
            active: true,
            updatedAt: new Date().toISOString(),
          },
          $setOnInsert: {
            createdAt: new Date().toISOString(),
          },
        },
        { upsert: true, new: true, runValidators: true }
      ).lean();

      // Serialize to ensure JSON-compatible
      const serialized = JSON.parse(JSON.stringify(result)) as LearningContent;

      return { success: true, data: serialized };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: handleValidationError(error) };
      }
      console.error("Error saving learning content:", error);
      return { success: false, error: handleServerError(error, "Failed to save learning content") };
    }
  });
}

// =====================================
// DELETE LEARNING CONTENT
// =====================================

/**
 * Soft delete learning content (set active to false)
 *
 * @param query - The identifying keys (scopeSequenceTag, grade, unit, lessonSection)
 * @returns Success status
 */
export async function deleteLearningContent(
  query: LearningContentQuery
): Promise<{ success: true } | { success: false; error: string }> {
  return withDbConnection(async () => {
    try {
      // Validate query
      const validatedQuery = LearningContentQuerySchema.parse(query);

      await LearningContentModel.findOneAndUpdate(
        {
          scopeSequenceTag: validatedQuery.scopeSequenceTag,
          grade: validatedQuery.grade,
          unit: validatedQuery.unit,
          lessonSection: validatedQuery.lessonSection,
        },
        {
          $set: {
            active: false,
            updatedAt: new Date().toISOString(),
          },
        }
      );

      return { success: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: handleValidationError(error) };
      }
      console.error("Error deleting learning content:", error);
      return { success: false, error: handleServerError(error, "Failed to delete learning content") };
    }
  });
}
