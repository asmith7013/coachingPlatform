import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@server/auth/api-key";
import { handleServerError } from "@error/handlers/server";
import {
  fetchActivityTypes,
  createActivityType,
  updateActivityType,
  deleteActivityType,
} from "@/app/scm/incentives/form/actions";

/**
 * API endpoint for managing incentive activity type configurations.
 *
 * Headers:
 *   - Authorization: Bearer <SOLVES_COACHING_API_KEY>
 *
 * GET  /api/podsie/incentives/activity-types - Returns all activity types
 * POST /api/podsie/incentives/activity-types - Create a new activity type
 * PUT  /api/podsie/incentives/activity-types - Update an activity type
 * DELETE /api/podsie/incentives/activity-types - Delete an activity type
 */

export async function GET(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const result = await fetchActivityTypes();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in incentives activity-types GET:", error);
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
    const result = await createActivityType(body);
    return NextResponse.json(result, {
      status: result.success ? 201 : 400,
    });
  } catch (error) {
    console.error("Error in incentives activity-types POST:", error);
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "id is required" },
        { status: 400 },
      );
    }

    const result = await updateActivityType(id, updates);
    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("Error in incentives activity-types PUT:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "id is required" },
        { status: 400 },
      );
    }

    const result = await deleteActivityType(id);
    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("Error in incentives activity-types DELETE:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 },
    );
  }
}
