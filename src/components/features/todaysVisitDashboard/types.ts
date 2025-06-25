import type { Visit } from '@zod-schema/visits/visit';
import type { CoachingActionPlan } from '@zod-schema/core/cap';

export interface TodaysVisitData {
  // Core visit information
  visit: Visit;
  daysFromToday: number;
  
  // Related coaching context (single fetch)
  actionPlan: CoachingActionPlan;
  
  // Derived data from embedded documents  
  weeklyPlan: {
    cycleNumber: string;
    visitNumber: string;
    focus: string;
    lookFor: string;
    coachAction: string;
    teacherAction: string;
    progressMonitoring: string;
    expectedMetrics: string[];
  } | null;
  
  // Schedule information
  schedule: {
    date: string;
    teachers: Array<{
      id: string;
      name: string;
      periods: Array<{
        periodNumber: number;
        subject: string;
        room?: string;
      }>;
    }>;
  };
  
  // Focus and goals (derived from action plan)
  focus: {
    overallGoal: string;           // From actionPlan.goalDescription
    weeklyFocus: string | null;    // From actionPlan.weeklyPlans[weeklyPlanIndex].focus
    ipgCoreAction: string;         // From actionPlan.ipgCoreAction
    ipgSubCategory: string;        // From actionPlan.ipgSubCategory
  };
  
  // Metrics to measure (derived from embedded outcomes)
  metrics: Array<{
    id: string;
    name: string;
    type: string;
    description: string;
    collectionMethod: string;
    baselineValue: string;
    targetValue: string;
    currentValue: string;
  }>;
}

export interface TodaysVisitDashboardContextType {
  todaysVisit: TodaysVisitData | null;
  isLoading: boolean;
  error: Error | null;
  hasVisitToday: boolean;
  isVisitInPast: boolean;
  isVisitInFuture: boolean;
  refreshData: () => Promise<void>;
} 