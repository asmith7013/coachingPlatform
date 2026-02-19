import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@server/auth/api-key";
import { handleServerError } from "@error/handlers/server";
import { withDbConnection } from "@server/db/ensure-connection";
import { StudentGoalModel } from "@mongoose-schema/scm/incentives";

/**
 * API endpoint for fetching a single student's goal.
 *
 * Headers:
 *   - Authorization: Bearer <SOLVES_COACHING_API_KEY>
 *
 * GET /api/podsie/incentives/goals/student?groupId=123&studentProfileId=uuid
 *   Returns the goal for a specific student in a group, or null if none set
 */

export async function GET(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const searchParams = new URL(req.url).searchParams;
    const groupId = searchParams.get("groupId");
    const studentProfileId = searchParams.get("studentProfileId");

    if (!groupId || !studentProfileId) {
      return NextResponse.json(
        {
          success: false,
          error: "groupId and studentProfileId parameters are required",
        },
        { status: 400 },
      );
    }

    const podsieGroupId = parseInt(groupId, 10);
    if (isNaN(podsieGroupId)) {
      return NextResponse.json(
        { success: false, error: "groupId must be a valid integer" },
        { status: 400 },
      );
    }

    const goal = await withDbConnection(async () => {
      const doc = await StudentGoalModel.findOne({
        podsieGroupId,
        podsieStudentProfileId: studentProfileId,
      }).lean();

      if (!doc) return null;
      return new StudentGoalModel(doc).toJSON();
    });

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    console.error("Error in incentives goals/student GET:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 },
    );
  }
}
