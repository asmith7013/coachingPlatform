import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { MetricCollectionMethodZod } from "@enums";

// ===== CAP METRIC FIELDS SCHEMA =====
export const CapMetricFieldsSchema = z.object({
  capId: z.string().describe("Reference to main CAP"),
  outcomeId: z.string().optional().describe("Reference to specific outcome"),
  name: z.string().describe("Metric name or identifier"),
  type: z.string().describe("Type of metric (quantitative, qualitative, etc.)"),
  description: z.string().describe("What will be measured"),
  collectionMethod: MetricCollectionMethodZod.describe("How the metric will be collected"),
  baselineValue: z.string().optional().describe("Starting value for this metric"),
  targetValue: z.string().describe("Goal or target value"),
  currentValue: z.string().optional().describe("Current measured value"),
  finalValue: z.string().optional().describe("Final measured value"),
  goalMet: z.boolean().optional().describe("Was the metric goal achieved?"),
  notes: z.string().optional().describe("Additional notes about this metric"),
  sortOrder: z.number().default(0).describe("For maintaining order"),
});

export const CapMetricZodSchema = BaseDocumentSchema.merge(CapMetricFieldsSchema);
export const CapMetricInputZodSchema = toInputSchema(CapMetricZodSchema);

export type CapMetric = z.infer<typeof CapMetricZodSchema>;
export type CapMetricInput = z.infer<typeof CapMetricInputZodSchema>;
