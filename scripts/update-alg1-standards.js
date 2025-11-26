// Script to update Algebra 1 lessons in scope-and-sequence collection with standards from standardsAlg1.json
// Run with: mongosh "$DATABASE_URL" --file /path/to/this/script.js

// Load the standards data
const fs = require('fs');
const standardsData = JSON.parse(fs.readFileSync('/Users/alexsmith/ai-coaching-platform/docs/standardsAlg1.json', 'utf8'));

let totalProcessed = 0;
let successfulUpdates = 0;
let failedUpdates = 0;
let notFoundCount = 0;

print('Starting to update Algebra 1 standards in scope-and-sequence collection...\n');

// Process each lesson from standardsAlg1.json
standardsData.forEach(lesson => {
  totalProcessed++;

  // Parse unit number from "Alg1.1" format -> 1
  const unitNumber = parseInt(lesson.unit.split('.')[1]);
  const grade = lesson.grade; // "Algebra 1"
  const lessonNumber = lesson.lessonNumber;

  // Keep ALL standards with their context (including MP standards)
  const allStandards = lesson.standards;

  // Find matching document in scope-and-sequence
  const query = {
    grade: grade,
    unitNumber: unitNumber,
    lessonNumber: lessonNumber
  };

  const existing = db['scope-and-sequence'].findOne(query);

  if (!existing) {
    print(`⚠️  No match found for Unit ${lesson.unit}, Lesson ${lessonNumber}: "${lesson.lessonTitle}"`);
    notFoundCount++;
    return;
  }

  // Verify the lesson name matches (for safety)
  const namesMatch = existing.lessonName.toLowerCase().includes(lesson.lessonTitle.toLowerCase()) ||
                      lesson.lessonTitle.toLowerCase().includes(existing.lessonName.toLowerCase());

  if (!namesMatch) {
    print(`⚠️  Name mismatch for Unit ${unitNumber}, Lesson ${lessonNumber}:`);
    print(`   JSON: "${lesson.lessonTitle}"`);
    print(`   DB:   "${existing.lessonName}"`);
    print(`   Skipping update for safety.\n`);
    failedUpdates++;
    return;
  }

  // Update the document with standards (including context field)
  const result = db['scope-and-sequence'].updateOne(
    { _id: existing._id },
    { $set: { standards: allStandards } }
  );

  if (result.modifiedCount > 0) {
    print(`✓ Updated: Unit ${unitNumber}, Lesson ${lessonNumber} - "${existing.lessonName}"`);
    print(`  Added ${allStandards.length} standards (with context)`);
    successfulUpdates++;
  } else {
    print(`✗ Failed to update: Unit ${unitNumber}, Lesson ${lessonNumber}`);
    failedUpdates++;
  }
});

print('\n' + '='.repeat(60));
print('Update Summary:');
print('='.repeat(60));
print(`Total lessons processed:    ${totalProcessed}`);
print(`Successful updates:         ${successfulUpdates}`);
print(`Failed updates:             ${failedUpdates}`);
print(`Not found in database:      ${notFoundCount}`);
print('='.repeat(60));
