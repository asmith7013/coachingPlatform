import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { zDateField } from '@zod-schema/shared/dateHelpers';

// Rubric Fields Schema
export const RubricFieldsSchema = z.object({
  score: z.number(), // Required number
  category: z.array(z.string()), // Array of category strings
  content: z.array(z.string()).optional(), // Optional array of content strings
  parentId: z.string().optional(), // Optional parent ID
  collectionId: z.string().optional(), // Optional collection ID
  hex: z.string().optional(), // Optional hex value
});

// Full schema using merge
export const RubricZodSchema = BaseDocumentSchema.merge(RubricFieldsSchema);

// Rubric Input Schema
export const RubricInputZodSchema = toInputSchema(RubricZodSchema);

// RubricScore Fields Schema
export const RubricScoreFieldsSchema = z.object({
  date: zDateField, // Required date with proper handling
  score: z.number(), // Required score
  staffId: z.string(), // Required staff ID
  school: z.string(), // Required school ID
  owners: z.array(z.string()), // Array of owner IDs
});

// RubricScore Full Schema
export const RubricScoreZodSchema = BaseDocumentSchema.merge(RubricScoreFieldsSchema);

// RubricScore Input Schema
export const RubricScoreInputZodSchema = toInputSchema(RubricScoreZodSchema);

// Auto-generate TypeScript types
export type Rubric = z.infer<typeof RubricZodSchema>;
export type RubricInput = z.infer<typeof RubricInputZodSchema>;
export type RubricScore = z.infer<typeof RubricScoreZodSchema>;
export type RubricScoreInput = z.infer<typeof RubricScoreInputZodSchema>;