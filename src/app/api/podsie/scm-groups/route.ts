import { NextRequest, NextResponse } from "next/server";
import { PodsieScmGroupModel } from "@mongoose-schema/scm/podsie/podsie-scm-group.model";
import { handleServerError } from "@error/handlers/server";
import { withDbConnection } from "@server/db/ensure-connection";
import { validateApiKey } from "@server/auth/api-key";

/**
 * API endpoint for managing Podsie SCM group metadata
 *
 * Headers:
 *   - Authorization: Bearer <SOLVES_COACHING_API_KEY>
 *
 * GET /api/podsie/scm-groups
 *   Returns all groups, or filtered by ?podsieGroupId=X
 *
 * POST /api/podsie/scm-groups
 *   Upserts a group record by podsieGroupId
 *   Body: { podsieGroupId, groupName, gradeLevel?, school? }
 *
 * PUT /api/podsie/scm-groups
 *   Updates group metadata
 *   Body: { podsieGroupId, gradeLevel?, school?, groupName? }
 */

export async function GET(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const searchParams = new URL(req.url).searchParams;
    const groupId = searchParams.get("podsieGroupId");

    const result = await withDbConnection(async () => {
      if (groupId) {
        const podsieGroupId = parseInt(groupId, 10);
        if (isNaN(podsieGroupId)) return null;
        return PodsieScmGroupModel.findOne({ podsieGroupId }).lean();
      }
      return PodsieScmGroupModel.find({}).sort({ podsieGroupId: 1 }).lean();
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in scm-groups GET:", error);
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
    const { podsieGroupId, groupName, gradeLevel, school } = body;

    if (!podsieGroupId) {
      return NextResponse.json(
        { success: false, error: "podsieGroupId is required" },
        { status: 400 },
      );
    }

    const result = await withDbConnection(async () => {
      return PodsieScmGroupModel.findOneAndUpdate(
        { podsieGroupId },
        {
          podsieGroupId,
          ...(groupName !== undefined && { groupName }),
          ...(gradeLevel !== undefined && { gradeLevel }),
          ...(school !== undefined && { school }),
        },
        { upsert: true, new: true },
      ).lean();
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in scm-groups POST:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { podsieGroupId, gradeLevel, school, groupName } = body;

    if (!podsieGroupId) {
      return NextResponse.json(
        { success: false, error: "podsieGroupId is required" },
        { status: 400 },
      );
    }

    const result = await withDbConnection(async () => {
      return PodsieScmGroupModel.findOneAndUpdate(
        { podsieGroupId },
        {
          ...(groupName !== undefined && { groupName }),
          ...(gradeLevel !== undefined && { gradeLevel }),
          ...(school !== undefined && { school }),
        },
        { new: true },
      ).lean();
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Group not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in scm-groups PUT:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 },
    );
  }
}
