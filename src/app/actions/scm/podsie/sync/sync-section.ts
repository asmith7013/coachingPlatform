"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { StudentModel } from "@mongoose-schema/scm/student/student.model";
import { syncStudentRampUpProgress } from "./sync-student";
import { buildQuestionMapping } from "@utils/podsie-question-mapping";
import type { SyncSectionResult, SyncResult, SyncOptions } from "../types";

// =====================================
// SYNC ALL STUDENTS IN SECTION
// =====================================

/**
 * Sync ramp-up progress for all students in a section (or single student in test mode)
 * @param section - The class section (e.g., "601")
 * @param school - The school code (e.g., "PS19") - required to uniquely identify the section
 */
export async function syncSectionRampUpProgress(
  section: string,
  scopeAndSequenceId: string,
  podsieAssignmentId: string,
  unitCode: string,
  rampUpId: string,
  totalQuestions: number,
  options: SyncOptions = {},
  school?: string,
): Promise<SyncSectionResult> {
  try {
    // Build question mapping if baseQuestionIds and variations are provided
    // BUT skip if questionIdToNumber is provided (it takes precedence for non-sequential question numbers)
    let questionMapping = options.questionMapping;
    if (
      !questionMapping &&
      options.baseQuestionIds &&
      options.variations !== undefined &&
      !options.questionIdToNumber
    ) {
      questionMapping = buildQuestionMapping(
        options.baseQuestionIds,
        options.variations,
        options.q1HasVariations ?? false,
      );
    }

    // Fetch all active students in section
    const allStudents = await withDbConnection(async () => {
      const query: Record<string, unknown> = {
        section,
        active: true,
      };

      // Filter by school if provided (important for sections that exist in multiple schools)
      if (school) {
        query.school = school;
      }

      // If specific test student requested
      if (options.testStudentId) {
        query._id = options.testStudentId;
      }

      const docs =
        await StudentModel.find(query).lean<
          Array<{
            _id: unknown;
            firstName: string;
            lastName: string;
            email?: string;
          }>
        >();

      return docs.map((doc) => ({
        _id: String(doc._id),
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
      }));
    });

    // In test mode, only use first student with email
    const students =
      options.testMode && !options.testStudentId
        ? allStudents.filter((s) => s.email).slice(0, 1)
        : allStudents;

    if (students.length === 0) {
      return {
        success: false,
        totalStudents: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        results: [],
        error: options.testMode
          ? "No students with email found in section for test mode"
          : "No students found in section",
      };
    }

    // Sync each student
    const results: SyncResult[] = [];

    for (const student of students) {
      if (!student.email) {
        results.push({
          studentId: student._id,
          studentName: `${student.lastName}, ${student.firstName}`,
          success: false,
          error: "No email address",
        });
        continue;
      }

      const result = await syncStudentRampUpProgress(
        student._id,
        student.email,
        `${student.lastName}, ${student.firstName}`,
        scopeAndSequenceId,
        podsieAssignmentId,
        unitCode,
        rampUpId,
        totalQuestions,
        questionMapping,
        options.baseQuestionIds,
        options.activityType,
        options.questionIdToNumber,
      );

      results.push(result);

      // Small delay to avoid rate limiting (skip in test mode for speed)
      if (!options.testMode) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    const successfulSyncs = results.filter((r) => r.success).length;
    const failedSyncs = results.filter((r) => !r.success).length;

    return {
      success: successfulSyncs > 0,
      totalStudents: students.length,
      successfulSyncs,
      failedSyncs,
      results,
    };
  } catch (error) {
    console.error("Error syncing section:", error);
    return {
      success: false,
      totalStudents: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      results: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
