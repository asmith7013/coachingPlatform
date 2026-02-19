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
      content: "Ms. Doe showed strong improvement in her turn-and-talk routine this week. Students were more engaged when sentence starters were posted on the board. Next step: have students generate their own discussion stems.",
      imageUrls: [],
      tags: {
        skillIds: [
          "1358ca7c-7e8b-452c-8a52-5f3041f65533", // lead-turn-and-talk
          "73f2a400-7bc9-4c7d-a5eb-d7dc68e6ee58", // facilitate-student-to-student-relationships
        ],
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
        skillIds: [
          "3a12be8f-d52f-496a-8457-04ad148e7054", // minute-drills
        ],
        actionPlanIds: [plans.closed._id],
        actionStepIds: [],
      },
    },
    {
      authorId: staff.coachId,
      teacherStaffId: staff.teacherId,
      content: "Growth mindset language is an area to develop. When a student made an error during the worked example, Ms. Doe quickly corrected rather than exploring the thinking. We discussed reframing to: \"Tell me more about how you got that answer.\"",
      imageUrls: [],
      tags: {
        skillIds: [
          "6b2df8f9-5566-43c3-b103-eee726fff768", // normalize-mistakes-as-learning-sgi
          "4eceaa9c-e1a5-45ee-a495-447a569fcea3", // promote-growth-mindset-sgi
        ],
        actionPlanIds: [plans.open._id],
        actionStepIds: [],
      },
    },
    {
      authorId: staff.coachId,
      teacherStaffId: staff.teacherId,
      content: "Ms. Doe has excellent personal rapport with students. She knows details about their lives outside school and references them in conversation. This is a real strength to build on as we work on small group facilitation.",
      imageUrls: [],
      tags: {
        skillIds: [
          "cdb2e644-243f-4e10-882d-018f140bfcfd", // build-personal-rapport
          "59d53eee-90e4-4031-9763-99129e34b678", // address-students-by-name
        ],
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
        skillIds: [
          "cd2379da-ae43-4a34-adfe-54def0987046", // facilitate-student-independent-practice
        ],
        actionPlanIds: [plans.open._id],
        actionStepIds: [],
      },
    },
  ]);

  console.log("  5 notes created (tagged to skills and action plans)\n");
}
