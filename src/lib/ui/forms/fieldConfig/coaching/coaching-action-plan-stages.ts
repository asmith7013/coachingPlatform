import { createFormFields } from '@/lib/ui/forms/tanstack/factory/field-factory';
import { 
  NeedsAndFocusZodSchema,
  GoalZodSchema,
  ImplementationRecordZodSchema,
  EndOfCycleAnalysisZodSchema
} from '@zod-schema/core/cap';

/**
 * Schema-derived field configurations for Coaching Action Plan stages
 * Each stage has its own schema and UI hints
 * Follows established domain-organized configuration pattern
 */

// Stage 1: Needs & Focus
export const needsAndFocusFields = createFormFields(NeedsAndFocusZodSchema, {
  fieldOrder: ["ipgCoreAction", "ipgSubCategory", "rationale", "pdfAttachment"],
  labels: {
    ipgCoreAction: "IPG Core Action",
    ipgSubCategory: "IPG Sub-Category", 
    rationale: "Rationale",
    pdfAttachment: "Supporting Document"
  },
  placeholders: {
    rationale: "Explain why this focus area was selected...",
  },
  fieldTypes: {
    ipgCoreAction: "select",
    ipgSubCategory: "select",
    rationale: "textarea",
    pdfAttachment: "text"
  },
  options: {
    ipgCoreAction: [
      { value: "CA1", label: "Core Action 1" },
      { value: "CA2", label: "Core Action 2" },
      { value: "CA3", label: "Core Action 3" }
    ],
    ipgSubCategory: [
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
  }
});

// Stage 2: Goal & Outcomes
export const goalFields = createFormFields(GoalZodSchema, {
  fieldOrder: ["description", "teacherOutcomes", "studentOutcomes"],
  labels: {
    description: "SMART Goal Statement",
    teacherOutcomes: "Teacher Outcomes",
    studentOutcomes: "Student Outcomes"
  },
  placeholders: {
    description: "Write a specific, measurable, achievable, relevant, and time-bound goal...",
  },
  fieldTypes: {
    description: "textarea",
    teacherOutcomes: "textarea", 
    studentOutcomes: "textarea"
  }
});

// Stage 3: Implementation Record
export const implementationRecordFields = createFormFields(ImplementationRecordZodSchema, {
  fieldOrder: ["date", "cycleNumber", "visitNumber", "coachingFocus", "teacherActions", "studentResponse", "coachReflections"],
  labels: {
    date: "Visit Date",
    cycleNumber: "Cycle Number",
    visitNumber: "Visit Number", 
    coachingFocus: "Coaching Focus",
    teacherActions: "Teacher Actions Observed",
    studentResponse: "Student Response",
    coachReflections: "Coach Reflections"
  },
  fieldTypes: {
    date: "date",
    cycleNumber: "number",
    visitNumber: "number",
    coachingFocus: "textarea",
    teacherActions: "textarea",
    studentResponse: "textarea", 
    coachReflections: "textarea"
  }
});

// Stage 4: End of Cycle Analysis
export const endOfCycleAnalysisFields = createFormFields(EndOfCycleAnalysisZodSchema, {
  fieldOrder: ["goalMet", "teacherOutcomeAnalysis", "studentOutcomeAnalysis", "impactOnLearning", "lessonsLearned", "recommendationsForNext"],
  labels: {
    goalMet: "Goal Achievement",
    teacherOutcomeAnalysis: "Teacher Outcome Analysis",
    studentOutcomeAnalysis: "Student Outcome Analysis", 
    impactOnLearning: "Impact on Learning",
    lessonsLearned: "Lessons Learned",
    recommendationsForNext: "Recommendations for Next Cycle"
  },
  fieldTypes: {
    goalMet: "checkbox",
    teacherOutcomeAnalysis: "textarea",
    studentOutcomeAnalysis: "textarea",
    impactOnLearning: "textarea",
    lessonsLearned: "textarea",
    recommendationsForNext: "textarea"
  }
});

// Combined configuration for stage selection
export const stageFieldConfigs = {
  1: needsAndFocusFields,
  2: goalFields,
  3: implementationRecordFields,
  4: endOfCycleAnalysisFields
} as const;

// Legacy exports for backward compatibility during migration
export const NeedsAndFocusFieldConfig = needsAndFocusFields;
export const GoalFieldConfig = goalFields;
export const ImplementationRecordFieldConfig = implementationRecordFields;
export const EndOfCycleAnalysisFieldConfig = endOfCycleAnalysisFields; 