import { z } from "zod";
import { zDateField } from '@zod-schema/shared/dateHelpers';

// ✅ Rubric Schema (shared schema)
export const RubricZodSchema = z.object({
  score: z.number(), // Required number
  category: z.array(z.string()), // Array of category strings
  content: z.array(z.string()).optional(), // Optional array of content strings
  parentId: z.string().optional(), // Optional parent ID
  collectionId: z.string().optional(), // Optional collection ID
  hex: z.string().optional(), // Optional hex value
});

// ✅ RubricScore Input Schema
export const RubricScoreInputZodSchema = z.object({
  date: z.string(), // Required ISO date string
  score: z.number(), // Required score
  staffId: z.string(), // Required staff ID
  school: z.string(), // Required school ID
  owners: z.array(z.string()), // Array of owner IDs
});


// ✅ RubricScore Full Schema
export const RubricScoreZodSchema = RubricScoreInputZodSchema.extend({
  _id: z.string(),
  createdAt: zDateField.optional(),
  updatedAt: zDateField.optional(),
});

// ✅ Auto-generate TypeScript types
export type Rubric = z.infer<typeof RubricZodSchema>;
export type RubricScoreInput = z.infer<typeof RubricScoreInputZodSchema>;
export type RubricScore = z.infer<typeof RubricScoreZodSchema>;