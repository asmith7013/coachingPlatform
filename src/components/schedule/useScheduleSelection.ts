// accept conditionally - needs further review later


import { useState, useCallback, useMemo } from 'react'
import type { SelectedTeacherPeriod } from './types'

export interface SelectionState {
  selectedTeacherPeriod: SelectedTeacherPeriod | null
  hasSelection: boolean
  canAssign: (targetPeriod: number) => boolean
}

export interface SelectionActions {
  selectTeacherPeriod: (selection: SelectedTeacherPeriod | null) => void
  clearSelection: () => void
  validateSelection: (targetPeriod: number) => { valid: boolean; reason?: string }
}

export interface UseScheduleSelectionOptions {
  allowMultipleSelections?: boolean
  validatePeriodMatch?: boolean
  onSelectionChange?: (selection: SelectedTeacherPeriod | null) => void
}

/**
 * Dedicated hook for managing schedule selection state
 * Extracts complex selection logic from components
 * Provides validation and consistent selection behavior
 * 
 * Moved from src/hooks/ui/useScheduleSelection.ts to be co-located with schedule components
 * Updated to use consolidated types for better maintainability
 */
export function useScheduleSelection(
  options: UseScheduleSelectionOptions = {}
): SelectionState & SelectionActions {
  const {
    allowMultipleSelections: _allowMultipleSelections = false,
    validatePeriodMatch = true,
    onSelectionChange
  } = options

  const [selectedTeacherPeriod, setSelectedTeacherPeriod] = useState<SelectedTeacherPeriod | null>(null)

  // Handle selection changes with validation
  const selectTeacherPeriod = useCallback((selection: SelectedTeacherPeriod | null) => {
    setSelectedTeacherPeriod(selection)
    onSelectionChange?.(selection)
  }, [onSelectionChange])

  // Clear selection
  const clearSelection = useCallback(() => {
    selectTeacherPeriod(null)
  }, [selectTeacherPeriod])

  // Validate if assignment can be made to a specific period
  // Note: This handles the type inconsistency between interface (periodIndex) and actual usage (period)
  const validateSelection = useCallback((targetPeriod: number): { valid: boolean; reason?: string } => {
    if (!selectedTeacherPeriod) {
      return { valid: false, reason: 'No teacher selected' }
    }

    // Handle the type mismatch - use periodIndex from interface (which is 0-based) + 1 to match period numbers
    const selectedPeriod = selectedTeacherPeriod.periodIndex + 1
    
    if (validatePeriodMatch && selectedPeriod !== targetPeriod) {
      return { 
        valid: false, 
        reason: `Selected period ${selectedPeriod} does not match target period ${targetPeriod}` 
      }
    }

    return { valid: true }
  }, [selectedTeacherPeriod, validatePeriodMatch])

  // Check if assignment can be made (simplified version of validate)
  const canAssign = useCallback((targetPeriod: number): boolean => {
    return validateSelection(targetPeriod).valid
  }, [validateSelection])

  // Computed state
  const selectionState = useMemo<SelectionState>(() => ({
    selectedTeacherPeriod,
    hasSelection: selectedTeacherPeriod !== null,
    canAssign
  }), [selectedTeacherPeriod, canAssign])

  const selectionActions = useMemo<SelectionActions>(() => ({
    selectTeacherPeriod,
    clearSelection,
    validateSelection
  }), [selectTeacherPeriod, clearSelection, validateSelection])

  return {
    ...selectionState,
    ...selectionActions
  }
} 