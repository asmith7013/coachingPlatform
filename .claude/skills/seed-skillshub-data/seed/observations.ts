import mongoose from "mongoose";
import { SkillsHubObservation } from "@lib/skills-hub/coach/observations/observation.model";
import { daysAgo, type StaffIds } from "./config";

export async function seedObservations(staff: StaffIds): Promise<void> {
  console.log("Creating observations...");

  // Classroom visit (3 weeks ago) — focused on open plan skills
  await SkillsHubObservation.create({
    teacherStaffId: staff.teacherId,
    observerId: staff.coachId,
    date: daysAgo(21),
    type: "classroom_visit",
    notes: "Observed small group instruction during 4th period. Ms. Cardona is beginning to implement turn-and-talk but needs to give students more wait time before calling on pairs. Good energy and rapport with students.",
    duration: 45,
    ratings: [
      {
        skillId: "facilitate-student-to-student-relationships",
        rating: "partial",
        evidence: "Students were placed in pairs but rarely spoke to each other without teacher prompting.",
      },
      {
        skillId: "lead-turn-and-talk",
        rating: "partial",
        evidence: "Turn-and-talk was attempted but sentence starters were not posted. Some students unsure of what to discuss.",
      },
      {
        skillId: "normalize-mistakes-as-learning-sgi",
        rating: "not_observed",
        evidence: null,
      },
      {
        skillId: "promote-growth-mindset-sgi",
        rating: "partial",
        evidence: "Teacher said \"good try\" but didn't specifically name what was good about the attempt.",
      },
    ],
    domainRatings: [],
  });

  // Debrief (2 weeks ago)
  await SkillsHubObservation.create({
    teacherStaffId: staff.teacherId,
    observerId: staff.coachId,
    date: daysAgo(14),
    type: "debrief",
    notes: "Debriefed the classroom visit from last week. Ms. Cardona was reflective and identified the need for posted sentence starters. We practiced scripting growth mindset responses to common student errors. She committed to posting sentence starters by Monday.",
    duration: 30,
    ratings: [],
    domainRatings: [],
  });

  // One-on-one (1 week ago) — checking on lesson launch
  await SkillsHubObservation.create({
    teacherStaffId: staff.teacherId,
    observerId: staff.coachId,
    date: daysAgo(7),
    type: "one_on_one",
    notes: "Weekly check-in. Lesson launch routine is becoming more consistent. Students know the warm-up expectations. Discussed next steps for small group facilitation.",
    duration: 20,
    ratings: [
      {
        skillId: "minute-drills",
        rating: "mostly",
        evidence: "Drills are happening every day. Timer is visible. A few students still need reminders to begin.",
      },
      {
        skillId: "lead-whole-class-warm-up-nyse",
        rating: "mostly",
        evidence: "Warm-up is posted and students begin within 2 minutes of entering. Teacher circulates during warm-up.",
      },
    ],
    domainRatings: [
      {
        domainId: "lesson-launch",
        overallRating: "mostly",
        evidence: "Consistent routine established. Room for tightening transitions.",
      },
    ],
  });

  // Quick update (2 days ago)
  await SkillsHubObservation.create({
    teacherStaffId: staff.teacherId,
    observerId: staff.coachId,
    date: daysAgo(2),
    type: "quick_update",
    notes: "Quick hallway check-in. Ms. Cardona shared that she posted the sentence starters and students are starting to use them. She wants to try the growth mindset scripting we practiced during her next small group session tomorrow.",
    duration: 5,
    ratings: [],
    domainRatings: [],
  });

  console.log("  4 observations created (classroom_visit, debrief, one_on_one, quick_update)\n");
}
