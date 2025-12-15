import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from "@zod-schema/base-schemas";
import { ScopeSequenceTagZod } from "@schema/enum/scm";

// =====================================
// WORKED EXAMPLE REQUEST SCHEMA
// =====================================

/**
 * Status enum for worked example requests
 */
export const WorkedExampleRequestStatusZod = z.enum([
  "pending",
  "in_progress",
  "completed",
  "cancelled"
]);
export type WorkedExampleRequestStatus = z.infer<typeof WorkedExampleRequestStatusZod>;

/**
 * Section enum for lesson sections within a unit
 */
export const LessonSectionZod = z.enum([
  "Ramp Ups",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "Unit Assessment"
]);
export type LessonSection = z.infer<typeof LessonSectionZod>;

/**
 * Worked Example Request - Teacher submission for creating a new worked example
 *
 * Teachers identify what lesson/skills students are struggling with,
 * upload a practice problem image, and submit to a queue for manual
 * processing via Claude Code.
 */
export const WorkedExampleRequestFieldsSchema = z.object({
  // =====================================
  // STATUS
  // =====================================
  status: WorkedExampleRequestStatusZod.default("pending"),

  // =====================================
  // LESSON REFERENCE (from scope-and-sequence selection)
  // =====================================
  scopeSequenceTag: ScopeSequenceTagZod.describe("Curriculum tag (Grade 6, Grade 7, Grade 8, Algebra 1)"),
  grade: z.string().describe("Grade level string"),
  unitNumber: z.number().int().positive().describe("Unit number"),
  lessonNumber: z.number().int().describe("Lesson number (can be 0 or negative for ramp-ups)"),
  lessonName: z.string().describe("Full lesson name"),
  scopeAndSequenceId: z.string().describe("MongoDB ObjectId reference to scope-and-sequence document"),
  section: LessonSectionZod.optional().describe("Lesson section within the unit (A, B, C, etc.)"),

  // =====================================
  // ROADMAP SKILLS CONTEXT
  // =====================================
  roadmapSkills: z.array(z.string()).default([]).describe("All roadmap skill numbers from the lesson"),
  targetSkills: z.array(z.string()).default([]).describe("Target skill numbers from the lesson"),

  // =====================================
  // TEACHER INPUT: WHAT STUDENT IS STRUGGLING WITH
  // =====================================
  strugglingSkillNumbers: z.array(z.string()).min(1).describe("Which skills teacher thinks student struggles with"),
  strugglingDescription: z.string().min(10).describe("Free text: describe the misconception/struggle"),

  // =====================================
  // WORKED EXAMPLE CONTENT FIELDS
  // =====================================
  title: z.string().optional().describe("Optional title - can auto-generate"),
  mathConcept: z.string().min(1).describe("The math concept being taught"),
  mathStandard: z.string().min(1).describe("Math standard (e.g., 8.EE.B.5)"),
  learningGoals: z.array(z.string()).default([]).describe("Student-facing learning objectives"),

  // =====================================
  // SOURCE IMAGE (uploaded to Vercel Blob)
  // =====================================
  sourceImageUrl: z.string().url().describe("Vercel Blob URL of uploaded practice problem image"),
  sourceImageFilename: z.string().describe("Original filename of the uploaded image"),

  // =====================================
  // ADDITIONAL NOTES
  // =====================================
  additionalNotes: z.string().optional().describe("Additional context or notes from teacher"),

  // =====================================
  // METADATA
  // =====================================
  requestedBy: z.string().describe("User ID who submitted the request"),
  requestedByEmail: z.string().email().optional().describe("Email for notifications"),
  completedWorkedExampleId: z.string().optional().describe("MongoDB ObjectId of created worked example deck when completed"),
});

// Full schema with base document fields
export const WorkedExampleRequestZodSchema = BaseDocumentSchema.merge(WorkedExampleRequestFieldsSchema);

// Input schema for creation (excludes _id, id, createdAt, updatedAt)
export const WorkedExampleRequestInputZodSchema = toInputSchema(WorkedExampleRequestZodSchema);

// =====================================
// TYPE EXPORTS
// =====================================

export type WorkedExampleRequest = z.infer<typeof WorkedExampleRequestZodSchema>;
export type WorkedExampleRequestInput = z.infer<typeof WorkedExampleRequestInputZodSchema>;

// =====================================
// QUERY SCHEMA
// =====================================

/**
 * Query params for finding worked example requests
 */
export const WorkedExampleRequestQuerySchema = z.object({
  status: WorkedExampleRequestStatusZod.optional(),
  scopeSequenceTag: ScopeSequenceTagZod.optional(),
  grade: z.string().optional(),
  unitNumber: z.number().int().positive().optional(),
  lessonNumber: z.number().int().optional(),
  requestedBy: z.string().optional(),
});

export type WorkedExampleRequestQuery = z.infer<typeof WorkedExampleRequestQuerySchema>;
