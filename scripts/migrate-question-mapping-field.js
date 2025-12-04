/**
 * Migration script to fix question mappings
 *
 * Problem: Old assignments have isRoot=undefined, new assignments properly set isRoot
 * This script sets isRoot=true for all questions where isRoot is undefined
 */

// Read DATABASE_URL from .env.local
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const databaseUrl = envContent.match(/DATABASE_URL=(.+)/)?.[1];

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

// Generate mongosh script
const migrationScript = `
print('🔄 Starting migration: Fix isRoot field for backwards compatibility\\n');
print('='.repeat(80));

const configs = db['section-configs'].find({}).toArray();
let totalConfigs = 0;
let totalAssignments = 0;
let totalActivities = 0;
let totalQuestionsFixed = 0;

for (const config of configs) {
  if (!config.assignmentContent || config.assignmentContent.length === 0) {
    continue;
  }

  totalConfigs++;
  let configUpdated = false;

  for (const assignment of config.assignmentContent) {
    if (!assignment.podsieActivities || assignment.podsieActivities.length === 0) {
      continue;
    }

    totalAssignments++;

    for (const activity of assignment.podsieActivities) {
      if (!activity.podsieQuestionMap || activity.podsieQuestionMap.length === 0) {
        continue;
      }

      totalActivities++;
      let activityUpdated = false;

      for (const question of activity.podsieQuestionMap) {
        // Fix: Set isRoot=true if it's undefined
        if (question.isRoot === undefined) {
          question.isRoot = true;
          totalQuestionsFixed++;
          activityUpdated = true;
          configUpdated = true;
        }
      }

      if (activityUpdated) {
        print('  ✅ Fixed activity:', activity.activityType, 'for', assignment.lessonName);
      }
    }
  }

  // Update the document if changes were made
  if (configUpdated) {
    db['section-configs'].updateOne(
      { _id: config._id },
      { $set: { assignmentContent: config.assignmentContent } }
    );
    print('✅ Updated config for section:', config.classSection || '(unknown)');
    print('');
  }
}

print('='.repeat(80));
print('\\n📊 Migration Summary:');
print('  - Section configs processed:', totalConfigs);
print('  - Assignments processed:', totalAssignments);
print('  - Activities processed:', totalActivities);
print('  - Questions fixed (set isRoot=true):', totalQuestionsFixed);
print('\\n✅ Migration complete!\\n');
`;

// Write migration script to temp file
const scriptPath = '/tmp/migrate-question-mapping.js';
fs.writeFileSync(scriptPath, migrationScript);

console.log('📝 Migration script generated at:', scriptPath);
console.log('\nTo run the migration:');
console.log(`  mongosh "${databaseUrl}" --file ${scriptPath}`);
console.log('\nOr run directly:');
console.log(`  node ${__filename} --execute\n`);

// If --execute flag is passed, run the migration
if (process.argv.includes('--execute')) {
  console.log('🚀 Executing migration...\n');
  const { execSync } = require('child_process');
  try {
    execSync(`mongosh "${databaseUrl}" --quiet --file ${scriptPath}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}
