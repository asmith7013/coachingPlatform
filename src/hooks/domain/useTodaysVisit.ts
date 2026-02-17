import { useMemo } from "react";
import { useVisits } from "@/hooks/domain/useVisits";
import { useCoachingActionPlans } from "@/hooks/domain/useCoachingActionPlans";
import { TodaysVisitData } from "@/components/features/todaysVisitDashboard/types";

interface UseTodaysVisitOptions {
  coachId?: string;
  schoolId?: string;
}

export function useTodaysVisit(options: UseTodaysVisitOptions = {}) {
  const { coachId, schoolId } = options;

  // Build filters based on options
  const visitFilters = useMemo(() => {
    const filters: Record<string, unknown> = {};
    if (coachId) filters.coachId = coachId;
    if (schoolId) filters.schoolId = schoolId;
    return filters;
  }, [coachId, schoolId]);

  // Fetch data with optional filtering
  const {
    items: visits,
    isLoading: visitsLoading,
    error: visitsError,
  } = useVisits.list({ filters: visitFilters });
  const { items: actionPlans, isLoading: plansLoading } =
    useCoachingActionPlans.list();

  const isLoading = visitsLoading || plansLoading;

  const todaysVisit = useMemo(() => {
    if (!visits?.length || !actionPlans?.length) return null;

    // Find visit closest to today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const visitWithDistance = visits
      .filter((visit) => visit.date)
      .map((visit) => {
        const visitDate = new Date(visit.date!);
        visitDate.setHours(0, 0, 0, 0);
        const daysFromToday = Math.round(
          (visitDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );

        return {
          visit,
          daysFromToday,
          absDistance: Math.abs(daysFromToday),
        };
      })
      .sort((a, b) => a.absDistance - b.absDistance)[0];

    if (!visitWithDistance) return null;

    // Get related action plan with embedded data
    const actionPlan = actionPlans.find(
      (plan) => plan._id === visitWithDistance.visit.coachingActionPlanId,
    );

    if (!actionPlan) return null;

    // Get embedded weekly plan using index
    const weeklyPlan =
      visitWithDistance.visit.weeklyPlanIndex !== undefined
        ? actionPlan.weeklyPlans[visitWithDistance.visit.weeklyPlanIndex]
        : null;

    // Get embedded metrics using outcome indexes
    const relevantMetrics =
      visitWithDistance.visit.focusOutcomeIndexes?.flatMap((outcomeIndex) => {
        const outcome = actionPlan.outcomes[outcomeIndex];
        return outcome?.metrics || [];
      }) || [];

    // Transform to component data format
    const todaysVisitData: TodaysVisitData = {
      visit: visitWithDistance.visit,
      daysFromToday: visitWithDistance.daysFromToday,
      actionPlan,
      weeklyPlan: weeklyPlan || null,
      schedule: {
        date: visitWithDistance.visit.date!,
        teachers: [], // Will be populated by schedule hook
      },
      focus: {
        overallGoal: actionPlan.goalDescription,
        weeklyFocus: weeklyPlan?.focus || null,
        ipgCoreAction: actionPlan.ipgCoreAction,
        ipgSubCategory: actionPlan.ipgSubCategory,
      },
      metrics: relevantMetrics.map((metric, index) => ({
        id: `metric-${index}`, // Generate ID since embedded docs don't have separate IDs
        name: metric.name,
        type: metric.type,
        description: metric.description,
        collectionMethod: metric.collectionMethod,
        baselineValue: metric.baselineValue || "",
        targetValue: metric.targetValue,
        currentValue: metric.currentValue || "",
      })),
    };

    return todaysVisitData;
  }, [visits, actionPlans]);

  return {
    todaysVisit,
    isLoading,
    error: visitsError,
    hasVisitToday: !!todaysVisit,
    isVisitInPast: todaysVisit ? todaysVisit.daysFromToday < 0 : false,
    isVisitInFuture: todaysVisit ? todaysVisit.daysFromToday > 0 : false,
  };
}
