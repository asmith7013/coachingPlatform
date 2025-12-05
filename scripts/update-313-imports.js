/**
 * Script to update import paths for reorganized 313 schemas
 *
 * Zod schema mapping:
 * - @zod-schema/313/student -> @zod-schema/313/student/student
 * - @zod-schema/313/student-activity -> @zod-schema/313/student/student-activity
 * - @zod-schema/313/student-performance -> @zod-schema/313/student/student-performance
 * - @zod-schema/313/student-data -> @zod-schema/313/student/student-data
 * - @zod-schema/313/roadmaps-student-data -> @zod-schema/313/student/roadmaps-student-data
 * - @zod-schema/313/roadmap -> @zod-schema/313/curriculum/roadmap
 * - @zod-schema/313/roadmap-skill -> @zod-schema/313/curriculum/roadmap-skill
 * - @zod-schema/313/roadmap-unit -> @zod-schema/313/curriculum/roadmap-unit
 * - @zod-schema/313/scope-and-sequence -> @zod-schema/313/curriculum/scope-and-sequence
 * - @zod-schema/313/podsie-completion -> @zod-schema/313/podsie/podsie-completion
 * - @zod-schema/313/podsie-question-map -> @zod-schema/313/podsie/podsie-question-map
 * - @zod-schema/313/podsie-response -> @zod-schema/313/podsie/podsie-response
 * - @zod-schema/313/ramp-up-progress -> @zod-schema/313/podsie/ramp-up-progress
 * - @zod-schema/313/section-config -> @zod-schema/313/podsie/section-config
 * - @zod-schema/313/activity-type-config -> @zod-schema/313/incentives/activity-type-config
 *
 * Mongoose schema mapping (same pattern with @mongoose-schema prefix and .model suffix):
 * - @mongoose-schema/313/student -> @mongoose-schema/313/student/student.model
 * - etc.
 */

const fs = require('fs');
const path = require('path');

// Map of old paths to new paths (order matters - more specific first)
const zodMappings = [
  // Student schemas
  ['@zod-schema/313/student-activity', '@zod-schema/313/student/student-activity'],
  ['@zod-schema/313/student-performance', '@zod-schema/313/student/student-performance'],
  ['@zod-schema/313/student-data', '@zod-schema/313/student/student-data'],
  ['@zod-schema/313/roadmaps-student-data', '@zod-schema/313/student/roadmaps-student-data'],
  ['@zod-schema/313/student', '@zod-schema/313/student/student'],

  // Curriculum schemas
  ['@zod-schema/313/roadmap-skill', '@zod-schema/313/curriculum/roadmap-skill'],
  ['@zod-schema/313/roadmap-unit', '@zod-schema/313/curriculum/roadmap-unit'],
  ['@zod-schema/313/roadmap', '@zod-schema/313/curriculum/roadmap'],
  ['@zod-schema/313/scope-and-sequence', '@zod-schema/313/curriculum/scope-and-sequence'],

  // Podsie schemas
  ['@zod-schema/313/podsie-completion', '@zod-schema/313/podsie/podsie-completion'],
  ['@zod-schema/313/podsie-question-map', '@zod-schema/313/podsie/podsie-question-map'],
  ['@zod-schema/313/podsie-response', '@zod-schema/313/podsie/podsie-response'],
  ['@zod-schema/313/ramp-up-progress', '@zod-schema/313/podsie/ramp-up-progress'],
  ['@zod-schema/313/section-config', '@zod-schema/313/podsie/section-config'],

  // Incentives schemas
  ['@zod-schema/313/activity-type-config', '@zod-schema/313/incentives/activity-type-config'],
];

const mongooseMappings = [
  // Student models
  ['@mongoose-schema/313/student-activity.model', '@mongoose-schema/313/student/student-activity.model'],
  ['@mongoose-schema/313/student-performance.model', '@mongoose-schema/313/student/student-performance.model'],
  ['@mongoose-schema/313/roadmaps-student-data.model', '@mongoose-schema/313/student/roadmaps-student-data.model'],
  ['@mongoose-schema/313/student.model', '@mongoose-schema/313/student/student.model'],

  // Curriculum models
  ['@mongoose-schema/313/roadmap-skill.model', '@mongoose-schema/313/curriculum/roadmap-skill.model'],
  ['@mongoose-schema/313/roadmap-unit.model', '@mongoose-schema/313/curriculum/roadmap-unit.model'],
  ['@mongoose-schema/313/roadmap.model', '@mongoose-schema/313/curriculum/roadmap.model'],
  ['@mongoose-schema/313/scope-and-sequence.model', '@mongoose-schema/313/curriculum/scope-and-sequence.model'],

  // Podsie models
  ['@mongoose-schema/313/podsie-completion.model', '@mongoose-schema/313/podsie/podsie-completion.model'],
  ['@mongoose-schema/313/podsie-question-map.model', '@mongoose-schema/313/podsie/podsie-question-map.model'],
  ['@mongoose-schema/313/ramp-up-progress.model', '@mongoose-schema/313/podsie/ramp-up-progress.model'],
  ['@mongoose-schema/313/section-config.model', '@mongoose-schema/313/podsie/section-config.model'],

  // Incentives models
  ['@mongoose-schema/313/activity-type-config.model', '@mongoose-schema/313/incentives/activity-type-config.model'],
];

function updateImports(filePath, mappings) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const [oldPath, newPath] of mappings) {
    // Match both single and double quotes
    const regex = new RegExp(`(['"])${oldPath.replace(/\//g, '\\/')}\\1`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `$1${newPath}$1`);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated: ${filePath}`);
    return true;
  }
  return false;
}

function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (file !== 'node_modules' && file !== '.next') {
        findTsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Main execution
const srcDir = path.join(__dirname, '../src');
const tsFiles = findTsFiles(srcDir);

let updatedCount = 0;

tsFiles.forEach(file => {
  const zodUpdated = updateImports(file, zodMappings);
  const mongooseUpdated = updateImports(file, mongooseMappings);
  if (zodUpdated || mongooseUpdated) {
    updatedCount++;
  }
});

console.log(`\nDone! Updated ${updatedCount} files.`);
