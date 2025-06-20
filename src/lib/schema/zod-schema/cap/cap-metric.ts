import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { MetricCollectionMethodZod } from "@enums";

// ===== CAP METRIC FIELDS SCHEMA =====
// This schema is designed to be embedded in outcomes within CAP documents
export const CapMetricFieldsSchema = z.object({
  name: z.string().default('').describe("Metric name or identifier"),
  type: z.string().default('').describe("Type of metric (quantitative, qualitative, etc.)"),
  description: z.string().default('').describe("What will be measured"),
  collectionMethod: MetricCollectionMethodZod.default(MetricCollectionMethodZod.options[0]).describe("How the metric will be collected"),
  baselineValue: z.string().optional().default('').describe("Starting value for this metric"),
  targetValue: z.string().default('').describe("Goal or target value"),
  currentValue: z.string().optional().default('').describe("Current measured value"),
  notes: z.string().optional().default('').describe("Additional notes about this metric")
});

// Keep standalone document schemas for backward compatibility and potential future use
export const CapMetricZodSchema = BaseDocumentSchema.merge(CapMetricFieldsSchema);
export const CapMetricInputZodSchema = toInputSchema(CapMetricZodSchema);

export type CapMetric = z.infer<typeof CapMetricZodSchema>;
export type CapMetricInput = z.infer<typeof CapMetricInputZodSchema>;

// Keep type exports for the fields only (used in embedded contexts)
export type CapMetricFields = z.infer<typeof CapMetricFieldsSchema>;

// Add helper for schema-driven defaults
export function createCapMetricDefaults(overrides: Partial<CapMetricInput> = {}): CapMetricInput {
  return {
    ...CapMetricInputZodSchema.parse({}),
    ...overrides
  };
}
