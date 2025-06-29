import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';

// =====================================
// LESSON CODE DEFINITIONS  
// =====================================

export const SCOPE_SEQUENCE = [
  "U2.L10", "U2.L11", "U2.L12", "U3.L1", "U3.L2", "U3.L3", "U3.L4", 
  "U3.L5", "U3.L6", "U3.L7", "U3.L8", "U3.L9", "U3.L10", "U3.L11", 
  "U3.L13", "U3.L14", "U5.L1", "U5.L2", "U5.L3", "U5.L4", "U5.L5"
] as const;

export const LessonCodeZod = z.enum(SCOPE_SEQUENCE);
export type LessonCode = z.infer<typeof LessonCodeZod>;

// =====================================
// TEACHER AND SECTION ENUMS
// =====================================

export enum Teachers {
  ISAAC = "Isaac",
  SCERRA = "Scerra"
}

export enum Sections {
  SECTION_601 = "601",
  SECTION_802 = "802"
}

export const TeacherZod = z.enum([Teachers.ISAAC, Teachers.SCERRA]);
export const SectionZod = z.enum([Sections.SECTION_601, Sections.SECTION_802]);

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
 * Snorkl/Mastery-specific completion fields
 */
export const SnorklCompletionFieldsSchema = BaseCompletionFieldsSchema.extend({
  completionType: z.literal("snorkl"),
  numberOfAttempts: z.number().int().min(1)
    .describe("Number of attempts made (always tracked for Snorkl)"),
  // Score only recorded if completed successfully
  snorklScore: z.number().int().min(1).max(4).optional()
    .describe("Final mastery score (only if completed: true)"),
});

/**
 * Full Snorkl completion schema with base document fields
 */
export const SnorklCompletionZodSchema = BaseDocumentSchema.merge(SnorklCompletionFieldsSchema);

/**
 * Input schema for creating/updating Snorkl completions
 */
export const SnorklCompletionInputZodSchema = toInputSchema(SnorklCompletionZodSchema);

// =====================================
// UNION COMPLETION SCHEMA
// =====================================

/**
 * Discriminated union for all completion types
 */
export const LessonCompletionZodSchema = z.discriminatedUnion("completionType", [
  ZearnCompletionZodSchema,
  SnorklCompletionZodSchema,
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
 * Daily class event fields schema
 */
export const DailyClassEventFieldsSchema = z.object({
  date: z.string().regex(/^\d{1,2}\/\d{1,2}\/\d{4}$/)
    .describe("Class date in MM/DD/YYYY format"),
  studentIDref: z.number().int().positive().describe("Student identifier"),
  studentName: z.string().describe("Student's full name"),
  teacher: TeacherZod.describe("Teacher name"),
  section: SectionZod.describe("Class section"),
  
  // Class timing and attendance
  classLengthMin: z.number().int().positive().describe("Total class length in minutes"),
  attendance: AttendanceStatusZod.describe("Student attendance status"),
  instructionReceivedMin: z.number().int().min(0).optional()
    .describe("Minutes of instruction received"),
  
  // Intervention tracking
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
export type SnorklCompletion = z.infer<typeof SnorklCompletionZodSchema>;
export type LessonCompletion = z.infer<typeof LessonCompletionZodSchema>;

// Input types
export type ZearnCompletionInput = z.infer<typeof ZearnCompletionInputZodSchema>;
export type SnorklCompletionInput = z.infer<typeof SnorklCompletionInputZodSchema>;

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
    teacher: Teachers.ISAAC,
    section: Sections.SECTION_601,
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
export function createSnorklCompletionDefaults(overrides: Partial<SnorklCompletionInput> = {}): SnorklCompletionInput {
  return {
    studentIDref: 0,
    studentName: "",
    lessonCode: "U3.L1",
    dateOfCompletion: new Date().toISOString(),
    teacher: Teachers.ISAAC,
    section: Sections.SECTION_601,
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
    studentName: "",
    teacher: Teachers.ISAAC,
    section: Sections.SECTION_601,
    classLengthMin: 60,
    attendance: AttendanceStatus.PRESENT,
    teacherInterventionMin: 0,
    ownerIds: [],
    ...overrides
  };
}