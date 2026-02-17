import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from "@zod-schema/base-schemas";
import { AllSectionsZod, TeachersZod, SchoolsZod } from "@schema/enum/scm";

// =====================================
// STUDENT ACTIVITY SCHEMA
// =====================================

/**
 * Individual activity event schema
 */
export const StudentActivitySchema = z.object({
  date: z.string().describe("Activity date (ISO format)"),
  activityType: z
    .string()
    .describe("Activity type ID (e.g., 'inquiry-activity')"),
  activityLabel: z
    .string()
    .describe("Activity display name (e.g., 'Inquiry Activity')"),

  // Optional context fields based on detailType
  unitId: z
    .string()
    .optional()
    .describe("Unit ID if activity is unit-specific"),
  moduleId: z.string().optional().describe("Podsie module ID (maps to unitId)"),
  lessonId: z
    .string()
    .optional()
    .describe("Lesson ID from scope-and-sequence (for acceleration)"),
  skillId: z
    .string()
    .optional()
    .describe("Skill number from roadmaps-lesson (for prerequisite)"),
  smallGroupType: z
    .enum(["mastery", "prerequisite"])
    .optional()
    .describe("Small group type - mastery check or prerequisite skill"),
  inquiryQuestion: z
    .string()
    .optional()
    .describe("Inquiry question (e.g., 'Section A Checkpoint - Question 1')"),
  customDetail: z.string().optional().describe("Custom detail text"),

  loggedBy: z
    .string()
    .optional()
    .describe("Teacher ID or name who logged this"),
  createdAt: z.string().optional().describe("When activity was logged"),
});

// =====================================
// SKILL PERFORMANCE SCHEMA
// =====================================

/**
 * Individual skill attempt
 */
export const SkillAttemptSchema = z.object({
  attemptNumber: z
    .number()
    .int()
    .positive()
    .describe("Attempt number for this skill"),
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

  status: z
    .enum(["Not Started", "Attempted But Not Mastered", "Mastered"])
    .describe("Current mastery status"),

  // Attempt history
  attempts: z
    .array(SkillAttemptSchema)
    .default([])
    .describe("All attempts for this skill"),

  // Summary fields
  bestScore: z
    .string()
    .optional()
    .describe("Best score achieved (e.g., '80%')"),
  attemptCount: z
    .number()
    .int()
    .default(0)
    .describe("Total number of attempts"),
  masteredDate: z
    .string()
    .optional()
    .describe("Date when skill was first mastered (ISO format)"),
  lastAttemptDate: z
    .string()
    .optional()
    .describe("Date of most recent attempt (ISO format)"),

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
  lessonCode: z
    .string()
    .describe("Lesson code in format 'G8 M2 L1' (Grade Module Lesson)"),
  completionDate: z
    .string()
    .describe("Date completed (ISO format or MM/DD/YY)"),
});

// =====================================
// PODSIE PROGRESS SCHEMA
// =====================================

/**
 * Individual Podsie question completion
 */
export const PodsieQuestionSchema = z.object({
  questionNumber: z
    .number()
    .int()
    .positive()
    .describe("Question number (1-indexed)"),
  completed: z
    .boolean()
    .default(false)
    .describe("Whether question was answered correctly"),
  completedAt: z
    .string()
    .optional()
    .describe("When question was completed (ISO format)"),
  // AI Analysis fields (scored 0-3)
  correctScore: z
    .number()
    .int()
    .min(0)
    .max(1)
    .optional()
    .describe("Answer correctness: 0 (incorrect) or 1 (correct)"),
  explanationScore: z
    .number()
    .int()
    .min(1)
    .max(3)
    .optional()
    .describe("Explanation quality: 1 (none), 2 (partial), or 3 (full)"),
});

/**
 * Activity type enum - differentiates between different Podsie activity types
 */
export const PodsieActivityTypeSchema = z
  .enum([
    "sidekick", // Podsie Sidekick lesson activities (warm-up, activities, cool-down)
    "mastery-check", // Mastery/summative assessment
    "ramp-up", // Ramp-up/prerequisite practice
  ])
  .describe("Type of Podsie activity");

export type PodsieActivityType = z.infer<typeof PodsieActivityTypeSchema>;

/**
 * Progress on a single Podsie assignment for a lesson
 *
 * NEW STRUCTURE (prevents duplicates):
 * - Primary keys: scopeAndSequenceId + podsieAssignmentId
 * - Each unique Podsie assignment appears only once
 * - Multiple activities for same lesson have different podsieAssignmentIds
 */
