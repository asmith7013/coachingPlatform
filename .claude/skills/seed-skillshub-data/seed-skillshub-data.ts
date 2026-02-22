/**
 * Seed Skills Hub Data - Main Entry Point
 *
 * Populates realistic mock data for multiple teachers across all Skills Hub collections.
 * Action plans drive skill statuses for internally consistent coaching progression.
 *
 * ONLY runs against local database (localhost/127.0.0.1).
 *
 * Usage: ~/solves-coaching/.claude/skills/seed-skillshub-data/run.sh
 */

import mongoose from "mongoose";
import {
  connectToDb,
  lookupCoach,
  lookupOrCreateTeacher,
  cleanupExistingData,
  seedCoachingAssignment,
  seedSkillProgressions,
  seedProgressionSteps,
  seedSkillStatuses,
  seedObservations,
  seedNotes,
} from "./seed";
import { COACH_EMAIL, type StaffIds } from "./seed/config";
import { TEACHER_CONFIGS } from "./seed/teachers";

async function seed() {
  console.log("Starting Skills Hub data seed...\n");

  // 1. Connect and find coach
  await connectToDb();
  const coach = await lookupCoach();

  // 2. Seed each teacher
  for (const teacherConfig of TEACHER_CONFIGS) {
    console.log("=".repeat(60));
    console.log(`Seeding: ${teacherConfig.displayName} (${teacherConfig.email})`);
    console.log("=".repeat(60) + "\n");

    const teacher = await lookupOrCreateTeacher(
      teacherConfig.email,
      teacherConfig.displayName,
    );
    const staff: StaffIds = {
      teacherId: teacher._id,
      coachId: coach._id,
      teacherName: teacher.staffName,
      coachName: coach.staffName,
    };

    await cleanupExistingData(staff);
    await seedCoachingAssignment(staff, teacherConfig.coachingDaysAgo);
    const plans = await seedSkillProgressions(staff, teacherConfig.actionPlans);
    await seedProgressionSteps(staff, plans, teacherConfig.actionPlans, teacherConfig.actionSteps);
    await seedSkillStatuses(staff, teacherConfig);
    await seedObservations(staff, teacherConfig.observations);
    await seedNotes(staff, plans, teacherConfig.notes);

    console.log(`  Done: ${teacherConfig.displayName}\n`);
    console.log(`  View at: /skillsHub/coach/teacher/${staff.teacherId}\n`);
  }

  // Final summary
  console.log("=".repeat(60));
  console.log("Skills Hub seed complete!");
  console.log("=".repeat(60));
  console.log(`\nCoach: ${coach.staffName} (${COACH_EMAIL})`);
  console.log(`Teachers seeded: ${TEACHER_CONFIGS.length}`);
  for (const tc of TEACHER_CONFIGS) {
    console.log(`  - ${tc.displayName} (${tc.email})`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
