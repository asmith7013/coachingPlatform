/**
 * Seed Skills Hub Data - Main Entry Point
 *
 * Populates realistic mock data for teacher Jane Doe across all Skills Hub collections.
 * Action plans drive skill statuses for internally consistent coaching progression.
 *
 * ONLY runs against local database (localhost/127.0.0.1).
 *
 * Usage: ~/solves-coaching/.claude/skills/seed-skillshub-data/run.sh
 */

import mongoose from "mongoose";
import {
  connectAndLookupStaff,
  cleanupExistingData,
  seedCoachingAssignment,
  seedSkillProgressions,
  seedProgressionSteps,
  seedSkillStatuses,
  seedObservations,
  seedNotes,
} from "./seed";
import { TEACHER_EMAIL, COACH_EMAIL } from "./seed/config";

async function seed() {
  console.log("Starting Skills Hub data seed...\n");

  // 1. Connect and find staff
  const staff = await connectAndLookupStaff();

  // 2. Clean up existing data
  await cleanupExistingData(staff);

  // 3. Create coaching assignment
  await seedCoachingAssignment(staff);

  // 4. Seed skill progressions (drive skill statuses)
  const plans = await seedSkillProgressions(staff);

  // 5. Seed progression steps
  await seedProgressionSteps(staff, plans);

  // 6. Seed skill statuses (derived from action plans)
  await seedSkillStatuses(staff);

  // 7. Seed observations
  await seedObservations(staff);

  // 8. Seed skill notes
  await seedNotes(staff, plans);

  // Summary
  console.log("=".repeat(60));
  console.log("Skills Hub seed complete!");
  console.log("=".repeat(60));
  console.log(`\nTeacher: ${staff.teacherName} (${TEACHER_EMAIL})`);
  console.log(`Coach: ${staff.coachName} (${COACH_EMAIL})`);
  console.log(`\nCollections populated:`);
  console.log(`  Coaching assignments: 1`);
  console.log(`  Skill statuses: 18 (5 active, 5 developing, 8 proficient)`);
  console.log(`  Action plans: 3 (1 open, 1 closed, 1 archived)`);
  console.log(`  Action steps: 8 (3 + 3 + 2)`);
  console.log(`  Observations: 4`);
  console.log(`  Skill notes: 5`);
  console.log(`\nView at: /skillsHub/coach/teacher/${staff.teacherId}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
