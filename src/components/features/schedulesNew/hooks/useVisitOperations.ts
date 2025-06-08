import { useScheduleContext } from '../context'

/**
 * ✅ SIMPLIFIED VISIT OPERATIONS: Direct delegation to context
 */
export function useVisitOperations() {
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
