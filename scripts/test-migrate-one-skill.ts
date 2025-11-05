#!/usr/bin/env tsx
/**
 * Test migration on a single skill before running full migration
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

import { connectToDatabase } from '../src/lib/server/db/ensure-connection';
import { RoadmapsSkillModel } from '../src/lib/schema/mongoose-schema/313/roadmap-skill.model';
import { RoadmapUnitModel } from '../src/lib/schema/mongoose-schema/313/roadmap-unit.model';

async function testMigrationOnOneSkill() {
  console.log('🧪 Testing migration on a single skill...\n');

  try {
    await connectToDatabase();

    // Get one skill
    const skill = await RoadmapsSkillModel.findOne({}).lean();

    if (!skill) {
      console.log('❌ No skills found in database');
      process.exit(1);
    }

    console.log(`📊 Testing with skill: ${skill.skillNumber} - ${skill.title}\n`);
    console.log('Current appearsIn value:', skill.appearsIn || 'undefined');
    console.log('\n--- Computing new appearsIn data ---\n');

    // Initialize appearsIn object
    const appearsIn = {
      asTarget: [] as Array<{ grade: string; unitTitle: string; unitNumber: number }>,
      asEssential: [] as Array<{ skillNumber: string; title: string; units: Array<{ grade: string; unitTitle: string; unitNumber: number }> }>,
      asHelpful: [] as Array<{ skillNumber: string; title: string; units: Array<{ grade: string; unitTitle: string; unitNumber: number }> }>,
      asSupport: [] as Array<{ grade: string; unitTitle: string; unitNumber: number }>
    };

    // 1. Find units where this skill appears
    const units = await RoadmapUnitModel.find({
      $or: [
        { targetSkills: skill.skillNumber },
        { additionalSupportSkills: skill.skillNumber }
      ]
    }, {
      grade: 1,
      unitTitle: 1,
      unitNumber: 1,
      targetSkills: 1,
      additionalSupportSkills: 1
    }).lean();

    console.log(`Found ${units.length} units`);

    for (const unit of units) {
      const unitRef = {
        grade: unit.grade,
        unitTitle: unit.unitTitle,
        unitNumber: unit.unitNumber ?? 0
      };

      if (unit.targetSkills?.includes(skill.skillNumber)) {
        appearsIn.asTarget.push(unitRef);
        console.log(`  - As Target in: ${unit.grade} - ${unit.unitTitle}`);
      } else if (unit.additionalSupportSkills?.includes(skill.skillNumber)) {
        appearsIn.asSupport.push(unitRef);
        console.log(`  - As Support in: ${unit.grade} - ${unit.unitTitle}`);
      }
    }

    // 2. Find skills that have this as essential
    const essentialSkills = await RoadmapsSkillModel.find({
      "essentialSkills.skillNumber": skill.skillNumber
    }, {
      skillNumber: 1,
      title: 1,
      units: 1
    }).lean();

    console.log(`\nFound ${essentialSkills.length} skills that need this as essential`);

    appearsIn.asEssential = essentialSkills.map(s => {
      console.log(`  - Essential for: ${s.skillNumber} - ${s.title}`);
      return {
        skillNumber: s.skillNumber,
        title: s.title,
        units: s.units || []
      };
    });

    // 3. Find skills that have this as helpful
    const helpfulSkills = await RoadmapsSkillModel.find({
      "helpfulSkills.skillNumber": skill.skillNumber
    }, {
      skillNumber: 1,
      title: 1,
      units: 1
    }).lean();

    console.log(`\nFound ${helpfulSkills.length} skills that use this as helpful`);

    appearsIn.asHelpful = helpfulSkills.map(s => {
      console.log(`  - Helpful for: ${s.skillNumber} - ${s.title}`);
      return {
        skillNumber: s.skillNumber,
        title: s.title,
        units: s.units || []
      };
    });

    console.log('\n--- Computed appearsIn data ---');
    console.log(JSON.stringify(appearsIn, null, 2));

    console.log('\n✅ Test complete - no data was modified');
    console.log('   This shows what would be added to the skill document.');
    console.log('   Run migrate-skill-appears-in.ts to apply to all skills.');

  } catch (error) {
    console.error('💥 Test failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

testMigrationOnOneSkill();
