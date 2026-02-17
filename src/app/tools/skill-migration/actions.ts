"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { RoadmapsSkillModel } from "@mongoose-schema/scm/roadmaps/roadmap-skill.model";
import { RoadmapUnitModel } from "@mongoose-schema/scm/roadmaps/roadmap-unit.model";

/**
 * Test migration on a single skill (for debugging)
 */
export async function testSingleSkillMigration(skillNumber: string) {
  console.log(`🧪 Testing migration for skill ${skillNumber}...`);

  return withDbConnection(async () => {
    try {
      // Get the skill
      const skill = (await RoadmapsSkillModel.findOne({
        skillNumber,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }).lean()) as any;

      if (!skill) {
        return {
          success: false,
          error: { message: `Skill ${skillNumber} not found` },
        };
      }

      console.log(`Found skill: ${skill.title}`);
      console.log(`Current appearsIn:`, skill.appearsIn || "undefined");

      // Initialize appearsIn object
      const appearsIn = {
        asTarget: [] as Array<{
          grade: string;
          unitTitle: string;
          unitNumber: number;
        }>,
        asEssential: [] as Array<{
          skillNumber: string;
          title: string;
          units: Array<{
            grade: string;
            unitTitle: string;
            unitNumber: number;
          }>;
        }>,
        asHelpful: [] as Array<{
          skillNumber: string;
          title: string;
          units: Array<{
            grade: string;
            unitTitle: string;
            unitNumber: number;
          }>;
        }>,
        asSupport: [] as Array<{
          grade: string;
          unitTitle: string;
          unitNumber: number;
        }>,
      };

      // Find units
      const units = await RoadmapUnitModel.find({
        $or: [
          { targetSkills: skillNumber },
          { additionalSupportSkills: skillNumber },
        ],
      }).lean();

      console.log(`Found ${units.length} units`);

      for (const unit of units) {
        const unitRef = {
          grade: unit.grade,
          unitTitle: unit.unitTitle,
          unitNumber: unit.unitNumber ?? 0,
        };

        if (unit.targetSkills?.includes(skillNumber)) {
          appearsIn.asTarget.push(unitRef);
          console.log(`  - As Target in: ${unit.grade} - ${unit.unitTitle}`);
        } else if (unit.additionalSupportSkills?.includes(skillNumber)) {
          appearsIn.asSupport.push(unitRef);
          console.log(`  - As Support in: ${unit.grade} - ${unit.unitTitle}`);
        }
      }

      // Find essential
      const essentialSkills = await RoadmapsSkillModel.find(
        {
          "essentialSkills.skillNumber": skillNumber,
        },
        { skillNumber: 1, title: 1, units: 1 },
      ).lean();

      console.log(
        `Found ${essentialSkills.length} skills that need this as essential`,
      );
      appearsIn.asEssential = essentialSkills.map((s) => ({
        skillNumber: s.skillNumber,
        title: s.title,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        units: (s.units || []).map((u: any) => ({
          grade: u.grade,
          unitTitle: u.unitTitle,
          unitNumber: u.unitNumber,
        })),
      }));

      // Find helpful
      const helpfulSkills = await RoadmapsSkillModel.find(
        {
          "helpfulSkills.skillNumber": skillNumber,
        },
        { skillNumber: 1, title: 1, units: 1 },
      ).lean();

      console.log(
        `Found ${helpfulSkills.length} skills that use this as helpful`,
      );
      appearsIn.asHelpful = helpfulSkills.map((s) => ({
        skillNumber: s.skillNumber,
        title: s.title,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        units: (s.units || []).map((u: any) => ({
          grade: u.grade,
          unitTitle: u.unitTitle,
          unitNumber: u.unitNumber,
        })),
      }));

      console.log("Computed appearsIn:", JSON.stringify(appearsIn, null, 2));

      // Update
      console.log("Attempting update...");
      const updateResult = await RoadmapsSkillModel.updateOne(
        { skillNumber },
        { $set: { appearsIn } },
      );

      console.log("Update result:", updateResult);

      return {
        success: true,
        data: {
          skillNumber,
          title: skill.title,
          updateResult: {
            acknowledged: updateResult.acknowledged,
            matchedCount: updateResult.matchedCount,
            modifiedCount: updateResult.modifiedCount,
            upsertedCount: updateResult.upsertedCount,
          },
          appearsIn,
        },
      };
    } catch (error) {
      console.error("💥 Test failed:", error);
      return {
        success: false,
        error: handleServerError(error, "testSingleSkillMigration"),
      };
    }
  });
}

interface MigrationResult {
  skillNumber: string;
  title: string;
  success: boolean;
  error?: string;
  appearsIn?: {
    asTarget: number;
    asEssential: number;
    asHelpful: number;
    asSupport: number;
  };
}

/**
 * Run the skill appearsIn migration for all skills
 */
