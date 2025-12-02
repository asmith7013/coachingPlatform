import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { AllSectionsZod, SchoolsZod, Teachers313Zod, ScopeSequenceTagZod } from "@schema/enum/313";

// =====================================
// SECTION CONFIG SCHEMA
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
 * Assignment type enum - differentiates between lesson activities and mastery assessments
 */
export const AssignmentTypeSchema = z.enum([
  'lesson',        // Lesson activities (warm-up, activities, cool-down)
  'mastery-check', // Mastery/summative assessment
]).describe("Type of assignment");

export type AssignmentType = z.infer<typeof AssignmentTypeSchema>;

/**
 * Podsie assignment configuration for a single lesson in this section
 */
export const PodsieAssignmentSchema = z.object({
  unitLessonId: z.string().describe("Unit.Lesson ID (e.g., '3.15', '4.RU1')"),
  lessonName: z.string().describe("Lesson name for display"),
  grade: z.string().optional().describe("Grade level (denormalized from lesson)"),

  assignmentType: AssignmentTypeSchema.default('mastery-check').describe("Type of assignment (lesson or mastery-check)"),

  podsieAssignmentId: z.string().describe("Podsie assignment ID"),
  podsieQuestionMap: z.array(PodsieQuestionMapSchema).default([]).describe("Map of question numbers to Podsie question IDs"),
  totalQuestions: z.number().int().positive().optional().describe("Total questions in the assignment"),

  hasZearnLesson: z.boolean().optional().default(false).describe("Whether this assignment has a corresponding Zearn lesson (controls Zearn column visibility)"),

  active: z.boolean().default(true).describe("Whether this assignment is active"),
  notes: z.string().optional().describe("Optional notes about this assignment"),
});

export type PodsieAssignment = z.infer<typeof PodsieAssignmentSchema>;

/**
 * Section Configuration - Complete configuration for a class section
 *
 * This collection stores all configuration for a single class section including:
 * - Section metadata (school, teacher, grade)
 * - All Podsie assignment configurations for lessons taught in this section
 *
 * Why section-centric?
 * - Natural mental model: "What's configured for my 802 class?"
 * - Single source of truth per section
 * - Efficient queries: One find gets all section info + all assignments
 * - Easy admin: Manage all configs for a section in one place
 * - Enables bulk operations: Import/export configs per section
 */
export const SectionConfigFieldsSchema = z.object({
  // =====================================
  // SECTION METADATA
  // =====================================

  school: SchoolsZod.describe("School identifier (IS313, PS19, or X644)"),
  classSection: AllSectionsZod.describe("Class section (e.g., '802', '803', '601')"),
  teacher: Teachers313Zod.optional().describe("Current teacher for this section"),
  gradeLevel: z.string().describe("Grade level (e.g., '6', '7', '8')"),
  scopeSequenceTag: ScopeSequenceTagZod.optional().describe("Scope and sequence tag (e.g., 'Grade 8', 'Algebra 1')"),

  groupId: z.string().optional().describe("Podsie group ID for this section (used in Podsie URLs)"),

  active: z.boolean().default(true).describe("Whether this section is currently active"),

  // =====================================
  // PODSIE ASSIGNMENT CONFIGURATIONS
  // =====================================

  podsieAssignments: z.array(PodsieAssignmentSchema).default([]).describe("All Podsie assignment configurations for this section"),

  // =====================================
  // METADATA
  // =====================================

  notes: z.string().optional().describe("Optional notes about this section"),
});

// Full schema with base document fields
export const SectionConfigZodSchema = BaseDocumentSchema.merge(SectionConfigFieldsSchema);

// Input schema for creation
export const SectionConfigInputZodSchema = toInputSchema(SectionConfigZodSchema);

// =====================================
// TYPE EXPORTS
// =====================================

export type SectionConfig = z.infer<typeof SectionConfigZodSchema>;
export type SectionConfigInput = z.infer<typeof SectionConfigInputZodSchema>;

// =====================================
// HELPER TYPES
// =====================================

/**
 * Query params for finding section configs
 */
export const SectionConfigQuerySchema = z.object({
  school: SchoolsZod.optional(),
  classSection: AllSectionsZod.optional(),
  teacher: Teachers313Zod.optional(),
  gradeLevel: z.string().optional(),
  active: z.boolean().optional(),
});

export type SectionConfigQuery = z.infer<typeof SectionConfigQuerySchema>;

/**
 * Joined type: Scope and Sequence + Podsie Assignment from Section Config
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

  // From section-config podsieAssignments array
  podsieAssignment?: {
    podsieAssignmentId: string;
    assignmentType: AssignmentType;
    podsieQuestionMap: PodsieQuestionMap[];
    totalQuestions?: number;
    active: boolean;
    notes?: string;
  };
};

/**
 * Section dropdown option with metadata
 */
export type SectionOption = {
  school: string;
  classSection: string;
  teacher?: string;
  gradeLevel: string;
  scopeSequenceTag?: string;
  assignmentCount: number;
};
