"use server";

import { StudentModel } from '@/lib/schema/mongoose-schema/scm/student/student.model';
import { handleServerError } from "@error/handlers/server";
import { connectToDB } from "@server/db/connection";

type AssessmentRow = {
  studentId: string;
  studentName: string;
  section: string;
  schoolId: string;
  assessmentDate: string;
  skillCode: string;
  skillName: string;
  skillGrade: string;
  unit: string;
  status: string;
  attemptNumber: number;
  dateCompleted: string;
  score: string;
  passed: boolean;
};

/**
 * Fetch all student assessment data by flattening skillPerformances from student documents
 */
export async function fetchStudentAssessments() {
  try {
    await connectToDB();

    const students = await StudentModel.find({ active: true })
      .select('studentID firstName lastName section skillPerformances lastAssessmentDate')
      .lean();

    const rows: AssessmentRow[] = [];

    for (const student of students) {
      const s = student as Record<string, unknown>;
      const studentName = `${s.lastName}, ${s.firstName}`;
      const studentId = (s.studentID as number).toString();

      const skillPerformances = s.skillPerformances as Array<Record<string, unknown>>;
      if (!skillPerformances || !Array.isArray(skillPerformances) || skillPerformances.length === 0) {
        continue;
      }

      for (const skill of skillPerformances) {
        // Only include skills with attempts (skip "Not Started")
        const attempts = skill.attempts as Array<Record<string, unknown>>;
        if (attempts && Array.isArray(attempts) && attempts.length > 0) {
          for (const attempt of attempts) {
            rows.push({
              studentId,
              studentName,
              section: s.section as string,
              schoolId: 'school-313',
              assessmentDate: (s.lastAssessmentDate as string) || '',
              skillCode: skill.skillCode as string,
              skillName: skill.skillName as string,
              skillGrade: (skill.skillGrade as string) || '',
              unit: (skill.unit as string) || '',
              status: skill.status as string,
              attemptNumber: attempt.attemptNumber as number,
              dateCompleted: attempt.dateCompleted as string,
              score: attempt.score as string,
              passed: attempt.passed as boolean
            });
          }
        }
      }
    }

    return { success: true, data: rows };
  } catch (error) {
    return {
      success: false,
      error: handleServerError(error, 'Failed to fetch student assessments')
    };
  }
}

/**
 * Get date range for assessment data
 */
export async function getAssessmentDateRange() {
  try {
    await connectToDB();

    const students = await StudentModel.find({ active: true })
      .select('skillPerformances')
      .lean();

    const allDates = new Set<string>();

    for (const student of students) {
      const s = student as Record<string, unknown>;
      const skillPerformances = s.skillPerformances as Array<Record<string, unknown>>;
      if (!skillPerformances || !Array.isArray(skillPerformances)) continue;

      for (const skill of skillPerformances) {
        const attempts = skill.attempts as Array<Record<string, unknown>>;
        if (!attempts || !Array.isArray(attempts)) continue;

        for (const attempt of attempts) {
          const dateStr = (attempt.dateCompleted as string).split('T')[0];
          allDates.add(dateStr);
        }
      }
    }

    const sortedDates = Array.from(allDates).sort();

    return {
      success: true,
      data: {
        allDates: sortedDates,
        earliest: sortedDates[0] || null,
        latest: sortedDates[sortedDates.length - 1] || null
      }
    };
  } catch (error) {
    return {
      success: false,
      error: handleServerError(error, 'Failed to get assessment date range')
    };
  }
}
