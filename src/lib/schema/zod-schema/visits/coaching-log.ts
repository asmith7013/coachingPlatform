import { z } from "zod";
import { 
  ReasonDoneZod, 
  TotalDurationZod, 
  SolvesTouchpointZod 
} from "@enums"; 
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { BaseReferenceZodSchema } from '@zod-schema/core-types/reference';
import { createReferenceTransformer, createArrayTransformer } from "@/lib/data-processing/transformers/factories/reference-factory";
import { getTotalDurationMinutes, hasMicroPL, hasModel } from "@schema/reference/visits/coaching-log-helpers";

// Coaching Log Fields Schema
export const CoachingLogFieldsSchema = z.object({
  coachingActionPlanId: z.string().describe("Reference to CoachingActionPlan document _id - PRIMARY AGGREGATE"),
  reasonDone: ReasonDoneZod.default(ReasonDoneZod.options[0]).describe("Why coaching was completed: Full completion or early termination"),
  microPLTopic: z.string().optional().describe("Topic for micro professional learning session"),
  microPLDuration: z.number().optional().describe("Duration in minutes for micro professional learning session"),
  modelTopic: z.string().optional().describe("Topic for modeling session"),
  modelDuration: z.number().optional().describe("Duration in minutes for modeling session"),
  adminMeet: z.boolean().optional().default(false).describe("Whether administrator joined the coaching session"),
  adminMeetDuration: z.number().optional().describe("Duration in minutes of administrator participation"),
  NYCDone: z.boolean().optional().default(false).describe("Whether NYC-specific coaching requirements were met"),
  totalDuration: TotalDurationZod.default(TotalDurationZod.options[0]).describe("Total session duration: 30min, 45min, 60min, or 90min"),
  solvesTouchpoint: SolvesTouchpointZod.default(SolvesTouchpointZod.options[0]).describe("Type of coaching support: Teacher, Leader, or Combined"),
  primaryStrategy: z.string().describe("Primary strategy used in this coaching log"),
  solvesSpecificStrategy: z.string().describe("Specific strategy solved in this coaching log"),
  aiSummary: z.string().optional().describe("AI-generated summary of the coaching log"),
  visitId: z.string().optional().describe("Reference to Visit document _id this log belongs to"),
});

// Coaching Log Full Schema
export const CoachingLogZodSchema = BaseDocumentSchema.merge(CoachingLogFieldsSchema);

// Coaching Log Input Schema
export const CoachingLogInputZodSchema = toInputSchema(CoachingLogZodSchema);

// Coaching Log Reference Schema
export const CoachingLogReferenceZodSchema = BaseReferenceZodSchema.merge(
  CoachingLogFieldsSchema
    .pick({
      coachingActionPlanId: true,
      reasonDone: true,
      totalDuration: true,
      solvesTouchpoint: true,
      visitId: true,
    })
    .partial()
).extend({
  hasMicroPL: z.boolean().optional(),
  hasModel: z.boolean().optional(),
  totalDurationMinutes: z.number().optional(),
  primaryStrategyShort: z.string().optional(),
});

// Coaching Log Reference Transformer
export const coachingLogToReference = createReferenceTransformer<CoachingLog, CoachingLogReference>(
  (log) => log.primaryStrategy ? log.primaryStrategy.slice(0, 50) + (log.primaryStrategy.length > 50 ? '...' : '') : 'Coaching Log',
  (log) => ({
    coachingActionPlanId: log.coachingActionPlanId,
    reasonDone: log.reasonDone,
    totalDuration: log.totalDuration,
    solvesTouchpoint: log.solvesTouchpoint,
    visitId: log.visitId,
    hasMicroPL: hasMicroPL(log),
    hasModel: hasModel(log),
    totalDurationMinutes: getTotalDurationMinutes(log),
    primaryStrategyShort: log.primaryStrategy?.slice(0, 50) + (log.primaryStrategy?.length > 50 ? '...' : ''),
  }),
  CoachingLogReferenceZodSchema
);

// Array transformer
export const coachingLogsToReferences = createArrayTransformer<CoachingLog, CoachingLogReference>(
  coachingLogToReference
);

// Auto-generate TypeScript types
export type CoachingLogInput = z.infer<typeof CoachingLogInputZodSchema>;
export type CoachingLog = z.infer<typeof CoachingLogZodSchema>;
export type CoachingLogReference = z.infer<typeof CoachingLogReferenceZodSchema>;

// Add helper for schema-driven defaults
export function createCoachingLogDefaults(overrides: Partial<CoachingLogInput> = {}): CoachingLogInput {
  return {
    ...CoachingLogInputZodSchema.parse({}),
    ...overrides
  };
}