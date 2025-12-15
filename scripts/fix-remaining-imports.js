/**
 * Fix remaining imports that weren't caught by the first pass
 */

const fs = require('fs');
const path = require('path');

const fixes = [
  // Student model paths (no subfolder in path, but now in student/ subfolder)
  ['@/lib/schema/mongoose-schema/scm/student.model', '@/lib/schema/mongoose-schema/scm/student/student.model'],
  ['@mongoose-schema/scm/student.model', '@mongoose-schema/scm/student/student.model'],
  ['../src/lib/schema/mongoose-schema/scm/student.model', '../src/lib/schema/mongoose-schema/scm/student/student.model'],

  // Section config model
  ['@mongoose-schema/scm/section-config.model', '@mongoose-schema/scm/podsie/section-config.model'],

  // Roadmaps student data model
  ['@/lib/schema/mongoose-schema/scm/roadmaps-student-data.model', '@/lib/schema/mongoose-schema/scm/student/roadmaps-student-data.model'],

  // Scope and sequence model
  ['../src/lib/schema/mongoose-schema/scm/scope-and-sequence.model', '../src/lib/schema/mongoose-schema/scm/curriculum/scope-and-sequence.model'],

  // Student data zod schema
  ['@/lib/schema/zod-schema/scm/student-data', '@/lib/schema/zod-schema/scm/student/student-data'],

  // Student zod schema (main schema)
  ['@/lib/schema/zod-schema/scm/student', '@/lib/schema/zod-schema/scm/student/student'],
  ['@zod-schema/scm/student', '@zod-schema/scm/student/student'],

  // Index file reference
  ['./313/student-performance', './313/student/student-performance'],
];

function updateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const [oldPath, newPath] of fixes) {
    const regex = new RegExp(`(['"])${oldPath.replace(/\//g, '\\/')}\\1`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `$1${newPath}$1`);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed: ${filePath}`);
    return true;
  }
  return false;
}

// Files mentioned in errors
const filesToFix = [
  'scripts/add-students.ts',
  'scripts/create-section-configs.ts',
  'scripts/db/drop-studentidref-index.ts',
  'scripts/delete-all-students.ts',
  'scripts/migrate-lesson-naming.ts',
  'scripts/update-unit-8-4-podsie-data.ts',
  'scripts/migrate-assessment-status.ts',
  'src/app/actions/313/podsie-sync.legacy.ts',
  'src/app/actions/313/roadmaps-student-data.ts',
  'src/app/actions/313/student-assessments.ts',
  'src/app/actions/313/student-data.ts',
  'src/app/scm/roadmaps/assessment-scraper/actions/update-student-data.ts',
  'src/components/features/313/studentDashboard/AttendanceOverview.tsx',
  'src/components/features/313/studentDashboard/CombinedLessonProgress.tsx',
  'src/components/features/313/studentDashboard/PreAssessmentData.tsx',
  'src/components/features/313/studentDashboard/ScopeSequenceProgress.tsx',
  'src/components/features/313/studentDashboard/StudentDashboard.tsx',
  'src/components/features/313/studentDashboard/ZearnProgress.tsx',
  'src/hooks/domain/313/useCombinedLessonData.ts',
  'src/hooks/domain/313/useStudentCalendarData.ts',
  'src/hooks/domain/313/useStudentData.ts',
  'src/hooks/domain/313/useStudents.ts',
  'src/lib/schema/zod-schema/index.ts',
  'src/app/313/snorkl-import/page.tsx',
  'src/app/313/snorkl-import/types.ts',
  'src/app/313/snorkl-import/utils/fuzzy-matcher.ts',
  'src/app/313/snorkl-import/utils/parser.ts',
  'src/app/313/students/page.tsx',
  'src/components/integrations/zearn/hooks/useZearnBatchData.ts',
];

let fixedCount = 0;
const baseDir = path.join(__dirname, '..');

filesToFix.forEach(file => {
  const filePath = path.join(baseDir, file);
  if (updateFile(filePath)) {
    fixedCount++;
  }
});

console.log(`\nFixed ${fixedCount} files.`);
