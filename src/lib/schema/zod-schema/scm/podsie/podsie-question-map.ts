import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from "@zod-schema/base-schemas";
import { PodsieQuestionMapSchema } from "./section-config";

// =====================================
// PODSIE QUESTION MAP SCHEMA
// =====================================

/**
 * Centralized question mapping for Podsie assignments
 *
 * This collection stores the canonical question mapping for each Podsie assignment,
 * which can be imported when creating section configs.
 */
export const PodsieQuestionMapDocumentFieldsSchema = z.object({
  // Primary identifier
  assignmentId: z.string().describe("Podsie assignment ID (unique identifier)"),

  // Assignment metadata
  assignmentName: z.string().describe("Name of the assignment from Podsie"),

  // Question mapping
  questionMap: z
    .array(PodsieQuestionMapSchema)
    .describe("Array of question mappings (root questions only for now)"),
  totalQuestions: z
    .number()
    .int()
    .positive()
    .describe("Total number of questions in the assignment"),

  // Metadata
  createdBy: z
    .string()
    .optional()
    .describe("Email of the person who created this mapping"),
  notes: z.string().optional().describe("Optional notes about this mapping"),
});

// Full schema with base document fields
export const PodsieQuestionMapDocumentSchema = BaseDocumentSchema.merge(
  PodsieQuestionMapDocumentFieldsSchema,
);

// Input schema for creation
export const PodsieQuestionMapInputSchema = toInputSchema(
  PodsieQuestionMapDocumentSchema,
);

// =====================================
// TYPE EXPORTS
// =====================================

export type PodsieQuestionMapDocument = z.infer<
  typeof PodsieQuestionMapDocumentSchema
>;
export type PodsieQuestionMapInput = z.infer<
  typeof PodsieQuestionMapInputSchema
>;
