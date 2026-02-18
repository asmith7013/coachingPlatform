import type { TeacherSkill } from "../_types/taxonomy.types";
import type { TeacherSkillStatusDocument } from "../_types/skill-status.types";

/**
 * Determines whether a skill should be locked in the UI.
 *
 * - Level 1 skills are never locked.
 * - Level 2 skills with no paired L1 (`pairedSkillId === null`) are always unlocked.
 * - Level 2 skills with a paired L1 are locked until that L1 reaches "proficient".
 */
export function isSkillLocked(
  skill: TeacherSkill,
  statusMap: Map<string, TeacherSkillStatusDocument>,
  allSkills: TeacherSkill[],
): boolean {
  if (skill.level === 1) return false;
  if (!skill.pairedSkillId) return false;

  const paired = allSkills.find((s) => s.id === skill.pairedSkillId);
  if (!paired) return false;

  return statusMap.get(paired.uuid)?.status !== "proficient";
}
