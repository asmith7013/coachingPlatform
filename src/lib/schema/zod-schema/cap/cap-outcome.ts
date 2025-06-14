import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';

// ===== CAP OUTCOME FIELDS SCHEMA =====
export const CapOutcomeFieldsSchema = z.object({
  capId: z.string().describe("Reference to main CAP"),
  type: z.string().describe("Type of outcome (teacher-facing or student-facing)"),
  description: z.string().describe("Expected outcome or change"),
  achieved: z.boolean().optional().describe("Was this outcome achieved?"),
  sortOrder: z.number().default(0).describe("For maintaining order"),
});

export const CapOutcomeZodSchema = BaseDocumentSchema.merge(CapOutcomeFieldsSchema);
export const CapOutcomeInputZodSchema = toInputSchema(CapOutcomeZodSchema);

export type CapOutcome = z.infer<typeof CapOutcomeZodSchema>;
export type CapOutcomeInput = z.infer<typeof CapOutcomeInputZodSchema>;
