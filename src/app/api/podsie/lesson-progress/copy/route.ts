import { NextRequest, NextResponse } from "next/server";
import { AssignmentPacingModel } from "@mongoose-schema/scm/podsie/assignment-pacing.model";
import { handleServerError } from "@error/handlers/server";
import { withDbConnection } from "@server/db/ensure-connection";
import { validateApiKey } from "@server/auth/api-key";

/**
 * API endpoint to copy pacing configuration to other groups
 *
 * Headers:
 *   - Authorization: Bearer <SOLVES_COACHING_API_KEY>
 *
 * POST /api/podsie/lesson-progress/copy
 *   Body: {
 *     sourceGroupId: number,
 *     sourceModuleId: number,
 *     targetGroupIds: number[]
 *   }
 *
 *   Copies the pacing config from source group/module to all target groups.
 *   Creates new configs or overwrites existing ones.
 */

export async function POST(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { sourceGroupId, sourceModuleId, targetGroupIds } = body;

    if (!sourceGroupId || !sourceModuleId) {
      return NextResponse.json(
        { success: false, error: "sourceGroupId and sourceModuleId are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(targetGroupIds) || targetGroupIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "targetGroupIds must be a non-empty array" },
        { status: 400 }
      );
    }

    // Validate all IDs are numbers
    if (
      typeof sourceGroupId !== "number" ||
      typeof sourceModuleId !== "number" ||
      !targetGroupIds.every((id) => typeof id === "number")
    ) {
      return NextResponse.json(
        { success: false, error: "All IDs must be valid numbers" },
        { status: 400 }
      );
    }

    const result = await withDbConnection(async () => {
      // Get source pacing config
      const sourceConfig = await AssignmentPacingModel.findOne({
        podsieGroupId: sourceGroupId,
        podsieModuleId: sourceModuleId,
      }).lean();

      if (!sourceConfig) {
        return { found: false, copiedCount: 0 };
      }

      // Copy to each target group
      let copiedCount = 0;
      for (const targetGroupId of targetGroupIds) {
        // Skip if trying to copy to self
        if (targetGroupId === sourceGroupId) continue;

        await AssignmentPacingModel.findOneAndUpdate(
          {
            podsieGroupId: targetGroupId,
            podsieModuleId: sourceModuleId,
          },
          {
            podsieGroupId: targetGroupId,
            podsieModuleId: sourceModuleId,
            assignments: sourceConfig.assignments,
          },
          { upsert: true, new: true }
        );
        copiedCount++;
      }

      return { found: true, copiedCount };
    });

    if (!result.found) {
      return NextResponse.json(
        { success: false, error: "Source pacing config not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      copiedCount: result.copiedCount,
    });
  } catch (error) {
    console.error("Error in lesson-progress/copy POST:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 }
    );
  }
}
