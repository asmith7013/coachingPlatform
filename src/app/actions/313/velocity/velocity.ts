"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { SectionConfigModel } from "@mongoose-schema/313/podsie/section-config.model";
import { Attendance313 } from "@mongoose-schema/313/student/attendance.model";
import { StudentModel } from "@mongoose-schema/313/student/student.model";
import { handleServerError } from "@error/handlers/server";
import type { AttendanceRecord } from "@zod-schema/313/student/attendance";
import type { Student } from "@zod-schema/313/student/student";

// =====================================
// TYPES
// =====================================

export interface DailyVelocityStats {
  date: string;
  averageVelocity: number; // Total completions / students present (adjusted for block type)
  totalCompletions: number; // All completed activities
  studentsPresent: number;
  blockType: 'single' | 'double' | 'none'; // Based on bell schedule meetingCount

  // Breakdown by activity type (HOW they practiced)
  byActivityType: {
    masteryChecks: number;    // activityType='mastery-check'
    sidekicks: number;        // activityType='sidekick'
    assessments: number;      // activityType='assessment'
  };

  // Breakdown by lesson type (WHAT they practiced)
  byLessonType: {
    lessons: number;          // lessonType='lesson'
    rampUps: number;          // lessonType='rampUp'
    assessments: number;      // lessonType='assessment'
  };

  // Velocity metrics for filtering
  velocityMetrics: {
    masteryChecksOnly: number;     // Only mastery-check activities / students present
    withoutRampUps: number;        // Exclude rampUp lessonType / students present
    lessonsOnly: number;           // Only lesson lessonType / students present
  };
}

// =====================================
// GET VELOCITY DATA FOR DATE RANGE
// =====================================

/**
 * Get class velocity (mastery completion rate) for a date range
 * Velocity = total completions / students present (counts ALL student completions, not just present students)
 */
