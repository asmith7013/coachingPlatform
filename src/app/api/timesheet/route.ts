// src/app/api/timesheet/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withDbConnection } from "@server/db/ensure-connection";
import { TimesheetEntryModel } from "@/lib/schema/mongoose-schema/scm/timesheet/timesheet-entry.model";
import { TimesheetBatchInputSchema } from "@/lib/schema/zod-schema/scm/timesheet/timesheet-entry";
import { logError } from "@error/core/logging";

// Simple API key for authentication (store in .env.local for production)
const TIMESHEET_API_KEY =
  process.env.TIMESHEET_API_KEY || "timesheet-dev-key-2024";

// CORS headers for cross-origin requests from Chrome extension
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * Helper to create JSON response with CORS headers
 */
function jsonResponse(data: unknown, status: number = 200) {
  return NextResponse.json(data, {
    status,
    headers: CORS_HEADERS,
  });
}

/**
 * OPTIONS /api/timesheet
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * Adjusts the date if submission is after 7pm EST
 * If after 7pm, shifts to the next day
 */
function adjustDateForLateSubmission(dateStr: string): string {
  // Get current time in EST
  const now = new Date();
  const estTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" }),
  );
  const currentHour = estTime.getHours();

  // If after 7pm (19:00) EST, shift to next day
  if (currentHour >= 19) {
    const date = new Date(dateStr + "T12:00:00"); // Parse as noon to avoid timezone issues
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0]; // Return YYYY-MM-DD
  }

  return dateStr;
}

/**
 * POST /api/timesheet
 * Receives timesheet entries from Chrome extension and stores them
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("📥 API /timesheet POST request received");

    // Validate input
    const validationResult = TimesheetBatchInputSchema.safeParse(body);
    if (!validationResult.success) {
      const fieldErrors = validationResult.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      logError(validationResult.error, {
        component: "TimesheetAPI",
        operation: "validateInput",
        severity: "warning",
      });
      return jsonResponse(
        {
          success: false,
          error: `Validation failed: ${fieldErrors}`,
          code: "VALIDATION_ERROR",
          details: validationResult.error.issues,
        },
        400,
      );
    }

    const { entries, apiKey } = validationResult.data;

    // Verify API key
    if (apiKey !== TIMESHEET_API_KEY) {
      logError(new Error("Invalid API key attempt"), {
        component: "TimesheetAPI",
        operation: "authenticate",
        severity: "warning",
      });
      return jsonResponse(
        {
          success: false,
          error: "Authentication failed: Invalid API key",
          code: "AUTH_ERROR",
        },
        401,
      );
    }

    // Process and save entries
    const savedEntries = await withDbConnection(async () => {
      const results = [];

      for (const entry of entries) {
        // Adjust date if after 7pm EST
        const adjustedDate = adjustDateForLateSubmission(entry.date);

        // Calculate total pay
        const totalPay = entry.hours * entry.rate;

        // Create the document
        const doc = new TimesheetEntryModel({
          date: adjustedDate,
          task: entry.task,
          project: entry.project,
          hours: entry.hours,
          rate: entry.rate,
          totalPay,
          submittedAt: new Date(),
        });

        const saved = await doc.save();
        results.push(saved.toJSON());
      }

      return results;
    });

    console.log(`✅ Saved ${savedEntries.length} timesheet entries`);

    return jsonResponse(
      {
        success: true,
        message: `Saved ${savedEntries.length} timesheet entries`,
        data: savedEntries,
      },
      201,
    );
  } catch (error) {
    const errorMessage = logError(error, {
      component: "TimesheetAPI",
      operation: "saveEntries",
      severity: "error",
    });

    return jsonResponse(
      {
        success: false,
        error: `Failed to save timesheet entries: ${errorMessage}`,
        code: "DATABASE_ERROR",
      },
      500,
    );
  }
}

/**
 * GET /api/timesheet
 * Fetches timesheet entries (for the viewing page)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const project = searchParams.get("project");

    console.log("📥 API /timesheet GET request received");

    const entries = await withDbConnection(async () => {
      const query: Record<string, unknown> = {};

      // Date range filter
      if (startDate || endDate) {
        query.date = {};
        if (startDate) {
          (query.date as Record<string, string>).$gte = startDate;
        }
        if (endDate) {
          (query.date as Record<string, string>).$lte = endDate;
        }
      }

      // Project filter
      if (project) {
        query.project = project;
      }

      const results = await TimesheetEntryModel.find(query)
        .sort({ date: -1, submittedAt: -1 })
        .lean();

      // Transform ObjectIds to strings
      return results.map((doc) => ({
        ...doc,
        _id: String(doc._id),
      }));
    });

    return jsonResponse({
      success: true,
      data: entries,
      count: entries.length,
    });
  } catch (error) {
    const errorMessage = logError(error, {
      component: "TimesheetAPI",
      operation: "fetchEntries",
      severity: "error",
    });

    return jsonResponse(
      {
        success: false,
        error: `Failed to fetch timesheet entries: ${errorMessage}`,
        code: "DATABASE_ERROR",
      },
      500,
    );
  }
}
