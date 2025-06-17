/**
 * @fileoverview DEPRECATED - This file is deprecated and will be removed.
 * Migration: Use hooks from @/components/features/schedulesUpdated/hooks instead
 * @deprecated
 */

/**
 * @fileoverview DEPRECATED - useScheduleSelectors hook
 * 
 * This hook is deprecated and will be removed in a future version.
 * Please migrate to the new schedule system at src/components/features/schedulesUpdated/
 * 
 * Migration path:
 * - Use the new useScheduleComposition hook for data composition
 * - Use the new useScheduleUI hook for UI state management
 * - Follow the new schema-first architecture patterns
 * 
 * @deprecated Use the new schedule system at src/components/features/schedulesUpdated/
 */

import { useMemo } from 'react'
import { useScheduleContext } from '../context'
import type { Visit } from '@zod-schema/visits/visit'

/**
 * @deprecated Use useScheduleSelectors from @/components/features/schedulesUpdated/hooks instead.
 * This hook will be removed in a future version.
 * Migration: Replace with equivalent hook from schedulesUpdated feature.
 */
/**
 * @deprecated Use the new schedule system at src/components/features/schedulesUpdated/
 */
export function useScheduleSelectors() {
  if (process.env.NODE_ENV === 'development') {
    console.warn('useScheduleSelectors is deprecated. Use the new schedule system at src/components/features/schedulesUpdated/');
  }
  if (process.env.NODE_ENV === 'development') {
    console.warn('DEPRECATED: useScheduleSelectors from schedulesNew is deprecated. Use schedulesUpdated instead.');
  }
  const context = useScheduleContext()

  // ✅ DIRECT ACCESS: Use simplified context interface
  const selectedTeacher = context.uiState.selectedTeacher
  const selectedPeriod = context.uiState.selectedPeriod
  const selectedPortion = context.uiState.selectedPortion
  const openDropdown = context.uiState.openDropdown
  const toggleDropdown = context.toggleDropdown
  const hasVisitConflict = context.hasVisitConflict

  // ✅ COMPUTED VALUES: Simple derivations from domain data
  const hasSelection = useMemo(() => 
    !!(selectedTeacher && selectedPeriod),
    [selectedTeacher, selectedPeriod]
  )

  const hasFullSelection = useMemo(() => 
    !!(selectedTeacher && selectedPeriod && selectedPortion),
    [selectedTeacher, selectedPeriod, selectedPortion]
  )

  // ✅ SIMPLE HELPERS: Work with Visit objects directly
  const hasData = context.teachers.length > 0

  const getTeacherName = useMemo(() => (teacherId: string) => {
    return context.teachers.find(t => t._id === teacherId)?.staffName || 'Unknown'
  }, [context.teachers])

  const getVisitForTeacherPeriod = useMemo(() => (teacherId: string, period: number): Visit | undefined => {
    return context.getVisitForTeacherPeriod(teacherId, period)
  }, [context])

  const getVisitsForPeriod = useMemo(() => (_period: number): Visit[] => {
    return context.visits.filter(_visit => {
      // TODO: Extract period from visit when schema supports it
      return true // For now, return all visits
    })
  }, [context.visits])

  return {
    // Selection state
    selectedTeacher,
    selectedPeriod,
    selectedPortion,
    hasSelection,
    hasFullSelection,
    
    // UI state
    openDropdown,
    toggleDropdown,
    
    // Data helpers
    hasData,
    getTeacherName,
    getVisitForTeacherPeriod,
    getVisitsForPeriod,
    hasVisitConflict,
    
    // Direct access to core data
    teachers: context.teachers,
    visits: context.visits,
    timeSlots: context.timeSlots,
    isLoading: context.isLoading,
    error: context.error
  }
}
  