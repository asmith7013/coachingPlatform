import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { BaseReferenceZodSchema } from '@zod-schema/core-types/reference';
import { createReferenceTransformer, createArrayTransformer } from "@transformers/factories/reference-factory";
import { zDateField } from '@zod-schema/shared/dateHelpers';

// IPG Core Action Enum (based on IPG data)
export const IPGCoreActionZod = z.enum([
  "CA1", // Ensure the work reflects Focus, Coherence, and Rigor
  "CA2", // Employ instructional practices for all students  
  "CA3"  // Provide opportunities for mathematical practices
]);

// IPG Sub Category Enum - varies by core action
export const IPGSubCategoryZod = z.enum([
  // CA1 sections
  "CA1A", // Grade-level cluster focus
  "CA1B", // Relates new content to prior math
  "CA1C", // Targets appropriate rigor aspects
  
  // CA2 sections  
  "CA2A", // Makes mathematics explicit
  "CA2B", // Strategically shares student representations
  
  // CA3 sections
  "CA3A", // Grade-level problems and exercises
  "CA3B", // Cultivates reasoning and problem solving
  "CA3C", // Prompts students to explain thinking
  "CA3D", // Creates conditions for student conversations
  "CA3E"  // Connects informal to precise mathematical language
]);

// Metric Collection Method Enum
export const MetricCollectionMethodZod = z.enum([
  "observation",
  "student_work_analysis", 
  "assessment_data",
  "interview",
  "survey",
  "documentation_review",
  "self_reflection",
  "other"
]);

// Visit Status Enum
export const VisitStatusZod = z.enum([
  "planned",
  "completed", 
  "cancelled",
  "rescheduled"
]);

// Cycle Position Enum - separate cycle and visit for cleaner data
export const CoachingCycleNumberZod = z.enum(["1", "2", "3"]);
export const VisitNumberZod = z.enum(["1", "2", "3"]);

// Metric Schema - for both teacher and student outcomes
export const MetricZodSchema = z.object({
  description: z.string().describe("What will be measured"),
  collectionMethod: MetricCollectionMethodZod.describe("How the metric will be collected"),
  goalValue: z.string().describe("Target or goal for this metric"),
  currentValue: z.string().optional().describe("Current measured value"),
  notes: z.string().optional().describe("Additional notes about this metric")
});

// Outcome Schema - for both teacher and student outcomes
export const OutcomeZodSchema = z.object({
  description: z.string().describe("Expected outcome or change"),
  metrics: z.array(MetricZodSchema).describe("Metrics that measure this outcome"),
  evidence: z.string().optional().describe("Evidence that supports this outcome")
});

// Stage 1: Needs and Focus Schema
export const NeedsAndFocusZodSchema = z.object({
  ipgCoreAction: IPGCoreActionZod.describe("Primary IPG Core Action focus"),
  ipgSubCategory: IPGSubCategoryZod.describe("Sub-category within the core action"),
  rationale: z.string().describe("Rationale for selecting this focus area"),
  pdfAttachment: z.string().optional().describe("Path or URL to supporting PDF document")
});

// Goal Schema
export const GoalZodSchema = z.object({
  description: z.string().describe("Primary goal statement"),
  teacherOutcomes: z.array(OutcomeZodSchema).describe("Expected teacher-facing outcomes"),
  studentOutcomes: z.array(OutcomeZodSchema).describe("Expected student-facing outcomes")
});

// Weekly Visit Plan Schema
export const WeeklyVisitPlanZodSchema = z.object({
  date: zDateField.describe("Planned date for this visit"),
  cycleNumber: CoachingCycleNumberZod.describe("Which coaching cycle this visit belongs to"),
  visitNumber: VisitNumberZod.describe("Which visit within the cycle"),
  focus: z.string().describe("Primary focus for this visit"),
  lookFor: z.string().describe("Specific things to observe or look for"),
  coachAction: z.string().describe("Actions the coach will take"),
  teacherAction: z.string().describe("Actions expected from the teacher"),
  progressMonitoring: z.string().describe("How progress will be monitored"),
  visitId: z.string().optional().describe("Reference to actual Visit entity"),
  status: VisitStatusZod.default("planned").describe("Current status of this visit")
});

