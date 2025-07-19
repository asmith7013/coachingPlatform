import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { SummerSectionsZod } from "@schema/enum/313";

// =====================================
// LESSON CODE DEFINITIONS  
// =====================================

// Updated scope and sequence based on full curriculum
export const SCOPE_SEQUENCE = [
  // Grade 6 - Unit 2
  "G6.U2.L01", "G6.U2.L02", "G6.U2.L03", "G6.U2.L04", "G6.U2.L05", 
  "G6.U2.L06", "G6.U2.L07", "G6.U2.L08", "G6.U2.L11", "G6.U2.L12", 
  "G6.U2.L13", "G6.U2.L14", "G6.U2.L16",
  
  // Grade 6 - Unit 3
  "G6.U3.L06", "G6.U3.L07", "G6.U3.L09", "G6.U3.L10", "G6.U3.L11", 
  "G6.U3.L12", "G6.U3.L13", "G6.U3.L14", "G6.U3.L16", "G6.U3.L17",
  
  // Grade 7 - Unit 2
  "G7.U2.L02", "G7.U2.L03", "G7.U2.L04", "G7.U2.L05", "G7.U2.L06", 
  "G7.U2.L07", "G7.U2.L08", "G7.U2.L10", "G7.U2.L11", "G7.U2.L12", 
  "G7.U2.L13",
  
  // Grade 7 - Unit 6
  "G7.U6.L04", "G7.U6.L05", "G7.U6.L06", "G7.U6.L07", "G7.U6.L08", 
  "G7.U6.L09", "G7.U6.L10", "G7.U6.L11", "G7.U6.L13", "G7.U6.L14", 
  "G7.U6.L15", "G7.U6.L16",
  
  // Grade 8 - Unit 2
  "G8.U2.PR1", "G8.U2.PR2", "G8.U2.PR3", "G8.U2.L10", "G8.U2.L11", 
  "G8.U2.L12",
  
  // Grade 8 - Unit 3
  "G8.U3.L01", "G8.U3.L02", "G8.U3.L03", "G8.U3.L04", "G8.U3.L05", 
  "G8.U3.L06", "G8.U3.L07", "G8.U3.L08", "G8.U3.L09", "G8.U3.L10", 
  "G8.U3.L11", "G8.U3.L13", "G8.U3.L14",
  
  // Grade 8 - Unit 5
  "G8.U5.L01", "G8.U5.L02", "G8.U5.L03", "G8.U5.L04", "G8.U5.L05"
] as const;

export const LessonCodeZod = z.enum(SCOPE_SEQUENCE);
export type LessonCode = z.infer<typeof LessonCodeZod>;

// =====================================
// TEACHER AND SECTION ENUMS
// =====================================

// Replace the existing enum-based schemas with string schemas for flexibility
export const TeacherZod = z.string().describe("Teacher name");
export const SectionZod = SummerSectionsZod.describe("Class section identifier");

export type Teacher = z.infer<typeof TeacherZod>;
export type Section = z.infer<typeof SectionZod>;

// =====================================
// BASE COMPLETION SCHEMA
// =====================================

/**
 * Base completion fields shared by both Zearn and Snorkl completion types
 */
export const BaseCompletionFieldsSchema = z.object({
  studentIDref: z.number().int().positive().describe("Unique student identifier"),
  studentName: z.string().describe("Student's full name"),
  lessonCode: LessonCodeZod.describe("Lesson identifier from scope sequence"),
  dateOfCompletion: z.string().describe("Date when work was completed (ISO string or MM/DD/YYYY)"),
  teacher: TeacherZod.describe("Teacher name"),
  section: SectionZod.describe("Class section identifier"),
  
  // Core attempt/completion tracking
  attempted: z.boolean().default(true).describe("Whether student worked on this lesson"),
  completed: z.boolean().describe("Whether student successfully finished this lesson"),
});

// =====================================
// ZEARN COMPLETION SCHEMA
// =====================================

/**
 * Zearn-specific completion fields
 */
export const ZearnCompletionFieldsSchema = BaseCompletionFieldsSchema.extend({
  completionType: z.literal("zearn"),
  // Time only recorded if completed successfully
  timeForCompletion: z.number().int().positive().optional()
    .describe("Minutes spent to complete lesson (only if completed: true)"),
});

/**
 * Full Zearn completion schema with base document fields
 */
export const ZearnCompletionZodSchema = BaseDocumentSchema.merge(ZearnCompletionFieldsSchema);

/**
 * Input schema for creating/updating Zearn completions
 */
