import { z } from "zod";
import { RubricZodSchema } from "./rubric"; // Assuming Rubric has its own schema
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';

// LookFor Fields Schema
export const LookForFieldsSchema = z.object({
  lookForIndex: z.number(), // Required number
  schools: z.array(z.string()), // Array of school IDs
  teachers: z.array(z.string()), // Array of teacher IDs
  topic: z.string(), // Required string
  description: z.string(), // Required string
  category: z.string().optional(), // Optional category
  status: z.string().optional(), // Optional status
  studentFacing: z.string(), // Required boolean
  rubric: z.array(RubricZodSchema), // Array of rubric items
});

// LookFor Full Schema
export const LookForZodSchema = BaseDocumentSchema.merge(LookForFieldsSchema);

// LookFor Input Schema
export const LookForInputZodSchema = toInputSchema(LookForZodSchema);

// LookForItem Schema (shared schema)
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

// Auto-generate TypeScript types
export type LookForInput = z.infer<typeof LookForInputZodSchema>;
export type LookFor = z.infer<typeof LookForZodSchema>;
export type LookForItem = z.infer<typeof LookForItemZodSchema>;