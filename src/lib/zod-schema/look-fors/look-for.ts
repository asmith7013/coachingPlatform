import { z } from "zod";
import { RubricZodSchema } from "./rubric"; // Assuming Rubric has its own schema

// Base schema for look-for input (create/update)
export const LookForInputZodSchema = z.object({
  lookForIndex: z.number(), // Required number
  schools: z.array(z.string()), // Array of school IDs
  teachers: z.array(z.string()), // Array of teacher IDs
  topic: z.string(), // Required string
  description: z.string(), // Required string
  category: z.string().optional(), // Optional category
  status: z.string().optional(), // Optional status
  studentFacing: z.string(), // Required boolean
  rubric: z.array(RubricZodSchema), // Array of rubric items
  owners: z.array(z.string()), // Array of owner IDs
  createdAt: z.date().optional(), // Match Mongoose timestamps
  updatedAt: z.date().optional(), // Match Mongoose timestamps
});

// ✅ LookFor Schema (includes _id for returned documents)
export const LookForZodSchema = LookForInputZodSchema.extend({
  _id: z.string(), // Required for returned documents
});

// ✅ LookForItem Schema
export const LookForItemZodSchema = z.object({
  originalLookFor: z.string(),
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()), // Array of tags
  lookForIndex: z.number(),
  teacherIDs: z.array(z.string()), // Array of teacher IDs
  chosenBy: z.array(z.string()), // Array of chosenBy IDs
  active: z.boolean(),
});

// ✅ Auto-generate TypeScript types
export type LookForInput = z.infer<typeof LookForInputZodSchema>;
export type LookFor = z.infer<typeof LookForZodSchema>;
export type LookForItem = z.infer<typeof LookForItemZodSchema>;