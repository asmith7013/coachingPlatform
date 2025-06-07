import { useState, useCallback, useEffect } from 'react'
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
 * Hook for managing visit scheduling with auto-save functionality
 * Provides optimistic updates, data persistence, and error handling
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

  // Auto-save integration
  const { triggerSave } = useAutoSave({
    entityId: `visits-${schoolId}-${date}`,
    data: visits,
    onSave: async (entityId, data) => {
      // This will be replaced with actual server action in Task 4.2
      console.log('Auto-saving visits:', entityId, data)
      await new Promise(resolve => setTimeout(resolve, 100)) // Simulate API call
    },
    debounceMs: 2000,
    enabled: visits.length > 0
  })

  // Trigger auto-save when visits change
  useEffect(() => {
    if (visits.length > 0) {
      triggerSave()
    }
  }, [visits, triggerSave])

  // Create optimistic visit from visit data
  const createOptimisticVisit = useCallback((data: CreateVisitData): ScheduledVisit => {
    return {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      teacherId: data.teacherId,
      teacherName: data.teacherName,
      periodNumber: data.periodNumber,
      portion: data.portion,
      purpose: data.purpose,
      createdAt: new Date()
    }
  }, [])

  // Validate visit data
  const validateVisitData = useCallback((data: CreateVisitData): ValidationResult => {
    const errors: string[] = []

    if (!data.teacherId) errors.push('Teacher ID is required')
    if (!data.teacherName) errors.push('Teacher name is required')
    if (!data.periodNumber || data.periodNumber < 1) errors.push('Valid period number is required')
    if (!data.portion) errors.push('Visit portion is required')
    if (!data.schoolId) errors.push('School ID is required')
    if (!data.date) errors.push('Date is required')

    // Check for duplicate visits in same period/portion
    const existingVisit = visits.find(visit => 
      visit.teacherId === data.teacherId && 
      visit.periodNumber === data.periodNumber &&
      visit.portion === data.portion
    )
    
    if (existingVisit) {
      errors.push(`Visit already exists for ${data.teacherName} in Period ${data.periodNumber} (${data.portion})`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }, [visits])

  // Schedule new visit
  const scheduleVisit = useCallback(async (visitData: CreateVisitData): Promise<SchedulingResult> => {
    setError(null)
    
    // Validate visit data
    const validation = validateVisitData(visitData)
    if (!validation.isValid) {
      const errorMessage = validation.errors.join(', ')
      setError(errorMessage)
      onError?.(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    }

    setIsLoading(true)

    try {
      // Create optimistic visit for immediate UI update
      const optimisticVisit = createOptimisticVisit(visitData)
      
      // Update state optimistically
      setVisits(prevVisits => [...prevVisits, optimisticVisit])
      
      // TODO: Replace with actual server action in Task 4.2
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
      
      // Notify parent component
      onVisitScheduled?.(optimisticVisit)
      
      return {
        success: true,
        visitId: optimisticVisit.id
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to schedule visit'
      
      // Revert optimistic update on error
      setVisits(prevVisits => prevVisits.filter(visit => 
        !(visit.teacherId === visitData.teacherId && 
          visit.periodNumber === visitData.periodNumber &&
          visit.portion === visitData.portion)
      ))
      
      setError(errorMessage)
      onError?.(errorMessage)
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }, [validateVisitData, createOptimisticVisit, onVisitScheduled, onError])

  // Update existing visit
  const updateVisit = useCallback(async (visitId: string, data: Partial<ScheduledVisit>): Promise<boolean> => {
    setError(null)
    setIsLoading(true)

    try {
      // Update state optimistically
      setVisits(prevVisits => 
        prevVisits.map(visit => 
          visit.id === visitId 
            ? { ...visit, ...data }
            : visit
        )
      )

      // TODO: Replace with actual server action in Task 4.2
      await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API call
      
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update visit'
      setError(errorMessage)
      onError?.(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [onError])

  // Delete visit
  const deleteVisit = useCallback(async (visitId: string): Promise<boolean> => {
    setError(null)
    setIsLoading(true)

    // Store visit for potential rollback
    const visitToDelete = visits.find(visit => visit.id === visitId)
    
    try {
      // Update state optimistically
      setVisits(prevVisits => prevVisits.filter(visit => visit.id !== visitId))

      // TODO: Replace with actual server action in Task 4.2
      await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API call
      
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete visit'
      
      // Revert optimistic update on error
      if (visitToDelete) {
        setVisits(prevVisits => [...prevVisits, visitToDelete])
      }
      
      setError(errorMessage)
      onError?.(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [visits, onError])

  // Load visits on mount (placeholder for actual data fetching)
  useEffect(() => {
    setIsLoading(true)
    
    // TODO: Replace with actual data fetching in Task 4.2
    const loadVisits = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 200)) // Simulate API call
        // setVisits(fetchedVisits) // Will be implemented with server actions
        setVisits([]) // Start with empty array for now
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load visits'
        setError(errorMessage)
        onError?.(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    loadVisits()
  }, [schoolId, date, onError])

  return {
    visits,
    scheduleVisit,
    updateVisit,
    deleteVisit,
    isLoading,
    error
  }
} 