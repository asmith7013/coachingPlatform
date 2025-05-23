import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';

// NextStep Fields Schema
export const NextStepFieldsSchema = z.object({
  description: z.string(), // Required description of the next step
  lookFor: z.string(), // Required LookFor reference ID
  teacher: z.string(), // Required Teacher reference ID
  school: z.string(), // Required School reference ID
});

// NextStep Full Schema
export const NextStepZodSchema = BaseDocumentSchema.merge(NextStepFieldsSchema);

// NextStep Input Schema
export const NextStepInputZodSchema = toInputSchema(NextStepZodSchema);

// Auto-generate TypeScript types
export type NextStepInput = z.infer<typeof NextStepInputZodSchema>;
export type NextStep = z.infer<typeof NextStepZodSchema>;