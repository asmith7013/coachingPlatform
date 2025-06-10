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
  reasonDone: ReasonDoneZod,
  microPLTopic: z.string().optional(),
  microPLDuration: z.number().optional(),
  modelTopic: z.string().optional(),
  modelDuration: z.number().optional(),
  adminMeet: z.boolean().optional(),
  adminMeetDuration: z.number().optional(),
  NYCDone: z.boolean().optional(),
  totalDuration: TotalDurationZod,
  solvesTouchpoint: SolvesTouchpointZod,
  primaryStrategy: z.string(),
  solvesSpecificStrategy: z.string(),
  aiSummary: z.string().optional(),
  visitId: z.string().optional(),
});

// Coaching Log Full Schema
export const CoachingLogZodSchema = BaseDocumentSchema.merge(CoachingLogFieldsSchema);

// Coaching Log Input Schema
export const CoachingLogInputZodSchema = toInputSchema(CoachingLogZodSchema);

// Coaching Log Reference Schema
export const CoachingLogReferenceZodSchema = BaseReferenceZodSchema.merge(
  CoachingLogFieldsSchema
    .pick({
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
  (log) => {
    const touchpoint = log.solvesTouchpoint;
    const duration = log.totalDuration;
    return `${touchpoint} (${duration})`;
  },
  (log) => ({
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