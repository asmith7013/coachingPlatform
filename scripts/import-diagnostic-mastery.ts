#!/usr/bin/env tsx

/**
 * Script to import diagnostic mastery data from exported skill matrix
 *
 * Usage:
 *   npx tsx scripts/import-diagnostic-mastery.ts --file ./path/to/file.txt --section 805 --school IS313
 *   npx tsx scripts/import-diagnostic-mastery.ts --file ./path/to/file.txt --section 805 --school IS313 --dry-run
 */

// Load environment variables BEFORE any other imports that use DATABASE_URL
import { config } from "dotenv";
config({ path: ".env.local" });

import fs from "fs";
import path from "path";

interface StudentMasteryData {
  studentName: string; // "LASTNAME, FIRSTNAME" format
  masteredSkillCodes: string[];
}

interface ParsedData {
  students: StudentMasteryData[];
  studentNames: string[];
}

/**
 * Parse the diagnostic export file
 * Format: pipe-delimited with student columns after "Not Started"
 * Auto-detects header row by finding row with "Not Started" column
 */
function parseFile(filePath: string): ParsedData {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n").filter((line) => line.trim());

  // Find header row by looking for "Not Started" column
  let headerLineIndex = -1;
  let headers: string[] = [];
  let notStartedIndex = -1;

  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const cols = lines[i].split("|").map((h) => h.trim());
    const idx = cols.findIndex((h) => h === "Not Started");
    if (idx !== -1) {
      headerLineIndex = i;
      headers = cols;
      notStartedIndex = idx;
      break;
    }
  }

  if (headerLineIndex === -1) {
    throw new Error('Could not find header row with "Not Started" column');
  }

  console.log(`Found header at line ${headerLineIndex + 1}`);

  // Student names are in columns after "Not Started"
  const studentNames = headers.slice(notStartedIndex + 1).filter((name) => name.length > 0);
  console.log(`Found ${studentNames.length} students:`, studentNames.slice(0, 5), studentNames.length > 5 ? "..." : "");

  // Initialize student mastery data
  const studentsMap = new Map<string, string[]>();
  for (const name of studentNames) {
    studentsMap.set(name, []);
  }

  // Parse each data row (start after header row)
  for (let i = headerLineIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    const cells = line.split("|").map((c) => c.trim());

    // Skip separator rows (---) and rows without a skill code
    // Note: cells[0] is empty due to leading |, so Skill Code is at index 3
    const skillCode = cells[3];
    if (!skillCode || !/^\d+$/.test(skillCode)) {
      continue;
    }

    // Check each student column for "PO"
    const studentStartIndex = notStartedIndex + 1;
    for (let j = 0; j < studentNames.length; j++) {
      const cellValue = cells[studentStartIndex + j] || "";
      // Only count "PO" as diagnostic mastery (case-insensitive)
      if (cellValue.toUpperCase() === "PO") {
        studentsMap.get(studentNames[j])?.push(skillCode);
      }
    }
  }

  // Convert to array format
  const students: StudentMasteryData[] = studentNames.map((name) => ({
    studentName: name,
    masteredSkillCodes: studentsMap.get(name) || [],
  }));

  return { students, studentNames };
}

/**
 * Normalize a name for comparison
 * Handles: case differences, extra spaces, accents
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parse command line arguments
 */
