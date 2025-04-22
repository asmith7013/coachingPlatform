import { z } from "zod";
import { zDateField } from '@/lib/zod-schema/shared/dateHelpers';

// ✅ NextStep Input Schema
export const NextStepInputZodSchema = z.object({
  description: z.string(), // Required description of the next step
  lookFor: z.string(), // Required LookFor reference ID
  teacher: z.string(), // Required Teacher reference ID
  school: z.string(), // Required School reference ID
  owners: z.array(z.string()), // Array of owner IDs
});

// ✅ NextStep Full Schema
export const NextStepZodSchema = NextStepInputZodSchema.extend({
  _id: z.string(),
  createdAt: zDateField.optional(),
  updatedAt: zDateField.optional(),
});

// ✅ Auto-generate TypeScript types
export type NextStepInput = z.infer<typeof NextStepInputZodSchema>;
export type NextStep = z.infer<typeof NextStepZodSchema>;