export const ZearnCompletionInputZodSchema = toInputSchema(ZearnCompletionZodSchema);

// =====================================
// SNORKL COMPLETION SCHEMA
// =====================================

/**
 * Individual response attempt schema - matches CSV export format
 */
export const ResponseAttemptSchema = z.object({
  attemptNumber: z.number().int().min(1).max(5).describe("Which attempt this was (1st, 2nd, 3rd, 4th, 5th)"),
  correct: z.boolean().describe("Whether the response was correct (Yes/No)"),
  explanationScore: z.number().int().min(0).max(4).describe("Explanation quality score (0-4)"),
  responseDate: z.string().describe("Date/time of response (ISO string)"),
});

/**
 * Best response summary - derived from all attempts
 */
export const BestResponseSchema = z.object({
  correct: z.boolean().describe("Whether the best response was correct"),
  explanationScore: z.number().int().min(0).max(4).describe("Best explanation score achieved"),
  responseDate: z.string().describe("Date of the best response"),
  attemptNumber: z.number().int().min(1).max(5).describe("Which attempt number was the best"),
});

/**
 * Updated Snorkl/Assessment completion fields schema
 * This replaces the simple SnorklCompletionFieldsSchema to match CSV export format
 */
export const AssessmentCompletionFieldsSchema = z.object({
  // Student identification
  studentIDref: z.number().int().positive().describe("Unique student identifier"),
  studentName: z.string().describe("Student's full name"),
  
  // Assessment identification
  assessmentQuestion: z.string().describe("Assessment question identifier (e.g., '#1')"),
  
  // Class context
  gradeLevel: z.string().describe("Grade level (e.g., '6 (Rising 7)')"),
  section: SectionZod.describe("Class section identifier"),
  
  // Assessment completion data
  attempts: z.array(ResponseAttemptSchema).min(1).max(5)
    .describe("All response attempts (1-5 attempts possible)"),
  
  bestResponse: BestResponseSchema
    .describe("Best scoring response from all attempts"),
  
  // Metadata
  dateOfCompletion: z.string().describe("Date when assessment was completed"),
  completionType: z.literal("snorkl_assessment").describe("Type identifier for assessment completions"),
  
  // Derived summary fields
  totalAttempts: z.number().int().min(1).max(5).describe("Total number of attempts made"),
  finallyCorrect: z.boolean().describe("Whether student eventually got correct answer"),
  improvementShown: z.boolean().describe("Whether explanation score improved across attempts"),
});


/**
 * Snorkl/Mastery-specific completion fields
 */
// export const SnorklCompletionFieldsSchema = BaseCompletionFieldsSchema.extend({
//   completionType: z.literal("snorkl"),
//   numberOfAttempts: z.number().int().min(1)
//     .describe("Number of attempts made (always tracked for Snorkl)"),
//   // Score only recorded if completed successfully
//   snorklScore: z.number().int().min(1).max(4).optional()
//     .describe("Final mastery score (only if completed: true)"),
// });

/**
 * Full Snorkl completion schema with base document fields
 */
export const AssessmentCompletionZodSchema = BaseDocumentSchema.merge(AssessmentCompletionFieldsSchema);

/**
 * Input schema for creating/updating Snorkl completions
 */
export const AssessmentCompletionInputZodSchema = toInputSchema(AssessmentCompletionZodSchema);

// =====================================
// UNION COMPLETION SCHEMA
// =====================================

/**
 * Discriminated union for all completion types
 */
export const LessonCompletionZodSchema = z.discriminatedUnion("completionType", [
  ZearnCompletionZodSchema,
  AssessmentCompletionZodSchema,
]);


// =====================================
// STUDENT ROSTER SCHEMA
// =====================================

/**
 * Student roster fields schema
 */
export const StudentRosterFieldsSchema = z.object({
//   studentID: z.number().int().positive().describe("Unique student identifier"),
  studentName: z.string().describe("Student's full name"),
  teacher: TeacherZod.describe("Assigned teacher"),
  section: SectionZod.describe("Class section"),
  enrollmentDate: z.string().optional().describe("Date student enrolled (ISO string)"),
  active: z.boolean().default(true).describe("Whether student is currently active"),
});

/**
 * Full student roster schema with base document fields
 */
export const StudentRosterZodSchema = BaseDocumentSchema.merge(StudentRosterFieldsSchema);

/**
 * Input schema for creating/updating student roster entries
 */
export const StudentRosterInputZodSchema = toInputSchema(StudentRosterZodSchema);

// =====================================
// DAILY CLASS EVENT SCHEMA
// =====================================

