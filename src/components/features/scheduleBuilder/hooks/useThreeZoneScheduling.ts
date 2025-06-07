/**
 * useThreeZoneScheduling Hook
 * 
 * Manages period-portion visit scheduling state and operations
 * Follows the simplified period-portion approach with conflict detection
 */

import { useState, useCallback, useMemo } from 'react'
import { VisitTimeCalculator, type VisitSchedule } from '../utils/visit-time-calculator'
import type { VisitPortion, ConflictWarning } from '../types'

export interface SchedulingResult {
  success: boolean
  visitId?: string
  error?: string
  conflicts?: ConflictWarning[]
}

export interface UseThreeZoneSchedulingReturn {
  // Selection state
  selectedTeachers: string[]
  selectedPortion: VisitPortion | null
  selectedPeriodNumber: number | null
  
  // Actions
  selectTeacher: (teacherId: string) => void
  selectPeriodPortion: (periodNumber: number, portion: VisitPortion) => void
  scheduleVisit: (purpose?: string) => Promise<SchedulingResult>
  clearSelection: () => void
  
  // Status
  isScheduling: boolean
  canSchedule: boolean
  conflicts: ConflictWarning[]
  
  // Display helpers
  getSelectionLabel: () => string // "First half of Period 2"
}

interface UseThreeZoneSchedulingOptions {
  maxTeachers?: number // Default: 2
  date: string // Required for conflict detection
  existingVisits?: VisitSchedule[]
  onVisitScheduled?: (visit: VisitSchedule) => void
  onError?: (error: string) => void
}

/**
 * Hook for managing three-zone visit scheduling
 */
export function useThreeZoneScheduling({
  maxTeachers = 2,
  date,
  existingVisits = [],
  onVisitScheduled,
  onError
}: UseThreeZoneSchedulingOptions): UseThreeZoneSchedulingReturn {
  // Core selection state
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([])
  const [selectedPortion, setSelectedPortion] = useState<VisitPortion | null>(null)
  const [selectedPeriodNumber, setSelectedPeriodNumber] = useState<number | null>(null)
  const [isScheduling, setIsScheduling] = useState(false)

  // Teacher selection logic
  const selectTeacher = useCallback((teacherId: string) => {
    setSelectedTeachers(current => {
      // Toggle teacher selection
      if (current.includes(teacherId)) {
        return current.filter(id => id !== teacherId)
      }
      
      // Respect max teachers limit
      if (current.length >= maxTeachers) {
        return [current[0], teacherId] // Replace first with new selection
      }
      
      return [...current, teacherId]
    })
  }, [maxTeachers])

  // Period-portion selection logic
  const selectPeriodPortion = useCallback((periodNumber: number, portion: VisitPortion) => {
    setSelectedPeriodNumber(periodNumber)
    setSelectedPortion(portion)
  }, [])

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedTeachers([])
    setSelectedPortion(null)
    setSelectedPeriodNumber(null)
  }, [])

  // Conflict detection
  const conflicts = useMemo((): ConflictWarning[] => {
    if (!selectedPeriodNumber || !selectedPortion || selectedTeachers.length === 0) {
      return []
    }

    const warnings: ConflictWarning[] = []
    
    // Create hypothetical visits for conflict checking
    const hypotheticalVisits: VisitSchedule[] = selectedTeachers.map(teacherId => ({
      teacherId,
      periodNumber: selectedPeriodNumber,
      portion: selectedPortion,
      date
    }))

    // Check multi-teacher conflicts
    const multiTeacherResult = VisitTimeCalculator.canScheduleMultiple(hypotheticalVisits)
    if (multiTeacherResult.hasConflict) {
      warnings.push({
        type: multiTeacherResult.type!,
        message: multiTeacherResult.message!,
        suggestions: multiTeacherResult.suggestions
      })
    }

    // Check conflicts with existing visits
    for (const hypotheticalVisit of hypotheticalVisits) {
      for (const existingVisit of existingVisits) {
        const conflictResult = VisitTimeCalculator.detectConflict(hypotheticalVisit, existingVisit)
        if (conflictResult.hasConflict) {
          warnings.push({
            type: conflictResult.type!,
            message: conflictResult.message!,
            suggestions: conflictResult.suggestions
          })
        }
      }
    }

    return warnings
  }, [selectedPeriodNumber, selectedPortion, selectedTeachers, date, existingVisits])

  // Check if scheduling is possible
  const canSchedule = useMemo(() => {
    return selectedTeachers.length > 0 && 
           selectedPortion !== null && 
           selectedPeriodNumber !== null && 
           conflicts.length === 0 &&
           !isScheduling
  }, [selectedTeachers.length, selectedPortion, selectedPeriodNumber, conflicts.length, isScheduling])

  // Schedule visit operation
  const scheduleVisit = useCallback(async (purpose?: string): Promise<SchedulingResult> => {
    if (!canSchedule) {
      return {
        success: false,
        error: 'Cannot schedule visit - invalid selection or conflicts exist',
        conflicts
      }
    }

    setIsScheduling(true)

    try {
      // Create visit objects
      const visits: VisitSchedule[] = selectedTeachers.map(teacherId => ({
        teacherId,
        periodNumber: selectedPeriodNumber!,
        portion: selectedPortion!,
        purpose,
        date
      }))

      // Here you would typically call a server action or API
      // For now, we'll simulate the operation
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call

      // Simulate success
      const visitId = `visit-${Date.now()}`
      
      // Notify parent of successful scheduling
      if (onVisitScheduled) {
        visits.forEach(visit => onVisitScheduled(visit))
      }

      // Clear selection after successful scheduling
      clearSelection()

      return {
        success: true,
        visitId
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      if (onError) {
        onError(errorMessage)
      }

      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsScheduling(false)
    }
  }, [canSchedule, selectedTeachers, selectedPeriodNumber, selectedPortion, date, conflicts, onVisitScheduled, onError, clearSelection])

  // Display label helper
  const getSelectionLabel = useCallback((): string => {
    if (!selectedPortion || !selectedPeriodNumber) {
      return 'No selection'
    }

    const portionLabels = {
      first_half: 'First half',
      second_half: 'Second half',
      full_period: 'Full period'
    }

    const teacherText = selectedTeachers.length === 0 ? 'No teachers' :
                       selectedTeachers.length === 1 ? '1 teacher' :
                       `${selectedTeachers.length} teachers`

    return `${portionLabels[selectedPortion]} of Period ${selectedPeriodNumber} (${teacherText})`
  }, [selectedPortion, selectedPeriodNumber, selectedTeachers.length])

  return {
    // Selection state
    selectedTeachers,
    selectedPortion,
    selectedPeriodNumber,
    
    // Actions
    selectTeacher,
    selectPeriodPortion,
    scheduleVisit,
    clearSelection,
    
    // Status
    isScheduling,
    canSchedule,
    conflicts,
    
    // Display helpers
    getSelectionLabel
  }
} 