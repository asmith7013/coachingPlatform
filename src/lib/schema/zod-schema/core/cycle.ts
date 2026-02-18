import { z } from "zod";
import { LookForItemZodSchema } from "@zod-schema/look-fors/look-for";
import { BaseDocumentSchema, toInputSchema } from "@zod-schema/base-schemas";
import { BaseReferenceZodSchema } from "@zod-schema/core-types/reference";
import {
  createReferenceTransformer,
  createArrayTransformer,
} from "@data-processing/transformers/factories/reference-factory";
import { getCycleDisplayString } from "@schema/reference/core/cycle-helpers";
import { getImplementationLevel } from "@schema/reference/core/cycle-helpers";

// Cycle Fields Schema
export const CycleFieldsSchema = z.object({
  cycleNum: z
    .number()
    .default(1)
    .describe("Coaching cycle number (typically 1-4 per school year)"),
  ipgIndicator: z.string().optional().default(""),
  actionPlanURL: z.string().optional().default(""),
  implementationIndicator: z
    .string()
    .default("")
    .describe(
      "Current implementation level: Beginning, Developing, or Proficient",
    ),
  supportCycle: z.string().optional().default(""),
  lookFors: z
    .array(LookForItemZodSchema)
    .nonempty()
    .default([LookForItemZodSchema.parse({})])
    .describe("Look-for items selected for this coaching cycle"),
});

// Cycle Full Schema
export const CycleZodSchema = BaseDocumentSchema.merge(CycleFieldsSchema);

// Cycle Input Schema
export const CycleInputZodSchema = toInputSchema(CycleZodSchema);

// Cycle Reference Schema
export const CycleReferenceZodSchema = BaseReferenceZodSchema.merge(
  CycleFieldsSchema.pick({
    cycleNum: true,
    ipgIndicator: true,
    implementationIndicator: true,
    supportCycle: true,
  }).partial(),
).extend({
  lookForCount: z.number().optional(),
  hasActionPlan: z.boolean().optional(),
  activeLookFors: z.number().optional(),
  implementationLevel: z.string().optional(),
  displayName: z.string().optional(),
});

// Cycle Reference Transformer
export const cycleToReference = createReferenceTransformer<
  Cycle,
  CycleReference
>(
  (cycle) => `Cycle ${cycle.cycleNum}`,
  (cycle) => ({
    cycleNum: cycle.cycleNum,
    ipgIndicator: cycle.ipgIndicator,
    implementationIndicator: cycle.implementationIndicator,
    supportCycle: cycle.supportCycle,
    lookForCount: cycle.lookFors?.length || 0,
    hasActionPlan: !!cycle.actionPlanURL,
    activeLookFors: cycle.lookFors?.filter((lf) => lf.active)?.length || 0,
    implementationLevel: getImplementationLevel(cycle.implementationIndicator),
    displayName: getCycleDisplayString(cycle),
  }),
  CycleReferenceZodSchema,
);

// Array transformer
export const cyclesToReferences = createArrayTransformer<Cycle, CycleReference>(
  cycleToReference,
);

// Auto-generate TypeScript types
export type CycleInput = z.infer<typeof CycleInputZodSchema>;
export type Cycle = z.infer<typeof CycleZodSchema>;
export type CycleReference = z.infer<typeof CycleReferenceZodSchema>;

// Add helper for schema-driven defaults
export function createCycleDefaults(
  overrides: Partial<CycleInput> = {},
): CycleInput {
  return {
    ...CycleInputZodSchema.parse({}),
    ...overrides,
  };
}
