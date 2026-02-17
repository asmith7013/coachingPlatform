import { NextRequest, NextResponse } from "next/server";
import { WorkedExampleDeck } from "@mongoose-schema/worked-example-deck.model";
import { handleServerError } from "@error/handlers/server";
import { withDbConnection } from "@server/db/ensure-connection";
import { validateApiKey } from "@server/auth/api-key";

/**
 * API endpoint to get a single worked example deck by slug
 *
 * Headers:
 *   - Authorization: Bearer <SOLVES_COACHING_API_KEY>
 *
 * Returns:
 *   - Full deck data including htmlSlides
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "slug parameter is required" },
        { status: 400 },
      );
    }

    const result = await withDbConnection(async () => {
      const deck = await WorkedExampleDeck.findOne({
        slug,
        isPublic: true,
        deactivated: { $ne: true },
      })
        .select(
          "slug title mathConcept mathStandard gradeLevel unitNumber lessonNumber learningGoals htmlSlides createdAt updatedAt",
        )
        .lean();

      return deck;
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: `Deck not found: ${slug}` },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[worked-examples] Error fetching deck:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 },
    );
  }
}
