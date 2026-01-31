import { NextRequest, NextResponse } from "next/server";
import { PodsieScmGroupModel } from "@mongoose-schema/scm/podsie/podsie-scm-group.model";
import { PodsieScmModuleModel } from "@mongoose-schema/scm/podsie/podsie-scm-module.model";
import { withDbConnection } from "@server/db/ensure-connection";
import { getAuthenticatedUser } from "@server/auth/getAuthenticatedUser";

/**
 * GET /api/scm/podsie-assignments?gradeLevel=8&unitNumber=3
 *
 * Returns deduplicated assignment list for a given grade + unit.
 * Flow: gradeLevel → find matching PodsieScmGroup docs → get podsieGroupIds
 *       → query PodsieScmModule where groupId in those + unitNumber matches
 *       → collect assignments from all matching modules
 */
export async function GET(req: NextRequest) {
  const authResult = await getAuthenticatedUser();
  if (!authResult.success) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const searchParams = new URL(req.url).searchParams;
  const gradeLevel = searchParams.get("gradeLevel");
  const unitNumber = searchParams.get("unitNumber");

  if (!gradeLevel || !unitNumber) {
    return NextResponse.json(
      { success: false, error: "gradeLevel and unitNumber are required" },
      { status: 400 },
    );
  }

  const unitNum = parseInt(unitNumber, 10);
  if (isNaN(unitNum)) {
    return NextResponse.json(
      { success: false, error: "unitNumber must be a number" },
      { status: 400 },
    );
  }

  try {
    const data = await withDbConnection(async () => {
      // Find groups matching the grade level
      const groups = await PodsieScmGroupModel.find({ gradeLevel })
        .select("podsieGroupId")
        .lean();

      if (groups.length === 0) return [];

      const groupIds = groups.map((g) => g.podsieGroupId);

      // Find module configs for those groups + unit number
      const modules = await PodsieScmModuleModel.find({
        podsieGroupId: { $in: groupIds },
        unitNumber: unitNum,
      })
        .select("assignments")
        .lean();

      // Deduplicate assignments by podsieAssignmentId
      const seen = new Map<
        number,
        { podsieAssignmentId: number; assignmentTitle: string }
      >();
      for (const mod of modules) {
        const assignments = (mod.assignments ?? []) as unknown as Array<{
          podsieAssignmentId?: number;
          assignmentTitle?: string;
        }>;
        for (const a of assignments) {
          if (a.podsieAssignmentId && !seen.has(a.podsieAssignmentId)) {
            seen.set(a.podsieAssignmentId, {
              podsieAssignmentId: a.podsieAssignmentId,
              assignmentTitle:
                a.assignmentTitle || `Assignment ${a.podsieAssignmentId}`,
            });
          }
        }
      }

      return Array.from(seen.values()).sort(
        (a, b) => a.podsieAssignmentId - b.podsieAssignmentId,
      );
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in podsie-assignments GET:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
