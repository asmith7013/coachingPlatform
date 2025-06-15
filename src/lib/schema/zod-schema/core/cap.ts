import { z } from "zod";
import { getTodayString } from '@data-processing/transformers/utils/date-utils';
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { 
  IPGCoreActionZod,
  IPGSubCategoryZod,
  CoachingActionPlanStatusZod
} from "@enums";
import { createReferenceTransformer } from "@data-processing/transformers/factories/reference-factory";
import { BaseReferenceZodSchema } from "../core-types/reference";

// Re-export everything from the comprehensive CAP schema
export * from '../cap/cap-outcome';
export * from '../cap/cap-metric';
export * from '../cap/cap-evidence';
export * from '../cap/cap-implementation-record';
export * from '../cap/cap-weekly-plan';

// Keep the core simple CAP schema for compatibility
export const CoachingActionPlanFieldsSchema = z.object({
  // Core identification
  title: z.string().default('').describe("Title of the coaching action plan"),
  teachers: z.array(z.string()).default([]).describe("References to teachers being coached"),
  coaches: z.array(z.string()).default([]).describe("References to coaches leading the plan"),
  school: z.string().default('').describe("Reference to school where coaching takes place"),
  academicYear: z.string().default('2024-2025').describe("Academic year for this plan (e.g., '2024-2025')"),
  
  // Flattened needs and focus (no nested objects)
  ipgCoreAction: IPGCoreActionZod.default('CA1').describe("Primary IPG Core Action focus"),
  ipgSubCategory: IPGSubCategoryZod.default('CA1a').describe("Sub-category within the core action"),
  rationale: z.string().default('').describe("Rationale for selecting this focus area"),
  pdfAttachment: z.string().optional().default('').describe("Path or URL to supporting PDF document"),
  
  // Simple goal statement (complex goals handled in separate schema)
  goalDescription: z.string().default('').describe("Primary goal statement"),
  
  // Status and metadata
  status: CoachingActionPlanStatusZod.default("draft").describe("Current status of the plan"),
  startDate: z.string().default(() => getTodayString()).describe("When coaching plan begins (ISO string)"),
  endDate: z.string().optional().default('').describe("When coaching plan ends (ISO string)"),
  cycleLength: z.number().default(3).describe("Number of coaching cycles in this plan"),
  
  // Goal achievement tracking (flat)
  goalMet: z.boolean().optional().default(false).describe("Was the primary goal achieved?"),
  impactOnLearning: z.string().optional().default('').describe("Analysis of impact on student learning"),
  lessonsLearned: z.string().optional().default('').describe("Key lessons learned from this coaching cycle"),
  recommendationsForNext: z.string().optional().default('').describe("Recommendations for the next coaching cycle"),
  
  // References to related entities
  relatedVisits: z.array(z.string()).default([]).describe("Array of Visit IDs related to this plan"),
  relatedCycles: z.array(z.string()).default([]).describe("Array of Cycle IDs related to this plan"),
});

// ===== FULL SCHEMA USING BASE PATTERN =====
export const CoachingActionPlanZodSchema = BaseDocumentSchema.merge(CoachingActionPlanFieldsSchema);

// ===== INPUT SCHEMA USING UTILITY =====
export const CoachingActionPlanInputZodSchema = toInputSchema(CoachingActionPlanZodSchema);

// ===== TYPE EXPORTS =====
export type CoachingActionPlan = z.infer<typeof CoachingActionPlanZodSchema>;
export type CoachingActionPlanInput = z.infer<typeof CoachingActionPlanInputZodSchema>;

// ===== CONTEXT AND DEFAULTS =====
export interface CoachingActionPlanContext {
  userId?: string;
  schoolId?: string;
  teacherId?: string;
  coachId?: string;
  academicYear?: string;
}

export const CoachingActionPlanReferenceZodSchema = BaseReferenceZodSchema.extend({
  title: z.string().describe("Title of the coaching action plan"),
  startDate: z.string().optional().describe("When coaching plan begins (ISO string)"),
  endDate: z.string().optional().describe("When coaching plan ends (ISO string)"),
});

export const coachingActionPlanToReference = createReferenceTransformer<CoachingActionPlan, CoachingActionPlanReference>(
  (cap) => cap.title,
  (cap) => ({
    title: cap.title,
    startDate: cap.startDate || undefined,
    endDate: cap.endDate || undefined,
  }),
  CoachingActionPlanReferenceZodSchema
);

export function createCoachingActionPlanDefaults(overrides: Partial<CoachingActionPlanInput> = {}): CoachingActionPlanInput {
  return {
    ...CoachingActionPlanInputZodSchema.parse({}),
    ...overrides
  };
}

export type CoachingActionPlanReference = z.infer<typeof CoachingActionPlanReferenceZodSchema>;