/**
 * Attendance status enum
 */
export enum AttendanceStatus {
  PRESENT = "✅",
  ABSENT = "❌", 
  PARTIAL = "🟡"
}

export const AttendanceStatusZod = z.enum([
  AttendanceStatus.PRESENT, 
  AttendanceStatus.ABSENT, 
  AttendanceStatus.PARTIAL
]);

/**
 * Daily class event fields schema - updated for Google Sheets export data
 */
export const DailyClassEventFieldsSchema = z.object({
  date: z.string().describe("Class date"),
  section: z.string().describe("Class section"), 
  teacher: z.string().describe("Teacher name"),
  studentIDref: z.number().int().positive().describe("Student identifier"),
  
  // Split name fields to match Google Sheets structure
  firstName: z.string().describe("Student first name"),
  lastName: z.string().describe("Student last name"),
  
  // Class timing and attendance
  classLengthMin: z.number().int().positive().describe("Total class length in minutes").default(60),
  attendance: AttendanceStatusZod.describe("Student attendance status"),
  classMissedMin: z.number().int().min(0).optional().describe("Minutes of class missed").default(0),
  
  // Export tracking metadata
  exportDate: z.string().optional().describe("When this data was exported"),
  exportSheet: z.string().optional().describe("Which sheet this data came from"),
  
  // Intervention tracking (keep existing)
  teacherInterventionMin: z.number().int().min(0).max(60).default(0)
    .describe("Minutes of teacher intervention provided"),
  interventionNotes: z.string().optional().describe("Notes about interventions"),
  behaviorNotes: z.string().optional().describe("Notes about student behavior"),
});

/**
 * Full daily class event schema with base document fields
 */
export const DailyClassEventZodSchema = BaseDocumentSchema.merge(DailyClassEventFieldsSchema);

/**
 * Input schema for creating/updating daily class events
 */
export const DailyClassEventInputZodSchema = toInputSchema(DailyClassEventZodSchema);

// =====================================
// TYPE EXPORTS
// =====================================

// Completion types
export type ZearnCompletion = z.infer<typeof ZearnCompletionZodSchema>;
export type AssessmentCompletion = z.infer<typeof AssessmentCompletionZodSchema>;
export type LessonCompletion = z.infer<typeof LessonCompletionZodSchema>;

// Input types
export type ZearnCompletionInput = z.infer<typeof ZearnCompletionInputZodSchema>;
export type AssessmentCompletionInput = z.infer<typeof AssessmentCompletionInputZodSchema>;

// Other entity types
export type StudentRoster = z.infer<typeof StudentRosterZodSchema>;
export type StudentRosterInput = z.infer<typeof StudentRosterInputZodSchema>;

export type DailyClassEvent = z.infer<typeof DailyClassEventZodSchema>;
export type DailyClassEventInput = z.infer<typeof DailyClassEventInputZodSchema>;

// Attendance type
export type AttendanceStatusType = z.infer<typeof AttendanceStatusZod>;

// =====================================
// DEFAULT VALUE CREATORS
// =====================================

/**
 * Create default values for Zearn completion input
 */
export function createZearnCompletionDefaults(overrides: Partial<ZearnCompletionInput> = {}): ZearnCompletionInput {
  return {
    studentIDref: 0,
    studentName: "",
    lessonCode: "U3.L1",
    dateOfCompletion: new Date().toISOString(),
    teacher: "",
    section: "",
    attempted: true,
    completed: false,
    completionType: "zearn",
    ownerIds: [],
    ...overrides
  };
}

/**
 * Create default values for Snorkl completion input
 */
export function createAssessmentCompletionDefaults(overrides: Partial<AssessmentCompletionInput> = {}): AssessmentCompletionInput {
  return {
    studentIDref: 0,
    studentName: "",
    lessonCode: "U3.L1",
    dateOfCompletion: new Date().toISOString(),
    teacher: "",
    section: "",
    attempted: true,
    completed: false,
    completionType: "snorkl",
    numberOfAttempts: 1,
    ownerIds: [],
    ...overrides
  };
}

/**
 * Create default values for daily class event input
 */
export function createDailyClassEventDefaults(overrides: Partial<DailyClassEventInput> = {}): DailyClassEventInput {
  const today = new Date();
  const dateString = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
  
  return {
    date: dateString,
    studentIDref: 0,
    firstName: "",
    lastName: "",
    teacher: "",
    section: "",
    classLengthMin: 60,
    attendance: AttendanceStatus.PRESENT,
    teacherInterventionMin: 0,
    ownerIds: [],
    ...overrides
  };
}