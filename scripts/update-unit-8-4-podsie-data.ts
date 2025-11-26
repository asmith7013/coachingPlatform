#!/usr/bin/env tsx
/**
 * Update Unit 8.4 lessons with Podsie assignment IDs and question mappings
 *
 * This script updates Grade 8, Unit 4 lessons that are tagged for Algebra 1
 * with their corresponding Podsie assignment IDs and question IDs.
 *
 * Run with: npx tsx scripts/update-unit-8-4-podsie-data.ts
 */

import mongoose from 'mongoose';
import { ScopeAndSequenceModel } from '../src/lib/schema/mongoose-schema/313/scope-and-sequence.model';

if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set.');
  console.error('Please set it in your .env.local file or export it in your shell.');
  process.exit(1);
}

const DATABASE_URL: string = process.env.DATABASE_URL;

// Unit 8.4 lesson data from docs/student.json
const UNIT_8_4_LESSONS = [
  { lessonNumber: 2, lessonName: "Keeping the Equation Balanced", assignmentId: "19206", questionId: "22759" },
  { lessonNumber: 3, lessonName: "Balanced Moves", assignmentId: "19207", questionId: "22760" },
  { lessonNumber: 4, lessonName: "More Balanced Moves", assignmentId: "19208", questionId: "22761" },
  { lessonNumber: 5, lessonName: "Solving Any Linear Equation", assignmentId: "19209", questionId: "22762" },
  { lessonNumber: 6, lessonName: "Strategic Solving", assignmentId: "19210", questionId: "22763" },
  { lessonNumber: 7, lessonName: "All, Some, or No Solutions", assignmentId: "19211", questionId: "22764" },
  { lessonNumber: 9, lessonName: "When Are They the Same?", assignmentId: "19212", questionId: "22765" },
  { lessonNumber: 10, lessonName: "On or Off the Line?", assignmentId: "19213", questionId: "22766" },
  { lessonNumber: 11, lessonName: "On Both of the Lines", assignmentId: "19214", questionId: "22767" },
  { lessonNumber: 12, lessonName: "Systems of Equations", assignmentId: "19215", questionId: "22768" },
  { lessonNumber: 13, lessonName: "Solving Systems of Equations", assignmentId: "19216", questionId: "22769" },
  { lessonNumber: 14, lessonName: "Solving More Systems", assignmentId: "19217", questionId: "22770" },
];

async function updateUnit84Lessons() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(DATABASE_URL);
    console.log('✅ Connected to MongoDB\n');

    const results = {
      updated: [] as string[],
      created: [] as string[],
      skipped: [] as string[],
      errors: [] as { lesson: string; error: string }[]
    };

    for (const lesson of UNIT_8_4_LESSONS) {
      const unitLessonId = `4.${lesson.lessonNumber}`;

      try {
        console.log(`🔄 Processing Lesson ${lesson.lessonNumber}: ${lesson.lessonName}`);

        // Find existing document
        const existing = await ScopeAndSequenceModel.findOne({
          grade: '8',
          unitLessonId,
          scopeSequenceTag: 'Algebra 1'
        });

        if (existing) {
          // Note: Podsie data now lives in section-config collection, not scope-and-sequence
          // This script is deprecated - use section-config server actions instead
          console.log(`   ⏭️  Document exists, but Podsie data is now in section-config, skipping`);
          results.skipped.push(unitLessonId);
          continue;
        } else {
          // Create new document (without Podsie data - that goes in section-config now)
          const newDoc = await ScopeAndSequenceModel.create({
            grade: '8',
            unit: 'Unit 4 - Linear Equations and Linear Systems',
            unitLessonId,
            unitNumber: 4,
            lessonNumber: lesson.lessonNumber,
            lessonName: lesson.lessonName,
            scopeSequenceTag: 'Algebra 1',
            section: 'A', // Default section for regular lessons
            lessonType: 'lesson', // Add lesson type
            roadmapSkills: [],
            targetSkills: [],
            ownerIds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

          console.log(`   ✨ Created new document (without Podsie data)`);
          console.log(`      Note: Add Podsie data to section-config collection`);
          results.created.push(unitLessonId);
        }

        console.log('');
      } catch (error) {
        console.error(`   ❌ Error processing ${unitLessonId}:`, error);
        results.errors.push({
          lesson: unitLessonId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.log('');
      }
    }

    // Print summary
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Updated: ${results.updated.length}`);
    if (results.updated.length > 0) {
      results.updated.forEach(id => console.log(`   - ${id}`));
    }
    console.log(`✨ Created: ${results.created.length}`);
    if (results.created.length > 0) {
      results.created.forEach(id => console.log(`   - ${id}`));
    }
    console.log(`⏭️  Skipped: ${results.skipped.length}`);
    if (results.skipped.length > 0) {
      results.skipped.forEach(id => console.log(`   - ${id}`));
    }
    console.log(`❌ Errors: ${results.errors.length}`);
    if (results.errors.length > 0) {
      results.errors.forEach(e => console.log(`   - ${e.lesson}: ${e.error}`));
    }

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
updateUnit84Lessons();
