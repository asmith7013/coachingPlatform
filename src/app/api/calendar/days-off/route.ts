import { NextRequest, NextResponse } from "next/server";
import { SchoolCalendarModel } from "@mongoose-schema/calendar";
import { handleServerError } from "@error/handlers/server";
import { withDbConnection } from "@server/db/ensure-connection";
import { validateApiKey } from "@server/auth/api-key";

/**
 * API endpoint to get global days off (NYC school calendar dates when school is out)
 *
 * Headers:
 *   - Authorization: Bearer <SOLVES_COACHING_API_KEY>
 *
 * Query params:
 *   - schoolYear (required): e.g., "2024-2025" or "2025-2026"
 *
 * Returns:
 *   - dates: string[] - Array of ISO date strings (YYYY-MM-DD) when school is out
 *   - schoolYear: string - The requested school year
 *   - startDate: string - First day of school
 *   - endDate: string - Last day of school
 */
export async function GET(req: NextRequest) {
  // Validate API key
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const searchParams = new URL(req.url).searchParams;
    const schoolYear = searchParams.get("schoolYear");

    if (!schoolYear) {
      return NextResponse.json(
        { success: false, error: "schoolYear parameter is required" },
        { status: 400 }
      );
    }

    const result = await withDbConnection(async () => {
      const calendar = (await SchoolCalendarModel.findOne({ schoolYear })
        .select("schoolYear startDate endDate events")
        .lean()) as {
        schoolYear: string;
        startDate: string;
        endDate: string;
        events?: Array<{
          date: string;
          name: string;
          school?: string;
          classSection?: string;
          hasMathClass?: boolean;
        }>;
      } | null;

      if (!calendar) {
        return null;
      }

      // Filter to global events (no school/classSection) where school is out (hasMathClass = false)
      const daysOff = (calendar.events ?? [])
        .filter((e) => !e.school && !e.classSection && !e.hasMathClass)
        .map((e) => e.date)
        .sort();

      return {
        schoolYear: calendar.schoolYear,
        startDate: calendar.startDate,
        endDate: calendar.endDate,
        dates: daysOff,
      };
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: `No calendar found for school year ${schoolYear}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in calendar days-off API:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 }
    );
  }
}
