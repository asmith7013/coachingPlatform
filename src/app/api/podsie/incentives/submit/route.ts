import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@server/auth/api-key";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { findStudentsByEmails } from "@/lib/utils/student-matching";
import {
  submitActivities,
  type StudentActivitySubmission,
} from "@/app/scm/incentives/form/actions";

/**
 * API endpoint for submitting incentive activities from Podsie.
 *
 * POST /api/podsie/incentives/submit
 * Body: {
 *   submissions: Array<{
 *     studentEmail: string,
 *     studentName: string,
 *     section: string,
 *     activities: Array<{
 *       date: string,
 *       activityType: string,
 *       activityLabel: string,
 *       unitId?: string,
 *       lessonId?: string,
 *       skillId?: string,
 *       smallGroupType?: "mastery" | "prerequisite",
 *       inquiryQuestion?: string,
 *       customDetail?: string,
 *     }>
 *   }>,
 *   teacherName?: string
 * }
 */

export async function POST(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { submissions, teacherName } = body;

    if (!Array.isArray(submissions) || submissions.length === 0) {
      return NextResponse.json(
        { success: false, error: "submissions must be a non-empty array" },
        { status: 400 }
      );
    }

    // Resolve student emails to MongoDB IDs
    const emails = submissions.map(
      (s: { studentEmail: string }) => s.studentEmail
    );

    const studentMap = await withDbConnection(async () => {
      return findStudentsByEmails(emails);
    });

    // Build submissions with resolved student IDs
    const resolvedSubmissions: StudentActivitySubmission[] = [];
    const unmatchedEmails: string[] = [];

    for (const sub of submissions) {
      const student = studentMap.get(sub.studentEmail.toLowerCase());
      if (!student) {
        unmatchedEmails.push(sub.studentEmail);
        continue;
      }

      resolvedSubmissions.push({
        studentId: student._id,
        activities: sub.activities,
      });
    }

    if (resolvedSubmissions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No students could be matched by email",
          unmatchedEmails,
        },
        { status: 400 }
      );
    }

    const result = await submitActivities(resolvedSubmissions, teacherName);

    return NextResponse.json({
      ...result,
      unmatchedEmails:
        unmatchedEmails.length > 0 ? unmatchedEmails : undefined,
    });
  } catch (error) {
    console.error("Error in incentives submit:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 }
    );
  }
}
