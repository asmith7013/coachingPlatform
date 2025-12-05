"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { StudentModel } from "@mongoose-schema/313/student.model";
import { RampUpQuestion } from "@zod-schema/313/student";
import { calculateRampUpSummary } from "@zod-schema/313/ramp-up-progress";
import { fetchPodsieResponses } from "../api/fetch-responses";
import { processResponsesToQuestions } from "../processing/process-responses";
import type { SyncResult } from "../types";

// =====================================
// SYNC SINGLE STUDENT
// =====================================

/**
 * Sync a single student's Podsie progress from Podsie
 * Saves directly to student document's podsieProgress array
 *
 * @param scopeAndSequenceId - MongoDB ObjectId reference to scope-and-sequence document
 * @param questionMapping - Optional mapping of logical positions to question_ids
 *                          Format: [[id1, id2], [id3], ...] where index = logical question (0-indexed)
 * @param baseQuestionIds - Optional array of base question IDs from assignment (in order)
 * @param activityType - Type of Podsie activity (sidekick, mastery-check, assessment)
 */
export async function syncStudentRampUpProgress(
  studentId: string,
  studentEmail: string,
  studentName: string,
  scopeAndSequenceId: string,
  podsieAssignmentId: string,
  unitCode: string,
  rampUpId: string,
  totalQuestions: number,
  questionMapping?: number[][],
  baseQuestionIds?: number[],
  activityType?: 'sidekick' | 'mastery-check' | 'assessment'
): Promise<SyncResult> {
  try {
    // Fetch from Podsie
    const responses = await fetchPodsieResponses(podsieAssignmentId, studentEmail);

    // Process responses - use mapping if provided, or baseQuestionIds, or totalQuestions
    const { questions: questionMap, assignmentName } = processResponsesToQuestions(
      responses,
      questionMapping,
      totalQuestions,
      baseQuestionIds
    );

    // Convert map to array format
    const questions: RampUpQuestion[] = [];

    if (questionMapping && questionMapping.length > 0) {
      // With mapping: use logical question numbers directly
      for (let i = 1; i <= questionMapping.length; i++) {
        const status = questionMap.get(i);
        questions.push({
          questionNumber: i,
          completed: status?.completed ?? false,
          completedAt: status?.completedAt,
          correctScore: status?.correctScore,
          explanationScore: status?.explanationScore,
        });
      }
    } else if (totalQuestions > 0) {
      // With totalQuestions: the map already has logical positions (1-indexed)
      for (let i = 1; i <= totalQuestions; i++) {
        const status = questionMap.get(i);
        questions.push({
          questionNumber: i,
          completed: status?.completed ?? false,
          completedAt: status?.completedAt,
          correctScore: status?.correctScore,
          explanationScore: status?.explanationScore,
        });
      }
    } else {
      // Legacy fallback: use sorted question_ids as sequential numbers
      const questionIds = Array.from(questionMap.keys()).sort((a, b) => a - b);
      questionIds.forEach((questionId, index) => {
        const status = questionMap.get(questionId);
        questions.push({
          questionNumber: index + 1,
          completed: status?.completed ?? false,
          completedAt: status?.completedAt,
          correctScore: status?.correctScore,
          explanationScore: status?.explanationScore,
        });
      });

      // Pad with remaining questions if we know the total
      while (questions.length < totalQuestions) {
        questions.push({
          questionNumber: questions.length + 1,
          completed: false,
        });
      }
    }

    // Calculate summary
    const summary = calculateRampUpSummary(questions);

    // Update student document's podsieProgress array
    await withDbConnection(async () => {
      // First, try to update existing entry in array
      // Match on scopeAndSequenceId + podsieAssignmentId (prevents duplicates)
      const updateResult = await StudentModel.updateOne(
        {
          _id: studentId,
          podsieProgress: {
            $elemMatch: {
              scopeAndSequenceId: scopeAndSequenceId,
              podsieAssignmentId: podsieAssignmentId
            }
          }
        },
        {
          $set: {
            "podsieProgress.$.unitCode": unitCode,
            "podsieProgress.$.rampUpId": rampUpId,
            "podsieProgress.$.rampUpName": assignmentName || `Unit ${unitCode} Ramp-Up`,
            "podsieProgress.$.activityType": activityType,
            "podsieProgress.$.questions": questions,
            "podsieProgress.$.totalQuestions": totalQuestions,
            "podsieProgress.$.completedCount": summary.completedCount,
            "podsieProgress.$.percentComplete": summary.percentComplete,
            "podsieProgress.$.isFullyComplete": summary.isFullyComplete,
            "podsieProgress.$.lastSyncedAt": new Date().toISOString(),
          }
        }
      );

      // If no existing entry, push a new one
      if (updateResult.matchedCount === 0) {
        await StudentModel.updateOne(
          { _id: studentId },
          {
            $push: {
              podsieProgress: {
                scopeAndSequenceId,
                podsieAssignmentId,
                unitCode,
                rampUpId,
                rampUpName: assignmentName || `Unit ${unitCode} Ramp-Up`,
                activityType,
                questions,
                totalQuestions: totalQuestions,
                completedCount: summary.completedCount,
                percentComplete: summary.percentComplete,
                isFullyComplete: summary.isFullyComplete,
                lastSyncedAt: new Date().toISOString(),
              }
            }
          }
        );
      }
    });

    return {
      studentId,
      studentName,
      success: true,
      completedCount: summary.completedCount,
      totalQuestions: questions.length,
    };
  } catch (error) {
    console.error(`Error syncing student ${studentName}:`, error);
    return {
      studentId,
      studentName,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
