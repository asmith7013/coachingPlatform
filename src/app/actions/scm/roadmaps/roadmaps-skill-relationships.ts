"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { RoadmapsSkillModel } from "@mongoose-schema/scm/roadmaps/roadmap-skill.model";
import { RoadmapUnitModel } from "@mongoose-schema/scm/roadmaps/roadmap-unit.model";

interface SkillReference {
  skillNumber: string;
  title: string;
  units?: Array<{
    grade: string;
    unitTitle: string;
    unitNumber: number;
  }>;
}

interface UnitReference {
  grade: string;
  unitTitle: string;
  unitNumber: number;
  role: 'target' | 'support';
}

interface SkillRelationships {
  // Where this skill appears as essential for other skills
  essentialFor: SkillReference[];
  // Where this skill appears as helpful for other skills
  helpfulFor: SkillReference[];
  // Units where this skill appears
  units: UnitReference[];
}

/**
 * Fetch all relationships for a skill
 * - Skills that require this skill as essential
 * - Skills that list this skill as helpful
 * - Units where this skill appears (as target or support)
 */
export async function fetchSkillRelationships(skillNumber: string) {
  return withDbConnection(async () => {
    try {
      const results: SkillRelationships = {
        essentialFor: [],
        helpfulFor: [],
        units: []
      };

      // Find skills that have this as an essential skill
      const essentialSkills = await RoadmapsSkillModel.find(
        { "essentialSkills.skillNumber": skillNumber },
        { skillNumber: 1, title: 1, units: 1 }
      ).lean();

      results.essentialFor = essentialSkills.map(skill => ({
        skillNumber: skill.skillNumber,
        title: skill.title,
        units: skill.units
      }));

      // Find skills that have this as a helpful skill
      const helpfulSkills = await RoadmapsSkillModel.find(
        { "helpfulSkills.skillNumber": skillNumber },
        { skillNumber: 1, title: 1, units: 1 }
      ).lean();

      results.helpfulFor = helpfulSkills.map(skill => ({
        skillNumber: skill.skillNumber,
        title: skill.title,
        units: skill.units
      }));

      // Find units where this skill appears
      const units = await RoadmapUnitModel.find(
        {
          $or: [
            { targetSkills: skillNumber },
            { additionalSupportSkills: skillNumber }
          ]
        },
        {
          grade: 1,
          unitTitle: 1,
          unitNumber: 1,
          targetSkills: 1,
          additionalSupportSkills: 1
        }
      ).lean();

      results.units = units.map(unit => ({
        grade: unit.grade,
        unitTitle: unit.unitTitle,
        unitNumber: unit.unitNumber ?? 0,
        role: unit.targetSkills?.includes(skillNumber) ? 'target' as const : 'support' as const
      }));

      return {
        success: true,
        data: results
      };
    } catch (error) {
      console.error('💥 Error fetching skill relationships:', error);
      return {
        success: false,
        error: handleServerError(error, 'fetchSkillRelationships')
      };
    }
  });
}
