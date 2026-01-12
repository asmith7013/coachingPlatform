/**
 * Migration script to add substandards to scope-and-sequence lessons
 *
 * This script reads the scraped substandard data from JSON files and updates
 * the MongoDB scope-and-sequence collection with granular substandard alignments.
 *
 * Standards are tagged with context:
 *   - "current" for direct alignments (no tag in JSON)
 *   - "buildingOn" for "Building On" standards
 *   - "buildingTowards" for "Building Towards" standards
 *
 * Usage:
 *   npx ts-node scripts/migrate-substandards.ts [--dry-run]
 */

import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface SubstandardEntry {
  code: string;
  text: string;
  tag?: string; // "Building On" | "Building Towards" | undefined
}

interface LessonSubstandards {
  unit: number;
  unitName: string;
  lesson: string;
  substandards: SubstandardEntry[];
}

interface GradeData {
  grade: string;
  source: string;
  substandard_descriptions: Record<string, string>;
  lesson_substandards: LessonSubstandards[];
}

// Standard schema matching the Mongoose model
interface StandardDoc {
  code: string;
  text: string;
  context?: 'current' | 'buildingOn' | 'buildingTowards';
}

/**
 * Extract lesson number from lesson name like "Lesson 4: Title"
 */
function extractLessonNumber(lessonName: string): number | null {
  const match = lessonName.match(/^Lesson (\d+):/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Convert scraped standard code to NY format for database
 * e.g., "7.RP.2a" -> "NY-7.RP.2a"
 */
function toNYFormat(code: string): string {
  if (code.startsWith('NY-')) return code;
  return `NY-${code}`;
}

/**
 * Load grade data from JSON file
 */
function loadGradeData(grade: string): GradeData | null {
  const filePath = path.join(process.cwd(), 'docs', 'nyse', `grade${grade}-substandards.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`  No data file found for grade ${grade}: ${filePath}`);
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as GradeData;
}

/**
 * Map JSON tag to schema context value
 */
function tagToContext(tag?: string): 'current' | 'buildingOn' | 'buildingTowards' {
  if (tag === 'Building On') return 'buildingOn';
  if (tag === 'Building Towards') return 'buildingTowards';
  return 'current';
}

/**
 * Build a lookup map: (unitNumber, lessonNumber) -> substandards (including all tags)
 */
function buildLessonLookup(data: GradeData): Map<string, StandardDoc[]> {
  const lookup = new Map<string, StandardDoc[]>();

  for (const lesson of data.lesson_substandards) {
    const lessonNum = extractLessonNumber(lesson.lesson);
    if (lessonNum === null) continue; // Skip "Block X" entries

    const key = `${lesson.unit}-${lessonNum}`;

    // Deduplicate by code (keep first occurrence)
    const seenCodes = new Set<string>();
    const standards: StandardDoc[] = [];

    for (const sub of lesson.substandards) {
      // Skip duplicates
      if (seenCodes.has(sub.code)) continue;
      seenCodes.add(sub.code);

      // Skip non-standard entries (like "Unit Rates in the World", "Model the World", etc.)
      if (!sub.code.match(/^\d+\.[A-Z]+\.\d+[a-d]?$/)) continue;

      standards.push({
        code: toNYFormat(sub.code),
        text: sub.text,
        context: tagToContext(sub.tag)
      });
    }

    if (standards.length > 0) {
      lookup.set(key, standards);
    }
  }

  return lookup;
}

async function migrateGrade(db: mongoose.Connection, grade: string, dryRun: boolean): Promise<{ updated: number; skipped: number }> {
  console.log(`\nProcessing Grade ${grade}...`);

  const data = loadGradeData(grade);
  if (!data) {
    return { updated: 0, skipped: 0 };
  }

  const lookup = buildLessonLookup(data);
  console.log(`  Found ${lookup.size} lessons with substandards`);

  const collection = db.collection('scope-and-sequence');
  const scopeSequenceTag = `Grade ${grade}`;

  let updated = 0;
  let skipped = 0;

  // Get all lessons for this grade
  const lessons = await collection.find({ scopeSequenceTag }).toArray();
  console.log(`  Found ${lessons.length} lessons in database for ${scopeSequenceTag}`);

  for (const lesson of lessons) {
    const key = `${lesson.unitNumber}-${lesson.lessonNumber}`;
    const newSubstandards = lookup.get(key);

    if (!newSubstandards || newSubstandards.length === 0) {
      skipped++;
      continue;
    }

    // Get existing standards
    const existingStandards: StandardDoc[] = lesson.standards || [];

    // Merge: keep existing parent standards, add new substandards
    // Avoid duplicates by code
    const existingCodes = new Set(existingStandards.map(s => s.code));
    const mergedStandards = [...existingStandards];

    for (const newStd of newSubstandards) {
      if (!existingCodes.has(newStd.code)) {
        mergedStandards.push(newStd);
        existingCodes.add(newStd.code);
      }
    }

    // Only update if we actually added new standards
    if (mergedStandards.length > existingStandards.length) {
      if (dryRun) {
        console.log(`  [DRY RUN] Would update Unit ${lesson.unitNumber}, Lesson ${lesson.lessonNumber}: ${lesson.lessonTitle}`);
        console.log(`    Existing: ${existingStandards.map(s => s.code).join(', ')}`);
        console.log(`    Adding: ${newSubstandards.filter(s => !existingStandards.some(e => e.code === s.code)).map(s => s.code).join(', ')}`);
      } else {
        await collection.updateOne(
          { _id: lesson._id },
          { $set: { standards: mergedStandards } }
        );
      }
      updated++;
    } else {
      skipped++;
    }
  }

  return { updated, skipped };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('='.repeat(60));
  console.log('Substandards Migration Script');
  console.log('='.repeat(60));
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE'}`);

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('ERROR: DATABASE_URL not found in environment');
    process.exit(1);
  }

  console.log('\nConnecting to MongoDB...');
  await mongoose.connect(dbUrl);
  const db = mongoose.connection;
  console.log('Connected.');

  const grades = ['6', '7', '8'];
  const totals = { updated: 0, skipped: 0 };

  for (const grade of grades) {
    const result = await migrateGrade(db, grade, dryRun);
    totals.updated += result.updated;
    totals.skipped += result.skipped;
  }

  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`Total lessons updated: ${totals.updated}`);
  console.log(`Total lessons skipped: ${totals.skipped}`);

  if (dryRun) {
    console.log('\nThis was a DRY RUN. No changes were made.');
    console.log('Run without --dry-run to apply changes.');
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
