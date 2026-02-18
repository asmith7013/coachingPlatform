import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@server/auth/api-key";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { StudentActivityModel } from "@mongoose-schema/scm/student/student-activity.model";

/**
 * API endpoint for fetching recent incentive submission dates for a section.
 *
 * GET /api/podsie/incentives/recent?section=803
 * Returns: { success: true, dates: string[] }
 *
 * Returns distinct dates (YYYY-MM-DD) where activities were logged
 * for the given section in the past 2 weeks.
 */

export async function GET(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const searchParams = new URL(req.url).searchParams;
    const section = searchParams.get("section");

    if (!section) {
      return NextResponse.json(
        { success: false, error: "section parameter is required" },
        { status: 400 },
      );
    }

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const twoWeeksAgoStr = twoWeeksAgo.toISOString().split("T")[0];

    const dates = await withDbConnection(async () => {
      const result: string[] = (await StudentActivityModel.distinct("date", {
        section,
        date: { $gte: twoWeeksAgoStr },
      })) as unknown as string[];

      return result.sort();
    });

    return NextResponse.json({
      success: true,
      dates,
    });
  } catch (error) {
    console.error("Error in incentives recent GET:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 },
    );
  }
}
