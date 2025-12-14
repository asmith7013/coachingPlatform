"use server";

import { RoadmapsStudentDataModel } from '@/lib/schema/mongoose-schema/313/student/roadmaps-student-data.model';
import { connectToDB } from "@server/db/connection";
import { handleServerError } from "@error/handlers/server";

/**
 * Fetch all student assessment data with optional filters
 */
export async function fetchStudentAssessmentData(filters?: {
  section?: string;
  startDate?: string;
  endDate?: string;
  studentId?: string;
}) {
  try {
    await connectToDB();

    // Build query
    const query: Record<string, unknown> = {};

    if (filters?.section) {
      // Match students by section - we'll need to join with students collection or filter client-side
      // For now, we'll return all and filter client-side
    }

    if (filters?.studentId) {
      query.studentId = filters.studentId;
    }

    // Fetch all student data
    const studentData = await RoadmapsStudentDataModel.find(query)
      .sort({ assessmentDate: -1, studentName: 1 })
      .lean()
      .exec();

    // Flatten the data to show all attempts for all students
    const flattenedData = studentData.flatMap(student => {
      return student.skillPerformances.flatMap(skill => {
        if (skill.attempts && Array.isArray(skill.attempts) && skill.attempts.length > 0) {
          return skill.attempts.map(attempt => ({
            studentId: student.studentId,
            studentName: student.studentName,
            schoolId: student.schoolId,
            assessmentDate: student.assessmentDate,
            skillCode: skill.skillCode,
            skillName: skill.skillName || '',
            skillGrade: skill.skillGrade || '',
            unit: skill.unit || '',
            status: skill.status,
            attemptNumber: attempt.attemptNumber,
            dateCompleted: attempt.dateCompleted,
            score: attempt.score,
            passed: attempt.passed
          }));
        } else {
          // If no attempts, return the skill with basic info
          return [{
            studentId: student.studentId,
            studentName: student.studentName,
            schoolId: student.schoolId,
            assessmentDate: student.assessmentDate,
            skillCode: skill.skillCode,
            skillName: skill.skillName || '',
            skillGrade: skill.skillGrade || '',
            unit: skill.unit || '',
            status: skill.status,
            attemptNumber: 0,
            dateCompleted: skill.lastUpdated || '',
            score: skill.score || '',
            passed: (skill.status as unknown as string) === 'Mastered'
          }];
        }
      });
    });

    // Apply date filters
    let filteredData = flattenedData;
    if (filters?.startDate) {
      filteredData = filteredData.filter(row =>
        new Date(row.dateCompleted) >= new Date(filters.startDate!)
      );
    }
    if (filters?.endDate) {
      filteredData = filteredData.filter(row =>
        new Date(row.dateCompleted) <= new Date(filters.endDate!)
      );
    }

    return {
      success: true,
      data: filteredData
    };
  } catch (error) {
    console.error('Error fetching student assessment data:', error);
    return {
      success: false,
      error: handleServerError(error, 'fetchStudentAssessmentData')
    };
  }
}

/**
 * Get unique dates from all assessment attempts
 */
export async function getAssessmentDateRange() {
  try {
    await connectToDB();

    const studentData = await RoadmapsStudentDataModel.find({})
      .lean()
      .exec();

    const allDates: Date[] = [];

    studentData.forEach((student: unknown) => {
      const s = student as Record<string, unknown>;
      const skills = s.skillPerformances as Array<Record<string, unknown>>;
      skills?.forEach((skill) => {
        const attempts = skill.attempts as Array<Record<string, unknown>>;
        if (attempts && Array.isArray(attempts) && attempts.length > 0) {
          attempts.forEach((attempt) => {
            if (attempt.dateCompleted) {
              allDates.push(new Date(attempt.dateCompleted as string));
            }
          });
        }
      });
    });

    if (allDates.length === 0) {
      return {
        success: true,
        data: { minDate: null, maxDate: null, allDates: [] }
      };
    }

    const sortedDates = allDates.sort((a, b) => a.getTime() - b.getTime());
    const uniqueDates = Array.from(new Set(sortedDates.map(d => d.toISOString().split('T')[0])));

    return {
      success: true,
      data: {
        minDate: sortedDates[0].toISOString().split('T')[0],
        maxDate: sortedDates[sortedDates.length - 1].toISOString().split('T')[0],
        allDates: uniqueDates
      }
    };
  } catch (error) {
    console.error('Error getting assessment date range:', error);
    return {
      success: false,
      error: handleServerError(error, 'getAssessmentDateRange')
    };
  }
}
