import { NextRequest, NextResponse } from "next/server";
import { PodsieAssignmentModel } from "@mongoose-schema/scm/podsie";
import { handleServerError } from "@error/handlers/server";
import { withDbConnection } from "@server/db/ensure-connection";
import { validateApiKey } from "@server/auth/api-key";

/**
 * API endpoint for bulk syncing Podsie assignment metadata
 *
 * Headers:
 *   - Authorization: Bearer <SOLVES_COACHING_API_KEY>
 *
 * POST /api/podsie/assignments/sync
 *   Bulk upserts assignment metadata from Podsie
 *   Body: { assignments: [{ podsieAssignmentId, title, podsieModuleId?, moduleOrder?, state? }] }
 *   Returns: { success: true, upsertedCount: number, insertedCount: number, modifiedCount: number }
 */

interface AssignmentInput {
  podsieAssignmentId: number;
  title: string;
  podsieModuleId?: number | null;
  moduleOrder?: number | null;
  state?: string | null;
}

export async function POST(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { assignments } = body as { assignments: AssignmentInput[] };

    if (!Array.isArray(assignments)) {
      return NextResponse.json(
        { success: false, error: "assignments must be an array" },
        { status: 400 }
      );
    }

    if (assignments.length === 0) {
      return NextResponse.json({
        success: true,
        upsertedCount: 0,
        insertedCount: 0,
        modifiedCount: 0,
      });
    }

    // Validate required fields
    for (const assignment of assignments) {
      if (typeof assignment.podsieAssignmentId !== 'number') {
        return NextResponse.json(
          { success: false, error: "Each assignment must have a numeric podsieAssignmentId" },
          { status: 400 }
        );
      }
      if (typeof assignment.title !== 'string' || !assignment.title.trim()) {
        return NextResponse.json(
          { success: false, error: `Assignment ${assignment.podsieAssignmentId} must have a non-empty title` },
          { status: 400 }
        );
      }
    }

    const result = await withDbConnection(async () => {
      // Use bulkWrite for efficient upserts
      const operations = assignments.map((assignment) => ({
        updateOne: {
          filter: { podsieAssignmentId: assignment.podsieAssignmentId },
          update: {
            $set: {
              podsieAssignmentId: assignment.podsieAssignmentId,
              title: assignment.title,
              podsieModuleId: assignment.podsieModuleId ?? null,
              moduleOrder: assignment.moduleOrder ?? null,
              state: assignment.state ?? null,
            },
          },
          upsert: true,
        },
      }));

      const bulkResult = await PodsieAssignmentModel.bulkWrite(operations);

      return {
        upsertedCount: bulkResult.upsertedCount,
        insertedCount: bulkResult.insertedCount,
        modifiedCount: bulkResult.modifiedCount,
      };
    });

    console.log(`Synced ${assignments.length} assignments: ${result.insertedCount} inserted, ${result.modifiedCount} modified`);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error in assignments sync POST:", error);
    return NextResponse.json(
      { success: false, error: handleServerError(error) },
      { status: 500 }
    );
  }
}
