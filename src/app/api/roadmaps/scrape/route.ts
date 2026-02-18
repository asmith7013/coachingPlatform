import { NextRequest, NextResponse } from "next/server";
import { scrapeAndUpdateAllSections } from "@/app/scm/roadmaps/assessment-scraper/actions/scrape-and-update";

/**
 * API endpoint for triggering roadmaps scraper
 * Called by GitHub Actions or other external services
 *
 * This endpoint triggers the same scraper that runs when clicking the
 * "🔄 Update Assessment Data" button on /roadmaps/history
 */
export async function POST(request: NextRequest) {
  try {
    // Verify API key authentication
    const authHeader = request.headers.get("authorization");
    const expectedApiKey = process.env.SCRAPER_API_KEY;

    if (!expectedApiKey) {
      console.error("❌ SCRAPER_API_KEY not configured in environment");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 },
      );
    }

    const providedApiKey = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (providedApiKey !== expectedApiKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { credentials } = body;

    if (!credentials || !credentials.email || !credentials.password) {
      return NextResponse.json(
        {
          error:
            "Missing credentials in request body (email and password required)",
        },
        { status: 400 },
      );
    }

    console.log("🚀 API: Starting scraper via API endpoint");

    // Call the scraper function (same as the UI button uses)
    const result = await scrapeAndUpdateAllSections({
      email: credentials.email,
      password: credentials.password,
    });

    if (result.success) {
      console.log("✅ API: Scraper completed successfully");
      return NextResponse.json({
        success: true,
        message: "Scraper completed successfully",
        data: result.data,
      });
    } else {
      console.error("❌ API: Scraper failed:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("💥 API: Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Roadmaps scraper API is running",
    timestamp: new Date().toISOString(),
  });
}
