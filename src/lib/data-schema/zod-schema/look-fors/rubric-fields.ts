import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';

// ⚠️ Shared rubric fields to avoid circular dependencies
export const RubricFieldsSchema = z.object({
  score: z.number(), // Required number
  category: z.array(z.string()), // Array of category strings
  content: z.array(z.string()).optional(), // Optional array of content strings
  parentId: z.string().optional(), // Optional parent ID
  collectionId: z.string().optional(), // Optional collection ID
  hex: z.string().optional(), // Optional hex value
});

// ⚠️ Base type for rubric fields
export type RubricFields = z.infer<typeof RubricFieldsSchema>;

// ⚠️ Full schema with base document fields
export const RubricZodSchema = BaseDocumentSchema.merge(RubricFieldsSchema);

// ⚠️ Input schema without base document fields
export const RubricInputZodSchema = toInputSchema(RubricZodSchema);

// ⚠️ Auto-generate TypeScript types
export type Rubric = z.infer<typeof RubricZodSchema>;
export type RubricInput = z.infer<typeof RubricInputZodSchema>; 