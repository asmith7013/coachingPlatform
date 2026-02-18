import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@server/auth/api-key";
import { handleServerError } from "@error/handlers/server";
import { reorderActivityTypes } from "@/app/scm/incentives/form/actions";

/**
 * API endpoint for reordering incentive activity types.
 *
 * POST /api/podsie/incentives/activity-types/reorder
 * Body: { orderedIds: string[] }
 */

export async function POST(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { orderedIds } = body;

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "orderedIds must be a non-empty array" },
        { status: 400 },
      );
    }

    const result = await reorderActivityTypes(orderedIds);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in incentives activity-types reorder:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 },
    );
  }
}
