import { z } from "zod";

// ⚠️ Shared rubric fields to avoid circular dependencies
export const RubricFieldsZodSchema = z.object({
  score: z.number(), // Required number
  category: z.array(z.string()), // Array of category strings
  content: z.array(z.string()).optional(), // Optional array of content strings
  parentId: z.string().optional(), // Optional parent ID
  collectionId: z.string().optional(), // Optional collection ID
  hex: z.string().optional(), // Optional hex value
});

// ⚠️ Base type for rubric fields
export type RubricFields = z.infer<typeof RubricFieldsZodSchema>;

// ⚠️ Export RubricZodSchema for use in other files
export const RubricZodSchema = RubricFieldsZodSchema; 