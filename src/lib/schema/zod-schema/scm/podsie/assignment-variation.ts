import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { ScopeSequenceTagZod } from "@schema/enum/scm";

// =====================================
// ASSIGNMENT VARIATION SCHEMA
// =====================================

/**
 * Visual type enum for static question visuals
 */
export const VisualTypeZod = z.enum(["none", "table", "graph", "diagram"]);
export type VisualType = z.infer<typeof VisualTypeZod>;

/**
 * Section enum for lesson sections within a unit
 */
export const SectionZod = z.enum(["Ramp Ups", "A", "B", "C", "D", "E", "F", "Unit Assessment"]);
export type Section = z.infer<typeof SectionZod>;

/**
 * Individual question within a variation (STATIC - no interactivity)
 * These are paper-test style questions similar to state standardized tests
 */
export const QuestionVariationSchema = z.object({
  questionNumber: z.number().int().positive().describe("Question number (1, 2, 3...)"),

  // Content (adapted from question-contents.md format)
  questionTitle: z.string().describe("Short descriptive title (<= 80 chars)"),
  contextScenario: z.string().optional().describe("Introductory text/scenario (if any)"),
  questionText: z.string().describe("The actual question prompt - exactly as student sees it"),

  // Static visual (optional) - tables, graphs as static HTML/SVG
  visualType: VisualTypeZod.default("none"),
  visualHtml: z.string().optional().describe("Static HTML for table or SVG for graph"),
  visualDescription: z.string().optional().describe("Alt text / description of the visual"),

  // Answer information
  acceptanceCriteria: z.array(z.string()).describe("Conditions for correct response"),
  correctAnswer: z.string().describe("The correct answer"),
  acceptableAnswerForms: z.array(z.string()).optional().describe("Equivalent forms accepted (e.g., '0.5', '1/2', '50%')"),

  // Explanation for AI tutor / grading
  explanation: z.string().describe("Guidance for AI tutor - hints, common misconceptions"),
  solutionSteps: z.array(z.string()).optional().describe("Step-by-step solution process"),
});

export type QuestionVariation = z.infer<typeof QuestionVariationSchema>;

/**
 * Assignment Variation - a "Version B" copy of an existing Podsie assignment
 *
 * These are static, state-test-style questions:
 * - Plain text question prompts
 * - Optional static visuals (tables, graphs as HTML/SVG)
 * - Clear acceptance criteria for grading
 * - NO interactive elements (no input boxes, no D3 interactivity)
 *
 * Used for creating alternate versions of assignments with different numbers/contexts
 * while maintaining the same mathematical rigor.
 */
export const AssignmentVariationFieldsSchema = z.object({
  // =====================================
  // IDENTIFYING INFO
  // =====================================
  title: z.string().describe("Assignment title (e.g., 'Linear Equations Practice - Version B')"),
  slug: z.string().describe("URL-friendly identifier"),

  // =====================================
  // SCOPE AND SEQUENCE REFERENCE
  // =====================================
  scopeSequenceTag: ScopeSequenceTagZod.describe("Scope and sequence tag (e.g., 'Grade 8', 'Algebra 1')"),
  grade: z.string().describe("Grade level (e.g., '6', '7', '8')"),
  unitNumber: z.number().int().positive().describe("Unit number"),
  lessonNumber: z.number().int().describe("Lesson number (can be 0 or negative for ramp-ups)"),
  scopeAndSequenceId: z.string().optional().describe("MongoDB ObjectId of scope-and-sequence document"),
  section: SectionZod.optional().describe("Lesson section within the unit (A, B, C, etc.)"),

  // =====================================
  // ORIGINAL ASSIGNMENT REFERENCE
  // =====================================
  originalAssignmentName: z.string().optional().describe("Name of the original Podsie assignment"),
  originalPodsieAssignmentId: z.string().optional().describe("Podsie assignment UUID if known"),

  // =====================================
  // QUESTIONS
  // =====================================
  questions: z.array(QuestionVariationSchema).describe("Array of question variations"),

  // =====================================
  // METADATA
  // =====================================
  generatedBy: z.enum(["ai", "manual"]).default("ai"),
  sourceImage: z.string().optional().describe("Filename of source screenshot"),
  isPublic: z.boolean().default(true),
  notes: z.string().optional().describe("Optional notes about this variation"),
});

// Full schema with base document fields
export const AssignmentVariationZodSchema = BaseDocumentSchema.merge(AssignmentVariationFieldsSchema);

// Input schema for creation (excludes _id, id, createdAt, updatedAt)
export const AssignmentVariationInputZodSchema = toInputSchema(AssignmentVariationZodSchema);

// =====================================
// TYPE EXPORTS
// =====================================

export type AssignmentVariation = z.infer<typeof AssignmentVariationZodSchema>;
export type AssignmentVariationInput = z.infer<typeof AssignmentVariationInputZodSchema>;

// =====================================
// QUERY SCHEMA
// =====================================

/**
 * Query params for finding assignment variations
 */
export const AssignmentVariationQuerySchema = z.object({
  scopeSequenceTag: ScopeSequenceTagZod.optional(),
  grade: z.string().optional(),
  unitNumber: z.number().int().positive().optional(),
  lessonNumber: z.number().int().optional(),
  slug: z.string().optional(),
});

export type AssignmentVariationQuery = z.infer<typeof AssignmentVariationQuerySchema>;
