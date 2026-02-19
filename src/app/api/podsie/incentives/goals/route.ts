import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@server/auth/api-key";
import { handleServerError } from "@error/handlers/server";
import { withDbConnection } from "@server/db/ensure-connection";
import { StudentGoalModel } from "@mongoose-schema/scm/incentives";

/**
 * API endpoint for managing student goals (per-student incentive goals).
 *
 * Headers:
 *   - Authorization: Bearer <SOLVES_COACHING_API_KEY>
 *
 * GET  /api/podsie/incentives/goals?groupId=123
 *   Returns all student goals for a group
 *
 * POST /api/podsie/incentives/goals
 *   Bulk upsert student goals for a group
 *   Body: { goals: StudentGoalInput[] }
 */

export async function GET(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const searchParams = new URL(req.url).searchParams;
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      return NextResponse.json(
        { success: false, error: "groupId parameter is required" },
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

    const goals = await withDbConnection(async () => {
      const docs = await StudentGoalModel.find({ podsieGroupId }).lean();
      return docs.map((doc) => new StudentGoalModel(doc).toJSON());
    });

    return NextResponse.json({ success: true, goals });
  } catch (error) {
    console.error("Error in incentives goals GET:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { goals } = body;

    if (!Array.isArray(goals) || goals.length === 0) {
      return NextResponse.json(
        { success: false, error: "goals must be a non-empty array" },
        { status: 400 },
      );
    }

    const result = await withDbConnection(async () => {
      const operations = goals.map(
        (goal: {
          podsieGroupId: number;
          podsieStudentProfileId: string;
          studentName: string;
          studentEmail: string;
          goalName: string;
          goalCost: number;
          goalImageUrl?: string | null;
          unitMultipliers?: Array<{
            podsieModuleId: number;
            multiplierPercent: number;
          }>;
          ownerIds?: string[];
        }) => ({
          updateOne: {
            filter: {
              podsieGroupId: goal.podsieGroupId,
              podsieStudentProfileId: goal.podsieStudentProfileId,
            },
            update: {
              $set: {
                studentName: goal.studentName,
                studentEmail: goal.studentEmail,
                goalName: goal.goalName,
                goalCost: goal.goalCost,
                goalImageUrl: goal.goalImageUrl ?? null,
                unitMultipliers: goal.unitMultipliers ?? [],
                ownerIds: goal.ownerIds ?? [],
              },
            },
            upsert: true,
          },
        }),
      );

      await StudentGoalModel.bulkWrite(operations);

      // Fetch the updated goals
      const groupId = goals[0].podsieGroupId;
      const docs = await StudentGoalModel.find({
        podsieGroupId: groupId,
      }).lean();
      return docs.map((doc) => new StudentGoalModel(doc).toJSON());
    });

    return NextResponse.json({ success: true, goals: result });
  } catch (error) {
    console.error("Error in incentives goals POST:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 },
    );
  }
}
