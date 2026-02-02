import { NextRequest, NextResponse } from "next/server";
import { PodsieScmModuleModel } from "@mongoose-schema/scm/podsie";
import { handleServerError } from "@error/handlers/server";
import { withDbConnection } from "@server/db/ensure-connection";
import { validateApiKey } from "@server/auth/api-key";

/**
 * API endpoint for bulk syncing Podsie assignment metadata into podsie-scm-modules
 *
 * Headers:
 *   - Authorization: Bearer <SOLVES_COACHING_API_KEY>
 *
 * POST /api/podsie/assignments/sync
 *   Upserts assignment metadata from Podsie into PodsieScmModule docs.
 *   Groups assignments by (podsieGroupId, podsieModuleId) and updates the
 *   assignments[] array on matching module docs.
 *
 *   Body: { assignments: [{ podsieAssignmentId, title, podsieGroupId, podsieModuleId?, moduleOrder?, state? }] }
 *   Returns: { success: true, modulesUpdated: number, assignmentsProcessed: number }
 */

interface AssignmentInput {
  podsieAssignmentId: number;
  title: string;
  podsieGroupId: number;
  podsieModuleId?: number | null;
  moduleName?: string | null;
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
        modulesUpdated: 0,
        assignmentsProcessed: 0,
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
      if (typeof assignment.podsieGroupId !== 'number') {
        return NextResponse.json(
          { success: false, error: `Assignment ${assignment.podsieAssignmentId} must have a numeric podsieGroupId` },
          { status: 400 }
        );
      }
    }

    const result = await withDbConnection(async () => {
      // Group assignments by (podsieGroupId, podsieModuleId)
      const moduleMap = new Map<string, {
        podsieGroupId: number;
        podsieModuleId: number;
        assignments: AssignmentInput[];
      }>();

      for (const a of assignments) {
        const moduleId = a.podsieModuleId ?? 0; // 0 for unassigned module
        const key = `${a.podsieGroupId}:${moduleId}`;
        if (!moduleMap.has(key)) {
          moduleMap.set(key, {
            podsieGroupId: a.podsieGroupId,
            podsieModuleId: moduleId,
            assignments: [],
          });
        }
        moduleMap.get(key)!.assignments.push(a);
      }

      let modulesUpdated = 0;

      for (const { podsieGroupId, podsieModuleId, assignments: moduleAssignments } of moduleMap.values()) {
        // Extract moduleName from the first assignment that has one
        const moduleName = moduleAssignments.find(a => a.moduleName)?.moduleName ?? null;

        // Find existing module doc
        const existingDoc = await PodsieScmModuleModel.findOne({
          podsieGroupId,
          podsieModuleId,
        });

        if (existingDoc) {
          // Update moduleName if available
          if (moduleName) {
            (existingDoc as unknown as Record<string, unknown>).moduleName = moduleName;
          }

          // Update existing assignments and add new ones
          const existingAssignments = Array.from(
            (existingDoc as unknown as { assignments: Array<Record<string, unknown>> }).assignments || []
          );

          const existingById = new Map(
            existingAssignments.map((a, i) => [a.podsieAssignmentId as number, i])
          );

          for (const incoming of moduleAssignments) {
            const idx = existingById.get(incoming.podsieAssignmentId);
            if (idx !== undefined) {
              // Update title and state on existing entry
              existingAssignments[idx].assignmentTitle = incoming.title;
              existingAssignments[idx].state = incoming.state ?? undefined;
              if (incoming.moduleOrder != null) {
                existingAssignments[idx].orderIndex = incoming.moduleOrder;
              }
            } else {
              // Add new assignment entry
              existingAssignments.push({
                podsieAssignmentId: incoming.podsieAssignmentId,
                assignmentTitle: incoming.title,
                state: incoming.state ?? undefined,
                orderIndex: incoming.moduleOrder ?? undefined,
              });
            }
          }

          (existingDoc as unknown as { assignments: Array<Record<string, unknown>> }).assignments = existingAssignments;
          await existingDoc.save();
        } else {
          // Create new module doc with these assignments
          await PodsieScmModuleModel.create({
            podsieGroupId,
            podsieModuleId,
            moduleName: moduleName ?? undefined,
            assignments: moduleAssignments.map(a => ({
              podsieAssignmentId: a.podsieAssignmentId,
              assignmentTitle: a.title,
              state: a.state ?? undefined,
              orderIndex: a.moduleOrder ?? undefined,
            })),
          });
        }

        modulesUpdated++;
      }

      return { modulesUpdated, assignmentsProcessed: assignments.length };
    });

    console.log(`Synced ${result.assignmentsProcessed} assignments across ${result.modulesUpdated} modules`);

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
