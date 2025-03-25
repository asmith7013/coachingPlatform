import { z } from "zod";

// ✅ Rubric Schema
export const RubricZodSchema = z.object({
  score: z.number(), // Required number
  category: z.array(z.string()), // Array of category strings
  content: z.array(z.string()).optional(), // Optional array of content strings
  parentId: z.string().optional(), // Optional parent ID
  collectionId: z.string().optional(), // Optional collection ID
  hex: z.string().optional(), // Optional hex value
});

// ✅ RubricScore Schema
export const RubricScoreZodSchema = z.object({
  date: z.string(), // Required ISO date string
  score: z.number(), // Required score
  staffId: z.string(), // Required staff ID
  school: z.string(), // Required school ID
  owners: z.array(z.string()), // Array of owner IDs
  createdAt: z.date().optional(), // Use Date type instead of string
  updatedAt: z.date().optional(), // Use Date type instead of string
});

// ✅ Auto-generate TypeScript types
export type Rubric = z.infer<typeof RubricZodSchema>;
export type RubricScore = z.infer<typeof RubricScoreZodSchema>;