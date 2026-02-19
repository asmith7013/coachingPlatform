import { SkillsHubTeacherSkillStatus } from "@lib/skills-hub/core/teacher-skill-status.model";
import { ACTION_PLANS, EXTRA_PROFICIENT_SKILLS, L1_PREREQS, type StaffIds } from "./config";

export async function seedSkillStatuses(staff: StaffIds): Promise<void> {
  console.log("Creating skill statuses (aligned to action plans)...");

  // Use a Map to dedup — proficient prereqs won't be downgraded by plan statuses
  const statusMap = new Map<string, string>();

  // 1. L1 prereqs → proficient (must come first so they aren't overridden)
  for (const uuid of L1_PREREQS) {
    statusMap.set(uuid, "proficient");
  }

  // 2. Extra proficient skills
  for (const uuid of EXTRA_PROFICIENT_SKILLS) {
    statusMap.set(uuid, "proficient");
  }

  // 3. Plan-based statuses (per-skill from skillStatuses map)
  //    Only set if not already proficient (don't downgrade prereqs)
  for (const plan of Object.values(ACTION_PLANS)) {
    const skillStatuses = plan.skillStatuses as Record<string, string>;
    for (const [uuid, status] of Object.entries(skillStatuses)) {
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
