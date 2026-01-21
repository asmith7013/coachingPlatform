"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { SectionConfigModel } from "@mongoose-schema/scm/podsie/section-config.model";
import { StudentModel } from "@mongoose-schema/scm/student/student.model";
import { handleServerError } from "@error/handlers/server";

// =====================================
// TYPES
// =====================================

export interface DateRange {
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string; // ISO date string (YYYY-MM-DD)
}

export interface StudentRoadmapData {
  id: string;
  studentID: number;
  firstName: string;
  lastName: string;
  // Skills mastered through practice (post-diagnostic)
  masteredFromPractice: number;
  // Skills from initial diagnostic (in masteredSkills but not in skillPerformances)
  masteredFromDiagnostic: number;
  // Total mastered skills
  totalMastered: number;
  // Attempted but not yet mastered (unique skills)
  attemptedNotMastered: number;
  // Total attempts across all skills (includes retries)
  totalAttempts: number;
}

export interface SectionRoadmapData {
  sectionId: string;
  school: string;
  classSection: string;
  teacher?: string;
  students: StudentRoadmapData[];
}

// =====================================
// GET ROADMAP COMPLETIONS BY SECTIONS
// =====================================

/**
 * Helper to check if a date string falls within the date range
 */
function isDateInRange(dateStr: string | undefined, dateRange?: DateRange): boolean {
  if (!dateRange || !dateStr) return true; // No filtering if no date range or no date

  // Parse the date string (could be various formats)
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return true; // Invalid date, include by default

  const start = new Date(dateRange.startDate);
  const end = new Date(dateRange.endDate);
  // Set end date to end of day
  end.setHours(23, 59, 59, 999);

  return date >= start && date <= end;
}

/**
 * Get roadmap completion data for multiple sections
 * @param sectionIds - Array of section IDs to fetch data for
 * @param dateRange - Optional date range to filter skill performances by masteredDate or lastAttemptDate
 */
export async function getRoadmapCompletionsBySection(
  sectionIds: string[],
  dateRange?: DateRange
): Promise<{ success: true; data: SectionRoadmapData[] } | { success: false; error: string }> {
  return withDbConnection(async () => {
    try {
      if (sectionIds.length === 0) {
        return { success: true, data: [] };
      }

      // Fetch all section configs
      const configs = await SectionConfigModel.find({
        _id: { $in: sectionIds },
        active: true,
      }).lean();

      interface LeanSectionConfig {
        _id: { toString(): string };
        school: string;
        classSection: string;
        teacher?: string;
      }

      const results: SectionRoadmapData[] = [];

      // For each section, fetch students and their roadmap data
      for (const config of configs as unknown as LeanSectionConfig[]) {
        const students = await StudentModel.find({
          section: config.classSection,
          school: config.school,
          active: true,
        })
          .select("studentID firstName lastName masteredSkills skillPerformances")
          .lean();

        interface SkillAttempt {
          attemptNumber: number;
          dateCompleted: string;
          score: string;
          passed: boolean;
        }

        interface SkillPerformance {
          skillCode: string;
          status: string;
          attemptCount?: number;
          masteredDate?: string;
          lastAttemptDate?: string;
          attempts?: SkillAttempt[];
        }

        interface LeanStudent {
          _id: { toString(): string };
          studentID: number;
          firstName: string;
          lastName: string;
          masteredSkills?: string[];
          skillPerformances?: SkillPerformance[];
        }

        const studentData: StudentRoadmapData[] = (students as unknown as LeanStudent[]).map((student) => {
          const masteredSkillsSet = new Set(student.masteredSkills || []);
          const allSkillPerformances = student.skillPerformances || [];

          // Filter skill performances by date range if provided
          // A skill is included if it has any activity within the date range
          const skillPerformances = dateRange
            ? allSkillPerformances.filter((sp) => {
                // Check if masteredDate is in range
                if (sp.masteredDate && isDateInRange(sp.masteredDate, dateRange)) {
                  return true;
                }
                // Check if lastAttemptDate is in range
                if (sp.lastAttemptDate && isDateInRange(sp.lastAttemptDate, dateRange)) {
                  return true;
                }
                // Check if any attempt is in range
                if (sp.attempts && sp.attempts.length > 0) {
                  return sp.attempts.some((attempt) =>
                    isDateInRange(attempt.dateCompleted, dateRange)
                  );
                }
                return false;
              })
            : allSkillPerformances;

          // For totalAttempts, count only attempts within the date range
          let totalAttempts = 0;
          if (dateRange) {
            for (const sp of skillPerformances) {
              if (sp.attempts && sp.attempts.length > 0) {
                totalAttempts += sp.attempts.filter((attempt) =>
                  isDateInRange(attempt.dateCompleted, dateRange)
                ).length;
              } else {
                // Fallback to attemptCount if no attempts array
                totalAttempts += sp.attemptCount || 0;
              }
            }
          } else {
            totalAttempts = skillPerformances.reduce(
              (sum, sp) => sum + (sp.attemptCount || 0),
              0
            );
          }

          // Skills mastered through practice within the date range
          const masteredFromPractice = skillPerformances.filter((sp) => {
            if (sp.status !== "Mastered") return false;
            // If date range, only count if mastered within range
            if (dateRange && sp.masteredDate) {
              return isDateInRange(sp.masteredDate, dateRange);
            }
            return true;
          }).length;

          // Skills attempted but not mastered (with activity in date range)
          const attemptedNotMastered = skillPerformances.filter(
            (sp) => sp.status === "Attempted But Not Mastered"
          ).length;

          // Skills from diagnostic (in masteredSkills but not in skillPerformances)
          // Note: Diagnostic skills don't have dates, so we include them regardless of date range
          const skillPerformanceCodes = new Set(allSkillPerformances.map((sp) => sp.skillCode));
          const masteredFromDiagnostic = dateRange
            ? 0 // Don't count diagnostic skills when filtering by date
            : [...masteredSkillsSet].filter((skill) => !skillPerformanceCodes.has(skill)).length;

          // Calculate total mastered within the date range
          const totalMastered = dateRange
            ? masteredFromPractice // Only count practice-mastered skills when filtering by date
            : masteredSkillsSet.size;

          return {
            id: student._id.toString(),
            studentID: student.studentID,
            firstName: student.firstName,
            lastName: student.lastName,
            masteredFromPractice,
            masteredFromDiagnostic,
            totalMastered,
            attemptedNotMastered,
            totalAttempts,
          };
        });

        // Sort students by last name, then first name
        studentData.sort((a, b) => {
          const lastNameCompare = a.lastName.localeCompare(b.lastName);
          if (lastNameCompare !== 0) return lastNameCompare;
          return a.firstName.localeCompare(b.firstName);
        });

        results.push({
          sectionId: config._id.toString(),
          school: config.school,
          classSection: config.classSection,
          teacher: config.teacher,
          students: studentData,
        });
      }

      return { success: true, data: results };
    } catch (error) {
      return { success: false, error: handleServerError(error, "Failed to fetch roadmap completions") };
    }
  });
}
