import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@server/auth/api-key";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { StudentActivityModel } from "@mongoose-schema/scm/student/student-activity.model";

/**
 * API endpoint for fetching recent activities for a section.
 *
 * GET /api/podsie/incentives/activities?section=803&limit=20&skip=0&startDate=2025-09-01&endDate=2025-12-31
 * Returns: { success: true, activities: Activity[], total: number }
 *
 * Returns recent activities logged for the given section,
 * sorted by date descending.
 */

interface ActivityDocument {
  _id: string;
  studentName: string;
  section: string;
  date: string;
  activityType: string;
  activityLabel: string;
  lessonId?: string;
  skillId?: string;
  inquiryQuestion?: string;
  customDetail?: string;
  loggedAt?: string;
  loggedBy?: string;
}

export async function GET(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const searchParams = new URL(req.url).searchParams;
    const section = searchParams.get("section");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 20;
    const skipParam = searchParams.get("skip");
    const skip = skipParam ? parseInt(skipParam, 10) : 0;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!section) {
      return NextResponse.json(
        { success: false, error: "section parameter is required" },
        { status: 400 },
      );
    }

    // Build filter with optional date range
    const filter: Record<string, unknown> = { section };
    if (startDate || endDate) {
      const dateFilter: Record<string, string> = {};
      if (startDate) dateFilter.$gte = startDate;
      if (endDate) dateFilter.$lte = endDate;
      filter.date = dateFilter;
    }

    const { activities, total } = await withDbConnection(async () => {
      const [result, count] = await Promise.all([
        StudentActivityModel.find(filter)
          .sort({ date: -1, loggedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean<ActivityDocument[]>(),
        StudentActivityModel.countDocuments(filter),
      ]);

      return {
        total: count,
        activities: result.map((doc) => {
          // Build detail string from available fields
          let detail: string | undefined;
          if (doc.inquiryQuestion) {
            detail = doc.inquiryQuestion;
          } else if (doc.customDetail) {
            detail = doc.customDetail;
          } else if (doc.skillId) {
            detail = `Skill: ${doc.skillId}`;
          } else if (doc.lessonId) {
            detail = `Lesson: ${doc.lessonId}`;
          }

          return {
            _id: doc._id.toString(),
            studentName: doc.studentName,
            date: doc.date,
            activityLabel: doc.activityLabel,
            detail,
            loggedAt: doc.loggedAt,
          };
        }),
      };
    });

    return NextResponse.json({
      success: true,
      activities,
      total,
    });
  } catch (error) {
    console.error("Error in incentives activities GET:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 },
    );
  }
}
