/**
 * @fileoverview DEPRECATED - This file is deprecated and will be removed.
 * Migration: Use hooks from @/components/features/schedulesUpdated/hooks instead
 * @deprecated
 */

import { useScheduleContext } from '../context'

/**
 * @deprecated Use useVisitOperations from @/components/features/schedulesUpdated/hooks instead.
 * This hook will be removed in a future version.
 * Migration: Replace with equivalent hook from schedulesUpdated feature.
 */
export function useVisitOperations() {
  if (process.env.NODE_ENV === 'development') {
    console.warn('DEPRECATED: useVisitOperations from schedulesNew is deprecated. Use schedulesUpdated instead.');
  }
  const context = useScheduleContext()

  return {
    // Core operations (delegated to domain hooks)
    scheduleVisit: context.scheduleVisit,
    updateVisit: context.updateVisit,
    deleteVisit: context.deleteVisit,
    
    // Query helpers
    getVisitForTeacherPeriod: context.getVisitForTeacherPeriod,
    hasVisitConflict: context.hasVisitConflict,
    
    // Direct data access
    visits: context.visits,
    isLoading: context.isLoading,
    error: context.error
  }
}
