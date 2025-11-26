import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';

// =====================================
// SCOPE AND SEQUENCE TAG ENUM
// =====================================

/**
 * Scope and sequence tag options
 * Used to identify which curriculum/course a lesson belongs to
 */
export const ScopeSequenceTagZod = z.enum([
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Algebra 1",
]);

export type ScopeSequenceTag = z.infer<typeof ScopeSequenceTagZod>;

// Array of tag options for UI dropdowns
export const SCOPE_SEQUENCE_TAG_OPTIONS = ScopeSequenceTagZod.options;

// =====================================
// SCOPE AND SEQUENCE SCHEMA
// =====================================

/**
 * Core fields for a Scope and Sequence entry
 * Represents a single lesson in the curriculum scope and sequence
 */
/**
 * Lesson section enum - defines the sections within a unit
 */
export const SectionZod = z.enum(["Ramp Ups", "A", "B", "C", "D", "E", "F", "Unit Assessment"]);
export type Section = z.infer<typeof SectionZod>;

// Array of section options for UI dropdowns
export const SECTION_OPTIONS = SectionZod.options;

/**
 * Standard context enum - defines how a standard relates to the lesson
 */
export const StandardContextZod = z.enum(["current", "buildingOn", "buildingTowards"]);
export type StandardContext = z.infer<typeof StandardContextZod>;

/**
 * Standard schema - represents a single educational standard
 */
export const StandardZod = z.object({
  code: z.string().describe("Standard code (e.g., 'NY-8.G.1', 'MP.5')"),
  text: z.string().describe("Full text description of the standard"),
  context: StandardContextZod.optional().describe("Context of how the standard relates to the lesson: current (addressed in this lesson), buildingOn (prerequisite), or buildingTowards (future learning)"),
});

export type Standard = z.infer<typeof StandardZod>;

export const ScopeAndSequenceFieldsSchema = z.object({
  grade: z.string().describe("Grade level (e.g., '8')"),
  unit: z.string().describe("Unit title with number (e.g., 'Unit 3 - Linear Relationships')"),
  unitLessonId: z.string().describe("Combined unit.lesson identifier (e.g., '3.15' or '3.RU1' for ramp-ups)"),
  unitNumber: z.number().int().positive().describe("Unit number"),
  lessonNumber: z.number().int().describe("Lesson number within the unit (0 or negative for ramp-ups)"),
  lessonName: z.string().describe("Full lesson name"),
  section: SectionZod.optional().describe("Lesson section: A, B, C, D, E, F, or Ramp Ups"),
  scopeSequenceTag: ScopeSequenceTagZod.optional().describe("Scope and sequence tag identifying which curriculum this lesson belongs to"),
  roadmapSkills: z.array(z.string()).default([]).describe("Array of roadmap skill numbers tagged to this lesson"),
  targetSkills: z.array(z.string()).default([]).describe("Array of target skill numbers for this lesson"),
  standards: z.array(StandardZod).default([]).describe("Array of standards addressed in this lesson (NY standards and Mathematical Practices)"),
});

// Full Scope and Sequence Schema with base document fields
export const ScopeAndSequenceZodSchema = BaseDocumentSchema.merge(ScopeAndSequenceFieldsSchema);

// Input Schema (for creation)
export const ScopeAndSequenceInputZodSchema = toInputSchema(ScopeAndSequenceZodSchema);

// =====================================
// TYPE EXPORTS
// =====================================

export type ScopeAndSequence = z.infer<typeof ScopeAndSequenceZodSchema>;
export type ScopeAndSequenceInput = z.infer<typeof ScopeAndSequenceInputZodSchema>;
