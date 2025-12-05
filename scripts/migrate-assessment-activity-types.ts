/**
 * Script to migrate existing section-config activities to use 'assessment' type
 *
 * This updates podsieActivities in section-configs collection where:
 * - The scopeAndSequenceId (in assignmentContent array) points to a scope-and-sequence
 *   document with lessonType='assessment'
 * - Currently has activityType='mastery-check', 'sidekick', or undefined
 *
 * Run with: npx tsx scripts/migrate-assessment-activity-types.ts
 */

import { connectToDB } from '@server/db/connection';
import mongoose from 'mongoose';

async function migrateAssessmentActivityTypes() {
  console.log('Starting migration of assessment activity types...\n');

  try {
    await connectToDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const sectionConfigsCollection = db.collection('section-configs');
    const scopeAndSequenceCollection = db.collection('scope-and-sequence');

    // First, find all assessment documents in scope-and-sequence
    console.log('📚 Finding all assessment documents in scope-and-sequence...');
    const assessments = await scopeAndSequenceCollection
      .find({ lessonType: 'assessment' })
      .toArray();

    // Create a Set of assessment IDs (as strings) for fast lookup
    const assessmentIdSet = new Set(assessments.map(doc => doc._id.toString()));
    console.log(`  Found ${assessmentIdSet.size} assessment documents\n`);

    // Find section-configs that have assignmentContent pointing to these assessments
    console.log('🔍 Finding section-configs with assessment activities...');
    const sectionConfigs = await sectionConfigsCollection
      .find({
        'assignmentContent.scopeAndSequenceId': {
          $in: Array.from(assessmentIdSet).map(id => new mongoose.Types.ObjectId(id))
        }
      })
      .toArray();

    console.log(`  Found ${sectionConfigs.length} section-configs with potential assessment activities\n`);

    if (sectionConfigs.length === 0) {
      console.log('✅ No section-configs need migration');
      return;
    }

    // Update each section-config
    let updatedConfigsCount = 0;
    let totalActivitiesUpdated = 0;

    for (const sectionConfig of sectionConfigs) {
      const updates: any[] = [];

      // Check each assignmentContent entry
      sectionConfig.assignmentContent?.forEach((assignment: any, assignmentIndex: number) => {
        const scopeSeqId = assignment.scopeAndSequenceId?.toString();

        // If this assignment points to an assessment
        if (scopeSeqId && assessmentIdSet.has(scopeSeqId)) {
          // Check each podsieActivity within this assignment
          assignment.podsieActivities?.forEach((activity: any, activityIndex: number) => {
            // If activity doesn't already have activityType='assessment', mark it for update
            if (activity.activityType !== 'assessment') {
              updates.push({
                assignmentIndex,
                activityIndex,
                oldType: activity.activityType || 'undefined',
                lessonName: assignment.lessonName,
                podsieAssignmentId: activity.podsieAssignmentId
              });
            }
          });
        }
      });

      if (updates.length > 0) {
        // Build update operations for this section-config
        const updateDoc: any = {};

        updates.forEach(update => {
          const fieldPath = `assignmentContent.${update.assignmentIndex}.podsieActivities.${update.activityIndex}.activityType`;
          updateDoc[fieldPath] = 'assessment';
        });

        // Execute the update
        await sectionConfigsCollection.updateOne(
          { _id: sectionConfig._id },
          { $set: updateDoc }
        );

        updatedConfigsCount++;
        totalActivitiesUpdated += updates.length;

        console.log(`✅ Updated section-config: ${sectionConfig.school} - ${sectionConfig.classSection}`);
        updates.forEach(update => {
          console.log(`   - ${update.lessonName} (Assignment ${update.podsieAssignmentId})`);
          console.log(`     Old type: ${update.oldType} → New type: assessment`);
        });
        console.log('');
      }
    }

    console.log('📊 Migration Summary:');
    console.log(`  - Section configs updated: ${updatedConfigsCount}`);
    console.log(`  - Total activities updated: ${totalActivitiesUpdated}`);
    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

// Run the script
migrateAssessmentActivityTypes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
