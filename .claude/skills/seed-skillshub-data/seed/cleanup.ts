import { SkillsHubTeacherSkillStatus } from "@lib/skills-hub/core/teacher-skill-status.model";
import { SkillsHubActionPlan } from "@lib/skills-hub/coach/skill-progressions/skill-progression.model";
import { SkillsHubActionStep } from "@lib/skills-hub/coach/skill-progressions/progression-step.model";
import { SkillsHubObservation } from "@lib/skills-hub/coach/observations/observation.model";
import { SkillsHubSkillNote } from "@lib/skills-hub/coach/notes/skill-note.model";
import { SkillsHubCoachTeacherAssignment } from "@lib/skills-hub/admin/coaching-assignments/coaching-assignment.model";
import type { StaffIds } from "./config";

export async function cleanupExistingData(staff: StaffIds): Promise<void> {
  console.log("Cleaning up existing Skills Hub data...");

  const cleanups = await Promise.all([
    SkillsHubTeacherSkillStatus.deleteMany({ teacherStaffId: staff.teacherId }),
    SkillsHubActionPlan.deleteMany({ teacherStaffId: staff.teacherId }),
    SkillsHubObservation.deleteMany({ teacherStaffId: staff.teacherId }),
    SkillsHubSkillNote.deleteMany({ teacherStaffId: staff.teacherId }),
    SkillsHubCoachTeacherAssignment.deleteMany({
      teacherStaffId: staff.teacherId,
    }),
  ]);
  console.log(
    `  Deleted: ${cleanups[0].deletedCount} statuses, ${cleanups[1].deletedCount} plans, ` +
      `${cleanups[2].deletedCount} observations, ${cleanups[3].deletedCount} notes, ` +
      `${cleanups[4].deletedCount} assignments`,
  );

  // Clean orphan action steps from deleted plans
  const remainingPlanIds = await SkillsHubActionPlan.find({}).select("_id").lean();
  const validPlanIds = new Set(
    remainingPlanIds.map((p: Record<string, unknown>) => String(p._id)),
  );
  const allSteps = await SkillsHubActionStep.find({}).select("actionPlanId").lean();
  const orphanStepIds = (allSteps as Record<string, unknown>[])
    .filter((s) => !validPlanIds.has(String(s.actionPlanId)))
    .map((s) => s._id);
  if (orphanStepIds.length > 0) {
    await SkillsHubActionStep.deleteMany({ _id: { $in: orphanStepIds } });
    console.log(`  Deleted: ${orphanStepIds.length} orphan action steps`);
  }
  console.log("");
}
