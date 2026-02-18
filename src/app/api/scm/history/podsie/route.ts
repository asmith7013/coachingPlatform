import { NextRequest, NextResponse } from "next/server";
import { handleServerError } from "@error/handlers/server";
import { withDbConnection } from "@server/db/ensure-connection";
import { validateApiKey } from "@server/auth/api-key";
import { SectionConfigModel } from "@mongoose-schema/scm/podsie/section-config.model";
import { StudentModel } from "@mongoose-schema/scm/student/student.model";

/**
 * API endpoint for fetching Podsie completion history
 *
 * Headers:
 *   - Authorization: Bearer <SOLVES_COACHING_API_KEY>
 *
 * GET /api/scm/history/podsie
 *   Returns all Podsie completions for active students
 *
 * Query params (optional):
 *   - section: Filter by student section
 *   - startDate: Filter completions after this date (ISO format)
 *   - endDate: Filter completions before this date (ISO format)
 */

// Type for the history row
type PodsieHistoryRow = {
  studentId: number;
  studentName: string;
  section: string;
  assignmentName: string;
  lessonType: "lesson" | "rampUp" | "assessment" | "unknown";
  completedDate: string;
};

export async function GET(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const searchParams = new URL(req.url).searchParams;
    const sectionFilter = searchParams.get("section");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const result = await withDbConnection(async () => {
      // Get all active section configs to build assignment lookup
      const sectionConfigs = await SectionConfigModel.find({
        active: true,
      }).lean();

      // Build assignment lookup map: podsieAssignmentId -> assignment details
      const assignmentDetailsMap = new Map<
        string,
        {
          assignmentName: string;
          lessonType: "lesson" | "rampUp" | "assessment";
        }
      >();

      for (const config of sectionConfigs as unknown as Array<{
        assignmentContent?: Array<{
          lessonType?: "lesson" | "rampUp" | "assessment";
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
          const lessonName = assignment.lessonName || "";

          if (lessonType && assignment.podsieActivities) {
            for (const activity of assignment.podsieActivities) {
              if (activity.podsieAssignmentId) {
                assignmentDetailsMap.set(activity.podsieAssignmentId, {
                  assignmentName: activity.podsieAssignmentName || lessonName,
                  lessonType,
                });
              }
            }
          }
        }
      }

      // Build student query
      const studentQuery: Record<string, unknown> = {
        active: true,
        podsieProgress: { $exists: true, $ne: [] },
      };

      if (sectionFilter) {
        studentQuery.section = sectionFilter;
      }

      // Get all students with podsieProgress
      const students = await StudentModel.find(studentQuery)
        .select("studentID firstName lastName section podsieProgress")
        .lean();

      const completions: PodsieHistoryRow[] = [];

      for (const student of students as unknown as Array<{
        studentID: number;
        firstName: string;
        lastName: string;
        section: string;
        podsieProgress: Array<{
          podsieAssignmentId?: string;
          isFullyComplete?: boolean;
          fullyCompletedDate?: string;
          questions?: Array<{ completedAt?: string }>;
        }>;
      }>) {
        const podsieProgress = student.podsieProgress;
        if (!podsieProgress || !Array.isArray(podsieProgress)) continue;

        for (const progress of podsieProgress) {
          // Check if fully completed
          if (!progress.isFullyComplete) continue;

          // Determine the completion date
          let completedDate: string | undefined;
          if (progress.fullyCompletedDate) {
            completedDate = progress.fullyCompletedDate;
          } else if (progress.questions && progress.questions.length > 0) {
            // Fallback: use the last question's completedAt
            const lastQuestion = progress.questions
              .filter((q) => q.completedAt)
              .sort((a, b) =>
                (b.completedAt || "").localeCompare(a.completedAt || ""),
              )[0];
            if (lastQuestion?.completedAt) {
              completedDate = lastQuestion.completedAt;
            }
          }

          if (!completedDate) continue;

          // Date filtering
          if (startDate || endDate) {
            const completionDateObj = new Date(completedDate);
            if (startDate && completionDateObj < new Date(startDate)) {
              continue;
            }
            if (endDate && completionDateObj > new Date(endDate)) {
              continue;
            }
          }

          // Look up assignment details
          const assignmentDetails = assignmentDetailsMap.get(
            progress.podsieAssignmentId || "",
          );

          completions.push({
            studentId: student.studentID,
            studentName:
              `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
              "(unknown)",
            section: student.section,
            assignmentName:
              assignmentDetails?.assignmentName ||
              progress.podsieAssignmentId ||
              "Unknown",
            lessonType: assignmentDetails?.lessonType || "unknown",
            completedDate,
          });
        }
      }

      // Sort by most recent first
      completions.sort((a, b) =>
        b.completedDate.localeCompare(a.completedDate),
      );

      return completions;
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in podsie history GET:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 },
    );
  }
}
