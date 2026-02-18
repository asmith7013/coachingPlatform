"use server";

import { withDbConnection } from "@/lib/server/db/ensure-connection";
import { PodsieQuestionMapModel } from "@mongoose-schema/scm/podsie/podsie-question-map.model";
import { fetchPodsieResponses } from "../api/fetch-responses";
import type { PodsieQuestionMap } from "@zod-schema/scm/podsie/section-config";
import type { PodsieQuestionMapInput } from "@zod-schema/scm/podsie/podsie-question-map";
import { handleServerError } from "@/lib/error/handlers/server";

// =====================================
// FETCH ASSIGNMENT RESPONSES AND GENERATE MAP
// =====================================

/**
 * Fetch responses from Podsie API and generate a question map
 * Assumes all questions in the response are root questions (student got no variants)
 */
export async function generateQuestionMapFromResponses(
  assignmentId: string,
  email: string = "alexander.smith@teachinglab.org",
) {
  try {
    // Fetch responses from Podsie
    const responses = await fetchPodsieResponses(assignmentId, email);

    if (!responses || responses.length === 0) {
      return {
        success: false,
        error: "No responses found for this assignment",
      };
    }

    // Extract question IDs and sort by creation time (chronological order = question order)
    const sortedResponses = [...responses].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    // Generate question map - all questions are root questions
    const questionMap: PodsieQuestionMap[] = sortedResponses.map(
      (response, index) => ({
        questionNumber: index + 1,
        questionId: response.question_id.toString(),
        isRoot: true,
      }),
    );

    return {
      success: true,
      data: {
        assignmentId: responses[0].assignment_id.toString(),
        assignmentName: responses[0].assignment_name,
        questionMap,
        totalQuestions: questionMap.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: handleServerError(
        error,
        "Failed to generate question map from responses",
      ),
    };
  }
}

// =====================================
// SAVE OR UPDATE QUESTION MAP
// =====================================

/**
 * Save or update a question map in the database
 * If a map for this assignmentId already exists, it will be updated
 */
export async function saveQuestionMap(input: PodsieQuestionMapInput) {
  return withDbConnection(async () => {
    try {
      // Use findOneAndUpdate with upsert to either update or create
      const result = await PodsieQuestionMapModel.findOneAndUpdate(
        { assignmentId: input.assignmentId },
        {
          $set: {
            assignmentName: input.assignmentName,
            questionMap: input.questionMap,
            totalQuestions: input.totalQuestions,
            createdBy: input.createdBy,
            notes: input.notes,
            updatedAt: new Date(),
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        },
      );

      return {
        success: true,
        data: result.toJSON(),
        wasUpdate: !!result,
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to save question map"),
      };
    }
  });
}

// =====================================
// FETCH QUESTION MAP
// =====================================

/**
 * Fetch an existing question map by assignment ID
 */
export async function getQuestionMap(assignmentId: string) {
  return withDbConnection(async () => {
    try {
      const questionMap = await PodsieQuestionMapModel.findOne({
        assignmentId,
      });

      if (!questionMap) {
        return {
          success: false,
          error: "No question map found for this assignment ID",
        };
      }

      return {
        success: true,
        data: questionMap.toJSON(),
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to fetch question map"),
      };
    }
  });
}

// =====================================
// FETCH QUESTION MAP BY NAME
// =====================================

/**
 * Find a question map by assignment name (fuzzy match)
 * Uses normalized name comparison for better matching
 */
export async function getQuestionMapByName(assignmentName: string) {
  return withDbConnection(async () => {
    try {
      // Try exact match first
      let questionMap = await PodsieQuestionMapModel.findOne({
        assignmentName,
      });

      if (!questionMap) {
        // Try case-insensitive match
        questionMap = await PodsieQuestionMapModel.findOne({
          assignmentName: {
            $regex: new RegExp(`^${escapeRegex(assignmentName)}$`, "i"),
          },
        });
      }

      if (!questionMap) {
        // Try partial match - find maps where the name contains key parts
        // Normalize the search name: remove "Lesson X:", colons, etc.
        const normalizedSearch = assignmentName
          .replace(/^(Lesson|Ramp Up)\s*\d+[:\s]*/i, "")
          .trim()
          .toLowerCase();

        const allMaps = await PodsieQuestionMapModel.find({}).lean();

        // Find best match by comparing normalized names
        let bestMatch = null;
        let bestScore = 0;

        for (const map of allMaps) {
          const normalizedMapName = map.assignmentName
            .replace(/^(Lesson|Ramp Up)\s*\d+[:\s]*/i, "")
            .trim()
            .toLowerCase();

          // Check if names are similar (contain same key words)
          const searchWords = normalizedSearch.split(/\s+/);
          const mapWords = normalizedMapName.split(/\s+/);
          const commonWords = searchWords.filter((w) => mapWords.includes(w));
          const score =
            commonWords.length / Math.max(searchWords.length, mapWords.length);

          if (score > bestScore && score >= 0.6) {
            bestScore = score;
            bestMatch = map;
          }
        }

        if (bestMatch) {
          // Serialize to handle ObjectIds
          const serialized = JSON.parse(JSON.stringify(bestMatch));
          return {
            success: true,
            data: serialized,
            matchType: "fuzzy" as const,
            matchScore: bestScore,
          };
        }

        return {
          success: false,
          error: `No question map found matching "${assignmentName}"`,
        };
      }

      return {
        success: true,
        data: questionMap.toJSON(),
        matchType: "exact" as const,
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to fetch question map by name"),
      };
    }
  });
}

// Helper to escape regex special characters
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// =====================================
// LIST ALL QUESTION MAPS
// =====================================

/**
 * Fetch all question maps (for browsing/selection)
 */
export async function listQuestionMaps() {
  return withDbConnection(async () => {
    try {
      const questionMaps = await PodsieQuestionMapModel.find({})
        .sort({ assignmentId: 1 })
        .lean();

      // Serialize to handle ObjectIds properly for client components
      const serialized = JSON.parse(JSON.stringify(questionMaps));

      return {
        success: true,
        data: serialized,
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to list question maps"),
      };
    }
  });
}

// =====================================
// DELETE QUESTION MAP
// =====================================

/**
 * Delete a question map by assignment ID
 */
export async function deleteQuestionMap(assignmentId: string) {
  return withDbConnection(async () => {
    try {
      const result = await PodsieQuestionMapModel.findOneAndDelete({
        assignmentId,
      });

      if (!result) {
        return {
          success: false,
          error: "No question map found with this assignment ID",
        };
      }

      return {
        success: true,
        data: { deletedId: assignmentId },
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to delete question map"),
      };
    }
  });
}
