/**
 * Migration script to update assessment status for all students
 * Updates status to only show "Demonstrated" for 80% or 100% scores
 */

import { StudentModel } from "@/lib/schema/mongoose-schema/scm/student/student.model";
import { connectToDB } from "@server/db/connection";

/**
 * Extract numeric score from percentage string
 */
function getNumericScore(scoreString: string): number {
  const match = scoreString.match(/(\d+)%/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Determine status based on best score
 * - 80% or 100%: "Demonstrated" ✅
 * - 60% or lower: "Attempted But Not Passed" ⏳
 * - Not attempted: "Not Started"
 */
function getStatus(
  bestScore: number,
): "Demonstrated" | "Attempted But Not Passed" | "Not Started" {
  if (bestScore === 80 || bestScore === 100) return "Demonstrated";
  if (bestScore > 0) return "Attempted But Not Passed";
  return "Not Started";
}

async function migrateAssessmentStatus() {
  console.log("🔄 Starting assessment status migration...");

  try {
    await connectToDB();
    console.log("✅ Connected to database");

    // Fetch all students
    const students = await StudentModel.find({}).lean();
    console.log(`📊 Found ${students.length} students to process`);

    let studentsUpdated = 0;
    let skillsUpdated = 0;

    for (const student of students) {
      const s = student as Record<string, unknown>;
      const studentName = `${s.lastName}, ${s.firstName}`;
      const skillPerformances = s.skillPerformances as Array<
        Record<string, unknown>
      >;

      if (
        !skillPerformances ||
        !Array.isArray(skillPerformances) ||
        skillPerformances.length === 0
      ) {
        console.log(`  ⏭️  Skipping ${studentName} (no skill performances)`);
        continue;
      }

      let studentHasChanges = false;
      const updatedSkillPerformances = [];
      const newMasteredSkills: string[] = [];

      for (const skill of skillPerformances) {
        const attempts = skill.attempts as Array<Record<string, unknown>>;

        // Calculate best score from attempts
        let bestScore = 0;
        if (attempts && Array.isArray(attempts) && attempts.length > 0) {
          const scores = attempts.map((a) =>
            getNumericScore(a.score as string),
          );
          bestScore = Math.max(...scores);
        }

        // Determine new status
        const newStatus = getStatus(bestScore);
        const oldStatus = skill.status;

        // Check if status changed
        if (newStatus !== oldStatus) {
          console.log(
            `    🔄 ${skill.skillCode}: "${oldStatus}" → "${newStatus}" (${bestScore}%)`,
          );
          studentHasChanges = true;
          skillsUpdated++;
        }

        // Update skill performance with new status
        updatedSkillPerformances.push({
          ...skill,
          status: newStatus,
          bestScore: `${bestScore}%`,
        });

        // Add to mastered skills if demonstrated
        if (newStatus === "Demonstrated") {
          newMasteredSkills.push(skill.skillCode as string);
        }
      }

      // Update student if there are changes
      if (studentHasChanges) {
        await StudentModel.findOneAndUpdate(
          { studentID: s.studentID },
          {
            $set: {
              skillPerformances: updatedSkillPerformances,
              masteredSkills: newMasteredSkills,
            },
          },
        );
        studentsUpdated++;
        console.log(
          `  ✅ Updated ${studentName} (${newMasteredSkills.length} mastered skills)`,
        );
      } else {
        console.log(`  ⏭️  No changes for ${studentName}`);
      }
    }

    console.log("\n✅ Migration complete!");
    console.log(`   📝 Students updated: ${studentsUpdated}`);
    console.log(`   🎯 Skills updated: ${skillsUpdated}`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Run the migration
migrateAssessmentStatus()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
