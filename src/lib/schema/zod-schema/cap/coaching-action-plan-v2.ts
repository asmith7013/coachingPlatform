import { z } from "zod";
import { useMemo } from 'react';
import { getTodayString } from '@data-processing/transformers/utils/date-utils';
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { 
  IPGCoreActionZod,
  IPGSubCategoryZod,
  CoachingActionPlanStatusZod
} from "@enums";

// ===== COACHING ACTION PLAN V2 FIELDS SCHEMA =====
export const CoachingActionPlanV2FieldsSchema = z.object({
  // Core identification
  title: z.string().describe("Title of the coaching action plan"),
  teachers: z.array(z.string()).describe("References to teachers being coached"),
  coaches: z.array(z.string()).describe("References to coaches leading the plan"),
  school: z.string().describe("Reference to school where coaching takes place"),
  academicYear: z.string().describe("Academic year for this plan (e.g., '2024-2025')"),
  
  // Flattened needs and focus (no nested objects)
  ipgCoreAction: IPGCoreActionZod.describe("Primary IPG Core Action focus"),
  ipgSubCategory: IPGSubCategoryZod.describe("Sub-category within the core action"),
  rationale: z.string().default('').describe("Rationale for selecting this focus area"),
  pdfAttachment: z.string().optional().describe("Path or URL to supporting PDF document"),
  
  // Simple goal statement (complex goals handled in separate schema)
  goalDescription: z.string().default('').describe("Primary goal statement"),
  
  // Status and metadata
  status: CoachingActionPlanStatusZod.default("draft").describe("Current status of the plan"),
  startDate: z.string().describe("When coaching plan begins (ISO string)"),
  endDate: z.string().optional().describe("When coaching plan ends (ISO string)"),
  cycleLength: z.number().default(3).describe("Number of coaching cycles in this plan"),
  
  // Goal achievement tracking (flat)
  goalMet: z.boolean().optional().describe("Was the primary goal achieved?"),
  impactOnLearning: z.string().optional().describe("Analysis of impact on student learning"),
  lessonsLearned: z.string().optional().describe("Key lessons learned from this coaching cycle"),
  recommendationsForNext: z.string().optional().describe("Recommendations for the next coaching cycle"),
  
  // References to related entities
  relatedVisits: z.array(z.string()).optional().describe("Array of Visit IDs related to this plan"),
  relatedCycles: z.array(z.string()).optional().describe("Array of Cycle IDs related to this plan"),
});

// ===== FULL SCHEMA USING BASE PATTERN =====
export const CoachingActionPlanV2ZodSchema = BaseDocumentSchema.merge(CoachingActionPlanV2FieldsSchema);

// ===== INPUT SCHEMA USING UTILITY =====
export const CoachingActionPlanV2InputZodSchema = toInputSchema(CoachingActionPlanV2ZodSchema);

// ===== TYPE EXPORTS =====
export type CoachingActionPlanV2 = z.infer<typeof CoachingActionPlanV2ZodSchema>;
export type CoachingActionPlanV2Input = z.infer<typeof CoachingActionPlanV2InputZodSchema>;

// ===== CONTEXT AND DEFAULTS =====
export interface CoachingActionPlanV2Context {
  userId?: string;
  schoolId?: string;
  teacherId?: string;
  coachId?: string;
  academicYear?: string;
}

/**
 * Factory function for creating coaching action plan V2 defaults with context
 */
export function createCoachingActionPlanV2Defaults(
  context: CoachingActionPlanV2Context = {}
): CoachingActionPlanV2Input {
  const baseDefaults = CoachingActionPlanV2InputZodSchema.parse({
    title: '',
    teachers: context.teacherId ? [context.teacherId] : [],
    coaches: context.coachId ? [context.coachId] : [],
    school: context.schoolId || '',
    academicYear: context.academicYear || '2024-2025',
    ipgCoreAction: 'CA1',
    ipgSubCategory: 'CA1a',
    rationale: '',
    goalDescription: '',
    startDate: getTodayString(),
    owners: context.userId ? [context.userId] : [],
  });
  
  return {
    ...baseDefaults,
    school: context.schoolId || baseDefaults.school,
    teachers: context.teacherId ? [context.teacherId] : baseDefaults.teachers,
    coaches: context.coachId ? [context.coachId] : context.userId ? [context.userId] : baseDefaults.coaches,
    owners: context.userId ? [context.userId] : baseDefaults.owners,
  };
}

/**
 * Hook for form defaults with authentication context
 */
export function useCoachingActionPlanV2Defaults(
  overrides: Partial<CoachingActionPlanV2Context> = {}
): CoachingActionPlanV2Input {
  return useMemo(() => 
    createCoachingActionPlanV2Defaults({
      ...overrides
    }), 
    [overrides]
  );
}
