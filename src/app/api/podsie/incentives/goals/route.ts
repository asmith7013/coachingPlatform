import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateApiKey } from "@server/auth/api-key";
import { handleServerError } from "@error/handlers/server";
import { withDbConnection } from "@server/db/ensure-connection";
import { StudentGoalModel } from "@mongoose-schema/scm/incentives";
import { StudentGoalInputZodSchema } from "@zod-schema/scm/incentives";

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

    // Validate input with Zod
    const GoalsArraySchema = z.array(StudentGoalInputZodSchema);
    const parsed = GoalsArraySchema.safeParse(goals);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid goal data: " + parsed.error.message },
        { status: 400 },
      );
    }

    // Validate all goals belong to the same group
    const groupId = parsed.data[0].podsieGroupId;
    const mixedGroups = parsed.data.some((g) => g.podsieGroupId !== groupId);
    if (mixedGroups) {
      return NextResponse.json(
        { success: false, error: "All goals must belong to the same group" },
        { status: 400 },
      );
    }

    const result = await withDbConnection(async () => {
      const operations = parsed.data.map((goal) => ({
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
      }));

      await StudentGoalModel.bulkWrite(operations);

      // Fetch the updated goals for this group
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
