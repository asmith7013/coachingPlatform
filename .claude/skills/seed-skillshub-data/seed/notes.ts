import mongoose from "mongoose";
import { SkillsHubSkillNote } from "@lib/skills-hub/coach/notes/skill-note.model";
import type { StaffIds } from "./config";
import type { PlanDocs } from "./action-plans";

export async function seedNotes(staff: StaffIds, plans: PlanDocs): Promise<void> {
  console.log("Creating skill notes...");

  await SkillsHubSkillNote.insertMany([
    {
      authorId: staff.coachId,
      teacherStaffId: staff.teacherId,
      content: "Ms. Cardona showed strong improvement in her turn-and-talk routine this week. Students were more engaged when sentence starters were posted on the board. Next step: have students generate their own discussion stems.",
      imageUrls: [],
      tags: {
        skillIds: ["lead-turn-and-talk", "facilitate-student-to-student-relationships"],
        actionPlanIds: [plans.open._id],
        actionStepIds: [],
      },
    },
    {
      authorId: staff.coachId,
      teacherStaffId: staff.teacherId,
      content: "Noticed during walkthrough that minute drills are now fully routinized. Students start immediately when the timer appears on the board. Great progress from where we started.",
      imageUrls: [],
      tags: {
        skillIds: ["minute-drills"],
        actionPlanIds: [plans.closed._id],
        actionStepIds: [],
      },
    },
    {
      authorId: staff.coachId,
      teacherStaffId: staff.teacherId,
      content: "Growth mindset language is an area to develop. When a student made an error during the worked example, Ms. Cardona quickly corrected rather than exploring the thinking. We discussed reframing to: \"Tell me more about how you got that answer.\"",
      imageUrls: [],
      tags: {
        skillIds: ["normalize-mistakes-as-learning-sgi", "promote-growth-mindset-sgi"],
        actionPlanIds: [plans.open._id],
        actionStepIds: [],
      },
    },
    {
      authorId: staff.coachId,
      teacherStaffId: staff.teacherId,
      content: "Ms. Cardona has excellent personal rapport with students. She knows details about their lives outside school and references them in conversation. This is a real strength to build on as we work on small group facilitation.",
      imageUrls: [],
      tags: {
        skillIds: ["build-personal-rapport", "address-students-by-name"],
        actionPlanIds: [],
        actionStepIds: [],
      },
    },
    {
      authorId: staff.coachId,
      teacherStaffId: staff.teacherId,
      content: "Planning note: For next observation, focus on whether students are able to work independently after the worked example. Look for evidence of gradual release — does the teacher step back and let students struggle productively?",
      imageUrls: [],
      tags: {
        skillIds: ["facilitate-student-independent-practice"],
        actionPlanIds: [plans.open._id],
        actionStepIds: [],
      },
    },
  ]);

  console.log("  5 notes created (tagged to skills and action plans)\n");
}
