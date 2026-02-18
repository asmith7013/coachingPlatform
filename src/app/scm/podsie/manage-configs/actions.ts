"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { SectionConfigModel } from "@mongoose-schema/scm/podsie/section-config.model";
import { revalidatePath } from "next/cache";
import { handleServerError } from "@error/handlers/server";
import type { PodsieQuestionMap } from "@zod-schema/scm/podsie/section-config";

/**
 * Update a specific question in the question mapping
 * Allows updating individual questions with root/variant relationships
 */
export async function updateQuestionMapping(
  school: string,
  classSection: string,
  scopeAndSequenceId: string,
  podsieAssignmentId: string,
  questionMapIndex: number,
  updatedQuestion: PodsieQuestionMap,
): Promise<{ success: boolean; error?: string }> {
  try {
    return await withDbConnection(async () => {
      // Find the section config
      const config = await SectionConfigModel.findOne({ school, classSection });

      if (!config) {
        return {
          success: false,
          error: "Section config not found",
        };
      }

      // Find the assignment content
      const assignmentContent = config.assignmentContent as unknown as Array<{
        scopeAndSequenceId: string;
        podsieActivities: Array<{
          podsieAssignmentId: string;
          podsieQuestionMap?: PodsieQuestionMap[];
        }>;
      }>;

      let updated = false;

      for (const content of assignmentContent) {
        if (content.scopeAndSequenceId.toString() === scopeAndSequenceId) {
          // Find the specific activity
          const activity = content.podsieActivities?.find(
            (a) => a.podsieAssignmentId === podsieAssignmentId,
          );

          if (activity && activity.podsieQuestionMap) {
            // Update the specific question at the index
            if (
              questionMapIndex >= 0 &&
              questionMapIndex < activity.podsieQuestionMap.length
            ) {
              activity.podsieQuestionMap[questionMapIndex] = updatedQuestion;
              updated = true;
              break;
            }
          }
        }
      }

      if (!updated) {
        return {
          success: false,
          error: "Question not found in mapping",
        };
      }

      // Mark the field as modified to ensure Mongoose saves it
      config.markModified("assignmentContent");

      // Save the config
      await config.save();

      // Revalidate relevant paths
      revalidatePath("/scm/roadmaps/manage-configs");
      revalidatePath("/scm/roadmaps/section-configs");
      revalidatePath("/scm/podsie/progress");

      return { success: true };
    });
  } catch (error) {
    console.error("Error updating question mapping:", error);
    return {
      success: false,
      error: handleServerError(error, "Failed to update question mapping"),
    };
  }
}

/**
 * Update a specific Podsie activity configuration
 * Allows updating totalQuestions, variations, or q1HasVariations for a specific activity
 */
export async function updateActivityConfig(
  school: string,
  classSection: string,
  scopeAndSequenceId: string,
  podsieAssignmentId: string,
  field: "totalQuestions" | "variations" | "q1HasVariations",
  value: number | boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    return await withDbConnection(async () => {
      // Validate input
      if (
        field === "variations" &&
        typeof value === "number" &&
        (value < 0 || value > 10)
      ) {
        return {
          success: false,
          error: "Variations must be between 0 and 10",
        };
      }

      if (
        field === "totalQuestions" &&
        typeof value === "number" &&
        value < 1
      ) {
        return {
          success: false,
          error: "Total questions must be at least 1",
        };
      }

      if (field === "q1HasVariations" && typeof value !== "boolean") {
        return {
          success: false,
          error: "q1HasVariations must be a boolean",
        };
      }

      // Find the section config
      const config = await SectionConfigModel.findOne({ school, classSection });

      if (!config) {
        return {
          success: false,
          error: "Section config not found",
        };
      }

      // Find the assignment content
      const assignmentContent = config.assignmentContent as unknown as Array<{
        scopeAndSequenceId: string;
        podsieActivities: Array<{
          podsieAssignmentId: string;
          totalQuestions?: number;
          variations?: number;
          q1HasVariations?: boolean;
        }>;
      }>;

      let updated = false;

      for (const content of assignmentContent) {
        if (content.scopeAndSequenceId.toString() === scopeAndSequenceId) {
          // Find the specific activity
          const activity = content.podsieActivities?.find(
            (a) => a.podsieAssignmentId === podsieAssignmentId,
          );

          if (activity) {
            // Update the field
            if (field === "totalQuestions") {
              activity.totalQuestions = value as number;
            } else if (field === "variations") {
              activity.variations = value as number;
            } else if (field === "q1HasVariations") {
              activity.q1HasVariations = value as boolean;
            }
            updated = true;
            break;
          }
        }
      }

      if (!updated) {
        return {
          success: false,
          error: "Assignment activity not found",
        };
      }

      // Mark the field as modified to ensure Mongoose saves it
      config.markModified("assignmentContent");

      // Save the config
      await config.save();

      // Revalidate relevant paths
      revalidatePath("/scm/roadmaps/manage-configs");
      revalidatePath("/scm/roadmaps/section-configs");
      revalidatePath("/scm/podsie/progress");

      return { success: true };
    });
  } catch (error) {
    console.error("Error updating activity config:", error);
    return {
      success: false,
      error: handleServerError(
        error,
        "Failed to update activity configuration",
      ),
    };
  }
}
