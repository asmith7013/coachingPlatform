import type { 
  CoachingActionPlan,
  CoachingActionPlanInput
} from '@zod-schema/core/cap';
import { CapImplementationRecord } from '@zod-schema/cap/cap-implementation-record';
// import { CapWeeklyPlan } from '@zod-schema/cap/cap-weekly-plan';
import { CapOutcome } from '@zod-schema/cap/cap-outcome';

export const stageValidators = {
  needsAndFocus: (data: CoachingActionPlan): boolean => {
    return !!(
      data.ipgCoreAction && 
      data.ipgSubCategory && 
      data.rationale?.trim()
    );
  },
  
  goal: (data: CoachingActionPlanInput): boolean => {
    return !!(
      // data.description?.trim() &&
      data.teacherOutcomes.length > 0 &&
      data.studentOutcomes.length > 0 &&
      data.teacherOutcomes.every((outcome: CapOutcome) => outcome.description.trim()) &&
      data.studentOutcomes.every((outcome: CapOutcome) => outcome.description.trim())
    );
  },
  
  implementation: (data: CapImplementationRecord[]): boolean => {
    return data.length > 0 && data.every(record => 
      record.lookForImplemented.trim() && 
      record.glows.length > 0 && 
      record.grows.length > 0
    );
  },
  
  analysis: (data: CoachingActionPlanInput): boolean => {
    return !!(
      data.goalMet !== undefined &&
      data.impactOnLearning.trim() &&
      data.teacherOutcomeAnalysis.every((analysis: CapOutcome) => analysis.achieved !== undefined) &&
      data.studentOutcomeAnalysis.every((analysis: CapOutcome) => analysis.achieved !== undefined)
    );
  }
};

// Type-safe error helpers
export function safeArrayAccess<T>(
  array: T[] | undefined, 
  index: number, 
  fallback: T
): T {
  return array?.[index] ?? fallback;
}

export function ensureMetricAnalysis(
  analysis: { finalMetricValues?: { metricId: string; finalValue: string; goalMet: boolean; }[] },
  metricIndex: number
) {
  if (!analysis.finalMetricValues) {
    analysis.finalMetricValues = [];
  }
  
  if (!analysis.finalMetricValues[metricIndex]) {
    analysis.finalMetricValues[metricIndex] = {
      metricId: `metric-${metricIndex}`,
      finalValue: '',
      goalMet: false
    };
  }
  
  return analysis.finalMetricValues[metricIndex];
} 