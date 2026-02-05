import { NextRequest, NextResponse } from "next/server";
import { PodsieScmGroupModel } from "@mongoose-schema/scm/podsie/podsie-scm-group.model";
import { PodsieScmModuleModel } from "@mongoose-schema/scm/podsie/podsie-scm-module.model";
import { withDbConnection } from "@server/db/ensure-connection";
import { getAuthenticatedUser } from "@server/auth/getAuthenticatedUser";

/**
 * GET /api/scm/podsie-modules?gradeLevel=8
 *
 * Returns deduplicated list of modules (unitNumber + moduleName) for a given grade.
 * Flow: gradeLevel → find matching PodsieScmGroup docs → get podsieGroupIds
 *       → query PodsieScmModule where groupId in those
 *       → deduplicate by unitNumber and return sorted list
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

  if (!gradeLevel) {
    return NextResponse.json(
      { success: false, error: "gradeLevel is required" },
      { status: 400 },
    );
  }

  try {
    const data = await withDbConnection(async () => {
      // Handle both formats: "8" and "Grade 8"
      const gradeVariants = [
        gradeLevel,
        `Grade ${gradeLevel}`,
        gradeLevel.replace(/^Grade\s+/i, ""), // "Grade 8" -> "8"
      ];

      // Find groups matching any variant of the grade level
      const groups = await PodsieScmGroupModel.find({
        gradeLevel: { $in: gradeVariants },
      })
        .select("podsieGroupId")
        .lean();

      if (groups.length === 0) return [];

      const groupIds = groups.map((g) => g.podsieGroupId);

      // Find all modules for those groups
      const modules = await PodsieScmModuleModel.find({
        podsieGroupId: { $in: groupIds },
        unitNumber: { $exists: true, $ne: null },
      })
        .select("unitNumber moduleName")
        .lean();

      // Deduplicate by unitNumber, preferring entries with moduleName
      const seen = new Map<
        number,
        { unitNumber: number; moduleName: string | null }
      >();

      for (const mod of modules) {
        const unit = mod.unitNumber as unknown as number;
        const name = (mod.moduleName as unknown as string | null) ?? null;

        if (!seen.has(unit)) {
          seen.set(unit, { unitNumber: unit, moduleName: name });
        } else if (name && !seen.get(unit)!.moduleName) {
          // Prefer entry with a moduleName
          seen.set(unit, { unitNumber: unit, moduleName: name });
        }
      }

      return Array.from(seen.values()).sort(
        (a, b) => a.unitNumber - b.unitNumber,
      );
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in podsie-modules GET:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
