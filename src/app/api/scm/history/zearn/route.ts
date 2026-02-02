import { NextRequest, NextResponse } from "next/server";
import { handleServerError } from "@error/handlers/server";
import { withDbConnection } from "@server/db/ensure-connection";
import { validateApiKey } from "@server/auth/api-key";
import { StudentModel } from "@mongoose-schema/scm/student/student.model";
import { PodsieScmModuleModel } from "@mongoose-schema/scm/podsie/podsie-scm-module.model";

/**
 * API endpoint for fetching Zearn completion history
 *
 * Headers:
 *   - Authorization: Bearer <SOLVES_COACHING_API_KEY>
 *
 * GET /api/scm/history/zearn
 *   Returns all Zearn completions for active students
 *
 * Query params (optional):
 *   - section: Filter by student section
 *   - startDate: Filter completions after this date (MM/DD/YY format)
 *   - endDate: Filter completions before this date (MM/DD/YY format)
 *   - groupId: Filter by Podsie group ID (uses pacing config to find relevant lesson codes)
 *   - moduleId: Filter by Podsie module ID (used with groupId for more specific filtering)
 *   - assignmentId: Filter by a specific Podsie assignment ID's zearn lesson code
 */

// Type for the student data from MongoDB
type StudentWithZearn = {
  studentID: number;
  firstName: string;
  lastName: string;
  email?: string;
  section: string;
  zearnLessons: Array<{
    lessonCode: string;
    completionDate: string;
  }>;
};

// Type for the history row
type ZearnHistoryRow = {
  studentId: string;
  studentName: string;
  studentEmail: string;
  section: string;
  lessonCode: string;
  completionDate: string;
  grade: string;
  module: string;
};

export async function GET(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const searchParams = new URL(req.url).searchParams;
    const sectionFilter = searchParams.get("section");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const groupIdParam = searchParams.get("groupId");
    const moduleIdParam = searchParams.get("moduleId");
    const assignmentIdParam = searchParams.get("assignmentId");

    const result = await withDbConnection(async () => {
      // If groupId/moduleId/assignmentId provided, look up relevant zearn lesson codes
      let allowedLessonCodes: Set<string> | null = null;

      if (groupIdParam || moduleIdParam || assignmentIdParam) {
        const moduleQuery: Record<string, unknown> = {};
        if (groupIdParam) moduleQuery.podsieGroupId = parseInt(groupIdParam, 10);
        if (moduleIdParam) moduleQuery.podsieModuleId = parseInt(moduleIdParam, 10);

        const modules = await PodsieScmModuleModel.find(moduleQuery, {
          assignments: 1,
        }).lean();

        allowedLessonCodes = new Set<string>();
        const assignmentIdFilter = assignmentIdParam ? parseInt(assignmentIdParam, 10) : null;

        for (const mod of modules) {
          for (const assignment of (mod as unknown as { assignments: Array<{ podsieAssignmentId: number; zearnLessonCode?: string }> }).assignments || []) {
            if (assignmentIdFilter != null && assignment.podsieAssignmentId !== assignmentIdFilter) {
              continue;
            }
            if (assignment.zearnLessonCode) {
              allowedLessonCodes.add(assignment.zearnLessonCode);
            }
          }
        }

        // If no lesson codes found, return empty
        if (allowedLessonCodes.size === 0) {
          return [];
        }
      }

      // Build query
      const query: Record<string, unknown> = {
        active: true,
        "zearnLessons.0": { $exists: true },
      };

      if (sectionFilter) {
        query.section = sectionFilter;
      }

      // Fetch students with zearnLessons
      const students = (await StudentModel.find(query, {
        studentID: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        section: 1,
        zearnLessons: 1,
      }).lean()) as unknown as StudentWithZearn[];

      // Flatten into rows
      const rows: ZearnHistoryRow[] = [];

      for (const student of students) {
        const studentName = `${student.lastName}, ${student.firstName}`;

        for (const lesson of student.zearnLessons || []) {
          // Filter by allowed lesson codes if specified
          if (allowedLessonCodes && !allowedLessonCodes.has(lesson.lessonCode)) {
            continue;
          }

          // Parse lesson code to extract grade and module
          // Format: "G8 M2 L1" or "G3 M1 L10"
          const lessonMatch = lesson.lessonCode.match(/G(\d+)\s+M(\d+)\s+L(\d+)/);
          const grade = lessonMatch ? lessonMatch[1] : "";
          const moduleNum = lessonMatch ? lessonMatch[2] : "";

          // Date filtering (MM/DD/YY format)
          if (startDate || endDate) {
            const completionDateObj = parseZearnDate(lesson.completionDate);
            if (startDate && completionDateObj < parseZearnDate(startDate)) {
              continue;
            }
            if (endDate && completionDateObj > parseZearnDate(endDate)) {
              continue;
            }
          }

          rows.push({
            studentId: student.studentID.toString(),
            studentName,
            studentEmail: student.email || "",
            section: student.section,
            lessonCode: lesson.lessonCode,
            completionDate: lesson.completionDate,
            grade,
            module: moduleNum,
          });
        }
      }

      // Sort by completion date (most recent first)
      rows.sort((a, b) => {
        const dateA = parseZearnDate(a.completionDate);
        const dateB = parseZearnDate(b.completionDate);
        return dateB.getTime() - dateA.getTime();
      });

      return rows;
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in zearn history GET:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 }
    );
  }
}

/**
 * Parse Zearn date format (MM/DD/YY) to Date object
 */
function parseZearnDate(dateStr: string): Date {
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const month = parseInt(parts[0], 10) - 1;
    const day = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);
    // Handle 2-digit year
    if (year < 100) {
      year += year < 50 ? 2000 : 1900;
    }
    return new Date(year, month, day);
  }
  return new Date(dateStr);
}
