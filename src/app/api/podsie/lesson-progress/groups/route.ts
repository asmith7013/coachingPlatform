import { NextRequest, NextResponse } from "next/server";
import { PodsieScmGroupModel } from "@mongoose-schema/scm/podsie/podsie-scm-group.model";
import { handleServerError } from "@error/handlers/server";
import { withDbConnection } from "@server/db/ensure-connection";
import { validateApiKey } from "@server/auth/api-key";

/**
 * API endpoint to get distinct Podsie group IDs
 *
 * Headers:
 *   - Authorization: Bearer <SOLVES_COACHING_API_KEY>
 *
 * GET /api/podsie/lesson-progress/groups
 *   Returns all distinct podsieGroupId values from the collection
 */

export async function GET(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const groupIds = await withDbConnection(async () => {
      const ids = await PodsieScmGroupModel.distinct("podsieGroupId");
      return ids.map((id) => Number(id)).sort((a, b) => a - b);
    });

    return NextResponse.json({
      success: true,
      groupIds,
      count: groupIds.length,
    });
  } catch (error) {
    console.error("Error in lesson-progress/groups GET:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 }
    );
  }
}
