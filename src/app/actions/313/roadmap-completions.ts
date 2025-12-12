"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { SectionConfigModel } from "@mongoose-schema/313/podsie/section-config.model";
import { StudentModel } from "@mongoose-schema/313/student/student.model";
import { handleServerError } from "@error/handlers/server";

// =====================================
// TYPES
// =====================================

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
  // Attempted but not yet mastered
  attemptedNotMastered: number;
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
 * Get roadmap completion data for multiple sections
 */
export async function getRoadmapCompletionsBySection(
  sectionIds: string[]
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

        interface LeanStudent {
          _id: { toString(): string };
          studentID: number;
          firstName: string;
          lastName: string;
          masteredSkills?: string[];
          skillPerformances?: Array<{
            skillCode: string;
            status: string;
          }>;
        }

        const studentData: StudentRoadmapData[] = (students as unknown as LeanStudent[]).map((student) => {
          const masteredSkillsSet = new Set(student.masteredSkills || []);
          const skillPerformances = student.skillPerformances || [];

          // Skills mastered through practice (have skillPerformance with status "Mastered")
          const masteredFromPractice = skillPerformances.filter(
            (sp) => sp.status === "Mastered"
          ).length;

          // Skills attempted but not mastered
          const attemptedNotMastered = skillPerformances.filter(
            (sp) => sp.status === "Attempted But Not Mastered"
          ).length;

          // Skills from diagnostic (in masteredSkills but not in skillPerformances)
          const skillPerformanceCodes = new Set(skillPerformances.map((sp) => sp.skillCode));
          const masteredFromDiagnostic = [...masteredSkillsSet].filter(
            (skill) => !skillPerformanceCodes.has(skill)
          ).length;

          return {
            id: student._id.toString(),
            studentID: student.studentID,
            firstName: student.firstName,
            lastName: student.lastName,
            masteredFromPractice,
            masteredFromDiagnostic,
            totalMastered: masteredSkillsSet.size,
            attemptedNotMastered,
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
