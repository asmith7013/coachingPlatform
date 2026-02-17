import type {
  CoachingActionPlan,
  CoachingActionPlanInput,
} from "@zod-schema/core/cap";
import { CapImplementationRecord } from "@zod-schema/cap/cap-implementation-record";
// import { CapWeeklyPlan } from '@zod-schema/cap/cap-weekly-plan';
import { CapOutcome } from "@zod-schema/cap/cap-outcome";

export const stageValidators = {
  needsAndFocus: (data: CoachingActionPlan): boolean => {
    return !!(
      data.ipgCoreAction &&
      data.ipgSubCategory &&
      data.rationale?.trim()
    );
  },

  goal: (data: CoachingActionPlanInput): boolean => {
    const teacherOutcomes =
      (data.teacherOutcomes as CapOutcome[] | undefined) || [];
    const studentOutcomes =
      (data.studentOutcomes as CapOutcome[] | undefined) || [];
    return !!(
      // data.description?.trim() &&
      (
        teacherOutcomes.length > 0 &&
        studentOutcomes.length > 0 &&
        teacherOutcomes.every((outcome: CapOutcome) =>
          outcome.description.trim(),
        ) &&
        studentOutcomes.every((outcome: CapOutcome) =>
          outcome.description.trim(),
        )
      )
    );
  },

  implementation: (data: CapImplementationRecord[]): boolean => {
    return (
      data.length > 0 &&
      data.every(
        (record) =>
          record.lookForImplemented.trim() &&
          record.glows.length > 0 &&
          record.grows.length > 0,
      )
    );
  },

  analysis: (data: CoachingActionPlanInput): boolean => {
    const teacherOutcomeAnalysis =
      (data.teacherOutcomeAnalysis as CapOutcome[] | undefined) || [];
    const studentOutcomeAnalysis =
      (data.studentOutcomeAnalysis as CapOutcome[] | undefined) || [];
    return !!(
      data.goalMet !== undefined &&
      (data.impactOnLearning as string | undefined)?.trim() &&
      teacherOutcomeAnalysis.every(
        (analysis: CapOutcome) => analysis.achieved !== undefined,
      ) &&
      studentOutcomeAnalysis.every(
        (analysis: CapOutcome) => analysis.achieved !== undefined,
      )
    );
  },
};

// Type-safe error helpers
export function safeArrayAccess<T>(
  array: T[] | undefined,
  index: number,
  fallback: T,
): T {
  return array?.[index] ?? fallback;
}

export function ensureMetricAnalysis(
  analysis: {
    finalMetricValues?: {
      metricId: string;
      finalValue: string;
      goalMet: boolean;
    }[];
  },
  metricIndex: number,
) {
  if (!analysis.finalMetricValues) {
    analysis.finalMetricValues = [];
  }

  if (!analysis.finalMetricValues[metricIndex]) {
    analysis.finalMetricValues[metricIndex] = {
      metricId: `metric-${metricIndex}`,
      finalValue: "",
      goalMet: false,
    };
  }

  return analysis.finalMetricValues[metricIndex];
}
