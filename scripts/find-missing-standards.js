// Script to find lessons with mismatched standards between Grade 8 and Algebra 1

// Get all Grade 8 lessons (scope tag = Grade 8)
const grade8Lessons = db["scope-and-sequence"].find({
  scopeSequenceTag: "Grade 8"
}).toArray();

// Get all Algebra 1 lessons where grade is "8" (Grade 8 prereqs in Algebra 1)
const alg1Grade8Lessons = db["scope-and-sequence"].find({
  scopeSequenceTag: "Algebra 1",
  grade: "8"
}).toArray();

print("Grade 8 (scopeSequenceTag) lessons:", grade8Lessons.length);
print("Algebra 1 lessons with grade=8:", alg1Grade8Lessons.length);
print("");

// Create a map of Grade 8 lessons by unitNumber + lessonNumber
const grade8Map = new Map();
for (const lesson of grade8Lessons) {
  const key = lesson.unitNumber + "-" + lesson.lessonNumber;
  grade8Map.set(key, lesson);
}

// Find matches and check standards
let matchesWithMissingStandards = [];
let matchesBothHaveStandards = [];
let matchesBothNoStandards = [];
let noMatchInGrade8 = [];

for (const alg1Lesson of alg1Grade8Lessons) {
  const key = alg1Lesson.unitNumber + "-" + alg1Lesson.lessonNumber;
  const grade8Lesson = grade8Map.get(key);

  if (grade8Lesson) {
    const alg1HasStandards = alg1Lesson.standards && alg1Lesson.standards.length > 0;
    const grade8HasStandards = grade8Lesson.standards && grade8Lesson.standards.length > 0;

    if (alg1HasStandards && !grade8HasStandards) {
      matchesWithMissingStandards.push({
        unitNumber: alg1Lesson.unitNumber,
        lessonNumber: alg1Lesson.lessonNumber,
        lessonName: alg1Lesson.lessonName || alg1Lesson.lessonTitle,
        sourceHasStandards: "Algebra 1",
        targetMissingStandards: "Grade 8",
        standardsCount: alg1Lesson.standards.length,
        sourceId: alg1Lesson._id.toString(),
        targetId: grade8Lesson._id.toString()
      });
    } else if (!alg1HasStandards && grade8HasStandards) {
      matchesWithMissingStandards.push({
        unitNumber: alg1Lesson.unitNumber,
        lessonNumber: alg1Lesson.lessonNumber,
        lessonName: alg1Lesson.lessonName || alg1Lesson.lessonTitle,
        sourceHasStandards: "Grade 8",
        targetMissingStandards: "Algebra 1",
        standardsCount: grade8Lesson.standards.length,
        sourceId: grade8Lesson._id.toString(),
        targetId: alg1Lesson._id.toString()
      });
    } else if (alg1HasStandards && grade8HasStandards) {
      matchesBothHaveStandards.push({
        unitNumber: alg1Lesson.unitNumber,
        lessonNumber: alg1Lesson.lessonNumber,
        lessonName: alg1Lesson.lessonName
      });
    } else {
      matchesBothNoStandards.push({
        unitNumber: alg1Lesson.unitNumber,
        lessonNumber: alg1Lesson.lessonNumber,
        lessonName: alg1Lesson.lessonName
      });
    }
  } else {
    noMatchInGrade8.push({
      unitNumber: alg1Lesson.unitNumber,
      lessonNumber: alg1Lesson.lessonNumber,
      lessonName: alg1Lesson.lessonName
    });
  }
}

print("=== LESSONS WITH MISMATCHED STANDARDS ===");
print("Found " + matchesWithMissingStandards.length + " lessons where one has standards and the other does not:");
print("");

for (const m of matchesWithMissingStandards) {
  print("Unit " + m.unitNumber + ", Lesson " + m.lessonNumber + ": " + m.lessonName);
  print("  Has standards in: " + m.sourceHasStandards + " (" + m.standardsCount + " standards)");
  print("  Missing standards in: " + m.targetMissingStandards);
  print("  Source ID: " + m.sourceId);
  print("  Target ID (needs update): " + m.targetId);
  print("");
}

print("");
print("=== SUMMARY ===");
print("Lessons with MISMATCHED standards (need copying): " + matchesWithMissingStandards.length);
print("Lessons with standards in BOTH: " + matchesBothHaveStandards.length);
print("Lessons with standards in NEITHER: " + matchesBothNoStandards.length);
print("Algebra 1 (grade=8) lessons NOT in Grade 8 scope: " + noMatchInGrade8.length);

// Output JSON for programmatic use
print("");
print("=== JSON OUTPUT FOR UPDATE SCRIPT ===");
printjson(matchesWithMissingStandards);
