import { NextRequest, NextResponse } from "next/server";
import { handleServerError } from "@error/handlers/server";
import { withDbConnection } from "@server/db/ensure-connection";
import { validateApiKey } from "@server/auth/api-key";
import { StudentModel } from "@mongoose-schema/scm/student/student.model";

/**
 * API endpoint for fetching Roadmaps assessment history
 *
 * Headers:
 *   - Authorization: Bearer <SOLVES_COACHING_API_KEY>
 *
 * GET /api/scm/history/roadmaps
 *   Returns all assessment attempts for active students
 *
 * Query params (optional):
 *   - section: Filter by student section
 *   - status: Filter by skill status (e.g., "Mastered", "Attempted But Not Mastered")
 *   - startDate: Filter completions after this date (ISO format)
 *   - endDate: Filter completions before this date (ISO format)
 */

// Type for the history row
type RoadmapsHistoryRow = {
  studentId: string;
  studentName: string;
  studentEmail: string;
  section: string;
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

export async function GET(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const searchParams = new URL(req.url).searchParams;
    const sectionFilter = searchParams.get("section");
    const statusFilter = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const result = await withDbConnection(async () => {
      // Build query
      const query: Record<string, unknown> = {
        active: true,
      };

      if (sectionFilter) {
        query.section = sectionFilter;
      }

      // Fetch students with skillPerformances
      const students = await StudentModel.find(query)
        .select(
          "studentID firstName lastName email section skillPerformances lastAssessmentDate"
        )
        .lean();

      const rows: RoadmapsHistoryRow[] = [];

      for (const student of students) {
        const s = student as Record<string, unknown>;
        const studentName = `${s.firstName || ""} ${s.lastName || ""}`.trim() || "(unknown)";
        const studentEmail = (s.email as string) || "";
        const studentId = (s.studentID as number).toString();

        const skillPerformances = s.skillPerformances as Array<
          Record<string, unknown>
        >;
        if (
          !skillPerformances ||
          !Array.isArray(skillPerformances) ||
          skillPerformances.length === 0
        ) {
          continue;
        }

        for (const skill of skillPerformances) {
          // Status filter
          if (statusFilter && skill.status !== statusFilter) {
            continue;
          }

          // Only include skills with attempts (skip "Not Started")
          const attempts = skill.attempts as Array<Record<string, unknown>>;
          if (attempts && Array.isArray(attempts) && attempts.length > 0) {
            for (const attempt of attempts) {
              const dateCompleted = attempt.dateCompleted as string;

              // Date filtering
              if (startDate || endDate) {
                const attemptDate = new Date(dateCompleted);
                if (startDate && attemptDate < new Date(startDate)) {
                  continue;
                }
                if (endDate && attemptDate > new Date(endDate)) {
                  continue;
                }
              }

              rows.push({
                studentId,
                studentName,
                studentEmail,
                section: s.section as string,
                skillCode: skill.skillCode as string,
                skillName: skill.skillName as string,
                skillGrade: (skill.skillGrade as string) || "",
                unit: (skill.unit as string) || "",
                status: skill.status as string,
                attemptNumber: attempt.attemptNumber as number,
                dateCompleted,
                score: attempt.score as string,
                passed: attempt.passed as boolean,
              });
            }
          }
        }
      }

      // Sort by date completed (most recent first)
      rows.sort((a, b) => {
        const dateA = new Date(a.dateCompleted);
        const dateB = new Date(b.dateCompleted);
        return dateB.getTime() - dateA.getTime();
      });

      return rows;
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in roadmaps history GET:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 }
    );
  }
}
