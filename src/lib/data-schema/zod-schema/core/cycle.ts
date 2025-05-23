import { z } from "zod";
import { LookForItemZodSchema } from "@zod-schema/look-fors/look-for";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';

// Cycle Fields Schema
export const CycleFieldsSchema = z.object({
  cycleNum: z.number(), // Required number
  ipgIndicator: z.string().optional(), // Optional string
  actionPlanURL: z.string().optional(), // Optional URL string
  implementationIndicator: z.string(), // Required string
  supportCycle: z.string().optional(), // Optional string
  lookFors: z.array(LookForItemZodSchema).nonempty(), // Array of LookForItem objects
});

// Cycle Full Schema
export const CycleZodSchema = BaseDocumentSchema.merge(CycleFieldsSchema);

// Cycle Input Schema
export const CycleInputZodSchema = toInputSchema(CycleZodSchema);

// Auto-generate TypeScript types
export type CycleInput = z.infer<typeof CycleInputZodSchema>;
export type Cycle = z.infer<typeof CycleZodSchema>;