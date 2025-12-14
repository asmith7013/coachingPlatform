import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { ScopeSequenceTagZod } from "@schema/enum/313";

// =====================================
// LEARNING CONTENT SCHEMA
// =====================================

/**
 * Learning Content - stores "What We're Learning" content for a specific unit section
 *
 * This content is displayed on the Smartboard Display on the Podsie Progress page
 * and allows teachers to customize learning objectives for each unit section.
 *
 * The content is keyed by:
 * - scopeSequenceTag: The scope and sequence (e.g., "Grade 8", "Algebra 1")
 * - grade: The grade level (e.g., "8")
 * - unit: The unit number (e.g., 4)
 * - lessonSection: The section within the unit (e.g., "A", "B", "C", "Ramp Ups", "Unit Assessment")
 */
export const LearningContentFieldsSchema = z.object({
  // =====================================
  // IDENTIFYING KEYS
  // =====================================

  scopeSequenceTag: ScopeSequenceTagZod.describe("Scope and sequence tag (e.g., 'Grade 8', 'Algebra 1')"),
  grade: z.string().describe("Grade level (e.g., '6', '7', '8')"),
  unit: z.number().int().positive().describe("Unit number (e.g., 1, 2, 3, 4)"),
  lessonSection: z.string().describe("Section within the unit (e.g., 'A', 'B', 'C', 'D', 'E', 'F', 'Ramp Ups', 'Unit Assessment')"),

  // =====================================
  // CONTENT
  // =====================================

  content: z.string().describe("Markdown-formatted learning objectives content (one item per line, optionally prefixed with '- ' or '• ')"),

  // =====================================
  // METADATA
  // =====================================

  active: z.boolean().default(true).describe("Whether this learning content is active"),
  notes: z.string().optional().describe("Optional notes about this content"),
});

// Full schema with base document fields
export const LearningContentZodSchema = BaseDocumentSchema.merge(LearningContentFieldsSchema);

// Input schema for creation
export const LearningContentInputZodSchema = toInputSchema(LearningContentZodSchema);

// =====================================
// TYPE EXPORTS
// =====================================

export type LearningContent = z.infer<typeof LearningContentZodSchema>;
export type LearningContentInput = z.infer<typeof LearningContentInputZodSchema>;

// =====================================
// QUERY SCHEMA
// =====================================

/**
 * Query params for finding learning content
 */
export const LearningContentQuerySchema = z.object({
  scopeSequenceTag: ScopeSequenceTagZod,
  grade: z.string(),
  unit: z.number().int().positive(),
  lessonSection: z.string(),
});

export type LearningContentQuery = z.infer<typeof LearningContentQuerySchema>;
