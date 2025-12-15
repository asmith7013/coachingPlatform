/**
 * Script to update import paths for reorganized 313 schemas
 *
 * Zod schema mapping:
 * - @zod-schema/scm/student -> @zod-schema/scm/student/student
 * - @zod-schema/scm/student-activity -> @zod-schema/scm/student/student-activity
 * - @zod-schema/scm/student-performance -> @zod-schema/scm/student/student-performance
 * - @zod-schema/scm/student-data -> @zod-schema/scm/student/student-data
 * - @zod-schema/scm/roadmaps-student-data -> @zod-schema/scm/student/roadmaps-student-data
 * - @zod-schema/scm/roadmap -> @zod-schema/scm/curriculum/roadmap
 * - @zod-schema/scm/roadmap-skill -> @zod-schema/scm/curriculum/roadmap-skill
 * - @zod-schema/scm/roadmap-unit -> @zod-schema/scm/curriculum/roadmap-unit
 * - @zod-schema/scm/scope-and-sequence -> @zod-schema/scm/curriculum/scope-and-sequence
 * - @zod-schema/scm/podsie-completion -> @zod-schema/scm/podsie/podsie-completion
 * - @zod-schema/scm/podsie-question-map -> @zod-schema/scm/podsie/podsie-question-map
 * - @zod-schema/scm/podsie-response -> @zod-schema/scm/podsie/podsie-response
 * - @zod-schema/scm/ramp-up-progress -> @zod-schema/scm/podsie/ramp-up-progress
 * - @zod-schema/scm/section-config -> @zod-schema/scm/podsie/section-config
 * - @zod-schema/scm/activity-type-config -> @zod-schema/scm/incentives/activity-type-config
 *
 * Mongoose schema mapping (same pattern with @mongoose-schema prefix and .model suffix):
 * - @mongoose-schema/scm/student -> @mongoose-schema/scm/student/student.model
 * - etc.
 */

const fs = require('fs');
const path = require('path');

// Map of old paths to new paths (order matters - more specific first)
const zodMappings = [
  // Student schemas
  ['@zod-schema/scm/student-activity', '@zod-schema/scm/student/student-activity'],
  ['@zod-schema/scm/student-performance', '@zod-schema/scm/student/student-performance'],
  ['@zod-schema/scm/student-data', '@zod-schema/scm/student/student-data'],
  ['@zod-schema/scm/roadmaps-student-data', '@zod-schema/scm/student/roadmaps-student-data'],
  ['@zod-schema/scm/student', '@zod-schema/scm/student/student'],

  // Curriculum schemas
  ['@zod-schema/scm/roadmap-skill', '@zod-schema/scm/curriculum/roadmap-skill'],
  ['@zod-schema/scm/roadmap-unit', '@zod-schema/scm/curriculum/roadmap-unit'],
  ['@zod-schema/scm/roadmap', '@zod-schema/scm/curriculum/roadmap'],
  ['@zod-schema/scm/scope-and-sequence', '@zod-schema/scm/curriculum/scope-and-sequence'],

  // Podsie schemas
  ['@zod-schema/scm/podsie-completion', '@zod-schema/scm/podsie/podsie-completion'],
  ['@zod-schema/scm/podsie-question-map', '@zod-schema/scm/podsie/podsie-question-map'],
  ['@zod-schema/scm/podsie-response', '@zod-schema/scm/podsie/podsie-response'],
  ['@zod-schema/scm/ramp-up-progress', '@zod-schema/scm/podsie/ramp-up-progress'],
  ['@zod-schema/scm/section-config', '@zod-schema/scm/podsie/section-config'],

  // Incentives schemas
  ['@zod-schema/scm/activity-type-config', '@zod-schema/scm/incentives/activity-type-config'],
];

const mongooseMappings = [
  // Student models
  ['@mongoose-schema/scm/student-activity.model', '@mongoose-schema/scm/student/student-activity.model'],
  ['@mongoose-schema/scm/student-performance.model', '@mongoose-schema/scm/student/student-performance.model'],
  ['@mongoose-schema/scm/roadmaps-student-data.model', '@mongoose-schema/scm/student/roadmaps-student-data.model'],
  ['@mongoose-schema/scm/student.model', '@mongoose-schema/scm/student/student.model'],

  // Curriculum models
  ['@mongoose-schema/scm/roadmap-skill.model', '@mongoose-schema/scm/curriculum/roadmap-skill.model'],
  ['@mongoose-schema/scm/roadmap-unit.model', '@mongoose-schema/scm/curriculum/roadmap-unit.model'],
  ['@mongoose-schema/scm/roadmap.model', '@mongoose-schema/scm/curriculum/roadmap.model'],
  ['@mongoose-schema/scm/scope-and-sequence.model', '@mongoose-schema/scm/curriculum/scope-and-sequence.model'],

  // Podsie models
  ['@mongoose-schema/scm/podsie-completion.model', '@mongoose-schema/scm/podsie/podsie-completion.model'],
  ['@mongoose-schema/scm/podsie-question-map.model', '@mongoose-schema/scm/podsie/podsie-question-map.model'],
  ['@mongoose-schema/scm/ramp-up-progress.model', '@mongoose-schema/scm/podsie/ramp-up-progress.model'],
  ['@mongoose-schema/scm/section-config.model', '@mongoose-schema/scm/podsie/section-config.model'],

  // Incentives models
  ['@mongoose-schema/scm/activity-type-config.model', '@mongoose-schema/scm/incentives/activity-type-config.model'],
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
