import type { Field } from '@ui-types/form';
import type { 
  NeedsAndFocus,
  Goal,
  ImplementationRecord,
  EndOfCycleAnalysis
} from '@zod-schema/core/cap';

/**
 * Simple field configurations for Coaching Action Plan stages
 * Following the new domain-specific pattern
 */

// Stage 1: Needs & Focus
export const NeedsAndFocusFieldConfig: Field<NeedsAndFocus>[] = [
  {
    name: "ipgCoreAction",
    label: "IPG Core Action",
    type: "select",
    options: [
      { value: "CA1", label: "Core Action 1" },
      { value: "CA2", label: "Core Action 2" },
      { value: "CA3", label: "Core Action 3" }
    ]
  },
  {
    name: "ipgSubCategory",
    label: "IPG Sub-Category",
    type: "select",
    options: [
      { value: "CA1A", label: "CA1A" },
      { value: "CA1B", label: "CA1B" },
      { value: "CA1C", label: "CA1C" },
      { value: "CA2A", label: "CA2A" },
      { value: "CA2B", label: "CA2B" },
      { value: "CA3A", label: "CA3A" },
      { value: "CA3B", label: "CA3B" },
      { value: "CA3C", label: "CA3C" },
      { value: "CA3D", label: "CA3D" },
      { value: "CA3E", label: "CA3E" }
    ]
  },
  {
    name: "rationale",
    label: "Rationale",
    type: "textarea",
    placeholder: "Explain why this focus area was selected...",
  },
  {
    name: "pdfAttachment",
    label: "Supporting Document",
    type: "text",
  }
];

// Stage 2: Goal & Outcomes
export const GoalFieldConfig: Field<Goal>[] = [
  {
    name: "description",
    label: "SMART Goal Statement",
    type: "textarea",
    placeholder: "Write a specific, measurable, achievable, relevant, and time-bound goal...",
  },
  {
    name: "teacherOutcomes",
    label: "Teacher Outcomes",
    type: "textarea",
  },
  {
    name: "studentOutcomes",
    label: "Student Outcomes",
    type: "textarea",
  }
];

// Stage 3: Implementation Record
export const ImplementationRecordFieldConfig: Field<ImplementationRecord>[] = [
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
export const EndOfCycleAnalysisFieldConfig: Field<EndOfCycleAnalysis>[] = [
  {
    name: "goalMet",
    label: "Goal Achievement",
    type: "checkbox",
  },
  {
    name: "teacherOutcomeAnalysis",
    label: "Teacher Outcome Analysis",
    type: "textarea",
  },
  {
    name: "studentOutcomeAnalysis",
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
  1: NeedsAndFocusFieldConfig,
  2: GoalFieldConfig,
  3: ImplementationRecordFieldConfig,
  4: EndOfCycleAnalysisFieldConfig
} as const;

// Aliases for backward compatibility
export const needsAndFocusFields = NeedsAndFocusFieldConfig;
export const goalFields = GoalFieldConfig;
export const implementationRecordFields = ImplementationRecordFieldConfig;
export const endOfCycleAnalysisFields = EndOfCycleAnalysisFieldConfig; 