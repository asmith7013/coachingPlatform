/**
 * Seed script to populate default activity types
 *
 * Run with: npx tsx src/scripts/seed-activity-types.ts
 */

import mongoose from 'mongoose';
import { ActivityTypeConfigModel } from '@mongoose-schema/scm/incentives/activity-type-config.model';
import { DEFAULT_ACTIVITY_TYPES } from '@zod-schema/scm/incentives/activity-type-config';

async function seedActivityTypes() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-coaching-platform';
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if activity types already exist
    const existingCount = await ActivityTypeConfigModel.countDocuments();

    if (existingCount > 0) {
      console.log(`\n⚠️  Found ${existingCount} existing activity types`);
      console.log('   Skipping seed to avoid duplicates.');
      console.log('   To re-seed, manually delete the activity-type-configs collection first.');
      return;
    }

    console.log('\n📦 Seeding default activity types...');

    // Insert default activity types
    const inserted = await ActivityTypeConfigModel.insertMany(DEFAULT_ACTIVITY_TYPES);

    console.log(`✅ Successfully seeded ${inserted.length} activity types:`);
    inserted.forEach((activity) => {
      console.log(`   ${activity.icon} ${activity.label} (${activity.id})`);
    });

    // Display all activity types
    console.log('\n📋 All activity types in database:');
    const allTypes = await ActivityTypeConfigModel.find({}).sort({ order: 1 });
    allTypes.forEach((type) => {
      console.log(`   ${type.order}. ${type.icon} ${type.label}`);
      console.log(`      ID: ${type.id}`);
      console.log(`      Detail Type: ${type.detailType}`);
      console.log(`      Requires Details: ${type.requiresDetails}`);
      console.log(`      Is Default: ${type.isDefault}`);
      console.log('');
    });

    console.log('🎉 Seed complete!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedActivityTypes();
