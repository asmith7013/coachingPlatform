/**
 * Migration script to update the scope-and-sequence unique index to include subsection field.
 *
 * This script:
 * 1. Drops the old unique index: { grade, unitLessonId, scopeSequenceTag, section }
 * 2. Creates the new unique index: { grade, unitLessonId, scopeSequenceTag, section, subsection }
 *
 * Run with: npx tsx scripts/db/migrate-subsection-index.ts
 */

import mongoose from 'mongoose';
import { ScopeAndSequenceModel } from '@mongoose-schema/scm/scope-and-sequence/scope-and-sequence.model';

async function migrateSubsectionIndex() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.DATABASE_URL;
    if (!MONGODB_URI) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the scope-and-sequence collection
    const collection = ScopeAndSequenceModel.collection;

    // List all indexes before migration
    console.log('\n📋 Current indexes on scope-and-sequence collection:');
    const indexesBefore = await collection.indexes();
    indexesBefore.forEach((index: { name?: string; key?: object }) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    // Drop the old index if it exists
    const oldIndexName = 'grade_1_unitLessonId_1_scopeSequenceTag_1_section_1';
    try {
      console.log(`\n🗑️  Dropping old index "${oldIndexName}"...`);
      await collection.dropIndex(oldIndexName);
      console.log(`✅ Successfully dropped old index "${oldIndexName}"`);
    } catch (error: unknown) {
      const mongoError = error as { code?: number };
      if (mongoError.code === 27) {
        console.log(`ℹ️  Old index "${oldIndexName}" does not exist (already dropped or never existed)`);
      } else {
        throw error;
      }
    }

    // Create the new index with subsection
    const newIndexName = 'grade_1_unitLessonId_1_scopeSequenceTag_1_section_1_subsection_1';
    try {
      console.log(`\n🔨 Creating new index with subsection...`);
      await collection.createIndex(
        { grade: 1, unitLessonId: 1, scopeSequenceTag: 1, section: 1, subsection: 1 },
        { unique: true, sparse: true, name: newIndexName }
      );
      console.log(`✅ Successfully created new index "${newIndexName}"`);
    } catch (error: unknown) {
      const mongoError = error as { code?: number };
      if (mongoError.code === 85 || mongoError.code === 86) {
        // Index already exists with same name or equivalent
        console.log(`ℹ️  New index already exists`);
      } else {
        throw error;
      }
    }

    // List indexes after migration
    console.log('\n📋 Indexes after migration:');
    const indexesAfter = await collection.indexes();
    indexesAfter.forEach((index: { name?: string; key?: object }) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
}

migrateSubsectionIndex();
