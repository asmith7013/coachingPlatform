import { NextRequest, NextResponse } from "next/server";
import { PodsieScmGroupModel } from "@mongoose-schema/scm/podsie/podsie-scm-group.model";
import { handleServerError } from "@error/handlers/server";
import { withDbConnection } from "@server/db/ensure-connection";
import { validateApiKey } from "@server/auth/api-key";

/**
 * API endpoint for managing YouTube links on Podsie SCM groups
 *
 * Headers:
 *   - Authorization: Bearer <SOLVES_COACHING_API_KEY>
 *
 * GET /api/podsie/scm-groups/youtube
 *   Returns YouTube links for a group or multiple groups
 *   Query params:
 *     - podsieGroupId: single group ID
 *     - podsieGroupIds: comma-separated list of group IDs (for bulk fetch)
 *
 * POST /api/podsie/scm-groups/youtube
 *   Adds a YouTube link to a group
 *   Body: { podsieGroupId, url, title }
 *
 * DELETE /api/podsie/scm-groups/youtube
 *   Removes a YouTube link from a group
 *   Body: { podsieGroupId, url }
 */

export async function GET(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const searchParams = new URL(req.url).searchParams;
    const groupId = searchParams.get("podsieGroupId");
    const groupIds = searchParams.get("podsieGroupIds");

    const result = await withDbConnection(async () => {
      if (groupId) {
        // Single group fetch
        const podsieGroupId = parseInt(groupId, 10);
        if (isNaN(podsieGroupId)) return null;
        const group = await PodsieScmGroupModel.findOne(
          { podsieGroupId },
          { youtubeLinks: 1, podsieGroupId: 1, groupName: 1 }
        ).lean();
        return group;
      }

      if (groupIds) {
        // Bulk fetch for multiple groups
        const ids = groupIds
          .split(",")
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id));
        if (ids.length === 0) return [];
        const groups = await PodsieScmGroupModel.find(
          { podsieGroupId: { $in: ids } },
          { youtubeLinks: 1, podsieGroupId: 1, groupName: 1 }
        ).lean();
        return groups;
      }

      return null;
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in scm-groups/youtube GET:", error);
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
    const { podsieGroupId, url, title } = body;

    if (!podsieGroupId || !url || !title) {
      return NextResponse.json(
        {
          success: false,
          error: "podsieGroupId, url, and title are required",
        },
        { status: 400 }
      );
    }

    const result = await withDbConnection(async () => {
      // Upsert the group and add the YouTube link if it doesn't already exist
      return PodsieScmGroupModel.findOneAndUpdate(
        { podsieGroupId },
        {
          $setOnInsert: { podsieGroupId },
          $addToSet: { youtubeLinks: { url, title } },
        },
        { upsert: true, new: true }
      ).lean();
    });

    return NextResponse.json({
      success: true,
      data: result?.youtubeLinks ?? [],
    });
  } catch (error) {
    console.error("Error in scm-groups/youtube POST:", error);
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
    const body = await req.json();
    const { podsieGroupId, url } = body;

    if (!podsieGroupId || !url) {
      return NextResponse.json(
        { success: false, error: "podsieGroupId and url are required" },
        { status: 400 }
      );
    }

    const result = await withDbConnection(async () => {
      return PodsieScmGroupModel.findOneAndUpdate(
        { podsieGroupId },
        { $pull: { youtubeLinks: { url } } },
        { new: true }
      ).lean();
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.youtubeLinks ?? [],
    });
  } catch (error) {
    console.error("Error in scm-groups/youtube DELETE:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 }
    );
  }
}
