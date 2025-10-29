import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { SummerSectionsZod, SummerTeachersZod } from "@schema/enum/313";

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
    ownerIds: [],
    ...overrides
  };
}


