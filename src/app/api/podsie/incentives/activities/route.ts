import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@server/auth/api-key";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { StudentActivityModel } from "@mongoose-schema/scm/student/student-activity.model";

/**
 * API endpoint for fetching recent activities for a section.
 *
 * GET /api/podsie/incentives/activities?section=803&limit=20
 * Returns: { success: true, activities: Activity[] }
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

    if (!section) {
      return NextResponse.json(
        { success: false, error: "section parameter is required" },
        { status: 400 }
      );
    }

    const activities = await withDbConnection(async () => {
      const result = await StudentActivityModel.find({ section })
        .sort({ date: -1, loggedAt: -1 })
        .limit(limit)
        .lean<ActivityDocument[]>();

      return result.map((doc) => {
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
      });
    });

    return NextResponse.json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error("Error in incentives activities GET:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 }
    );
  }
}
