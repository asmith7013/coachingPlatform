import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { AllSectionsZod, SchoolsZod } from "@schema/enum/scm";

// =====================================
// PODSIE COMPLETION CONFIG SCHEMA
// =====================================

/**
 * Podsie question mapping - maps question numbers to Podsie question IDs
 */
export const PodsieQuestionMapSchema = z.object({
  questionNumber: z.number().int().positive().describe("Question number (1-based index)"),
  questionId: z.string().describe("Podsie question ID"),
});

export type PodsieQuestionMap = z.infer<typeof PodsieQuestionMapSchema>;

/**
 * Podsie Completion Config - Section-specific Podsie assignment configuration
 *
 * This collection stores the implementation details for how scope-and-sequence lessons
 * are tracked in Podsie for specific class sections and schools.
 *
 * Why separate from scope-and-sequence?
 * - Scope-and-sequence defines WHAT to teach (curriculum, skills, standards)
 * - This collection defines HOW completion is tracked (platform-specific IDs)
 * - Allows same curriculum to have different Podsie IDs per section/school
 * - Clean separation enables multi-school support without duplicating curriculum
 */
export const PodsieCompletionFieldsSchema = z.object({
  // =====================================
  // IDENTIFIERS
  // =====================================

  school: SchoolsZod.describe("School identifier (IS313, PS19, or X644)"),
  classSection: AllSectionsZod.describe("Class section (e.g., '802', '803', '601')"),

  // Reference to scope-and-sequence
  scopeAndSequenceId: z.string().optional().describe("MongoDB ObjectId reference to scope-and-sequence document"),

  // Denormalized for easy querying (copied from scope-and-sequence)
  unitLessonId: z.string().describe("Unit.Lesson ID (e.g., '3.15', '4.RU1') from scope-and-sequence"),
  grade: z.string().optional().describe("Grade level (denormalized from scope-and-sequence)"),
  lessonName: z.string().optional().describe("Lesson name (denormalized for display)"),

  // =====================================
  // PODSIE INTEGRATION DATA
  // =====================================

  podsieAssignmentId: z.string().describe("Podsie assignment ID for this section's version"),
  podsieQuestionMap: z.array(PodsieQuestionMapSchema).default([]).describe("Map of question numbers to Podsie question IDs"),
  totalQuestions: z.number().int().positive().optional().describe("Total questions in the assessment"),

  // =====================================
  // METADATA
  // =====================================

  active: z.boolean().default(true).describe("Whether this config is currently active"),
  notes: z.string().optional().describe("Optional notes about this section's configuration"),
});

// Full schema with base document fields
export const PodsieCompletionZodSchema = BaseDocumentSchema.merge(PodsieCompletionFieldsSchema);

// Input schema for creation
export const PodsieCompletionInputZodSchema = toInputSchema(PodsieCompletionZodSchema);

// =====================================
// TYPE EXPORTS
// =====================================

export type PodsieCompletion = z.infer<typeof PodsieCompletionZodSchema>;
export type PodsieCompletionInput = z.infer<typeof PodsieCompletionInputZodSchema>;

// =====================================
// HELPER TYPES
// =====================================

/**
 * Query params for finding Podsie completion configs
 */
export const PodsieCompletionQuerySchema = z.object({
  school: SchoolsZod.optional(),
  classSection: AllSectionsZod.optional(),
  unitLessonId: z.string().optional(),
  active: z.boolean().optional(),
});

export type PodsieCompletionQuery = z.infer<typeof PodsieCompletionQuerySchema>;

/**
 * Joined type: Scope and Sequence + Podsie Completion Config
 * Used when you need both curriculum data and section-specific Podsie data
 */
export type ScopeAndSequenceWithPodsie = {
  // From scope-and-sequence
  id: string;
  unitLessonId: string;
  lessonName: string;
  grade: string;
  unit: string;
  section?: string;
  roadmapSkills: string[];
  targetSkills: string[];

  // From podsie-completion (optional - may not exist for all sections)
  podsieConfig?: {
    id: string;
    school: string;
    classSection: string;
    podsieAssignmentId: string;
    podsieQuestionMap: PodsieQuestionMap[];
    totalQuestions?: number;
    active: boolean;
  };
};
