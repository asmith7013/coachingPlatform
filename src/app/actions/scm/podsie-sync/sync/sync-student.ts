"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { StudentModel } from "@mongoose-schema/313/student/student.model";
import { RampUpQuestion } from "@zod-schema/scm/student/student";
import { calculateRampUpSummary } from "@zod-schema/scm/podsie/ramp-up-progress";
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
 * @param questionIdToNumber - Optional map of questionId -> actual questionNumber
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
  activityType?: 'sidekick' | 'mastery-check' | 'assessment',
  questionIdToNumber?: { [questionId: string]: number }
): Promise<SyncResult> {
  try {
    // Fetch from Podsie
    const responses = await fetchPodsieResponses(podsieAssignmentId, studentEmail);

    // Process responses - use mapping if provided, or baseQuestionIds, or totalQuestions
    const { questions: questionMap, assignmentName } = processResponsesToQuestions(
      responses,
      questionMapping,
      totalQuestions,
      baseQuestionIds,
      questionIdToNumber
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
    } else if (questionIdToNumber && Object.keys(questionIdToNumber).length > 0) {
      // With questionIdToNumber: use actual questionNumbers from the map
      // The questionMap keys are the actual questionNumbers (may be non-sequential like 1, 2, 4, 6, 8...)
      const questionNumbers = Array.from(questionMap.keys()).sort((a, b) => a - b);
      for (const qNum of questionNumbers) {
        const status = questionMap.get(qNum);
        questions.push({
          questionNumber: qNum,
          completed: status?.completed ?? false,
          completedAt: status?.completedAt,
          correctScore: status?.correctScore,
          explanationScore: status?.explanationScore,
        });
      }
    } else if (totalQuestions > 0) {
      // With totalQuestions only (no mapping): assume sequential positions 1-indexed
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

    // Determine fullyCompletedDate - use the completedAt of the last question if fully complete
    let fullyCompletedDate: string | undefined;
    if (summary.isFullyComplete && questions.length > 0) {
      // Find the last completed question's date
      const lastQuestion = questions[questions.length - 1];
      fullyCompletedDate = lastQuestion.completedAt;
    }

    // Update student document's podsieProgress array
    await withDbConnection(async () => {
      // First, check if entry exists and if it was previously not fully complete
      const existingStudent = await StudentModel.findOne(
        {
          _id: studentId,
          podsieProgress: {
            $elemMatch: {
              scopeAndSequenceId: scopeAndSequenceId,
              podsieAssignmentId: podsieAssignmentId
            }
          }
        }
      ).lean();

      interface PodsieProgressEntry {
        scopeAndSequenceId: string;
        podsieAssignmentId: string;
        fullyCompletedDate?: string;
      }

      const podsieProgressArray = existingStudent?.podsieProgress as PodsieProgressEntry[] | undefined;
      const existingProgress = Array.isArray(podsieProgressArray)
        ? podsieProgressArray.find(
            (p) => p.scopeAndSequenceId === scopeAndSequenceId && p.podsieAssignmentId === podsieAssignmentId
          )
        : undefined;

      // If newly completed, use the date; if already had a date, preserve it
      const finalFullyCompletedDate =
        existingProgress?.fullyCompletedDate ||
        (summary.isFullyComplete ? fullyCompletedDate : undefined);

      // Update existing entry in array
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
            "podsieProgress.$.fullyCompletedDate": finalFullyCompletedDate,
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
                fullyCompletedDate: summary.isFullyComplete ? fullyCompletedDate : undefined,
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
