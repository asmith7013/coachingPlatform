import { useMemo } from 'react'
import { useScheduleContext } from '../context'
import type { Visit } from '@zod-schema/visits/visit'

/**
 * ✅ SIMPLIFIED SELECTORS: Work with domain types directly
 * No complex transformations, just simple data access patterns
 */
export function useScheduleSelectors() {
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
  