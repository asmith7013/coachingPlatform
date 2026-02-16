import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@server/auth/api-key";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { StudentActivityModel } from "@mongoose-schema/scm/student/student-activity.model";

/**
 * API endpoint for fetching aggregated activity counts per student for a section.
 *
 * GET /api/podsie/incentives/summary?section=803&startDate=2024-01-15
 * Returns: { success: true, summary: { [studentId]: { [activityType]: count } }, activityTypes: string[] }
 *
 * Returns aggregated counts of each activity type per student.
 * Optionally filters by startDate (activities on or after this date).
 */

interface AggregationResult {
  _id: {
    studentName: string;
    activityType: string;
  };
  count: number;
}

export async function GET(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const searchParams = new URL(req.url).searchParams;
    const section = searchParams.get("section");
    const startDate = searchParams.get("startDate");

    if (!section) {
      return NextResponse.json(
        { success: false, error: "section parameter is required" },
        { status: 400 },
      );
    }

    const result = await withDbConnection(async () => {
      // Build match conditions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const matchConditions: any = { section };
      if (startDate) {
        matchConditions.date = { $gte: startDate };
      }

      // Aggregate counts by student name and activity type
      const aggregation =
        await StudentActivityModel.aggregate<AggregationResult>([
          { $match: matchConditions },
          {
            $group: {
              _id: {
                studentName: "$studentName",
                activityType: "$activityType",
              },
              count: { $sum: 1 },
            },
          },
        ]);

      // Transform into nested structure: { studentName: { activityType: count } }
      const summary: Record<
        string,
        { name: string; counts: Record<string, number> }
      > = {};
      const activityTypesSet = new Set<string>();

      for (const item of aggregation) {
        const { studentName, activityType } = item._id;
        activityTypesSet.add(activityType);

        if (!summary[studentName]) {
          summary[studentName] = { name: studentName, counts: {} };
        }
        summary[studentName].counts[activityType] = item.count;
      }

      return {
        summary,
        activityTypes: Array.from(activityTypesSet).sort(),
      };
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error in incentives summary GET:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 },
    );
  }
}