// Implementation Record Schema - what actually happened
export const ImplementationRecordZodSchema = z.object({
  date: zDateField.describe("Date when implementation occurred"),
  visitId: z.string().optional().describe("Reference to actual Visit entity"),
  cycleNumber: CoachingCycleNumberZod.describe("Which coaching cycle this visit belongs to"),
  visitNumber: VisitNumberZod.describe("Which visit within the cycle"),
  lookForImplemented: z.string().describe("What was actually observed/looked for"),
  glows: z.array(z.string()).describe("Areas of strength observed"),
  grows: z.array(z.string()).describe("Areas for improvement identified"),
  successMetrics: z.array(z.string()).describe("Metrics that showed success"),
  nextSteps: z.array(z.string()).describe("Defined next steps from this visit"),
  teacherReflection: z.string().optional().describe("Teacher's reflection on the session"),
  coachNotes: z.string().optional().describe("Additional coach observations")
});

// Evidence Schema
export const EvidenceZodSchema = z.object({
  type: z.enum(["written_summary", "link", "document", "photo", "video"]).describe("Type of evidence"),
  title: z.string().describe("Title or brief description of evidence"),
  content: z.string().optional().describe("Written summary or content"),
  url: z.string().optional().describe("Link to external evidence"),
  uploadedFile: z.string().optional().describe("Path to uploaded file"),
  dateCollected: zDateField.describe("When this evidence was collected")
});

// End of Cycle Analysis Schema
export const EndOfCycleAnalysisZodSchema = z.object({
  goalMet: z.boolean().describe("Was the primary goal achieved?"),
  teacherOutcomeAnalysis: z.array(z.object({
    outcomeId: z.string().describe("Reference to the original outcome"),
    achieved: z.boolean().describe("Was this outcome achieved?"),
    evidence: z.array(EvidenceZodSchema).describe("Evidence supporting this outcome"),
    finalMetricValues: z.array(z.object({
      metricId: z.string().describe("Reference to the original metric"),
      finalValue: z.string().describe("Final measured value"),
      goalMet: z.boolean().describe("Was the metric goal achieved?")
    }))
  })).describe("Analysis of teacher-facing outcomes"),
  studentOutcomeAnalysis: z.array(z.object({
    outcomeId: z.string().describe("Reference to the original outcome"),
    achieved: z.boolean().describe("Was this outcome achieved?"),
    evidence: z.array(EvidenceZodSchema).describe("Evidence supporting this outcome"),
    finalMetricValues: z.array(z.object({
      metricId: z.string().describe("Reference to the original metric"),
      finalValue: z.string().describe("Final measured value"),
      goalMet: z.boolean().describe("Was the metric goal achieved?")
    }))
  })).describe("Analysis of student-facing outcomes"),
  impactOnLearning: z.string().describe("Analysis of impact on student learning and how to build on this"),
  overallEvidence: z.array(EvidenceZodSchema).describe("Overall supporting evidence for the entire cycle"),
  lessonsLearned: z.string().optional().describe("Key lessons learned from this coaching cycle"),
  recommendationsForNext: z.string().optional().describe("Recommendations for the next coaching cycle")
});

// Main Coaching Action Plan Fields Schema
export const CoachingActionPlanFieldsSchema = z.object({
  title: z.string().describe("Title of the coaching action plan"),
  teachers: z.array(z.string()).describe("References to teachers being coached"),
  coaches: z.array(z.string()).describe("References to coaches leading the plan"),
  school: z.string().describe("Reference to school where coaching takes place"),
  academicYear: z.string().describe("Academic year for this plan (e.g., '2024-2025')"),
  
  // Stage 1: Needs and Focus
  needsAndFocus: NeedsAndFocusZodSchema.describe("Initial needs assessment and focus area"),
  
  // Goal Definition
  goal: GoalZodSchema.describe("Primary goal and expected outcomes"),
  
  // Planning Implementation (Weekly Plans)
  weeklyPlans: z.array(WeeklyVisitPlanZodSchema).describe("Week-by-week visit plans"),
  
  // Implementation Record (What Actually Happened)
  implementationRecords: z.array(ImplementationRecordZodSchema).describe("Records of actual implementation"),
  
  // End of Cycle Analysis
  endOfCycleAnalysis: EndOfCycleAnalysisZodSchema.optional().describe("Final analysis and outcomes"),
  
  // Metadata
  status: z.enum(["draft", "active", "completed", "archived"]).default("draft").describe("Current status of the plan"),
  startDate: zDateField.describe("When coaching plan begins"),
  endDate: zDateField.optional().describe("When coaching plan ends"),
  cycleLength: z.number().default(3).describe("Number of coaching cycles in this plan"),
  
  // Related entities
  relatedVisits: z.array(z.string()).optional().describe("Array of Visit IDs related to this plan"),
  relatedCycles: z.array(z.string()).optional().describe("Array of Cycle IDs related to this plan")
});

