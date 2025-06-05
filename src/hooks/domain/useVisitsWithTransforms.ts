import { useMemo } from 'react';
import { useVisitsList, useVisitById, useVisitsMutations, useVisits } from '@hooks/domain/useVisits';
import { visitToInfoCardTransformer, visitToSummaryTransformer } from '@transformers/domain/visit-transforms';
import type { Visit } from '@zod-schema/visits/visit';
import type { QueryParams } from '@core-types/query';

interface VisitInfoCardActions {
  onView: (visit: Visit) => void;
  onEdit: (visit: Visit) => void;
}

/**
 * Enhanced visits hook with built-in transformers for UI components
 */
export function useVisitsWithTransforms(
  params?: QueryParams,
  actions?: VisitInfoCardActions
) {
  const { items: visits, ...visitQuery } = useVisitsList(params);

  // Transform visits to InfoCard format
  const visitInfoCards = useMemo(() => {
    if (!actions) return [];
    
    return visits.map(visit => 
      visitToInfoCardTransformer(visit, {
        onView: () => actions.onView(visit),
        onEdit: () => actions.onEdit(visit)
      })
    );
  }, [visits, actions]);

  // Transform visits to summary format
  const visitSummaries = useMemo(() => 
    visits.map(visitToSummaryTransformer),
    [visits]
  );

  return {
    ...visitQuery,
    visits,
    visitInfoCards,
    visitSummaries
  };
}

/**
 * Hook specifically for school visit cards
 */
export function useSchoolVisitCards(
  schoolId: string,
  actions: VisitInfoCardActions,
  limit: number = 3
) {
  return useVisitsWithTransforms(
    {
      page: 1,
      filters: { school: schoolId },
      limit,
      sortBy: 'date',
      sortOrder: 'desc'
    },
    actions
  );
}

// Re-export original hooks for backward compatibility
export { useVisitsList, useVisitById, useVisitsMutations, useVisits }; 