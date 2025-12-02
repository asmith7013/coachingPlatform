// Debug script to simulate the exact query for section 803, Unit 3
const scopeSequenceTag = "Grade 8";
const unitNumber = 3;

print('\n=== SIMULATING FETCHRAMPUPSBYUNIT ===');
print('Query parameters:');
print('  scopeSequenceTag:', scopeSequenceTag);
print('  unitNumber:', unitNumber);

const query = {
  scopeSequenceTag: scopeSequenceTag,
  unitNumber: unitNumber
};

print('\nExecuting query...');
const lessons = db['scope-and-sequence']
  .find(query)
  .sort({ section: 1, lessonNumber: 1, unitLessonId: 1 })
  .toArray();

print('\nResults:', lessons.length, 'lessons found');
lessons.forEach(lesson => {
  print('\n  Lesson:', lesson.unitLessonId);
  print('    Name:', lesson.lessonName);
  print('    Section:', lesson.section);
  print('    Tag:', lesson.scopeSequenceTag);
});

print('\n=== SIMULATING SECTION-CONFIG ASSIGNMENTS ===');
const config = db['section-configs'].findOne({ school: 'IS313', classSection: '803' });
const unit3Assignments = config.podsieAssignments.filter(a =>
  a.unitLessonId && a.unitLessonId.toString().startsWith('3.')
);

print('Unit 3 assignments in 803 config:', unit3Assignments.length);
unit3Assignments.forEach(a => {
  print('  ', a.unitLessonId, '-', a.lessonName);
});

print('\n=== SIMULATING FILTERING LOGIC ===');
print('Matching lessons to assignments...');

const lessonsWithAssignments = lessons.filter(lesson => {
  const match = unit3Assignments.some(a =>
    a.unitLessonId === lesson.unitLessonId &&
    a.lessonName === lesson.lessonName
  );
  if (match) {
    print('  ✓ Matched:', lesson.unitLessonId, '-', lesson.lessonName, '- Section:', lesson.section);
  }
  return match;
});

print('\nLessons with matching assignments:', lessonsWithAssignments.length);

const uniqueSections = [...new Set(lessonsWithAssignments.map(lesson => lesson.section).filter(Boolean))];
print('\nUnique sections for dropdown:', JSON.stringify(uniqueSections));
