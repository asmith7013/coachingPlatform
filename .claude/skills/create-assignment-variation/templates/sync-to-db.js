// Sync Assignment Variation to MongoDB
// Usage: node sync-to-db.js <slug> > /tmp/variation-sync.js && mongosh "$DATABASE_URL" < /tmp/variation-sync.js --quiet

const fs = require('fs');
const path = require('path');

// Get slug from command line arguments
const slug = process.argv[2];

if (!slug) {
  console.error('Error: Please provide a slug as argument');
  console.error('Usage: node sync-to-db.js <slug>');
  process.exit(1);
}

const variationDir = path.join(__dirname, '../../../../src/app/scm/podsie/variations', slug);

// Check if directory exists
if (!fs.existsSync(variationDir)) {
  console.error(`Error: Directory not found: ${variationDir}`);
  process.exit(1);
}

// Read metadata file
const metadataPath = path.join(variationDir, 'metadata.json');
if (!fs.existsSync(metadataPath)) {
  console.error('Error: metadata.json not found in directory');
  process.exit(1);
}

const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

// Read all question files
const questionFiles = fs.readdirSync(variationDir)
  .filter(f => f.startsWith('question-') && f.endsWith('.json'))
  .sort((a, b) => {
    const numA = parseInt(a.match(/question-(\d+)/)[1]);
    const numB = parseInt(b.match(/question-(\d+)/)[1]);
    return numA - numB;
  });

if (questionFiles.length === 0) {
  console.error('Error: No question files found in directory');
  process.exit(1);
}

// Process each question
const questions = questionFiles.map(file => {
  const questionData = JSON.parse(fs.readFileSync(path.join(variationDir, file), 'utf-8'));
  return questionData;
});

// Build the variation data object
const variationData = {
  title: metadata.title || `Assignment Variation: ${slug}`,
  slug: slug,
  scopeSequenceTag: metadata.scopeSequenceTag || 'Grade 8',
  grade: metadata.grade || '8',
  unitNumber: metadata.unitNumber || 1,
  lessonNumber: metadata.lessonNumber || 1,
  scopeAndSequenceId: metadata.scopeAndSequenceId,
  section: metadata.section,
  originalAssignmentName: metadata.originalAssignmentName,
  originalPodsieAssignmentId: metadata.originalPodsieAssignmentId,
  questions: questions,
  generatedBy: metadata.generatedBy || 'ai',
  sourceImage: metadata.sourceImage || '',
  isPublic: metadata.isPublic !== false,
  notes: metadata.notes,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Generate MongoDB commands as a string
const mongoScript = `
// Sync Assignment Variation: ${slug}
// Generated: ${new Date().toISOString()}

// Switch to the correct database
use('ai-coaching-platform');

const variationData = ${JSON.stringify(variationData, null, 2)};

// Check if variation already exists
const existingVariation = db['assignment-variations'].findOne({ slug: variationData.slug });
if (existingVariation) {
  print('⚠️  Variation already exists. Deleting old version...');
  db['assignment-variations'].deleteOne({ slug: variationData.slug });
}

// Insert the variation
const result = db['assignment-variations'].insertOne(variationData);

if (result.acknowledged) {
  print('✅ Assignment Variation saved successfully!');
  print('Variation ID: ' + result.insertedId);
  print('Slug: ' + variationData.slug);
  print('Total questions: ' + variationData.questions.length);
  print('📁 Local files: src/app/scm/podsie/variations/' + variationData.slug + '/');
  print('🔗 View at: /scm/podsie/variations/' + variationData.slug);
} else {
  print('❌ Error: Failed to insert variation');
  printjson(result);
}
`;

console.log(mongoScript);
