import { z } from "zod";
import { LookForItemZodSchema } from "../look-fors/look-for";
import { zDateField } from '@/lib/data/schemas/shared/dateHelpers';

// ✅ Cycle Input Schema
export const CycleInputZodSchema = z.object({
  cycleNum: z.number(), // Required number
  ipgIndicator: z.string().optional(), // Optional string
  actionPlanURL: z.string().optional(), // Optional URL string
  implementationIndicator: z.string(), // Required string
  supportCycle: z.string().optional(), // Optional string
  lookFors: z.array(LookForItemZodSchema).nonempty(), // Array of LookForItem objects
  owners: z.array(z.string()), // Array of owner IDs
});

// ✅ Cycle Full Schema
export const CycleZodSchema = CycleInputZodSchema.extend({
  _id: z.string(),
  createdAt: zDateField.optional(),
  updatedAt: zDateField.optional(),
});

// ✅ Auto-generate TypeScript types
export type CycleInput = z.infer<typeof CycleInputZodSchema>;
export type Cycle = z.infer<typeof CycleZodSchema>;