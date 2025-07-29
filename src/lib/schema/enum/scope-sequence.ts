import { z } from "zod";

/**
 * Grade 6 Summer Rising Scope and Sequence
 */
export const Grade6LessonsZod = z.enum([
  "G6 U2 L01",
  "G6 U2 L02", 
  "G6 U2 L03",
  "G6 U2 L04",
  "G6 U2 L05",
  "G6 U2 L06",
  "G6 U2 L07",
  "G6 U2 L08",
  "G6 U2 L11",
  "G6 U2 L12",
  "G6 U2 L13",
  "G6 U2 L14",
  "G6 U2 L16",
  "G6 U3 L06",
  "G6 U3 L07",
  "G6 U3 L09",
  "G6 U3 L10",
  "G6 U3 L11",
  "G6 U3 L12",
  "G6 U3 L13",
  "G6 U3 L14",
  "G6 U3 L16",
  "G6 U3 L17"
]);

/**
 * Grade 7 Summer Rising Scope and Sequence
 */
export const Grade7LessonsZod = z.enum([
  "G7 U2 L02",
  "G7 U2 L03",
  "G7 U2 L04",
  "G7 U2 L05",
  "G7 U2 L06",
  "G7 U2 L07",
  "G7 U2 L08",
  "G7 U2 L10",
  "G7 U2 L11",
  "G7 U2 L12",
  "G7 U2 L13",
  "G7 U6 L04",
  "G7 U6 L05",
  "G7 U6 L06",
  "G7 U6 L07",
  "G7 U6 L08",
  "G7 U6 L09",
  "G7 U6 L10",
  "G7 U6 L11",
  "G7 U6 L13",
  "G7 U6 L14",
  "G7 U6 L15",
  "G7 U6 L16"
]);

/**
 * Grade 8 Summer Rising Scope and Sequence
 */
export const Grade8LessonsZod = z.enum([
  "G8 U2 L10",
  "G8 U2 L11",
  "G8 U2 L12",
  "G8 U3 L01",
  "G8 U3 L02",
  "G8 U3 L03",
  "G8 U3 L04",
  "G8 U3 L05",
  "G8 U3 L06",
  "G8 U3 L07",
  "G8 U3 L08",
  "G8 U3 L09",
  "G8 U3 L10",
  "G8 U3 L11",
  "G8 U3 L13",
  "G8 U3 L14",
  "G8 U5 L01",
  "G8 U5 L02",
  "G8 U5 L03",
  "G8 U5 L04",
  "G8 U5 L05"
]);

/**
 * Union of all lessons across grades
 */
export const AllLessonsZod = z.union([Grade6LessonsZod, Grade7LessonsZod, Grade8LessonsZod]);

/**
 * Grade level enum
 */
export const GradeLevelZod = z.enum(["6", "7", "8"]);

// Type exports
export type Grade6Lessons = z.infer<typeof Grade6LessonsZod>;
export type Grade7Lessons = z.infer<typeof Grade7LessonsZod>;
export type Grade8Lessons = z.infer<typeof Grade8LessonsZod>;
export type AllLessons = z.infer<typeof AllLessonsZod>;
export type GradeLevel = z.infer<typeof GradeLevelZod>;

/**
 * Get lessons for a specific grade
 */
export function getLessonsForGrade(grade: GradeLevel): string[] {
  switch (grade) {
    case "6":
      return Grade6LessonsZod.options;
    case "7":
      return Grade7LessonsZod.options;
    case "8":
      return Grade8LessonsZod.options;
    default:
      return [];
  }
}

/**
 * Determine grade level from lesson code
 */
export function getGradeFromLesson(lesson: string): GradeLevel | null {
  if (lesson.startsWith("G6")) return "6";
  if (lesson.startsWith("G7")) return "7";
  if (lesson.startsWith("G8")) return "8";
  return null;
}

/**
 * Validate if lesson belongs to specific grade
 */
export function isLessonForGrade(lesson: string, grade: GradeLevel): boolean {
  const lessonsForGrade = getLessonsForGrade(grade);
  return lessonsForGrade.includes(lesson);
}

/**
 * Calculate progress statistics for a grade
 */
export interface ProgressStats {
  completed: number;
  total: number;
  percentage: number;
  remaining: string[];
  completedLessons: string[];
}

export function calculateProgress(
  completedLessons: string[], 
  grade: GradeLevel
): ProgressStats {
  const allLessons = getLessonsForGrade(grade);
  const gradeCompletedLessons = completedLessons.filter(lesson => 
    isLessonForGrade(lesson, grade)
  );
  
  const completed = gradeCompletedLessons.length;
  const total = allLessons.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const remaining = allLessons.filter(lesson => 
    !gradeCompletedLessons.includes(lesson)
  );
  
  return {
    completed,
    total,
    percentage,
    remaining,
    completedLessons: gradeCompletedLessons
  };
} 