#!/usr/bin/env tsx
/**
 * Migration Script: Add lessonType and lessonTitle to scope-and-sequence
 *
 * This script extracts lesson type and pure titles from existing lessonName values.
 *
 * Patterns:
 * - "Ramp Up 1: Title" or "Ramp Up #1: Title" -> lessonType: "ramp-up", lessonTitle: "Title"
 * - "End of Unit Assessment X.Y" -> lessonType: "unit-assessment", lessonTitle: "End of Unit Assessment X.Y"
 * - "Regular Lesson Title" -> lessonType: "lesson", lessonTitle: "Regular Lesson Title"
 */

import mongoose from 'mongoose';
import { ScopeAndSequenceModel } from '../src/lib/schema/mongoose-schema/313/scope-and-sequence.model';

// Extract lesson type and title from lessonName
function extractLessonTypeAndTitle(lessonName: string, section?: string): {
  lessonType: 'lesson' | 'ramp-up' | 'unit-assessment';
  lessonTitle: string;
} {
  // Pattern 1: Ramp Up with number (with or without #)
  const rampUpMatch = lessonName.match(/^Ramp Up #?(\d+):\s*(.+)$/i);
  if (rampUpMatch) {
    return {
      lessonType: 'ramp-up',
      lessonTitle: rampUpMatch[2].trim()
    };
  }

  // Pattern 2: End of Unit Assessment
  if (lessonName.match(/^End of Unit Assessment/i)) {
    return {
      lessonType: 'unit-assessment',
      lessonTitle: lessonName // Keep full name as title for assessments
    };
  }

  // Pattern 3: Use section as fallback indicator
  if (section === 'Ramp Ups') {
    // This shouldn't happen if naming is consistent, but handle it
    console.warn(`⚠️  Ramp Up in section but no prefix: "${lessonName}"`);
    return {
      lessonType: 'ramp-up',
      lessonTitle: lessonName
    };
  }

  if (section === 'Unit Assessment') {
    return {
      lessonType: 'unit-assessment',
      lessonTitle: lessonName
    };
  }

  // Default: Regular lesson
  return {
    lessonType: 'lesson',
    lessonTitle: lessonName
  };
}

async function migrateDatabase() {
  try {
    // Connect to database
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(DATABASE_URL);
    console.log('✅ Connected to MongoDB\n');

    // Get all lessons
    const lessons = await ScopeAndSequenceModel.find({}).lean() as unknown as Array<{
      _id: unknown;
      lessonName: string;
      lessonType?: string;
      lessonTitle?: string;
      section?: string;
    }>;
    console.log(`📚 Found ${lessons.length} lessons to process\n`);

    // Statistics
    const stats = {
      totalProcessed: 0,
      rampUps: 0,
      assessments: 0,
      regularLessons: 0,
      alreadyMigrated: 0,
      errors: 0,
      patterns: {
        rampUpWithNumber: 0,
        rampUpWithHash: 0,
        assessment: 0,
      }
    };

    // Process each lesson
    for (const lesson of lessons) {
      try {
        // Skip if already has lessonType and lessonTitle
        if (lesson.lessonType && lesson.lessonTitle) {
          stats.alreadyMigrated++;
          continue;
        }

        const { lessonType, lessonTitle } = extractLessonTypeAndTitle(
          lesson.lessonName,
          lesson.section
        );

        // Track patterns
        if (lessonType === 'ramp-up') {
          stats.rampUps++;
          if (lesson.lessonName.match(/^Ramp Up \d+:/)) {
            stats.patterns.rampUpWithNumber++;
          } else if (lesson.lessonName.match(/^Ramp Up #\d+:/)) {
            stats.patterns.rampUpWithHash++;
          }
        } else if (lessonType === 'unit-assessment') {
          stats.assessments++;
          stats.patterns.assessment++;
        } else {
          stats.regularLessons++;
        }

        // Update the document
        await ScopeAndSequenceModel.updateOne(
          { _id: lesson._id },
          {
            $set: {
              lessonType,
              lessonTitle
            }
          }
        );

        stats.totalProcessed++;

        // Log progress every 50 lessons
        if (stats.totalProcessed % 50 === 0) {
          console.log(`  Processed ${stats.totalProcessed} lessons...`);
        }
      } catch (error) {
        stats.errors++;
        console.error(`❌ Error processing lesson ${lesson._id} (${lesson.lessonName}):`, error);
      }
    }

    // Print summary
    console.log('\n✅ Migration Complete!\n');
    console.log('📊 Summary:');
    console.log(`  Total processed: ${stats.totalProcessed}`);
    console.log(`  Already migrated: ${stats.alreadyMigrated}`);
    console.log(`  Errors: ${stats.errors}`);
    console.log('\n📈 Breakdown by Type:');
    console.log(`  Ramp Ups: ${stats.rampUps}`);
    console.log(`    - "Ramp Up [N]:" format: ${stats.patterns.rampUpWithNumber}`);
    console.log(`    - "Ramp Up #[N]:" format: ${stats.patterns.rampUpWithHash}`);
    console.log(`  Unit Assessments: ${stats.assessments}`);
    console.log(`  Regular Lessons: ${stats.regularLessons}`);

    // Show a few examples
    console.log('\n📝 Sample Results:');
    const samples = await ScopeAndSequenceModel.find({ lessonType: { $exists: true } })
      .limit(5)
      .lean() as unknown as Array<{
        lessonType: string;
        lessonName: string;
        lessonTitle: string;
      }>;

    samples.forEach(s => {
      console.log(`  ${String(s.lessonType).padEnd(15)} | ${s.lessonName}`);
      console.log(`  ${''.padEnd(15)} | → Title: "${s.lessonTitle}"`);
    });

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run migration
migrateDatabase();
