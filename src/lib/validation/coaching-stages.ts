import type { 
  ImplementationRecord, 
  CoachingActionPlan
} from '@zod-schema/cap';

export const stageValidators = {
  needsAndFocus: (data: CoachingActionPlan): boolean => {
    return !!(
      data.ipgCoreAction && 
      data.ipgSubCategory && 
      data.rationale?.trim()
    );
  },
  
  goal: (data: CoachingActionPlan): boolean => {
    return !!(
      // data.description?.trim() &&
      data.teacherOutcomes.length > 0 &&
      data.studentOutcomes.length > 0 &&
      data.teacherOutcomes.every(outcome => outcome.description.trim()) &&
      data.studentOutcomes.every(outcome => outcome.description.trim())
    );
  },
  
  implementation: (data: ImplementationRecord[]): boolean => {
    return data.length > 0 && data.every(record => 
      record.lookForImplemented.trim() && 
      record.glows.length > 0 && 
      record.grows.length > 0
    );
  },
  
  analysis: (data: CoachingActionPlan): boolean => {
    return !!(
      data.goalMet !== undefined &&
      data.impactOnLearning.trim() &&
      data.teacherOutcomeAnalysis.every(analysis => analysis.achieved !== undefined) &&
      data.studentOutcomeAnalysis.every(analysis => analysis.achieved !== undefined)
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