export async function getSectionVelocityByDateRange(
  section: string,
  school: string,
  startDate: string,
  endDate: string
): Promise<{ success: true; data: DailyVelocityStats[] } | { success: false; error: string }> {
  return withDbConnection(async () => {
    try {
      // Get section config to build podsieAssignmentId -> lessonType lookup and get bell schedule
      const sectionConfig = await SectionConfigModel.findOne({
        school,
        classSection: section,
        active: true,
      }).lean();

      // Build assignment lookup map: podsieAssignmentId -> lessonType
      const assignmentLessonTypeMap = new Map<string, 'lesson' | 'rampUp' | 'assessment'>();

      if (sectionConfig?.assignmentContent) {
        for (const assignment of sectionConfig.assignmentContent as unknown as Array<{
          lessonType?: 'lesson' | 'rampUp' | 'assessment';
          podsieActivities?: Array<{ podsieAssignmentId?: string }>;
        }>) {
          const lessonType = assignment.lessonType;
          if (lessonType && assignment.podsieActivities) {
            for (const activity of assignment.podsieActivities) {
              if (activity.podsieAssignmentId) {
                assignmentLessonTypeMap.set(activity.podsieAssignmentId, lessonType);
              }
            }
          }
        }
      }

      // Get bell schedule for block type determination
      const bellSchedule = sectionConfig?.bellSchedule as unknown as {
        monday?: { meetingCount: number };
        tuesday?: { meetingCount: number };
        wednesday?: { meetingCount: number };
        thursday?: { meetingCount: number };
        friday?: { meetingCount: number };
      } | undefined;

      // Helper function to determine block type for a given date
      const getBlockType = (dateStr: string): 'single' | 'double' | 'none' => {
        if (!bellSchedule) return 'none';

        // Parse date string directly to avoid timezone issues
        // dateStr format is "YYYY-MM-DD"
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day); // month is 0-indexed
        const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday

        let meetingCount = 0;
        switch (dayOfWeek) {
          case 1: meetingCount = bellSchedule.monday?.meetingCount || 0; break;
          case 2: meetingCount = bellSchedule.tuesday?.meetingCount || 0; break;
          case 3: meetingCount = bellSchedule.wednesday?.meetingCount || 0; break;
          case 4: meetingCount = bellSchedule.thursday?.meetingCount || 0; break;
          case 5: meetingCount = bellSchedule.friday?.meetingCount || 0; break;
          default: return 'none'; // Weekend
        }

        if (meetingCount === 0) return 'none';
        if (meetingCount === 1) return 'single';
        if (meetingCount >= 2) return 'double';
        return 'none';
      };

      // Get students in section
      const students = await StudentModel.find({
        section,
        school,
        active: true,
      })
        .select("studentID podsieProgress")
        .lean();

      // Get attendance for date range
      // Note: "not-tracked" is treated as present (attendance wasn't recorded but student was likely there)
      const attendanceRecords = await Attendance313.find({
        section,
        date: { $gte: startDate, $lte: endDate },
        status: { $in: ["present", "late", "not-tracked"] }, // Count present/late/not-tracked students
      }).lean();

      // Group attendance by date
      const attendanceByDate = new Map<string, Set<number>>();
      for (const record of attendanceRecords as AttendanceRecord[]) {
        const recDate = record.date;
        const recStudentId = record.studentId;
        if (!attendanceByDate.has(recDate)) {
          attendanceByDate.set(recDate, new Set());
        }
        attendanceByDate.get(recDate)!.add(recStudentId);
      }

      // Build completion data by date (from ALL students, not just present)
      const completionsByDate = new Map<string, {
        byActivityType: { masteryChecks: number; sidekicks: number; assessments: number };
        byLessonType: { lessons: number; rampUps: number; assessments: number };
        total: number;
      }>();

      for (const student of students as unknown as Pick<Student, 'studentID' | 'podsieProgress'>[]) {
        const podsieProgress = student.podsieProgress;
        if (!podsieProgress || !Array.isArray(podsieProgress)) continue;

        for (const progress of podsieProgress) {
          // Check if fully completed (use fullyCompletedDate when available)
          if (!progress.isFullyComplete) continue;

          // Determine the completion date
          let completionDate: string | undefined;
          if (progress.fullyCompletedDate) {
            completionDate = progress.fullyCompletedDate.split('T')[0]; // Extract YYYY-MM-DD
          } else if (progress.questions && progress.questions.length > 0) {
            // Fallback: use the last question's completedAt
            const lastQuestion = progress.questions
              .filter(q => q.completedAt)
              .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))[0];
            if (lastQuestion?.completedAt) {
              completionDate = lastQuestion.completedAt.split('T')[0];
            }
          }

          if (!completionDate) continue;

          // Initialize date entry if needed
          if (!completionsByDate.has(completionDate)) {
            completionsByDate.set(completionDate, {
              byActivityType: { masteryChecks: 0, sidekicks: 0, assessments: 0 },
              byLessonType: { lessons: 0, rampUps: 0, assessments: 0 },
              total: 0,
            });
          }

          const dateData = completionsByDate.get(completionDate)!;
          dateData.total++;

          // Count by activity type
          const activityType = progress.activityType;
          if (activityType === 'mastery-check') {
            dateData.byActivityType.masteryChecks++;
          } else if (activityType === 'sidekick') {
            dateData.byActivityType.sidekicks++;
          } else if (activityType === 'ramp-up') {
            // Note: 'ramp-up' is an activity type but we don't have a separate category for it
            // in the byActivityType breakdown, so it's not counted here
          }

          // Count by lesson type (lookup from section config)
          const lessonType = assignmentLessonTypeMap.get(progress.podsieAssignmentId || '');
          if (lessonType === 'lesson') {
            dateData.byLessonType.lessons++;
          } else if (lessonType === 'rampUp') {
            dateData.byLessonType.rampUps++;
          } else if (lessonType === 'assessment') {
            dateData.byLessonType.assessments++;
          }
        }
      }

      // Calculate velocity for each date
      const velocityStats: DailyVelocityStats[] = [];

      // Get total number of students in section for default attendance assumption
      const totalStudents = students.length;

      // Iterate through all dates that have either attendance or completions
      const allDates = new Set([...attendanceByDate.keys(), ...completionsByDate.keys()]);

      for (const date of allDates) {
        // Determine block type for this date
        const blockType = getBlockType(date);

        // If no attendance data exists for a school day, assume all students are present
        let studentsPresent = attendanceByDate.get(date)?.size;
        if (studentsPresent === undefined && blockType !== 'none') {
          studentsPresent = totalStudents;
        } else if (studentsPresent === undefined) {
          studentsPresent = 0;
        }

        const completions = completionsByDate.get(date) || {
          byActivityType: { masteryChecks: 0, sidekicks: 0, assessments: 0 },
          byLessonType: { lessons: 0, rampUps: 0, assessments: 0 },
          total: 0,
        };

        // Calculate velocities (divide by 2 for double blocks since it's essentially 2 classes)
        const blockDivisor = blockType === 'double' ? 2 : 1;
        const averageVelocity = studentsPresent > 0
          ? (completions.total / studentsPresent) / blockDivisor
          : 0;
        const masteryChecksOnlyVelocity = studentsPresent > 0
          ? (completions.byActivityType.masteryChecks / studentsPresent) / blockDivisor
          : 0;
        const withoutRampUpsVelocity = studentsPresent > 0
          ? ((completions.total - completions.byLessonType.rampUps) / studentsPresent) / blockDivisor
          : 0;
        const lessonsOnlyVelocity = studentsPresent > 0
          ? (completions.byLessonType.lessons / studentsPresent) / blockDivisor
          : 0;

        velocityStats.push({
          date,
          averageVelocity: Math.round(averageVelocity * 100) / 100,
          totalCompletions: completions.total,
          studentsPresent,
          blockType,
          byActivityType: completions.byActivityType,
          byLessonType: completions.byLessonType,
          velocityMetrics: {
            masteryChecksOnly: Math.round(masteryChecksOnlyVelocity * 100) / 100,
            withoutRampUps: Math.round(withoutRampUpsVelocity * 100) / 100,
            lessonsOnly: Math.round(lessonsOnlyVelocity * 100) / 100,
          },
        });
      }

      return {
        success: true,
        data: velocityStats.sort((a, b) => a.date.localeCompare(b.date)),
      };
    } catch (error) {
      return { success: false, error: handleServerError(error, "Failed to fetch velocity data") };
    }
  });
}
