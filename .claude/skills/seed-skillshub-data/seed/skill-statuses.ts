import { SkillsHubTeacherSkillStatus } from "@lib/skills-hub/core/teacher-skill-status.model";
import type { StaffIds } from "./config";
import type { TeacherSeedConfig } from "./teachers/teacher-seed-config.types";

export async function seedSkillStatuses(
  staff: StaffIds,
  config: Pick<TeacherSeedConfig, "actionPlans" | "l1Prereqs" | "extraProficientSkills">,
): Promise<void> {
  console.log("Creating skill statuses (aligned to action plans)...");

  // Use a Map to dedup — proficient prereqs won't be downgraded by plan statuses
  const statusMap = new Map<string, string>();

  // 1. L1 prereqs → proficient (must come first so they aren't overridden)
  for (const uuid of config.l1Prereqs) {
    statusMap.set(uuid, "proficient");
  }

  // 2. Extra proficient skills
  for (const uuid of config.extraProficientSkills) {
    statusMap.set(uuid, "proficient");
  }

  // 3. Plan-based statuses (per-skill from skillStatuses map)
  //    Only set if not already proficient (don't downgrade prereqs)
  for (const plan of Object.values(config.actionPlans)) {
    for (const [uuid, status] of Object.entries(plan.skillStatuses)) {
      if (statusMap.get(uuid) !== "proficient") {
        statusMap.set(uuid, status);
      }
    }
  }

  const records = Array.from(statusMap.entries()).map(([skillId, status]) => ({
    teacherStaffId: staff.teacherId,
    skillId,
    status,
    updatedBy: staff.coachId,
  }));

  await SkillsHubTeacherSkillStatus.insertMany(records);

  const counts = {
    active: records.filter((r) => r.status === "active").length,
    developing: records.filter((r) => r.status === "developing").length,
    proficient: records.filter((r) => r.status === "proficient").length,
  };
  console.log(
    `  ${records.length} total: ${counts.active} active, ${counts.developing} developing, ${counts.proficient} proficient\n`,
  );
}
