import { NextRequest, NextResponse } from "next/server";
import { WorkedExampleDeck } from "@mongoose-schema/worked-example-deck.model";
import { handleServerError } from "@error/handlers/server";
import { withDbConnection } from "@server/db/ensure-connection";
import { validateApiKey } from "@server/auth/api-key";

/**
 * API endpoint to list worked example decks
 *
 * Headers:
 *   - Authorization: Bearer <SOLVES_COACHING_API_KEY>
 *
 * Query params:
 *   - gradeLevel (optional): "6" | "7" | "8" | "Algebra 1"
 *   - page (optional): number (default: 1)
 *   - limit (optional): number (default: 100)
 *
 * Returns:
 *   - data: Array of deck summaries (without htmlSlides)
 *   - pagination: { total, page, limit, hasMore }
 */
export async function GET(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const searchParams = new URL(req.url).searchParams;
    const gradeLevel = searchParams.get("gradeLevel");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "100", 10)));
    const skip = (page - 1) * limit;

    const result = await withDbConnection(async () => {
      // Build query: only public, non-deactivated decks
      const query: Record<string, unknown> = {
        isPublic: true,
        deactivated: { $ne: true },
      };

      if (gradeLevel) {
        query.gradeLevel = gradeLevel;
      }

      // Get total count for pagination
      const total = await WorkedExampleDeck.countDocuments(query);

      // Fetch decks with light projection (no htmlSlides)
      const decks = await WorkedExampleDeck.find(query)
        .select("slug title mathConcept mathStandard gradeLevel unitNumber lessonNumber learningGoals createdAt")
        .sort({ unitNumber: 1, lessonNumber: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return {
        decks,
        pagination: {
          total,
          page,
          limit,
          hasMore: skip + decks.length < total,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: result.decks,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("[worked-examples] Error listing decks:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 }
    );
  }
}
