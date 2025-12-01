/**
 * Script to create basic section config documents for all sections
 *
 * This script creates SectionConfig documents for sections that don't have one yet.
 * Each section config includes basic metadata (school, classSection, gradeLevel, scopeSequenceTag)
 * with an empty podsieAssignments array to be filled in later.
 *
 * Usage:
 *   npx tsx scripts/create-section-configs.ts
 */

import mongoose from 'mongoose';
import { SectionConfigModel } from '@mongoose-schema/313/section-config.model';

// Section metadata based on enum definitions and section-roadmap config
const SECTION_METADATA: Array<{
  school: 'IS313' | 'PS19';
  classSection: string;
  gradeLevel: string;
  scopeSequenceTag: 'Grade 6' | 'Grade 7' | 'Grade 8' | 'Algebra 1';
}> = [
  // IS313 - 6th Grade Sections
  {
    school: 'IS313',
    classSection: '603/605',
    gradeLevel: '6',
    scopeSequenceTag: 'Grade 6',
  },
  {
    school: 'IS313',
    classSection: '604',
    gradeLevel: '6',
    scopeSequenceTag: 'Grade 6',
  },

  // IS313 - 7th Grade Sections
  {
    school: 'IS313',
    classSection: '704',
    gradeLevel: '7',
    scopeSequenceTag: 'Grade 7',
  },
  {
    school: 'IS313',
    classSection: '703/705',
    gradeLevel: '7',
    scopeSequenceTag: 'Grade 7',
  },

  // IS313 - 8th Grade Sections (Algebra 1)
  {
    school: 'IS313',
    classSection: '802',
    gradeLevel: '8',
    scopeSequenceTag: 'Algebra 1',
  },

  // IS313 - 8th Grade Sections (Standard)
  {
    school: 'IS313',
    classSection: '803',
    gradeLevel: '8',
    scopeSequenceTag: 'Grade 8',
  },
  {
    school: 'IS313',
    classSection: '804',
    gradeLevel: '8',
    scopeSequenceTag: 'Grade 8',
  },
  {
    school: 'IS313',
    classSection: '805',
    gradeLevel: '8',
    scopeSequenceTag: 'Grade 8',
  },

  // PS19 - 6th Grade Sections
  {
    school: 'PS19',
    classSection: '601',
    gradeLevel: '6',
    scopeSequenceTag: 'Grade 6',
  },
  {
    school: 'PS19',
    classSection: '602',
    gradeLevel: '6',
    scopeSequenceTag: 'Grade 6',
  },
  {
    school: 'PS19',
    classSection: '603',
    gradeLevel: '6',
    scopeSequenceTag: 'Grade 6',
  },
];

async function createSectionConfigs() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.DATABASE_URL;
    if (!mongoUri) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Track stats
    let created = 0;
    let skipped = 0;
    let errors = 0;

    console.log('📋 Creating section configs...\n');

    for (const metadata of SECTION_METADATA) {
      const { school, classSection, gradeLevel, scopeSequenceTag } = metadata;

      try {
        // Check if config already exists
        const existing = await SectionConfigModel.findOne({
          school,
          classSection,
        });

        if (existing) {
          console.log(`⏭️  Skipped ${school} ${classSection} - already exists`);
          skipped++;
          continue;
        }

        // Create new section config
        const newConfig = new SectionConfigModel({
          school,
          classSection,
          gradeLevel,
          scopeSequenceTag,
          active: true,
          podsieAssignments: [], // Empty array to be filled later
          notes: `Created by script on ${new Date().toISOString()}`,
        });

        await newConfig.save();
        console.log(`✅ Created ${school} ${classSection} (${scopeSequenceTag})`);
        created++;
      } catch (error) {
        console.error(`❌ Error creating ${school} ${classSection}:`, error);
        errors++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:');
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log('='.repeat(50));

    // Verify final state
    console.log('\n📋 Final section configs in database:');
    const allConfigs = await SectionConfigModel.find({})
      .select('school classSection gradeLevel scopeSequenceTag active')
      .sort({ school: 1, classSection: 1 });

    console.log('\nIS313 Sections:');
    allConfigs
      .filter((c: any) => c.school === 'IS313')
      .forEach((c: any) => {
        console.log(`   ${c.classSection.padEnd(10)} - ${c.scopeSequenceTag} (${c.active ? 'active' : 'inactive'})`);
      });

    console.log('\nPS19 Sections:');
    allConfigs
      .filter((c: any) => c.school === 'PS19')
      .forEach((c: any) => {
        console.log(`   ${c.classSection.padEnd(10)} - ${c.scopeSequenceTag} (${c.active ? 'active' : 'inactive'})`);
      });

    console.log(`\nTotal: ${allConfigs.length} section configs\n`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the script
createSectionConfigs()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
