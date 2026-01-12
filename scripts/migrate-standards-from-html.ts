/**
 * Migration script to fully replace scope-and-sequence standards with scraped HTML data
 *
 * This script reads the scraped standard data from JSON files (from initiative-25 in HTML)
 * and REPLACES all standards in the MongoDB scope-and-sequence collection.
 *
 * This ensures we only have properly formatted NY standards (no alt frameworks, no MP standards).
 *
 * Standards format: NY-X.DOMAIN.NUM or NY-X.DOMAIN.NUMx
 *
 * Usage:
 *   npx ts-node scripts/migrate-standards-from-html.ts [--dry-run]
 */

import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface ScrapedStandard {
  code: string;
  text: string;
  context?: 'current' | 'buildingOn' | 'buildingTowards';
}

interface ScrapedLesson {
  unit: number;
  lesson: number;
  lessonTitle: string;
  standards: ScrapedStandard[];
}

interface ScrapedGradeData {
  grade: string;
  source: string;
  standard_descriptions: Record<string, string>;
  lessons: ScrapedLesson[];
}

// Standard schema matching the Mongoose model
interface StandardDoc {
  code: string;
  text: string;
  context?: 'current' | 'buildingOn' | 'buildingTowards';
}

/**
 * Load grade data from JSON file
 */
function loadGradeData(grade: string): ScrapedGradeData | null {
  const filePath = path.join(process.cwd(), 'docs', 'nyse', `grade${grade}-standards-full.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`  No data file found for grade ${grade}: ${filePath}`);
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as ScrapedGradeData;
}

/**
 * Build a lookup map: (unitNumber, lessonNumber) -> standards
 */
function buildLessonLookup(data: ScrapedGradeData): Map<string, StandardDoc[]> {
  const lookup = new Map<string, StandardDoc[]>();

  for (const lesson of data.lessons) {
    const key = `${lesson.unit}-${lesson.lesson}`;

    // Convert scraped standards to StandardDoc format
    // Preserve context from JSON (current, buildingOn, buildingTowards)
    const standards: StandardDoc[] = lesson.standards.map(std => ({
      code: std.code,
      text: std.text,
      context: std.context || 'current'
    }));

    if (standards.length > 0) {
      lookup.set(key, standards);
    }
  }

  return lookup;
}

async function migrateGrade(
  db: mongoose.Connection,
  grade: string,
  dryRun: boolean
): Promise<{ updated: number; skipped: number; notFound: number }> {
  console.log(`\nProcessing Grade ${grade}...`);

  const data = loadGradeData(grade);
  if (!data) {
    return { updated: 0, skipped: 0, notFound: 0 };
  }

  const lookup = buildLessonLookup(data);
  console.log(`  Found ${lookup.size} lessons with standards in JSON`);

  const collection = db.collection('scope-and-sequence');
  const scopeSequenceTag = `Grade ${grade}`;

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  // Get all lessons for this grade
  const lessons = await collection.find({ scopeSequenceTag }).toArray();
  console.log(`  Found ${lessons.length} lessons in database for ${scopeSequenceTag}`);

  for (const lesson of lessons) {
    const key = `${lesson.unitNumber}-${lesson.lessonNumber}`;
    const newStandards = lookup.get(key);

    if (!newStandards) {
      // No standards found in scraped data for this lesson
      notFound++;
      if (dryRun && notFound <= 5) {
        console.log(`  [DRY RUN] No scraped data for Unit ${lesson.unitNumber} Lesson ${lesson.lessonNumber}: ${lesson.lessonTitle}`);
      }
      continue;
    }

    // Get existing standards for comparison
    const existingStandards: StandardDoc[] = lesson.standards || [];

    // Compare codes AND context to determine if update is needed
    const existingKey = existingStandards
      .map(s => `${s.code}:${s.context || 'none'}`)
      .sort()
      .join(',');
    const newKey = newStandards
      .map(s => `${s.code}:${s.context || 'none'}`)
      .sort()
      .join(',');

    // Only update if standards are different (including context)
    if (existingKey === newKey) {
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`  [DRY RUN] Would update Unit ${lesson.unitNumber} Lesson ${lesson.lessonNumber}: ${lesson.lessonTitle}`);
      console.log(`    Old: ${existingStandards.map(s => s.code).join(', ')}`);
      console.log(`    New: ${newStandards.map(s => s.code).join(', ')}`);
    } else {
      await collection.updateOne(
        { _id: lesson._id },
        { $set: { standards: newStandards } }
      );
    }
    updated++;
  }

  return { updated, skipped, notFound };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('='.repeat(60));
  console.log('Standards Migration Script (Full Replace from HTML)');
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
  const totals = { updated: 0, skipped: 0, notFound: 0 };

  for (const grade of grades) {
    const result = await migrateGrade(db, grade, dryRun);
    totals.updated += result.updated;
    totals.skipped += result.skipped;
    totals.notFound += result.notFound;
  }

  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`Total lessons updated: ${totals.updated}`);
  console.log(`Total lessons skipped (no changes): ${totals.skipped}`);
  console.log(`Total lessons with no scraped data: ${totals.notFound}`);

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
