import { SkillsHubSkillNote } from "@lib/skills-hub/coach/notes/skill-note.model";
import type { StaffIds } from "./config";
import type { PlanDocs } from "./action-plans";
import type { NoteConfig } from "./teachers/teacher-seed-config.types";

export async function seedNotes(
  staff: StaffIds,
  plans: PlanDocs,
  notes: NoteConfig[],
): Promise<void> {
  console.log("Creating skill notes...");

  const records = notes.map((note) => ({
    authorId: staff.coachId,
    teacherStaffId: staff.teacherId,
    content: note.content,
    imageUrls: [],
    tags: {
      skillIds: note.skillIds,
      actionPlanIds: note.planKeys
        .filter((key) => plans[key])
        .map((key) => plans[key]._id),
      actionStepIds: [],
    },
  }));

  await SkillsHubSkillNote.insertMany(records);

  console.log(`  ${notes.length} notes created (tagged to skills and action plans)\n`);
}