function parseArgs(): { file: string; sections: string[]; school: string; dryRun: boolean } {
  const args = process.argv.slice(2);
  let file = "";
  let sectionArg = "";
  let school = "";
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--file":
      case "-f":
        file = args[++i];
        break;
      case "--section":
      case "-s":
        sectionArg = args[++i];
        break;
      case "--school":
        school = args[++i];
        break;
      case "--dry-run":
      case "-d":
        dryRun = true;
        break;
    }
  }

  if (!file || !sectionArg || !school) {
    console.error(`
Usage: npx tsx scripts/import-diagnostic-mastery.ts --file <path> --section <section(s)> --school <school> [--dry-run]

Options:
  --file, -f      Path to the diagnostic export file (required)
  --section, -s   Section code(s), e.g., "805" or "603,604" for multiple (required)
  --school        School code, e.g., "IS313" (required)
  --dry-run, -d   Preview changes without writing to database

Example:
  npx tsx scripts/import-diagnostic-mastery.ts --file ./src/app/scm/roadmaps/805.txt --section 805 --school IS313 --dry-run
  npx tsx scripts/import-diagnostic-mastery.ts --file ./src/app/scm/roadmaps/6th.txt --section 603,604 --school IS313 --dry-run
`);
    process.exit(1);
  }

  // Support comma-separated sections
  const sections = sectionArg.split(",").map((s) => s.trim());

  // Resolve relative paths
  if (!path.isAbsolute(file)) {
    file = path.resolve(process.cwd(), file);
  }

  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exit(1);
  }

  return { file, sections, school, dryRun };
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const { file, sections, school, dryRun } = parseArgs();

  console.log("🚀 Diagnostic Mastery Import");
  console.log(`   File: ${file}`);
  console.log(`   Section(s): ${sections.join(", ")}`);
  console.log(`   School: ${school}`);
  console.log(`   Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);

  // Parse file first (no DB needed)
  console.log(`\n📂 Reading file: ${file}`);
  const { students } = parseFile(file);

  // Dynamic imports for DB modules (after dotenv is loaded)
  console.log(`\n🔌 Connecting to database...`);
  const { connectToDB } = await import("@/lib/server/db/connection");
  const { StudentModel } = await import("@/lib/schema/mongoose-schema/scm/student/student.model");
  await connectToDB();

  console.log(`\n🔍 Matching students in section(s) ${sections.join(", ")} at ${school}...\n`);

  /**
   * Match file student name to database student
   * Searches across all specified sections
   */
  async function findStudentInDB(
    studentName: string
  ): Promise<{ _id: string; firstName: string; lastName: string; masteredSkills: string[] } | null> {
    // Parse name: "LASTNAME, FIRSTNAME" or "LASTNAME LASTNAME2, FIRSTNAME"
    const commaIndex = studentName.indexOf(",");
    if (commaIndex === -1) {
      console.warn(`  Could not parse name (no comma): ${studentName}`);
      return null;
    }

    const lastName = studentName.slice(0, commaIndex).trim();
    const firstName = studentName.slice(commaIndex + 1).trim();

    // Try exact match first (across all sections)
    const student = await StudentModel.findOne(
      {
        section: { $in: sections },
        school,
        active: true,
        firstName: { $regex: new RegExp(`^${firstName}$`, "i") },
        lastName: { $regex: new RegExp(`^${lastName}$`, "i") },
      },
      { _id: 1, firstName: 1, lastName: 1, masteredSkills: 1 }
    ).lean();

    if (student) {
      return student as unknown as { _id: string; firstName: string; lastName: string; masteredSkills: string[] };
    }

    // Try normalized match
    const normalizedFirst = normalizeName(firstName);
    const normalizedLast = normalizeName(lastName);

    const allStudents = await StudentModel.find(
      { section: { $in: sections }, school, active: true },
      { _id: 1, firstName: 1, lastName: 1, masteredSkills: 1 }
    ).lean();

    for (const s of allStudents) {
      const dbFirst = normalizeName(s.firstName as unknown as string);
      const dbLast = normalizeName(s.lastName as unknown as string);

      // Check if names match (allowing for partial matches on compound last names)
      const lastNameMatches = dbLast.includes(normalizedLast) || normalizedLast.includes(dbLast);
      const firstNameMatches =
        dbFirst === normalizedFirst || dbFirst.startsWith(normalizedFirst) || normalizedFirst.startsWith(dbFirst);

      if (lastNameMatches && firstNameMatches) {
        return s as unknown as { _id: string; firstName: string; lastName: string; masteredSkills: string[] };
      }
    }

    return null;
  }

  let matched = 0;
  let notFound = 0;
  let updated = 0;
  let skipped = 0;

  for (const studentData of students) {
    const dbStudent = await findStudentInDB(studentData.studentName);

    if (!dbStudent) {
      console.log(`  ❌ Not found: ${studentData.studentName}`);
      notFound++;
      continue;
    }

    matched++;
    const existingSkills = new Set(dbStudent.masteredSkills || []);
    const newSkills = studentData.masteredSkillCodes.filter((code) => !existingSkills.has(code));

    if (newSkills.length === 0) {
      console.log(`  ✓ ${studentData.studentName} → ${dbStudent.firstName} ${dbStudent.lastName} (no new skills)`);
      skipped++;
      continue;
    }

    console.log(`  ✓ ${studentData.studentName} → ${dbStudent.firstName} ${dbStudent.lastName}`);
    console.log(`    Adding ${newSkills.length} skills: ${newSkills.slice(0, 10).join(", ")}${newSkills.length > 10 ? "..." : ""}`);

    if (!dryRun) {
      await StudentModel.updateOne({ _id: dbStudent._id }, { $addToSet: { masteredSkills: { $each: newSkills } } });
      updated++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Students in file: ${students.length}`);
  console.log(`  Matched in DB: ${matched}`);
  console.log(`  Not found: ${notFound}`);
  if (dryRun) {
    console.log(`  Would update: ${matched - skipped}`);
    console.log(`  Would skip (no new skills): ${skipped}`);
    console.log(`\n🧪 DRY RUN - no changes made`);
  } else {
    console.log(`  Updated: ${updated}`);
    console.log(`  Skipped (no new skills): ${skipped}`);
    console.log(`\n✅ Import complete!`);
  }
}

// Handle errors
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
  process.exit(1);
});

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n💥 Import failed:", error);
    process.exit(1);
  });
