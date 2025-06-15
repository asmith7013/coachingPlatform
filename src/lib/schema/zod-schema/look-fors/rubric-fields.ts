import { z } from "zod";

// ⚠️ Shared rubric fields to avoid circular dependencies
export const RubricFieldsZodSchema = z.object({
  score: z.number().default(1), // Required number
  category: z.array(z.string()).default([]), // Array of category strings
  content: z.array(z.string()).optional().default([]), // Optional array of content strings
  parentId: z.string().optional().default(''), // Optional parent ID
  collectionId: z.string().optional().default(''), // Optional collection ID
  hex: z.string().optional().default(''), // Optional hex value
});

// ⚠️ Base type for rubric fields
export type RubricFields = z.infer<typeof RubricFieldsZodSchema>;

// ⚠️ Export RubricZodSchema for use in other files
export const RubricZodSchema = RubricFieldsZodSchema;

// Helper for schema-driven defaults
export function createRubricFieldsDefaults(overrides: Partial<RubricFields> = {}): RubricFields {
  return {
    ...RubricFieldsZodSchema.parse({}),
    ...overrides
  };
}