export const PodsieProgressSchema = z.object({
  // =====================================
  // PRIMARY KEYS
  // =====================================

  scopeAndSequenceId: z
    .string()
    .describe(
      "MongoDB ObjectId reference to scope-and-sequence document - provides unambiguous link to exact lesson",
    ),
  podsieAssignmentId: z
    .string()
    .describe(
      "Podsie assignment ID - unique identifier for this specific activity",
    ),

  // =====================================
  // DENORMALIZED FIELDS (from scope-and-sequence)
  // =====================================

  unitCode: z.string().describe("Denormalized: Unit code (e.g., '8.4')"),
  rampUpId: z
    .string()
    .describe("Denormalized: Ramp-up identifier (e.g., '4.RU1')"),
  rampUpName: z
    .string()
    .optional()
    .describe("Denormalized: Ramp-up name for display"),

  // =====================================
  // ACTIVITY TYPE
  // =====================================

  activityType: PodsieActivityTypeSchema.optional().describe(
    "Type of Podsie activity",
  ),

  // =====================================
  // PROGRESS DATA
  // =====================================

  questions: z
    .array(PodsieQuestionSchema)
    .default([])
    .describe("Per-question completion status"),
  totalQuestions: z
    .number()
    .int()
    .default(0)
    .describe("Total questions in this assignment"),
  completedCount: z
    .number()
    .int()
    .default(0)
    .describe("Number of questions completed"),
  percentComplete: z.number().default(0).describe("Completion percentage"),
  isFullyComplete: z
    .boolean()
    .default(false)
    .describe("Whether all questions completed"),
  fullyCompletedDate: z
    .string()
    .optional()
    .describe("Date when assignment was fully completed (ISO format)"),

  lastSyncedAt: z.string().optional().describe("Last Podsie sync timestamp"),
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

  school: SchoolsZod.describe("School identifier (IS313, PS19, or X644)"),
  section: AllSectionsZod.describe("Class section identifier"),
  teacher: TeachersZod.describe("Assigned teacher").optional(),

  gradeLevel: z.string().describe("Current grade level (e.g., '6'").optional(),
  //   subject: z.string().min(1).describe("Subject area"),
  email: z.string().email().describe("Student email address"),
  active: z
    .boolean()
    .default(true)
    .describe("Whether student is currently active"),
  masteredSkills: z
    .array(z.string())
    .default([])
    .describe("Array of skill numbers that the student has mastered"),
  classActivities: z
    .array(StudentActivitySchema)
    .default([])
    .describe("Array of classroom activity events"),

  // Assessment/skill performance tracking
  skillPerformances: z
    .array(SkillPerformanceSchema)
    .default([])
    .describe("Array of skill performance data with attempt history"),
  lastAssessmentDate: z
    .string()
    .optional()
    .describe("Date of most recent assessment update (ISO format)"),

  // Zearn lesson completions
  zearnLessons: z
    .array(ZearnLessonCompletionSchema)
    .default([])
    .describe("Array of completed Zearn lessons with dates"),

  // Podsie progress tracking (all activity types: sidekick, mastery-check, ramp-up)
  podsieProgress: z
    .array(PodsieProgressSchema)
    .default([])
    .describe("Array of Podsie assignment progress across all activity types"),
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
export type PodsieQuestion = z.infer<typeof PodsieQuestionSchema>;
export type PodsieProgress = z.infer<typeof PodsieProgressSchema>;
export type Student = z.infer<typeof StudentZodSchema>;
export type StudentInput = z.infer<typeof StudentInputZodSchema>;

// Legacy type aliases for backwards compatibility
/** @deprecated Use PodsieQuestion instead */
export type RampUpQuestion = PodsieQuestion;
/** @deprecated Use PodsieProgress instead */
export type RampUpProgress = PodsieProgress;

// =====================================
// DEFAULT VALUE CREATORS
// =====================================

/**
 * Create default values for student input
 */
export function createStudentDefaults(
  overrides: Partial<StudentInput> = {},
): StudentInput {
  return {
    studentID: 0,
    firstName: "",
    lastName: "",
    school: "IS313",
    section: "",
    gradeLevel: "",
    email: "",
    active: true,
    masteredSkills: [],
    classActivities: [],
    skillPerformances: [],
    zearnLessons: [],
    podsieProgress: [],
    ownerIds: [],
    ...overrides,
  };
}
