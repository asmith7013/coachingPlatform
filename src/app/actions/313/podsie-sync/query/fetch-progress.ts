"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { StudentModel } from "@mongoose-schema/313/student/student.model";
import { RampUpQuestion } from "@zod-schema/313/student/student";
import type { StudentRampUpProgressData } from "../types";

// =====================================
// FETCH PROGRESS FROM STUDENT DOCUMENTS
// =====================================

/**
 * Fetch ramp-up progress for all students in a section from student documents
 */
export async function fetchRampUpProgress(
  section: string,
  unitCode: string,
  rampUpId?: string,
  podsieAssignmentId?: string
): Promise<{
  success: boolean;
  data: StudentRampUpProgressData[];
  error?: string;
}> {
  try {
    interface StudentDoc {
      _id: unknown;
      firstName: string;
      lastName: string;
      podsieProgress: Array<{
        scopeAndSequenceId: string;
        podsieAssignmentId: string;
        unitCode: string;
        rampUpId: string;
        rampUpName?: string;
        activityType?: 'sidekick' | 'mastery-check' | 'assessment';
        questions: RampUpQuestion[];
        totalQuestions: number;
        completedCount: number;
        percentComplete: number;
        isFullyComplete: boolean;
        lastSyncedAt?: string;
      }>;
      zearnLessons?: Array<{
        lessonCode: string;
        completionDate: string;
      }>;
    }

    // Helper function to parse Zearn lesson code (e.g., "G8 M3 L10")
    function parseZearnLessonCode(lessonCode: string): { grade: string; module: string; lesson: string } | null {
      const match = lessonCode.match(/G(\d+)\s+M(\d+)\s+L(\d+)/);
      if (!match) return null;
      return { grade: match[1], module: match[2], lesson: match[3] };
    }

    // Helper function to convert Zearn lesson to unitLessonId format
    function zearnToUnitLessonId(lessonCode: string): string | null {
      const parsed = parseZearnLessonCode(lessonCode);
      if (!parsed) return null;
      return `${parsed.module}.${parsed.lesson}`;
    }

    const students = await withDbConnection(async () => {
      const docs = await StudentModel.find({
        section,
        active: true,
      })
        .select("_id firstName lastName podsieProgress zearnLessons")
        .lean<StudentDoc[]>();

      return docs;
    });

    // Build result array
    const result: StudentRampUpProgressData[] = [];

    for (const student of students) {
      const studentId = String(student._id);
      const studentName = `${student.lastName}, ${student.firstName}`;

      // Find matching progress entry(ies)
      const progressEntries = (student.podsieProgress || []).filter(p => {
        if (p.unitCode !== unitCode) return false;
        if (rampUpId && p.rampUpId !== rampUpId) return false;
        if (podsieAssignmentId && p.podsieAssignmentId !== podsieAssignmentId) return false;
        return true;
      });

      if (progressEntries.length > 0) {
        // Add each matching entry
        for (const p of progressEntries) {
          // Check if student has completed corresponding Zearn lesson
          let zearnCompleted = false;
          let zearnCompletionDate: string | undefined;

          if (student.zearnLessons && p.rampUpId) {
            const matchingZearnLesson = student.zearnLessons.find(zl => {
              const convertedId = zearnToUnitLessonId(zl.lessonCode);
              return convertedId === p.rampUpId;
            });

            if (matchingZearnLesson) {
              zearnCompleted = true;
              zearnCompletionDate = matchingZearnLesson.completionDate;
            }
          }

          result.push({
            studentId,
            studentName,
            scopeAndSequenceId: p.scopeAndSequenceId,
            podsieAssignmentId: p.podsieAssignmentId,
            unitCode: p.unitCode,
            rampUpId: p.rampUpId,
            rampUpName: p.rampUpName,
            activityType: p.activityType,
            questions: p.questions || [],
            totalQuestions: p.totalQuestions || 0,
            completedCount: p.completedCount || 0,
            percentComplete: p.percentComplete || 0,
            isFullyComplete: p.isFullyComplete || false,
            lastSyncedAt: p.lastSyncedAt,
            zearnCompleted,
            zearnCompletionDate,
          });
        }
      } else {
        // No progress yet - check for Zearn completion
        let zearnCompleted = false;
        let zearnCompletionDate: string | undefined;

        if (student.zearnLessons && rampUpId) {
          const matchingZearnLesson = student.zearnLessons.find(zl => {
            const convertedId = zearnToUnitLessonId(zl.lessonCode);
            return convertedId === rampUpId;
          });

          if (matchingZearnLesson) {
            zearnCompleted = true;
            zearnCompletionDate = matchingZearnLesson.completionDate;
          }
        }

        // Return empty entry with Zearn data if available
        result.push({
          studentId,
          studentName,
          scopeAndSequenceId: "", // No progress yet
          podsieAssignmentId: "", // No progress yet
          unitCode,
          rampUpId: rampUpId || "",
          questions: [],
          totalQuestions: 0,
          completedCount: 0,
          percentComplete: 0,
          isFullyComplete: false,
          zearnCompleted,
          zearnCompletionDate,
        });
      }
    }

    // Sort by student name
    result.sort((a, b) => a.studentName.localeCompare(b.studentName));

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching ramp-up progress:", error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
