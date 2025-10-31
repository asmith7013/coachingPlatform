import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { SummerSectionsZod, SummerTeachersZod } from "@schema/enum/313";

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
  section: SummerSectionsZod.describe("Class section identifier"),
  teacher: SummerTeachersZod.describe("Assigned teacher").optional(),

  gradeLevel: z.string().describe("Current grade level (e.g., '6'").optional(),
//   subject: z.string().min(1).describe("Subject area"),
  email: z.email().optional().describe("Student email address").optional(),
  active: z.boolean().default(true).describe("Whether student is currently active"),
  masteredSkills: z.array(z.string()).default([]).describe("Array of skill numbers that the student has mastered"),
  classActivities: z.array(StudentActivitySchema).default([]).describe("Array of classroom activity events"),
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
    ownerIds: [],
    ...overrides
  };
}


