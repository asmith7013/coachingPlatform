import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { 
  VisitStatusZod,
  CoachingCycleNumberZod,
  VisitNumberZod
} from "@enums";

// ===== CAP WEEKLY PLAN FIELDS SCHEMA =====
export const CapWeeklyPlanFieldsSchema = z.object({
  date: z.string().default('').describe("Planned date for this visit (ISO string)"),
  cycleNumber: CoachingCycleNumberZod.default(CoachingCycleNumberZod.options[0]).describe("Which coaching cycle this visit belongs to"),
  visitNumber: VisitNumberZod.default(VisitNumberZod.options[0]).describe("Which visit within the cycle"),
  focus: z.string().default('').describe("Primary focus for this visit"),
  lookFor: z.string().default('').describe("Specific things to observe or look for"),
  coachAction: z.string().default('').describe("Actions the coach will take"),
  teacherAction: z.string().default('').describe("Actions expected from the teacher"),
  progressMonitoring: z.string().default('').describe("How progress will be monitored"),
  visitId: z.string().optional().default('').describe("Reference to actual Visit entity"),
  status: VisitStatusZod.default("planned").describe("Current status of this visit")
});

export const CapWeeklyPlanZodSchema = BaseDocumentSchema.merge(CapWeeklyPlanFieldsSchema);
export const CapWeeklyPlanInputZodSchema = toInputSchema(CapWeeklyPlanZodSchema);

export type CapWeeklyPlan = z.infer<typeof CapWeeklyPlanZodSchema>;
export type CapWeeklyPlanInput = z.infer<typeof CapWeeklyPlanInputZodSchema>;

// Add helper for schema-driven defaults
export function createCapWeeklyPlanDefaults(overrides: Partial<CapWeeklyPlanInput> = {}): CapWeeklyPlanInput {
  return {
    ...CapWeeklyPlanInputZodSchema.parse({}),
    ...overrides
  };
}