// Coaching Action Plan Full Schema
export const CoachingActionPlanZodSchema = BaseDocumentSchema.merge(CoachingActionPlanFieldsSchema);

// Coaching Action Plan Input Schema
export const CoachingActionPlanInputZodSchema = toInputSchema(CoachingActionPlanZodSchema);

// Coaching Action Plan Reference Schema
export const CoachingActionPlanReferenceZodSchema = BaseReferenceZodSchema.merge(
  z.object({
    teachers: z.array(z.string()).optional(),
    coaches: z.array(z.string()).optional(),
    school: z.string().optional(),
    academicYear: z.string().optional(),
    status: z.string().optional(),
    startDate: zDateField.optional(),
    endDate: zDateField.optional(),
  })
).extend({
  teacherNames: z.array(z.string()).optional().describe("Teacher names for display"),
  coachNames: z.array(z.string()).optional().describe("Coach names for display"),
  schoolName: z.string().optional().describe("School name for display"),
  progress: z.string().optional().describe("Current progress status"),
  completedVisits: z.number().optional().describe("Number of completed visits"),
  totalPlannedVisits: z.number().optional().describe("Total number of planned visits")
});

// Reference transformer
export const coachingActionPlanToReference = createReferenceTransformer<CoachingActionPlan, CoachingActionPlanReference>(
  // Label function: Create display string
  (plan) => `${plan.title} - ${plan.academicYear}`,
  
  // Additional fields function
  (plan) => ({
    teachers: plan.teachers,
    coaches: plan.coaches,
    school: plan.school,
    academicYear: plan.academicYear,
    status: plan.status,
    startDate: plan.startDate,
    endDate: plan.endDate,
    completedVisits: plan.implementationRecords?.length || 0,
    totalPlannedVisits: plan.weeklyPlans?.length || 0,
    progress: `${plan.implementationRecords?.length || 0}/${plan.weeklyPlans?.length || 0} visits completed`
  }),
  
  // Validation schema
  CoachingActionPlanReferenceZodSchema as z.ZodType<CoachingActionPlanReference>
);

// Array transformer
export const coachingActionPlansToReferences = createArrayTransformer<CoachingActionPlan, CoachingActionPlanReference>(
  coachingActionPlanToReference
);

// Auto-generate TypeScript types
export type MetricCollectionMethod = z.infer<typeof MetricCollectionMethodZod>;
export type VisitStatus = z.infer<typeof VisitStatusZod>;
export type CoachingCycleNumber = z.infer<typeof CoachingCycleNumberZod>;
export type VisitNumber = z.infer<typeof VisitNumberZod>;
export type IPGCoreAction = z.infer<typeof IPGCoreActionZod>;
export type IPGSubCategory = z.infer<typeof IPGSubCategoryZod>;

export type Metric = z.infer<typeof MetricZodSchema>;
export type Outcome = z.infer<typeof OutcomeZodSchema>;
export type NeedsAndFocus = z.infer<typeof NeedsAndFocusZodSchema>;
export type Goal = z.infer<typeof GoalZodSchema>;
export type WeeklyVisitPlan = z.infer<typeof WeeklyVisitPlanZodSchema>;
export type ImplementationRecord = z.infer<typeof ImplementationRecordZodSchema>;
export type Evidence = z.infer<typeof EvidenceZodSchema>;
export type EndOfCycleAnalysis = z.infer<typeof EndOfCycleAnalysisZodSchema>;

export type CoachingActionPlanInput = z.infer<typeof CoachingActionPlanInputZodSchema>;
export type CoachingActionPlan = z.infer<typeof CoachingActionPlanZodSchema>;
export type CoachingActionPlanReference = z.infer<typeof CoachingActionPlanReferenceZodSchema>;