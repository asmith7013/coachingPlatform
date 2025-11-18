import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { Sections313Zod, Teachers313Zod } from "@schema/enum/313";

// =====================================
// STUDENT ACTIVITY SCHEMA
// =====================================

/**
 * Individual activity event schema
 */
export const StudentActivitySchema = z.object({
  date: z.string().describe("Activity date (ISO format)"),
  activityType: z.string().describe("Activity type ID (e.g., 'inquiry-activity')"),
  activityLabel: z.string().describe("Activity display name (e.g., 'Inquiry Activity')"),

  // Optional context fields based on detailType
  unitId: z.string().optional().describe("Unit ID if activity is unit-specific"),
  lessonId: z.string().optional().describe("Lesson ID from scope-and-sequence (for acceleration)"),
  skillId: z.string().optional().describe("Skill number from roadmaps-lesson (for prerequisite)"),
  inquiryQuestion: z.string().optional().describe("Inquiry question (e.g., 'Section A Checkpoint - Question 1')"),
  customDetail: z.string().optional().describe("Custom detail text"),

  loggedBy: z.string().optional().describe("Teacher ID or name who logged this"),
  createdAt: z.string().optional().describe("When activity was logged"),
});

// =====================================
// SKILL PERFORMANCE SCHEMA
// =====================================

/**
 * Individual skill attempt
 */
export const SkillAttemptSchema = z.object({
  attemptNumber: z.number().int().positive().describe("Attempt number for this skill"),
  dateCompleted: z.string().describe("Date of attempt (ISO format)"),
  score: z.string().describe("Score as percentage string (e.g., '80%')"),
  passed: z.boolean().describe("Whether this attempt passed (typically 80%+)"),
});

/**
 * Skill performance tracking
 */
export const SkillPerformanceSchema = z.object({
  skillCode: z.string().describe("Skill code/number"),
  skillName: z.string().describe("Skill name"),
  skillGrade: z.string().optional().describe("Grade level for this skill"),
  unit: z.string().optional().describe("Unit name this skill belongs to"),
  standards: z.string().optional().describe("Standards covered by this skill"),

  status: z.enum(["Not Started", "Attempted But Not Mastered", "Mastered"]).describe("Current mastery status"),

  // Attempt history
  attempts: z.array(SkillAttemptSchema).default([]).describe("All attempts for this skill"),

  // Summary fields
  bestScore: z.string().optional().describe("Best score achieved (e.g., '80%')"),
  attemptCount: z.number().int().default(0).describe("Total number of attempts"),
  masteredDate: z.string().optional().describe("Date when skill was first mastered (ISO format)"),
  lastAttemptDate: z.string().optional().describe("Date of most recent attempt (ISO format)"),

  // Legacy fields for backward compatibility
  score: z.string().optional().describe("Legacy: best score"),
  lastUpdated: z.string().optional().describe("Legacy: last attempt date"),
});

// =====================================
// ZEARN LESSON COMPLETION SCHEMA
// =====================================

/**
 * Individual Zearn lesson completion
 */
export const ZearnLessonCompletionSchema = z.object({
  lessonCode: z.string().describe("Lesson code in format 'G8 M2 L1' (Grade Module Lesson)"),
  completionDate: z.string().describe("Date completed (ISO format or MM/DD/YY)"),
});

// =====================================
// STUDENT SCHEMA
// =====================================

/**
 * Student fields schema - core student information
 */
export const StudentFieldsSchema = z.object({
  studentID: z.number().int().positive().describe("Unique student identifier"),
  firstName: z.string().describe("Student's first name"),
  lastName: z.string().describe("Student's last name"),

  // ✅ Keep enum validation but expect string instead of array
  section: Sections313Zod.describe("Class section identifier"),
  teacher: Teachers313Zod.describe("Assigned teacher").optional(),

  gradeLevel: z.string().describe("Current grade level (e.g., '6'").optional(),
//   subject: z.string().min(1).describe("Subject area"),
  email: z.email().optional().describe("Student email address").optional(),
  active: z.boolean().default(true).describe("Whether student is currently active"),
  masteredSkills: z.array(z.string()).default([]).describe("Array of skill numbers that the student has mastered"),
  classActivities: z.array(StudentActivitySchema).default([]).describe("Array of classroom activity events"),

  // Assessment/skill performance tracking
  skillPerformances: z.array(SkillPerformanceSchema).default([]).describe("Array of skill performance data with attempt history"),
  lastAssessmentDate: z.string().optional().describe("Date of most recent assessment update (ISO format)"),

  // Zearn lesson completions
  zearnLessons: z.array(ZearnLessonCompletionSchema).default([]).describe("Array of completed Zearn lessons with dates"),
});

/**
 * Full student schema with base document fields
 */
export const StudentZodSchema = BaseDocumentSchema.merge(StudentFieldsSchema);

/**
 * Input schema for creating/updating students
 */
export const StudentInputZodSchema = toInputSchema(StudentZodSchema);

// =====================================
// TYPE EXPORTS
// =====================================

export type StudentActivity = z.infer<typeof StudentActivitySchema>;
export type SkillAttempt = z.infer<typeof SkillAttemptSchema>;
export type SkillPerformance = z.infer<typeof SkillPerformanceSchema>;
export type ZearnLessonCompletion = z.infer<typeof ZearnLessonCompletionSchema>;
export type Student = z.infer<typeof StudentZodSchema>;
export type StudentInput = z.infer<typeof StudentInputZodSchema>;

// =====================================
// DEFAULT VALUE CREATORS
// =====================================

/**
 * Create default values for student input
 */
export function createStudentDefaults(overrides: Partial<StudentInput> = {}): StudentInput {
  return {
    studentID: 0,
    firstName: "",
    lastName: "",
    section: "",
    gradeLevel: "",
    active: true,
    masteredSkills: [],
    classActivities: [],
    skillPerformances: [],
    zearnLessons: [],
    ownerIds: [],
    ...overrides
  };
}


