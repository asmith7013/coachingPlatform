/**
 * Script to create unit assessments for Grade 6, 7, and 8
 *
 * This creates assessment documents in the scope-and-sequence collection
 * following the pattern established by existing Grade 8 assessments.
 *
 * Pattern:
 * - Grade 6: grade = "6", scopeSequenceTag = "Grade 6"
 * - Grade 7: grade = "7", scopeSequenceTag = "Grade 7"
 * - Grade 8: grade = "8", scopeSequenceTag = "Grade 8"
 * - Algebra 1: grade = "8", scopeSequenceTag = "Algebra 1" (NOT included in this script)
 *
 * Run with: npx tsx scripts/create-unit-assessments.ts
 */

import { connectToDB } from '@server/db/connection';
import mongoose from 'mongoose';

interface AssessmentData {
  scopeSequenceTag: string;
  grade: string;
  unitNumber: number;
  unit: string;
}

const grade6Units: AssessmentData[] = [
  { scopeSequenceTag: 'Grade 6', grade: '6', unitNumber: 1, unit: 'Unit 1 - Area and Surface Area' },
  { scopeSequenceTag: 'Grade 6', grade: '6', unitNumber: 2, unit: 'Unit 2 - Introducing Ratios' },
  { scopeSequenceTag: 'Grade 6', grade: '6', unitNumber: 3, unit: 'Unit 3 - Unit Rates and Percentages' },
  { scopeSequenceTag: 'Grade 6', grade: '6', unitNumber: 4, unit: 'Unit 4 - Dividing Fractions' },
  { scopeSequenceTag: 'Grade 6', grade: '6', unitNumber: 5, unit: 'Unit 5 - Arithmetic in Base Ten' },
  { scopeSequenceTag: 'Grade 6', grade: '6', unitNumber: 6, unit: 'Unit 6 - Expressions and Equations' },
  { scopeSequenceTag: 'Grade 6', grade: '6', unitNumber: 7, unit: 'Unit 7 - Rational Numbers' },
  { scopeSequenceTag: 'Grade 6', grade: '6', unitNumber: 8, unit: 'Unit 8 - Data Sets and Distributions' },
];

const grade7Units: AssessmentData[] = [
  { scopeSequenceTag: 'Grade 7', grade: '7', unitNumber: 1, unit: 'Unit 1 - Scale Drawings' },
  { scopeSequenceTag: 'Grade 7', grade: '7', unitNumber: 2, unit: 'Unit 2 - Introducing Proportional Relationships' },
  { scopeSequenceTag: 'Grade 7', grade: '7', unitNumber: 3, unit: 'Unit 3 - Circles' },
  { scopeSequenceTag: 'Grade 7', grade: '7', unitNumber: 4, unit: 'Unit 4 - Proportional Relationships and Percentages' },
  { scopeSequenceTag: 'Grade 7', grade: '7', unitNumber: 5, unit: 'Unit 5 - Rational Number Arithmetic' },
  { scopeSequenceTag: 'Grade 7', grade: '7', unitNumber: 6, unit: 'Unit 6 - Expressions, Equations, and Inequalities' },
  { scopeSequenceTag: 'Grade 7', grade: '7', unitNumber: 7, unit: 'Unit 7 - Angles, Triangles, and Prisms' },
  { scopeSequenceTag: 'Grade 7', grade: '7', unitNumber: 8, unit: 'Unit 8 - Probability and Sampling' },
];

const grade8Units: AssessmentData[] = [
  // Units 1-2 already exist, so we'll create 3-8
  { scopeSequenceTag: 'Grade 8', grade: '8', unitNumber: 3, unit: 'Unit 3 - Linear Relationships' },
  { scopeSequenceTag: 'Grade 8', grade: '8', unitNumber: 4, unit: 'Unit 4 - Linear Equations and Linear Systems' },
  { scopeSequenceTag: 'Grade 8', grade: '8', unitNumber: 5, unit: 'Unit 5 - Functions and Volume' },
  { scopeSequenceTag: 'Grade 8', grade: '8', unitNumber: 6, unit: 'Unit 6 - Associations in Data' },
  { scopeSequenceTag: 'Grade 8', grade: '8', unitNumber: 7, unit: 'Unit 7 - Exponents and Scientific Notation' },
  { scopeSequenceTag: 'Grade 8', grade: '8', unitNumber: 8, unit: 'Unit 8 - Pythagorean Theorem and Irrational Numbers' },
];

function createAssessmentDocument(data: AssessmentData) {
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

async function createAssessments() {
  console.log('Starting assessment creation...\n');

  try {
    await connectToDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const collection = db.collection('scope-and-sequence');

    // Combine all units
    const allUnits = [...grade6Units, ...grade7Units, ...grade8Units];

    console.log(`Creating ${allUnits.length} assessments:`);
    console.log(`  - Grade 6: ${grade6Units.length} assessments (grade="6", scopeSequenceTag="Grade 6")`);
    console.log(`  - Grade 7: ${grade7Units.length} assessments (grade="7", scopeSequenceTag="Grade 7")`);
    console.log(`  - Grade 8: ${grade8Units.length} assessments (grade="8", scopeSequenceTag="Grade 8") - Units 3-8 only`);
    console.log('');

    // Check for existing assessments
    const existing = await collection.countDocuments({
      scopeSequenceTag: { $in: ['Grade 6', 'Grade 7', 'Grade 8'] },
      lessonType: 'assessment'
    });
    console.log(`Existing assessments: ${existing}`);
    console.log('');

    // Create assessment documents
    const assessments = allUnits.map(createAssessmentDocument);

    // Insert all at once
    const result = await collection.insertMany(assessments);
    console.log(`✅ Successfully inserted ${result.insertedCount} assessments`);
    console.log('');

    // Verify insertion
    const counts = await Promise.all([
      collection.countDocuments({ scopeSequenceTag: 'Grade 6', lessonType: 'assessment' }),
      collection.countDocuments({ scopeSequenceTag: 'Grade 7', lessonType: 'assessment' }),
      collection.countDocuments({ scopeSequenceTag: 'Grade 8', lessonType: 'assessment' }),
    ]);

    console.log('Verification:');
    console.log(`  Grade 6: ${counts[0]} assessments (expected: 8)`);
    console.log(`  Grade 7: ${counts[1]} assessments (expected: 8)`);
    console.log(`  Grade 8: ${counts[2]} assessments (expected: 8)`);
    console.log('');

    if (counts[0] === 8 && counts[1] === 8 && counts[2] === 8) {
      console.log('✅ All assessments created successfully!');
    } else {
      console.log('⚠️  Assessment counts do not match expected values');
    }

  } catch (error) {
    console.error('❌ Failed to create assessments:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

// Run the script
createAssessments()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
