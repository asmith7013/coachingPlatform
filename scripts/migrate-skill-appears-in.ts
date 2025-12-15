#!/usr/bin/env tsx
/**
 * Migration script to populate the appearsIn field for all roadmaps skills
 * This pre-computes where each skill appears (as target, essential, helpful, or support)
 * Run once after adding the appearsIn field to the schema
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

import { connectToDatabase } from '../src/lib/server/db/ensure-connection';
import { RoadmapsSkillModel } from '../src/lib/schema/mongoose-schema/scm/roadmap-skill.model';
import { RoadmapUnitModel } from '../src/lib/schema/mongoose-schema/scm/roadmap-unit.model';

async function populateAppearsIn() {
  console.log('🚀 Starting skill appearsIn migration...\n');

  try {
    // Connect to database
    await connectToDatabase();

    // Get all skills
    const allSkills = await RoadmapsSkillModel.find({}).lean();
    console.log(`📊 Found ${allSkills.length} skills to process\n`);

    let processed = 0;
    let updated = 0;
    let skipped = 0;

    for (const skill of allSkills) {
      processed++;

      try {
        // Initialize appearsIn object
        const appearsIn = {
          asTarget: [] as Array<{ grade: string; unitTitle: string; unitNumber: number }>,
          asEssential: [] as Array<{ skillNumber: string; title: string; units: Array<{ grade: string; unitTitle: string; unitNumber: number }> }>,
          asHelpful: [] as Array<{ skillNumber: string; title: string; units: Array<{ grade: string; unitTitle: string; unitNumber: number }> }>,
          asSupport: [] as Array<{ grade: string; unitTitle: string; unitNumber: number }>
        };

        // 1. Find units where this skill appears as target or support
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

        // Categorize units
        for (const unit of units) {
          const unitRef = {
            grade: unit.grade,
            unitTitle: unit.unitTitle,
            unitNumber: unit.unitNumber ?? 0
          };

          if (unit.targetSkills?.includes(skill.skillNumber)) {
            appearsIn.asTarget.push(unitRef);
          } else if (unit.additionalSupportSkills?.includes(skill.skillNumber)) {
            appearsIn.asSupport.push(unitRef);
          }
        }

        // 2. Find skills that have this as an essential skill
        const essentialSkills = await RoadmapsSkillModel.find({
          "essentialSkills.skillNumber": skill.skillNumber
        }, {
          skillNumber: 1,
          title: 1,
          units: 1
        }).lean();

        appearsIn.asEssential = essentialSkills.map(s => ({
          skillNumber: s.skillNumber,
          title: s.title,
          units: s.units || []
        }));

        // 3. Find skills that have this as a helpful skill
        const helpfulSkills = await RoadmapsSkillModel.find({
          "helpfulSkills.skillNumber": skill.skillNumber
        }, {
          skillNumber: 1,
          title: 1,
          units: 1
        }).lean();

        appearsIn.asHelpful = helpfulSkills.map(s => ({
          skillNumber: s.skillNumber,
          title: s.title,
          units: s.units || []
        }));

        // Update the skill with computed data
        await RoadmapsSkillModel.updateOne(
          { skillNumber: skill.skillNumber },
          { $set: { appearsIn } }
        );

        updated++;

        // Log progress every 10 skills
        if (processed % 10 === 0) {
          console.log(`📝 Progress: ${processed}/${allSkills.length} (${Math.round(processed / allSkills.length * 100)}%)`);
        }

      } catch (error) {
        console.error(`❌ Error processing skill ${skill.skillNumber}:`, error);
        skipped++;
      }
    }

    console.log('\n✅ Migration complete!');
    console.log(`   Processed: ${processed}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the migration
populateAppearsIn();
