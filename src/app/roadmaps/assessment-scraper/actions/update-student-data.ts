"use server";

import { z } from "zod";
import { RoadmapsStudentDataModel } from '@/lib/schema/mongoose-schema/313/roadmaps-student-data.model';
import { type AssessmentRow } from '@/lib/schema/zod-schema/313/assessment-scraper';
import { groupByStudent, groupBySkill } from '../lib/csv-parser';
import { handleServerError } from "@error/handlers/server";
import { connectToDB } from "@server/db/connection";

/**
 * Request schema for updating student data
 */
const UpdateStudentDataRequestZod = z.object({
  assessmentData: z.array(z.object({
    name: z.string(),
    skillName: z.string(),
    skillNumber: z.string(),
    attempt: z.number(),
    dateCompleted: z.string(),
    result: z.string()
  })),
  schoolId: z.string(),
  assessmentDate: z.string() // Date when this assessment data was collected
});

/**
 * Determine if a score represents mastery (passed)
 * Default threshold: 80%
 */
function isPassed(scoreString: string, threshold: number = 80): boolean {
  const match = scoreString.match(/(\d+)%/);
  if (!match) return false;

  const score = parseInt(match[1], 10);
  return score >= threshold;
}

/**
 * Extract numeric score from percentage string
 */
function getNumericScore(scoreString: string): number {
  const match = scoreString.match(/(\d+)%/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Determine status based on best score
 */
function getStatus(bestScore: number): "Demonstrated" | "Attempted But Not Passed" | "Not Started" {
  if (bestScore >= 80) return "Demonstrated";
  if (bestScore > 0) return "Attempted But Not Passed";
  return "Not Started";
}

/**
 * Update student data in MongoDB from assessment CSV data
 */
export async function updateStudentData(request: unknown) {
  try {
    // Validate request
    const { assessmentData, schoolId, assessmentDate } = UpdateStudentDataRequestZod.parse(request);

    console.log('🔄 Starting student data update...');
    console.log(`   📊 Total rows: ${assessmentData.length}`);
    console.log(`   🏫 School ID: ${schoolId}`);
    console.log(`   📅 Assessment Date: ${assessmentDate}`);

    // Connect to MongoDB
    await connectToDB();

    // Group data by student
    const studentGroups = groupByStudent(assessmentData as AssessmentRow[]);
    console.log(`   👥 Students to process: ${studentGroups.size}`);

    let studentsUpdated = 0;
    let studentsCreated = 0;
    const errors: string[] = [];

    // Process each student
    for (const [studentName, studentRows] of studentGroups) {
      try {
        // Generate a simple student ID from name (you may want a better approach)
        const studentId = studentName.toLowerCase().replace(/[^a-z0-9]/g, '-');

        // Group student's rows by skill
        const skillGroups = groupBySkill(studentRows);

        // Build skill performances
        const skillPerformances = [];

        for (const [skillNumber, skillAttempts] of skillGroups) {
          // Sort attempts by attempt number
          const sortedAttempts = skillAttempts.sort((a, b) => a.attempt - b.attempt);

          // Build attempts array
          const attempts = sortedAttempts.map(attempt => ({
            attemptNumber: attempt.attempt,
            dateCompleted: attempt.dateCompleted,
            score: attempt.result,
            passed: isPassed(attempt.result)
          }));

          // Calculate best score
          const scores = sortedAttempts.map(a => getNumericScore(a.result));
          const bestScore = Math.max(...scores);
          const bestScoreString = `${bestScore}%`;

          // Find mastered date (first passing attempt)
          const firstPassed = sortedAttempts.find(a => isPassed(a.result));
          const masteredDate = firstPassed?.dateCompleted || undefined;

          // Get last attempt date
          const lastAttemptDate = sortedAttempts[sortedAttempts.length - 1].dateCompleted;

          // Determine status
          const status = getStatus(bestScore);

          // Get skill name from first row
          const skillName = sortedAttempts[0].skillName;

          skillPerformances.push({
            skillCode: skillNumber,
            skillName: skillName,
            status: status,
            score: bestScoreString, // Keep for backward compatibility
            lastUpdated: lastAttemptDate, // Keep for backward compatibility
            attempts: attempts,
            bestScore: bestScoreString,
            attemptCount: attempts.length,
            masteredDate: masteredDate,
            lastAttemptDate: lastAttemptDate
          });
        }

        // Upsert student record
        const result = await RoadmapsStudentDataModel.findOneAndUpdate(
          { studentId, schoolId },
          {
            studentId,
            studentName,
            schoolId,
            assessmentDate,
            skillPerformances
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
          }
        );

        if (result) {
          studentsUpdated++;
          console.log(`  ✅ Updated: ${studentName} (${skillPerformances.length} skills)`);
        }

      } catch (studentError) {
        const errorMsg = `Failed to update ${studentName}: ${studentError instanceof Error ? studentError.message : 'Unknown error'}`;
        console.error(`  ❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log('✅ Student data update complete');
    console.log(`   📝 Students updated: ${studentsUpdated}`);
    console.log(`   ❌ Errors: ${errors.length}`);

    return {
      success: true,
      data: {
        studentsUpdated,
        studentsCreated,
        totalStudents: studentGroups.size,
        errors
      }
    };

  } catch (error) {
    console.error('💥 Error in updateStudentData:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation error: ${error.errors.map(e => e.message).join(', ')}`
      };
    }

    return {
      success: false,
      error: handleServerError(error, 'updateStudentData')
    };
  }
}
