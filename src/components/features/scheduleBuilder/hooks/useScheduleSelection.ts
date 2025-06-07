import { useState, useCallback, useMemo } from 'react'
import type { SelectedTeacherPeriod } from '@domain-types/schedule'
import { useErrorBoundary } from '@/hooks/error/useErrorBoundary'

export interface SelectionState {
  selectedTeacherPeriod: SelectedTeacherPeriod | null
  hasSelection: boolean
  canAssign: (targetPeriod: number) => boolean
  isLoading: boolean
  error: Error | null
}

export interface SelectionActions {
  selectTeacherPeriod: (selection: SelectedTeacherPeriod | null) => void
  clearSelection: () => void
  validateSelection: (targetPeriod: number) => { valid: boolean; reason?: string }
  resetError: () => void
}

export interface UseScheduleSelectionOptions {
  allowMultipleSelections?: boolean
  validatePeriodMatch?: boolean
  onSelectionChange?: (selection: SelectedTeacherPeriod | null) => void
  onValidationError?: (error: Error) => void
}

/**
 * Dedicated hook for managing schedule selection state
 * 
 * Features:
 * - Selection state management with validation
 * - Integrated error handling using established error patterns
 * - Consistent callback patterns matching other UI hooks
 * - Proper error boundary integration
 */
export function useScheduleSelection(
  options: UseScheduleSelectionOptions = {}
): SelectionState & SelectionActions {
  const {
    allowMultipleSelections: _allowMultipleSelections = false,
    validatePeriodMatch = true,
    onSelectionChange,
    onValidationError
  } = options

  const [selectedTeacherPeriod, setSelectedTeacherPeriod] = useState<SelectedTeacherPeriod | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Use established error boundary pattern
  const { error, handleError, resetError } = useErrorBoundary({
    context: 'useScheduleSelection'
  })

  // Handle selection changes with validation and error handling
  const selectTeacherPeriod = useCallback((selection: SelectedTeacherPeriod | null) => {
    try {
      setIsLoading(true)
      setSelectedTeacherPeriod(selection)
      onSelectionChange?.(selection)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Selection failed')
      handleError(error, { componentStack: 'useScheduleSelection.selectTeacherPeriod' })
      onValidationError?.(error)
    } finally {
      setIsLoading(false)
    }
  }, [onSelectionChange, onValidationError, handleError])

  // Clear selection following established pattern
  const clearSelection = useCallback(() => {
    try {
      setIsLoading(true)
      selectTeacherPeriod(null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Clear selection failed')
      handleError(error, { componentStack: 'useScheduleSelection.clearSelection' })
    } finally {
      setIsLoading(false)
    }
  }, [selectTeacherPeriod, handleError])

  // Validate if assignment can be made to a specific period
  const validateSelection = useCallback((targetPeriod: number): { valid: boolean; reason?: string } => {
    if (!selectedTeacherPeriod) {
      return { valid: false, reason: 'No teacher selected' }
    }

    if (validatePeriodMatch && selectedTeacherPeriod.periodIndex !== targetPeriod) {
      return { 
        valid: false, 
        reason: `Selected period ${selectedTeacherPeriod.periodIndex} does not match target period ${targetPeriod}` 
      }
    }

    return { valid: true }
  }, [selectedTeacherPeriod, validatePeriodMatch])

  // Check if assignment can be made (simplified version of validate)
  const canAssign = useCallback((targetPeriod: number): boolean => {
    return validateSelection(targetPeriod).valid
  }, [validateSelection])

  // Computed state following established patterns
  const selectionState = useMemo<SelectionState>(() => ({
    selectedTeacherPeriod,
    hasSelection: selectedTeacherPeriod !== null,
    canAssign,
    isLoading,
    error
  }), [selectedTeacherPeriod, canAssign, isLoading, error])

  const selectionActions = useMemo<SelectionActions>(() => ({
    selectTeacherPeriod,
    clearSelection,
    validateSelection,
    resetError
  }), [selectTeacherPeriod, clearSelection, validateSelection, resetError])

  return {
    ...selectionState,
    ...selectionActions
  }
}

export default useScheduleSelection