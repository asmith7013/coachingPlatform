import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { CapMetricFieldsSchema } from './cap-metric';
import { CapEvidenceFieldsSchema } from './cap-evidence';

// ===== CAP OUTCOME FIELDS SCHEMA =====
export const CapOutcomeFieldsSchema = z.object({
  capId: z.string().default('').describe("Reference to main CAP"),
  type: z.string().default('').describe("Type of outcome (teacher-facing or student-facing)"),
  description: z.string().default('').describe("Expected outcome or change"),
  achieved: z.boolean().optional().default(false).describe("Was this outcome achieved?"),
  sortOrder: z.number().default(0).describe("For maintaining order"),
  metrics: z.array(CapMetricFieldsSchema).default([]).describe("Metrics that measure this outcome"),
  evidence: z.array(CapEvidenceFieldsSchema).optional().default([]).describe("Evidence supporting this outcome")
});

export const CapOutcomeZodSchema = BaseDocumentSchema.merge(CapOutcomeFieldsSchema);
export const CapOutcomeInputZodSchema = toInputSchema(CapOutcomeZodSchema);

export type CapOutcome = z.infer<typeof CapOutcomeZodSchema>;
export type CapOutcomeInput = z.infer<typeof CapOutcomeInputZodSchema>;

// Add helper for schema-driven defaults
export function createCapOutcomeDefaults(overrides: Partial<CapOutcomeInput> = {}): CapOutcomeInput {
  return {
    ...CapOutcomeInputZodSchema.parse({}),
    ...overrides
  };
}
