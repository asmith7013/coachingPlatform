import type { Field } from '@ui-types/form';
import type { 
  CapImplementationRecord,
  CapOutcomeInput,
  CoachingActionPlan
} from '@zod-schema/cap';
import { IPGCoreActionZod, IPGSubCategoryZod } from '@zod-schema/cap';

/**
 * Simple field configurations for Coaching Action Plan stages
 * Following the new domain-specific pattern
 */

// Stage 1: Needs & Focus
export const CoachingActionPlanFieldConfig: Field<CoachingActionPlan>[] = [
  {
    name: "ipgCoreAction",
    label: "IPG Core Action",
    type: "select",
    options: IPGCoreActionZod.options.map(option => ({ value: option, label: option }))
  },
  {
    name: "ipgSubCategory",
    label: "IPG Sub-Category",
    type: "select",
    options: IPGSubCategoryZod.options.map(option => ({ value: option, label: option }))
  },
  {
    name: "rationale",
    label: "Rationale",
    type: "textarea",
    placeholder: "Explain why this focus area was selected based on teacher needs and observations...",
  },
  {
    name: "pdfAttachment",
    label: "Supporting Documentation (Optional)",
    type: "file",
    // accept: ".pdf",
    placeholder: "Upload supporting PDF document"
  }
];

// Stage 2: Goal & Outcomes
export const GoalFieldConfig: Field<CoachingActionPlan>[] = [
  {
    name: "goalDescription",
    label: "Primary Goal Description",
    type: "textarea",
    placeholder: "Describe the main goal for this coaching cycle...",
  },
  {
    name: "goalDescription",
    label: "Teacher Outcomes",
    type: "textarea",
  },
  {
    name: "goalDescription",
    label: "Student Outcomes",
    type: "textarea",
  }
];

// Stage 3: Implementation Record
export const ImplementationRecordFieldConfig: Field<CapImplementationRecord>[] = [
  {
    name: "date",
    label: "Visit Date",
    type: "date",
  },
  {
    name: "cycleNumber",
    label: "Cycle Number",
    type: "number",
  },
  {
    name: "visitNumber",
    label: "Visit Number",
    type: "number",
  },
  {
    name: "lookForImplemented",
    label: "What Was Observed",
    type: "textarea",
  },
  {
    name: "glows",
    label: "Strengths Observed",
    type: "textarea",
  },
  {
    name: "grows",
    label: "Areas for Improvement",
    type: "textarea",
  },
  {
    name: "successMetrics",
    label: "Success Metrics",
    type: "textarea",
  },
  {
    name: "nextSteps",
    label: "Next Steps",
    type: "textarea",
  }
];

// Stage 4: End of Cycle Analysis
export const EndOfCycleAnalysisFieldConfig: Field<CapOutcomeInput>[] = [
  {
    name: "goalMet",
    label: "Goal Achievement",
    type: "checkbox",
  },
  {
    name: "endOfCycleAnalysis.teacherOutcomes",
    label: "Teacher Outcome Analysis",
    type: "textarea",
  },
  {
    name: "endOfCycleAnalysis.studentOutcomes",
    label: "Student Outcome Analysis",
    type: "textarea",
  },
  {
    name: "impactOnLearning",
    label: "Impact on Learning",
    type: "textarea",
  },
  {
    name: "lessonsLearned",
    label: "Lessons Learned",
    type: "textarea",
  },
  {
    name: "recommendationsForNext",
    label: "Recommendations for Next Cycle",
    type: "textarea",
  }
];

// Combined configuration for stage selection
export const stageFieldConfigs = {
  1: CoachingActionPlanFieldConfig,
  2: GoalFieldConfig,
  3: ImplementationRecordFieldConfig,
  4: EndOfCycleAnalysisFieldConfig
} as const;

// Aliases for backward compatibility
export const needsAndFocusFields = CoachingActionPlanFieldConfig;
export const goalFields = GoalFieldConfig;
export const implementationRecordFields = ImplementationRecordFieldConfig;
export const endOfCycleAnalysisFields = EndOfCycleAnalysisFieldConfig;

  export const WeeklyVisitPlanFieldConfig: Field<CoachingActionPlan>[] = [
  // Define fields for weekly plan stage as needed
]; 