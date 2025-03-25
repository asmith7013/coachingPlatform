import { z } from "zod";
import { LookForItemZodSchema } from "../look-fors/look-for";

// ✅ Cycle Schema
export const CycleZodSchema = z.object({
  _id: z.string().optional(), // MongoDB auto-generates this
  cycleNum: z.number(), // Required number
  ipgIndicator: z.string().optional(), // Optional string
  actionPlanURL: z.string().optional(), // Optional URL string
  implementationIndicator: z.string(), // Required string
  supportCycle: z.string().optional(), // Optional string
  lookFors: z.array(LookForItemZodSchema).nonempty(), // Array of LookForItem objects
  owners: z.array(z.string()), // Array of owner IDs
  createdAt: z.date().optional(), // Match Mongoose timestamps
  updatedAt: z.date().optional(), // Match Mongoose timestamps
});

// ✅ Auto-generate TypeScript type
export type Cycle = z.infer<typeof CycleZodSchema>;