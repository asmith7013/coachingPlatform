import { z } from "zod";

// ✅ NextStep Schema
export const NextStepZodSchema = z.object({
  _id: z.string().optional(), // MongoDB auto-generates this
  description: z.string(), // Required description of the next step
  lookFor: z.string(), // Required LookFor reference ID
  teacher: z.string(), // Required Teacher reference ID
  school: z.string(), // Required School reference ID
  owners: z.array(z.string()), // Array of owner IDs
  createdAt: z.date().optional(), // Use Date type instead of string
  updatedAt: z.date().optional(), // Use Date type instead of string
});

// ✅ Auto-generate TypeScript type
export type NextStep = z.infer<typeof NextStepZodSchema>;