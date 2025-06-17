/**
 * @fileoverview DEPRECATED - useScheduleState hook
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

import { useState, useCallback, useMemo } from 'react'
import type { ScheduleUIState } from '../types'
import { ScheduleAssignment } from '@enums'
// import { useScheduleContext } from '../context/ScheduleContext';

/**
 * Focused hook for schedule UI state
 * Single responsibility: Manage selection, dropdowns, and interaction state
 */
/**
 * @deprecated Use the new schedule system at src/components/features/schedulesUpdated/
 */
export function useScheduleState() {
  if (process.env.NODE_ENV === 'development') {
    console.warn('useScheduleState is deprecated. Use the new schedule system at src/components/features/schedulesUpdated/');
  }
  const [uiState, setUIState] = useState<ScheduleUIState>({
    selectedTeacher: null,
    selectedPeriod: null,
    selectedPortion: null,
    openDropdown: null
  })

  // ===== COMPUTED STATE =====
  const hasSelection = useMemo(() => 
    !!(uiState.selectedTeacher && uiState.selectedPeriod),
    [uiState.selectedTeacher, uiState.selectedPeriod]
  )

  const hasFullSelection = useMemo(() => 
    !!(uiState.selectedTeacher && uiState.selectedPeriod && uiState.selectedPortion),
    [uiState.selectedTeacher, uiState.selectedPeriod, uiState.selectedPortion]
  )

  // ===== ACTIONS =====
  const clearSelection = useCallback(() => {
    setUIState(prev => ({
      ...prev,
      selectedTeacher: null,
      selectedPeriod: null,
      selectedPortion: null
    }))
  }, [])

  const selectTeacherPeriod = useCallback((teacherId: string, period: number) => {
    setUIState(prev => ({
      ...prev,
      selectedTeacher: teacherId,
      selectedPeriod: period,
      selectedPortion: null // Reset portion when changing selection
    }))
  }, [])

  const selectPortion = useCallback((portion: ScheduleAssignment) => {
    setUIState(prev => ({
      ...prev,
      selectedPortion: portion
    }))
  }, [])

  const toggleDropdown = useCallback((dropdownId: string | null) => {
    setUIState(prev => ({
      ...prev,
      openDropdown: prev.openDropdown === dropdownId ? null : dropdownId
    }))
  }, [])

  return {
    // ✅ CLEAN STATE ACCESS - destructured for easy access
    selectedTeacher: uiState.selectedTeacher,
    selectedPeriod: uiState.selectedPeriod,
    selectedPortion: uiState.selectedPortion,
    openDropdown: uiState.openDropdown,
    
    // ✅ COMPUTED HELPERS
    hasSelection,
    hasFullSelection,
    
    // ✅ PURE ACTIONS
    clearSelection,
    selectTeacherPeriod,
    selectPortion,
    toggleDropdown,
    
    // ✅ LEGACY COMPATIBILITY - expose full state object if needed
    uiState
  }
}