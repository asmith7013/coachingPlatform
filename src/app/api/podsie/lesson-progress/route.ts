import { NextRequest, NextResponse } from "next/server";
import { LessonProgressModel } from "@mongoose-schema/scm/podsie/lesson-progress.model";
import { handleServerError } from "@error/handlers/server";
import { withDbConnection } from "@server/db/ensure-connection";
import { validateApiKey } from "@server/auth/api-key";

/**
 * API endpoint for managing assignment pacing configuration
 *
 * Headers:
 *   - Authorization: Bearer <SOLVES_COACHING_API_KEY>
 *
 * GET /api/podsie/lesson-progress?groupId=123&moduleId=456
 *   Returns pacing config for a specific group + module
 *
 * GET /api/podsie/lesson-progress?groupId=123
 *   Returns all pacing configs for a group (across all modules)
 *
 * POST /api/podsie/lesson-progress
 *   Creates or updates pacing config
 *   Body: { podsieGroupId, podsieModuleId, assignments: [...] }
 *
 * DELETE /api/podsie/lesson-progress?groupId=123&moduleId=456
 *   Deletes pacing config for a specific group + module
 */

export async function GET(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const searchParams = new URL(req.url).searchParams;
    const groupId = searchParams.get("groupId");
    const moduleId = searchParams.get("moduleId");

    if (!groupId) {
      return NextResponse.json(
        { success: false, error: "groupId parameter is required" },
        { status: 400 }
      );
    }

    const podsieGroupId = parseInt(groupId, 10);
    if (isNaN(podsieGroupId)) {
      return NextResponse.json(
        { success: false, error: "groupId must be a valid integer" },
        { status: 400 }
      );
    }

    // If moduleId is provided, return single config; otherwise return all for group
    if (moduleId) {
      const podsieModuleId = parseInt(moduleId, 10);
      if (isNaN(podsieModuleId)) {
        return NextResponse.json(
          { success: false, error: "moduleId must be a valid integer" },
          { status: 400 }
        );
      }

      const result = await withDbConnection(async () => {
        const pacingConfig = await LessonProgressModel.findOne({
          podsieGroupId,
          podsieModuleId,
        }).lean();

        return pacingConfig;
      });

      if (!result) {
        return NextResponse.json(
          { success: false, error: "No pacing config found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // No moduleId - return all pacing configs for this group
    const results = await withDbConnection(async () => {
      const pacingConfigs = await LessonProgressModel.find({
        podsieGroupId,
      }).lean();

      return pacingConfigs;
    });

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error in lesson-progress GET:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { podsieGroupId, podsieModuleId, moduleStartDate, pointsRewardGoal, pointsRewardDescription, assignments } = body;

    if (!podsieGroupId || !podsieModuleId) {
      return NextResponse.json(
        { success: false, error: "podsieGroupId and podsieModuleId are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(assignments)) {
      return NextResponse.json(
        { success: false, error: "assignments must be an array" },
        { status: 400 }
      );
    }

    const result = await withDbConnection(async () => {
      const existingConfig = await LessonProgressModel.findOne({
        podsieGroupId,
        podsieModuleId,
      });

      if (existingConfig) {
        // Update existing - use set() for proper Mongoose subdocument handling
        if (moduleStartDate !== undefined) {
          existingConfig.set('moduleStartDate', moduleStartDate);
        }
        if (pointsRewardGoal !== undefined) {
          existingConfig.set('pointsRewardGoal', pointsRewardGoal);
        }
        if (pointsRewardDescription !== undefined) {
          existingConfig.set('pointsRewardDescription', pointsRewardDescription);
        }
        existingConfig.set('assignments', assignments);
        await existingConfig.save();
        return { doc: existingConfig.toJSON(), created: false };
      } else {
        // Create new
        const newConfig = new LessonProgressModel({
          podsieGroupId,
          podsieModuleId,
          moduleStartDate,
          pointsRewardGoal,
          pointsRewardDescription,
          assignments,
        });
        await newConfig.save();
        return { doc: newConfig.toJSON(), created: true };
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: result.doc,
        created: result.created,
      },
      { status: result.created ? 201 : 200 }
    );
  } catch (error) {
    console.error("Error in lesson-progress POST:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const searchParams = new URL(req.url).searchParams;
    const groupId = searchParams.get("groupId");
    const moduleId = searchParams.get("moduleId");

    if (!groupId || !moduleId) {
      return NextResponse.json(
        { success: false, error: "groupId and moduleId parameters are required" },
        { status: 400 }
      );
    }

    const podsieGroupId = parseInt(groupId, 10);
    const podsieModuleId = parseInt(moduleId, 10);

    if (isNaN(podsieGroupId) || isNaN(podsieModuleId)) {
      return NextResponse.json(
        { success: false, error: "groupId and moduleId must be valid integers" },
        { status: 400 }
      );
    }

    await withDbConnection(async () => {
      await LessonProgressModel.deleteOne({
        podsieGroupId,
        podsieModuleId,
      });
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in lesson-progress DELETE:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 }
    );
  }
}
