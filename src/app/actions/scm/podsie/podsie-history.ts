"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { SectionConfigModel } from "@mongoose-schema/scm/podsie/section-config.model";
import { StudentModel } from "@mongoose-schema/scm/student/student.model";
import { handleServerError } from "@error/handlers/server";

// =====================================
// TYPES
// =====================================

export interface PodsieCompletionRow {
  studentId: number;
  studentName: string;
  section: string;
  school: string;
  assignmentName: string;
  unitLessonId: string;
  lessonType: 'lesson' | 'rampUp' | 'assessment' | 'unknown';
  activityType: string;
  completedDate: string;
}

// =====================================
// FETCH PODSIE COMPLETIONS
// =====================================

/**
 * Fetch all Podsie assignment completions across all students
 * Uses the same logic as the velocity page to determine completion
 */
export async function fetchPodsieCompletions(): Promise<{
  success: true;
  data: PodsieCompletionRow[];
} | {
  success: false;
  error: string;
}> {
  return withDbConnection(async () => {
    try {
      // Get all active section configs to build assignment lookup
      const sectionConfigs = await SectionConfigModel.find({ active: true }).lean();

      // Build assignment lookup map: podsieAssignmentId -> assignment details
      const assignmentDetailsMap = new Map<string, {
        assignmentName: string;
        unitLessonId: string;
        lessonType: 'lesson' | 'rampUp' | 'assessment';
        school: string;
        classSection: string;
      }>();

      for (const config of sectionConfigs as unknown as Array<{
        school: string;
        classSection: string;
        assignmentContent?: Array<{
          lessonType?: 'lesson' | 'rampUp' | 'assessment';
          unitLessonId?: string;
          lessonName?: string;
          podsieActivities?: Array<{
            podsieAssignmentId?: string;
            podsieAssignmentName?: string;
          }>;
        }>;
      }>) {
        const assignmentContent = config.assignmentContent;

        if (!assignmentContent) continue;

        for (const assignment of assignmentContent) {
          const lessonType = assignment.lessonType;
          const unitLessonId = assignment.unitLessonId || '';
          const lessonName = assignment.lessonName || '';

          if (lessonType && assignment.podsieActivities) {
            for (const activity of assignment.podsieActivities) {
              if (activity.podsieAssignmentId) {
                assignmentDetailsMap.set(activity.podsieAssignmentId, {
                  assignmentName: activity.podsieAssignmentName || lessonName,
                  unitLessonId,
                  lessonType,
                  school: config.school,
                  classSection: config.classSection,
                });
              }
            }
          }
        }
      }

      // Get all students with podsieProgress
      const students = await StudentModel.find({
        active: true,
        podsieProgress: { $exists: true, $ne: [] },
      })
        .select("studentID firstName lastName section school podsieProgress")
        .lean();

      const completions: PodsieCompletionRow[] = [];

      for (const student of students as unknown as Array<{
        studentID: number;
        firstName: string;
        lastName: string;
        section: string;
        school: string;
        podsieProgress: Array<{
          podsieAssignmentId?: string;
          isFullyComplete?: boolean;
          fullyCompletedDate?: string;
          activityType?: string;
          questions?: Array<{ completedAt?: string }>;
        }>;
      }>) {
        const podsieProgress = student.podsieProgress;

        if (!podsieProgress || !Array.isArray(podsieProgress)) continue;

        for (const progress of podsieProgress) {
          // Check if fully completed (same logic as velocity page)
          if (!progress.isFullyComplete) continue;

          // Determine the completion date
          let completedDate: string | undefined;
          if (progress.fullyCompletedDate) {
            completedDate = progress.fullyCompletedDate;
          } else if (progress.questions && progress.questions.length > 0) {
            // Fallback: use the last question's completedAt
            const lastQuestion = progress.questions
              .filter(q => q.completedAt)
              .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))[0];
            if (lastQuestion?.completedAt) {
              completedDate = lastQuestion.completedAt;
            }
          }

          if (!completedDate) continue;

          // Look up assignment details
          const assignmentDetails = assignmentDetailsMap.get(progress.podsieAssignmentId || '');

          completions.push({
            studentId: student.studentID,
            studentName: `${student.lastName}, ${student.firstName}`,
            section: student.section,
            school: student.school,
            assignmentName: assignmentDetails?.assignmentName || progress.podsieAssignmentId || 'Unknown',
            unitLessonId: assignmentDetails?.unitLessonId || '',
            lessonType: assignmentDetails?.lessonType || 'unknown',
            activityType: progress.activityType || 'unknown',
            completedDate,
          });
        }
      }

      // Sort by most recent first
      completions.sort((a, b) => b.completedDate.localeCompare(a.completedDate));

      return {
        success: true,
        data: completions,
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to fetch Podsie completions"),
      };
    }
  });
}
