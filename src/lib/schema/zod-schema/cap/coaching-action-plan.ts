import { z } from "zod";
import { useMemo } from 'react';
import { getTodayString } from '@data-processing/transformers/utils/date-utils';
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { 
  IPGCoreActionZod,
  IPGSubCategoryZod,
  CoachingActionPlanStatusZod,
  MetricCollectionMethodZod,
  EvidenceTypeZod,
  CoachingCycleNumberZod,
  VisitNumberZod
} from "@enums";

// ===== NESTED SCHEMA ADDITIONS =====
export const MetricZodSchema = z.object({
  name: z.string().default('').describe("Metric name or identifier"),
  type: z.string().default('quantitative').describe("Type of metric (quantitative, qualitative, etc.)"),
  description: z.string().default('').describe("What will be measured"),
  collectionMethod: MetricCollectionMethodZod.default('observation').describe("How the metric will be collected"),
  baselineValue: z.string().default('').describe("Starting value for this metric"),
  targetValue: z.string().default('').describe("Goal or target value"),
  currentValue: z.string().default('').describe("Current measured value"),
  notes: z.string().default('').describe("Additional notes about this metric")
});

export const EvidenceZodSchema = z.object({
  type: EvidenceTypeZod.default('written_summary').describe("Type of evidence"),
  title: z.string().default('').describe("Title or brief description of evidence"),
  description: z.string().default('').describe("Detailed description of the evidence"),
  content: z.string().default('').describe("Written summary or content"),
  url: z.string().default('').describe("Link to external evidence"),
  uploadedFile: z.string().default('').describe("Path to uploaded file"),
  dateCollected: z.string().default('').describe("When this evidence was collected (ISO string)")
});

export const OutcomeZodSchema = z.object({
  type: z.string().default('').describe("Type of outcome (teacher-facing or student-facing)"),
  description: z.string().default('').describe("Expected outcome or change"),
  metrics: z.array(MetricZodSchema).default([]).describe("Metrics that measure this outcome"),
  evidence: z.array(EvidenceZodSchema).default([]).describe("Evidence supporting this outcome")
});

export const ImplementationRecordZodSchema = z.object({
  date: z.string().default('').describe("Date when implementation occurred (ISO string)"),
  visitId: z.string().default('').describe("Reference to actual Visit entity"),
  cycleNumber: CoachingCycleNumberZod.default('1').describe("Which coaching cycle this visit belongs to"),
  visitNumber: VisitNumberZod.default('1').describe("Which visit within the cycle"),
  lookForImplemented: z.string().default('').describe("What was actually observed/looked for"),
  glows: z.array(z.string()).default([]).describe("Areas of strength observed"),
  grows: z.array(z.string()).default([]).describe("Areas for improvement identified"),
  successMetrics: z.array(z.string()).default([]).describe("Metrics that showed success"),
  nextSteps: z.array(z.string()).default([]).describe("Defined next steps from this visit"),
  teacherReflection: z.string().default('').describe("Teacher's reflection on the session"),
  coachNotes: z.string().default('').describe("Additional coach observations")
});

// ===== COACHING ACTION PLAN FIELDS SCHEMA =====
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
  
  // New fields from nested schemas
  teacherOutcomes: z.array(OutcomeZodSchema).default([]).describe("Expected teacher-facing outcomes"),
  studentOutcomes: z.array(OutcomeZodSchema).default([]).describe("Expected student-facing outcomes"),
  implementationRecords: z.array(ImplementationRecordZodSchema).default([]).describe("Records of actual implementation"),
  teacherOutcomeAnalysis: z.array(z.object({
    outcomeIndex: z.number().describe("Index of the original outcome"),
    achieved: z.boolean().default(false).describe("Was this outcome achieved?"),
    evidence: z.array(EvidenceZodSchema).default([]).describe("Evidence supporting this outcome"),
    finalMetricValues: z.array(z.object({
      metricIndex: z.number().describe("Index of the original metric"),
      finalValue: z.string().default('').describe("Final measured value"),
      goalMet: z.boolean().default(false).describe("Was the metric goal achieved?")
    })).default([])
  })).default([]).describe("Analysis of teacher-facing outcomes"),
  studentOutcomeAnalysis: z.array(z.object({
    outcomeIndex: z.number().describe("Index of the original outcome"),
    achieved: z.boolean().default(false).describe("Was this outcome achieved?"),
    evidence: z.array(EvidenceZodSchema).default([]).describe("Evidence supporting this outcome"),
    finalMetricValues: z.array(z.object({
      metricIndex: z.number().describe("Index of the original metric"),
      finalValue: z.string().default('').describe("Final measured value"),
      goalMet: z.boolean().default(false).describe("Was the metric goal achieved?")
    })).default([])
  })).default([]).describe("Analysis of student-facing outcomes"),
  overallEvidence: z.array(EvidenceZodSchema).default([]).describe("Overall supporting evidence for the entire cycle")
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


// Add helper for schema-driven defaults
export function createCoachingActionPlanDefaults(overrides: Partial<CoachingActionPlanInput> = {}): CoachingActionPlanInput {
  return {
    ...CoachingActionPlanInputZodSchema.parse({}),
    ...overrides
  };
}

/**
 * Hook for form defaults with authentication context
 */
export function useCoachingActionPlanDefaults(
  overrides: Partial<CoachingActionPlanContext> = {}
): CoachingActionPlanInput {
  return useMemo(() => 
    createCoachingActionPlanDefaults({
      ...overrides
    }), 
    [overrides]
  );
}


// ===== TYPE EXPORTS =====
export type Metric = z.infer<typeof MetricZodSchema>;
export type Evidence = z.infer<typeof EvidenceZodSchema>;
export type Outcome = z.infer<typeof OutcomeZodSchema>;
export type ImplementationRecord = z.infer<typeof ImplementationRecordZodSchema>;
export type MetricCollectionMethod = z.infer<typeof MetricCollectionMethodZod>;
export type EvidenceType = z.infer<typeof EvidenceTypeZod>;
export type CoachingCycleNumber = z.infer<typeof CoachingCycleNumberZod>;
export type VisitNumber = z.infer<typeof VisitNumberZod>;
