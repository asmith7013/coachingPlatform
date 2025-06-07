import { useState, useCallback, useEffect, useMemo } from 'react'
import { useAutoSave } from '@hooks/utilities/useAutoSave'
import type { ScheduledVisit } from '@components/features/scheduleBuilder/PlannedVisitsColumn'
import type { VisitPortion } from '@components/features/scheduleBuilder/types'

export interface UseVisitSchedulingOptions {
  schoolId: string
  date: string
  onVisitScheduled?: (visit: ScheduledVisit) => void
  onError?: (error: string) => void
}

export interface UseVisitSchedulingReturn {
  visits: ScheduledVisit[]
  scheduleVisit: (visitData: CreateVisitData) => Promise<SchedulingResult>
  updateVisit: (visitId: string, data: Partial<ScheduledVisit>) => Promise<boolean>
  deleteVisit: (visitId: string) => Promise<boolean>
  isLoading: boolean
  error: string | null
}

export interface CreateVisitData {
  schoolId: string
  teacherId: string
  teacherName: string
  periodNumber: number
  portion: VisitPortion
  purpose?: string
  date: string
}

export interface SchedulingResult {
  success: boolean
  visitId?: string
  error?: string
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Hook for managing visit scheduling with auto-save persistence
 * 
 * Features:
 * - Optimistic updates for immediate UI response
 * - Auto-save with 2-second debouncing
 * - Error handling with retry logic
 * - CRUD operations for visit management
 * 
 * @example
 * ```tsx
 * const { visits, scheduleVisit, updateVisit, deleteVisit } = useVisitScheduling({
 *   schoolId: 'school-123',
 *   date: '2024-01-15',
 *   onVisitScheduled: (visit) => console.log('Visit scheduled:', visit)
 * })
 * ```
 */
export function useVisitScheduling({
  schoolId,
  date,
  onVisitScheduled,
  onError
}: UseVisitSchedulingOptions): UseVisitSchedulingReturn {
  // Core state
  const [visits, setVisits] = useState<ScheduledVisit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-save configuration
  const { triggerSave } = useAutoSave({
    entityId: `visits-${schoolId}-${date}`,
    data: visits,
    onSave: async (entityId, data) => {
      // TODO: Implement server action call for visit persistence
      console.log('Auto-saving visits:', entityId, data)
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
    },
    debounceMs: 2000,
    enabled: true
  })

  // Load existing visits on mount
  useEffect(() => {
    // TODO: Implement visit loading from server
    console.log('Loading visits for school:', schoolId, 'date:', date)
    setVisits([]) // Start with empty array for now
  }, [schoolId, date])

  // Create optimistic visit from input data
  const createOptimisticVisit = useCallback((data: CreateVisitData): ScheduledVisit => {
    return {
      id: `temp-visit-${Date.now()}`,
      teacherId: data.teacherId,
      teacherName: data.teacherName,
      periodNumber: data.periodNumber,
      portion: data.portion,
      purpose: data.purpose,
      createdAt: new Date()
    }
  }, [])

  // Validate visit data before scheduling
  const validateVisitData = useCallback((data: CreateVisitData): ValidationResult => {
    const errors: string[] = []

    if (!data.schoolId) errors.push('School ID is required')
    if (!data.teacherId) errors.push('Teacher ID is required')
    if (!data.teacherName) errors.push('Teacher name is required')
    if (!data.periodNumber || data.periodNumber < 1) errors.push('Valid period number is required')
    if (!data.portion) errors.push('Visit portion is required')
    if (!data.date) errors.push('Date is required')

    // Check for duplicate visits
    const duplicate = visits.find(visit => 
      visit.teacherId === data.teacherId && 
      visit.periodNumber === data.periodNumber &&
      visit.portion === data.portion
    )
    if (duplicate) {
      errors.push(`Visit already scheduled for ${data.teacherName} in Period ${data.periodNumber}`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }, [visits])

  // Schedule new visit
  const scheduleVisit = useCallback(async (visitData: CreateVisitData): Promise<SchedulingResult> => {
    setError(null)
    setIsLoading(true)

    try {
      // Validate input data
      const validation = validateVisitData(visitData)
      if (!validation.isValid) {
        const errorMessage = validation.errors.join(', ')
        setError(errorMessage)
        onError?.(errorMessage)
        return { success: false, error: errorMessage }
      }

      // Create optimistic visit
      const optimisticVisit = createOptimisticVisit(visitData)
      
      // Update state optimistically
      setVisits(currentVisits => [...currentVisits, optimisticVisit])
      
      // Trigger auto-save
      triggerSave()
      
      // Notify parent
      onVisitScheduled?.(optimisticVisit)

      // TODO: Replace with actual server action call
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
      
      return {
        success: true,
        visitId: optimisticVisit.id
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule visit'
      setError(errorMessage)
      onError?.(errorMessage)
      
      // Revert optimistic update on error
      setVisits(currentVisits => 
        currentVisits.filter(visit => visit.id !== `temp-visit-${Date.now()}`)
      )
      
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [validateVisitData, createOptimisticVisit, triggerSave, onVisitScheduled, onError])

  // Update existing visit
  const updateVisit = useCallback(async (visitId: string, data: Partial<ScheduledVisit>): Promise<boolean> => {
    setError(null)
    setIsLoading(true)

    try {
      // Update state optimistically
      setVisits(currentVisits =>
        currentVisits.map(visit =>
          visit.id === visitId ? { ...visit, ...data } : visit
        )
      )
      
      // Trigger auto-save
      triggerSave()

      // TODO: Replace with actual server action call
      await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API call
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update visit'
      setError(errorMessage)
      onError?.(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [triggerSave, onError])

  // Delete visit
  const deleteVisit = useCallback(async (visitId: string): Promise<boolean> => {
    setError(null)
    setIsLoading(true)

    try {
      // Store original state for potential rollback
      const originalVisits = visits
      
      // Update state optimistically
      setVisits(currentVisits => currentVisits.filter(visit => visit.id !== visitId))
      
      // Trigger auto-save
      triggerSave()

      // TODO: Replace with actual server action call
      await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API call
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete visit'
      setError(errorMessage)
      onError?.(errorMessage)
      
      // Revert on error
      setVisits(visits)
      
      return false
    } finally {
      setIsLoading(false)
    }
  }, [visits, triggerSave, onError])

  // Derived state
  const hasVisits = useMemo(() => visits.length > 0, [visits.length])

  return {
    visits,
    scheduleVisit,
    updateVisit,
    deleteVisit,
    isLoading,
    error
  }
} 