export async function runSkillAppearsInMigration() {
  console.log("🚀 Starting skill appearsIn migration...");

  return withDbConnection(async () => {
    try {
      // Get all skills
      console.log("📊 Fetching all skills...");
      const allSkills = await RoadmapsSkillModel.find({}).lean();
      console.log(`Found ${allSkills.length} skills to process`);

      const results: MigrationResult[] = [];

      let processed = 0;
      let updated = 0;
      let failed = 0;

      for (const skill of allSkills) {
        processed++;

        // Log progress every 10 skills
        if (processed % 10 === 0) {
          console.log(
            `📝 Progress: ${processed}/${allSkills.length} (${Math.round((processed / allSkills.length) * 100)}%)`,
          );
        }

        try {
          // Initialize appearsIn object
          const appearsIn = {
            asTarget: [] as Array<{
              grade: string;
              unitTitle: string;
              unitNumber: number;
            }>,
            asEssential: [] as Array<{
              skillNumber: string;
              title: string;
              units: Array<{
                grade: string;
                unitTitle: string;
                unitNumber: number;
              }>;
            }>,
            asHelpful: [] as Array<{
              skillNumber: string;
              title: string;
              units: Array<{
                grade: string;
                unitTitle: string;
                unitNumber: number;
              }>;
            }>,
            asSupport: [] as Array<{
              grade: string;
              unitTitle: string;
              unitNumber: number;
            }>,
          };

          // 1. Find units where this skill appears as target or support
          const units = await RoadmapUnitModel.find(
            {
              $or: [
                { targetSkills: skill.skillNumber },
                { additionalSupportSkills: skill.skillNumber },
              ],
            },
            {
              grade: 1,
              unitTitle: 1,
              unitNumber: 1,
              targetSkills: 1,
              additionalSupportSkills: 1,
            },
          ).lean();

          // Categorize units
          for (const unit of units) {
            const unitRef = {
              grade: unit.grade,
              unitTitle: unit.unitTitle,
              unitNumber: unit.unitNumber ?? 0,
            };

            if (unit.targetSkills?.includes(skill.skillNumber)) {
              appearsIn.asTarget.push(unitRef);
            } else if (
              unit.additionalSupportSkills?.includes(skill.skillNumber)
            ) {
              appearsIn.asSupport.push(unitRef);
            }
          }

          // 2. Find skills that have this as an essential skill
          const essentialSkills = await RoadmapsSkillModel.find(
            {
              "essentialSkills.skillNumber": skill.skillNumber,
            },
            {
              skillNumber: 1,
              title: 1,
              units: 1,
            },
          ).lean();

          appearsIn.asEssential = essentialSkills.map((s) => ({
            skillNumber: s.skillNumber,
            title: s.title,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            units: (s.units || []).map((u: any) => ({
              grade: u.grade,
              unitTitle: u.unitTitle,
              unitNumber: u.unitNumber,
            })),
          }));

          // 3. Find skills that have this as a helpful skill
          const helpfulSkills = await RoadmapsSkillModel.find(
            {
              "helpfulSkills.skillNumber": skill.skillNumber,
            },
            {
              skillNumber: 1,
              title: 1,
              units: 1,
            },
          ).lean();

          appearsIn.asHelpful = helpfulSkills.map((s) => ({
            skillNumber: s.skillNumber,
            title: s.title,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            units: (s.units || []).map((u: any) => ({
              grade: u.grade,
              unitTitle: u.unitTitle,
              unitNumber: u.unitNumber,
            })),
          }));

          // Update the skill with computed data
          const updateResult = await RoadmapsSkillModel.updateOne(
            { skillNumber: skill.skillNumber },
            { $set: { appearsIn } },
          );

          if (!updateResult.acknowledged) {
            throw new Error("Update was not acknowledged by database");
          }

          if (updateResult.matchedCount === 0) {
            throw new Error("Skill not found in database");
          }

          if (updateResult.modifiedCount === 0) {
            console.warn(
              `⚠️  Skill ${skill.skillNumber} was not modified (may already have appearsIn)`,
            );
          }

          updated++;

          results.push({
            skillNumber: skill.skillNumber,
            title: skill.title,
            success: true,
            appearsIn: {
              asTarget: appearsIn.asTarget.length,
              asEssential: appearsIn.asEssential.length,
              asHelpful: appearsIn.asHelpful.length,
              asSupport: appearsIn.asSupport.length,
            },
          });
        } catch (error) {
          failed++;
          const errorMsg =
            error instanceof Error ? error.message : "Unknown error";
          console.error(
            `❌ Failed to process skill ${skill.skillNumber}:`,
            errorMsg,
          );
          results.push({
            skillNumber: skill.skillNumber,
            title: skill.title,
            success: false,
            error: errorMsg,
          });
        }
      }

      console.log("\n✅ Migration complete!");
      console.log(`   Total: ${allSkills.length}`);
      console.log(`   Updated: ${updated}`);
      console.log(`   Failed: ${failed}`);

      return {
        success: true,
        data: {
          total: allSkills.length,
          processed,
          updated,
          failed,
          results,
        },
      };
    } catch (error) {
      console.error("💥 Migration failed:", error);
      return {
        success: false,
        error: handleServerError(error, "runSkillAppearsInMigration"),
      };
    }
  });
}
