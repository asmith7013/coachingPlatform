/**
 * Script to create unit assessments for Algebra 1
 *
 * This creates assessment documents in the scope-and-sequence collection
 * for Algebra 1 following the established pattern.
 *
 * IMPORTANT: The Algebra 1 scopeSequenceTag includes BOTH Algebra 1 units AND Grade 8 units.
 * This is by design - the Algebra 1 curriculum is a mix of both.
 *
 * Pattern:
 * - scopeSequenceTag = "Algebra 1" (ALWAYS)
 * - grade = "Algebra 1" OR "8" (depending on which unit)
 * - Follows GRADE_VALUES enum: ["6", "7", "8", "Algebra 1"]
 * - Follows SCOPE_SEQUENCE_TAG_VALUES enum: ["Grade 6", "Grade 7", "Grade 8", "Algebra 1", etc.]
 *
 * Run with: npx tsx scripts/create-algebra1-assessments.ts
 */

import { connectToDB } from '@server/db/connection';
import mongoose from 'mongoose';

interface AssessmentData {
  scopeSequenceTag: string;
  grade: string;
  unitNumber: number;
  unit: string;
}

const algebra1Units: AssessmentData[] = [
  // Pure Algebra 1 units (grade = "Algebra 1")
  { scopeSequenceTag: 'Algebra 1', grade: 'Algebra 1', unitNumber: 1, unit: 'Algebra 1, Unit 1 - One-variable Statistics' },
  { scopeSequenceTag: 'Algebra 1', grade: 'Algebra 1', unitNumber: 2, unit: 'Algebra 1, Unit 2 - Linear Equations, Inequalities, and Systems' },

  // Grade 8 units that are part of Algebra 1 curriculum (grade = "8")
  { scopeSequenceTag: 'Algebra 1', grade: '8', unitNumber: 3, unit: 'Grade 8, Unit 3 - Linear Relationships' },

  // Pure Algebra 1 unit
  { scopeSequenceTag: 'Algebra 1', grade: 'Algebra 1', unitNumber: 3, unit: 'Algebra 1, Unit 3 - Two-variable Statistics' },

  // Grade 8 unit
  { scopeSequenceTag: 'Algebra 1', grade: '8', unitNumber: 4, unit: 'Grade 8, Unit 4 - Linear Equations and Linear Systems' },

  // Pure Algebra 1 unit
  { scopeSequenceTag: 'Algebra 1', grade: 'Algebra 1', unitNumber: 4, unit: 'Algebra 1, Unit 4 - Linear Inequalities and Systems' },

  // Grade 8 unit
  { scopeSequenceTag: 'Algebra 1', grade: '8', unitNumber: 5, unit: 'Grade 8, Unit 5 - Functions and Volume' },

  // Pure Algebra 1 unit
  { scopeSequenceTag: 'Algebra 1', grade: 'Algebra 1', unitNumber: 5, unit: 'Algebra 1, Unit 5 - Functions' },

  // Grade 8 unit
  { scopeSequenceTag: 'Algebra 1', grade: '8', unitNumber: 6, unit: 'Grade 8, Unit 6 - Associations in Data' },

  // Pure Algebra 1 units
  { scopeSequenceTag: 'Algebra 1', grade: 'Algebra 1', unitNumber: 6, unit: 'Algebra 1, Unit 6 - Introduction to Exponential Functions' },
  { scopeSequenceTag: 'Algebra 1', grade: 'Algebra 1', unitNumber: 7, unit: 'Algebra 1, Unit 7 - Introduction to Quadratic Functions' },
  { scopeSequenceTag: 'Algebra 1', grade: 'Algebra 1', unitNumber: 8, unit: 'Algebra 1, Unit 8 - Quadratic Equations' },
];

function createAssessmentDocument(data: AssessmentData) {
  // Use the grade field to determine the lesson name
  // For grade="8" units: "End of Unit Assessment: 8.3"
  // For grade="Algebra 1" units: "End of Unit Assessment: Algebra 1.1"
  const lessonName = `End of Unit Assessment: ${data.grade}.${data.unitNumber}`;

  return {
    grade: data.grade,
    unit: data.unit,
    unitLessonId: `${data.unitNumber}.1`,
    unitNumber: data.unitNumber,
    lessonNumber: 1,
    lessonName: lessonName,
    lessonTitle: lessonName,
    section: 'Unit Assessment',
    scopeSequenceTag: data.scopeSequenceTag,
    lessonType: 'assessment',
    roadmapSkills: [],
    targetSkills: [],
    ownerIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function createAlgebra1Assessments() {
  console.log('Starting Algebra 1 assessment creation...\n');

  try {
    await connectToDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const collection = db.collection('scope-and-sequence');

    console.log(`Creating ${algebra1Units.length} Algebra 1 assessments`);
    console.log(`  - scopeSequenceTag="Algebra 1" (ALWAYS)`);
    console.log(`  - Includes ${algebra1Units.filter(u => u.grade === 'Algebra 1').length} Algebra 1 units (grade="Algebra 1")`);
    console.log(`  - Includes ${algebra1Units.filter(u => u.grade === '8').length} Grade 8 units (grade="8")`);
    console.log('');

    // Check for existing Algebra 1 assessments
    const existing = await collection.countDocuments({
      scopeSequenceTag: 'Algebra 1',
      lessonType: 'assessment'
    });
    console.log(`Existing Algebra 1 assessments: ${existing}`);
    console.log('');

    // Create assessment documents
    const assessments = algebra1Units.map(createAssessmentDocument);

    // Insert all at once
    const result = await collection.insertMany(assessments);
    console.log(`✅ Successfully inserted ${result.insertedCount} assessments`);
    console.log('');

    // Verify insertion
    const count = await collection.countDocuments({
      scopeSequenceTag: 'Algebra 1',
      lessonType: 'assessment'
    });

    console.log('Verification:');
    console.log(`  Algebra 1 scopeSequenceTag: ${count} assessments (expected: 12)`);
    console.log('');

    if (count === 12) {
      console.log('✅ All Algebra 1 assessments created successfully!');
    } else {
      console.log('⚠️  Assessment count does not match expected value');
    }

    // Show the created assessments
    console.log('\nCreated assessments:');
    const created = await collection
      .find({
        scopeSequenceTag: 'Algebra 1',
        lessonType: 'assessment'
      })
      .sort({ unitNumber: 1 })
      .toArray();

    created.forEach((doc: any) => {
      console.log(`  Unit ${doc.unitNumber}: ${doc.lessonName}`);
      console.log(`    grade: "${doc.grade}"`);
      console.log(`    scopeSequenceTag: "${doc.scopeSequenceTag}"`);
    });

  } catch (error) {
    console.error('❌ Failed to create Algebra 1 assessments:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

// Run the script
createAlgebra1Assessments()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
