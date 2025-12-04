/**
 * Migration Script: Update lessonType enum values
 *
 * This script updates the lessonType values in the scope-and-sequence collection
 * from the old hyphenated format to the new camelCase format:
 * - "ramp-up" -> "rampUp"
 * - "unit-assessment" -> "assessment"
 * - "lesson" -> "lesson" (unchanged)
 *
 * Run with: npm run tsx scripts/migrate-lessontype-enum.ts
 */

import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';

async function migrateLessonTypes() {
  console.log('Starting lessonType migration...\n');

  try {
    // Connect to database
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const collection = db.collection('scope-and-sequence');

    // Count documents before migration
    const totalDocs = await collection.countDocuments();
    const rampUpCount = await collection.countDocuments({ lessonType: 'ramp-up' });
    const assessmentCount = await collection.countDocuments({ lessonType: 'unit-assessment' });
    const lessonCount = await collection.countDocuments({ lessonType: 'lesson' });

    console.log('Current state:');
    console.log(`  Total documents: ${totalDocs}`);
    console.log(`  "ramp-up": ${rampUpCount}`);
    console.log(`  "unit-assessment": ${assessmentCount}`);
    console.log(`  "lesson": ${lessonCount}`);
    console.log('');

    // Update ramp-up -> rampUp
    const rampUpResult = await collection.updateMany(
      { lessonType: 'ramp-up' },
      { $set: { lessonType: 'rampUp' } }
    );
    console.log(`✅ Updated ${rampUpResult.modifiedCount} documents: "ramp-up" -> "rampUp"`);

    // Update unit-assessment -> assessment
    const assessmentResult = await collection.updateMany(
      { lessonType: 'unit-assessment' },
      { $set: { lessonType: 'assessment' } }
    );
    console.log(`✅ Updated ${assessmentResult.modifiedCount} documents: "unit-assessment" -> "assessment"`);

    // Verify migration
    console.log('\nVerifying migration:');
    const newRampUpCount = await collection.countDocuments({ lessonType: 'rampUp' });
    const newAssessmentCount = await collection.countDocuments({ lessonType: 'assessment' });
    const newLessonCount = await collection.countDocuments({ lessonType: 'lesson' });
    const oldRampUpCount = await collection.countDocuments({ lessonType: 'ramp-up' });
    const oldAssessmentCount = await collection.countDocuments({ lessonType: 'unit-assessment' });

    console.log(`  "rampUp": ${newRampUpCount} (expected: ${rampUpCount})`);
    console.log(`  "assessment": ${newAssessmentCount} (expected: ${assessmentCount})`);
    console.log(`  "lesson": ${newLessonCount} (expected: ${lessonCount})`);
    console.log(`  Old "ramp-up" remaining: ${oldRampUpCount} (expected: 0)`);
    console.log(`  Old "unit-assessment" remaining: ${oldAssessmentCount} (expected: 0)`);

    if (oldRampUpCount === 0 && oldAssessmentCount === 0 &&
        newRampUpCount === rampUpCount && newAssessmentCount === assessmentCount) {
      console.log('\n✅ Migration completed successfully!');
    } else {
      console.log('\n⚠️  Migration completed but verification failed. Please check manually.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

// Run migration
migrateLessonTypes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
