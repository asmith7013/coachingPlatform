import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from "@zod-schema/base-schemas";

// =====================================
// STUDENT ACTIVITY SCHEMA (Standalone Collection)
// =====================================

/**
 * Standalone student activity event schema for dedicated collection
 * This replaces the embedded classActivities array in students collection
 */
export const StudentActivityFieldsSchema = z.object({
  // Student reference
  studentId: z.string().describe("Reference to student document _id"),
  studentName: z.string().describe("Student's full name for quick access"),
  section: z.string().describe("Class section"),
  gradeLevel: z.string().describe("Grade level"),

  // Activity metadata
  date: z.string().describe("Activity date (ISO format YYYY-MM-DD)"),
  activityType: z
    .string()
    .describe("Activity type ID (e.g., 'inquiry-activity')"),
  activityLabel: z
    .string()
    .describe("Activity display name (e.g., 'Inquiry Activity')"),

  // Unit context
  unitId: z
    .string()
    .optional()
    .describe("Unit ID if activity is unit-specific"),
  unitNumber: z
    .number()
    .optional()
    .describe("Unit number for easier filtering"),

  // Detail fields based on activity type
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

  // Logging metadata
  loggedBy: z
    .string()
    .optional()
    .describe("Teacher ID or name who logged this"),
  loggedAt: z
    .string()
    .optional()
    .describe("When activity was logged (ISO timestamp)"),
});

/**
 * Full student activity schema with base document fields
 */
export const StudentActivityZodSchema = BaseDocumentSchema.merge(
  StudentActivityFieldsSchema,
);

/**
 * Input schema for creating student activities
 */
export const StudentActivityInputZodSchema = toInputSchema(
  StudentActivityZodSchema,
);

// =====================================
// TYPE EXPORTS
// =====================================

export type StudentActivityEvent = z.infer<typeof StudentActivityZodSchema>;
export type StudentActivityEventInput = z.infer<
  typeof StudentActivityInputZodSchema
>;

// =====================================
// DEFAULT VALUE CREATORS
// =====================================

/**
 * Create default values for student activity input
 */
export function createStudentActivityDefaults(
  overrides: Partial<StudentActivityEventInput> = {},
): StudentActivityEventInput {
  return {
    studentId: "",
    studentName: "",
    section: "",
    gradeLevel: "8",
    date: new Date().toISOString().split("T")[0],
    activityType: "",
    activityLabel: "",
    ownerIds: [],
    ...overrides,
  };
}
