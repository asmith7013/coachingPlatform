import mongoose from "mongoose";
import { SkillsHubTeacherSkillStatus } from "@lib/skills-hub/core/teacher-skill-status.model";
import { ACTION_PLANS, EXTRA_PROFICIENT_SKILLS, type StaffIds } from "./config";

export async function seedSkillStatuses(staff: StaffIds): Promise<void> {
  console.log("Creating skill statuses (aligned to action plans)...");

  const records: Array<{
    teacherStaffId: mongoose.Types.ObjectId;
    skillId: string;
    status: string;
    updatedBy: mongoose.Types.ObjectId;
  }> = [];

  for (const plan of Object.values(ACTION_PLANS)) {
    for (const uuid of plan.skillUuids) {
      records.push({
        teacherStaffId: staff.teacherId,
        skillId: uuid,
        status: plan.targetStatus,
        updatedBy: staff.coachId,
      });
    }
  }

  for (const uuid of EXTRA_PROFICIENT_SKILLS) {
    records.push({
      teacherStaffId: staff.teacherId,
      skillId: uuid,
      status: "proficient",
      updatedBy: staff.coachId,
    });
  }

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
