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
 * Lesson type enum - categorizes lessons by their instructional purpose
 */
export const LessonTypeZod = z.enum([
  "lesson",      // Regular instructional lesson
  "rampUp",      // Prerequisite skill review/ramp-up activity
  "assessment",  // End-of-unit assessment
]);
export type LessonType = z.infer<typeof LessonTypeZod>;

// Array of lesson type options for UI dropdowns
export const LESSON_TYPE_OPTIONS = LessonTypeZod.options;

/**
 * Standard schema - represents a single educational standard
 */
export const StandardZod = z.object({
  code: z.string().describe("Standard code (e.g., 'NY-8.G.1', 'MP.5')"),
  text: z.string().describe("Full text description of the standard"),
  context: StandardContextZod.optional().describe("Context of how the standard relates to the lesson: current (addressed in this lesson), buildingOn (prerequisite), or buildingTowards (future learning)"),
});

export type Standard = z.infer<typeof StandardZod>;

/**
 * Grade level enum - defines valid grade levels
 */
export const GradeZod = z.enum(["6", "7", "8", "Algebra 1"]);
export type Grade = z.infer<typeof GradeZod>;

// Array of grade options for UI dropdowns
export const GRADE_OPTIONS = GradeZod.options;

export const ScopeAndSequenceFieldsSchema = z.object({
  grade: GradeZod.describe("Grade level (e.g., '8')"),
  unit: z.string().describe("Unit title with number (e.g., 'Unit 3 - Linear Relationships')"),
  unitLessonId: z.string().describe("Combined unit.lesson identifier (e.g., '3.15' or '3.RU1' for ramp-ups)"),
  unitNumber: z.number().int().positive().describe("Unit number"),
  lessonNumber: z.number().int().describe("Lesson number within the unit (0 or negative for ramp-ups)"),
  lessonName: z.string().describe("Full lesson name (includes prefix for ramp-ups/assessments, e.g., 'Ramp Up 1: Division of Fractions')"),
  lessonType: LessonTypeZod.optional().describe("Lesson type: lesson (regular), rampUp, or assessment"),
  lessonTitle: z.string().optional().describe("Pure lesson title without type prefix (e.g., 'Division of Fractions' extracted from 'Ramp Up 1: Division of Fractions')"),
  section: SectionZod.optional().describe("Lesson section within the unit"),
  subsection: z.number().int().positive().optional().describe(
    "Subsection number (1, 2, etc.) for subdividing large sections. undefined = not subdivided"
  ),
  scopeSequenceTag: ScopeSequenceTagZod.optional().describe("Scope and sequence tag identifying which curriculum this lesson belongs to"),
  roadmapSkills: z.array(z.string()).default([]).describe("Array of roadmap skill numbers tagged to this lesson"),
  targetSkills: z.array(z.string()).default([]).describe("Array of target skill numbers for this lesson"),
  standards: z.array(StandardZod).optional().default([]).describe("Array of standards addressed in this lesson (NY standards and Mathematical Practices)"),
  learningTargets: z.array(z.string()).optional().default([]).describe("Array of learning targets/objectives for this lesson"),
});

// Full Scope and Sequence Schema with base document fields
export const ScopeAndSequenceZodSchema = BaseDocumentSchema.merge(ScopeAndSequenceFieldsSchema);

// Input Schema (for creation)
export const ScopeAndSequenceInputZodSchema = toInputSchema(ScopeAndSequenceZodSchema);

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * Get display name for a section with optional subsection
 * Examples:
 *   - section="A", subsection=undefined -> "Section A"
 *   - section="A", subsection=1 -> "Section A (Part 1)"
 *   - section="Ramp Ups", subsection=undefined -> "Ramp Ups"
 *   - section="Ramp Ups", subsection=1 -> "Ramp Ups (Part 1)"
 */
export function getSectionDisplayName(section: string, subsection?: number): string {
  const baseName = (section === 'Ramp Ups' || section === 'Unit Assessment')
    ? section
    : `Section ${section}`;

  if (subsection === undefined) return baseName;
  return `${baseName} (Part ${subsection})`;
}

// =====================================
// TYPE EXPORTS
// =====================================

export type ScopeAndSequence = z.infer<typeof ScopeAndSequenceZodSchema>;
export type ScopeAndSequenceInput = z.infer<typeof ScopeAndSequenceInputZodSchema>;
