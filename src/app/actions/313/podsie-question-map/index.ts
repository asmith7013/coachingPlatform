"use server";

import { withDbConnection } from "@/lib/server/db/ensure-connection";
import { PodsieQuestionMapModel } from "@mongoose-schema/313/podsie/podsie-question-map.model";
import { fetchPodsieResponses } from "../podsie-sync/api/fetch-responses";
import type { PodsieQuestionMap } from "@zod-schema/313/podsie/section-config";
import type { PodsieQuestionMapInput } from "@zod-schema/313/podsie/podsie-question-map";
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
  email: string = "alexander.smith@teachinglab.org"
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
    const sortedResponses = [...responses].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Generate question map - all questions are root questions
    const questionMap: PodsieQuestionMap[] = sortedResponses.map((response, index) => ({
      questionNumber: index + 1,
      questionId: response.question_id.toString(),
      isRoot: true,
    }));

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
      error: handleServerError(error, "Failed to generate question map from responses"),
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
        }
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
      const questionMap = await PodsieQuestionMapModel.findOne({ assignmentId });

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

      return {
        success: true,
        data: questionMaps,
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
      const result = await PodsieQuestionMapModel.findOneAndDelete({ assignmentId });

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
