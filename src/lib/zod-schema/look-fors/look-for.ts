import { z } from "zod";
import { RubricZodSchema } from "./rubric"; // Assuming Rubric has its own schema

// ✅ LookFor Schema
export const LookForZodSchema = z.object({
  _id: z.string().optional(), // MongoDB auto-generates this
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
export type LookFor = z.infer<typeof LookForZodSchema>;
export type LookForItem = z.infer<typeof LookForItemZodSchema>;