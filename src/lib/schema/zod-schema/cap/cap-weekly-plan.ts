import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { 
  VisitStatusZod,
  CoachingCycleNumberZod,
  VisitNumberZod
} from "@enums";

// ===== CAP WEEKLY PLAN FIELDS SCHEMA =====
export const CapWeeklyPlanFieldsSchema = z.object({
  capId: z.string().describe("Reference to main CAP"),
  date: z.string().describe("Planned date for this visit (ISO string)"),
  cycleNumber: CoachingCycleNumberZod.describe("Which coaching cycle this visit belongs to"),
  visitNumber: VisitNumberZod.describe("Which visit within the cycle"),
  focus: z.string().describe("Primary focus for this visit"),
  lookFor: z.string().describe("Specific things to observe or look for"),
  coachAction: z.string().describe("Actions the coach will take"),
  teacherAction: z.string().describe("Actions expected from the teacher"),
  progressMonitoring: z.string().describe("How progress will be monitored"),
  visitId: z.string().optional().describe("Reference to actual Visit entity"),
  status: VisitStatusZod.default("planned").describe("Current status of this visit"),
  sortOrder: z.number().default(0).describe("For maintaining order"),
});

export const CapWeeklyPlanZodSchema = BaseDocumentSchema.merge(CapWeeklyPlanFieldsSchema);
export const CapWeeklyPlanInputZodSchema = toInputSchema(CapWeeklyPlanZodSchema);

export type CapWeeklyPlan = z.infer<typeof CapWeeklyPlanZodSchema>;
export type CapWeeklyPlanInput = z.infer<typeof CapWeeklyPlanInputZodSchema>;
