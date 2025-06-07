import { useState, useCallback, useEffect, useRef } from 'react'
import { useAutoSave } from '@/hooks/utilities/useAutoSave'
import { useAuthenticatedUser } from '@/hooks/auth/useAuthenticatedUser'

// Import server actions
import { 
  createPlannedVisit,
  updatePlannedVisit,
  deletePlannedVisit,
  fetchPlannedVisitsByDateAndSchool,
  bulkCreatePlannedVisits
} from '@actions/visits/planned-visits'

// Import types
import type { PlannedVisitInput } from '@zod-schema/visits/planned-visit'

// Import time utilities
import { calculatePeriodTimeSlot } from '../utils/schedule-time-utils'
import { ScheduledVisit } from '../types'


export interface UseVisitSchedulingOptions {
  schoolId: string
  date: string
  onVisitScheduled?: (visit: ScheduledVisit) => void
  onError?: (error: string | Error) => void
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
  portion: 'first_half' | 'second_half' | 'full_period'
  purpose?: string
  date: string
}

export interface SchedulingResult {
  success: boolean
  visitId?: string
  error?: string
}

/**
 * Consolidated visit scheduling hook for schedulesNew interface
 * Single source of truth for visit scheduling with proper auto-save
 * Optimized for UI component needs with stable function references
 */
export function useVisitScheduling({
  schoolId,
  date,
  onVisitScheduled,
  onError
}: UseVisitSchedulingOptions): UseVisitSchedulingReturn {
  // Get authenticated user for coach ID
  const { metadata } = useAuthenticatedUser()
  
  // Core state
  const [visits, setVisits] = useState<ScheduledVisit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track if visits have been loaded to avoid auto-saving empty initial state
  const hasLoadedVisits = useRef(false)
  
  // Store latest callbacks in refs to avoid dependency issues
  const onErrorRef = useRef(onError)
  const onVisitScheduledRef = useRef(onVisitScheduled)
  
  // Update refs when callbacks change
  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])
  
  useEffect(() => {
    onVisitScheduledRef.current = onVisitScheduled
  }, [onVisitScheduled])

  // Helper to convert ScheduledVisit to PlannedVisitInput
  const convertToPlannedVisitInput = useCallback((visit: ScheduledVisit): PlannedVisitInput => {
    const coachId = metadata.staffId || 'unknown-coach'
    
    // Calculate time slot using centralized utility
    const { startTime, endTime } = calculatePeriodTimeSlot(visit.periodNumber)
    const periodNum = typeof visit.periodNumber === 'number' ? visit.periodNumber : parseInt(String(visit.periodNumber))
    
    return {
      teacherId: visit.teacherId,
      timeSlot: {
        startTime,
        endTime,
        periodNum: periodNum
      },
      purpose: visit.purpose || 'Observation',
      duration: '45', // Default 45 minutes
      date: new Date(date),
      coach: coachId,
      assignmentType: visit.portion,
      customPurpose: false,
      periodNumber: periodNum,
      portion: visit.portion,
      school: schoolId,
      owners: [coachId]
    }
  }, [metadata, schoolId, date])

  // Auto-save functionality with real server actions
  const { triggerSave } = useAutoSave({
    entityId: `visits-${schoolId}-${date}`,
    data: visits,
    onSave: async (entityId, data) => {
      console.log('Auto-saving visits:', entityId, data)
      
      if (!Array.isArray(data) || data.length === 0) {
        console.log('No visits to save')
        return
      }
      
      // Convert ScheduledVisit[] to PlannedVisitInput[]
      const plannedVisits = (data as ScheduledVisit[]).map(visit => convertToPlannedVisitInput(visit))
      
      // Save to database using server action
      const result = await bulkCreatePlannedVisits(plannedVisits)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save visits')
      }
    },
    debounceMs: 2000,
    enabled: visits.length > 0 && hasLoadedVisits.current
  })

  // Auto-save when visits change (after initial load)
  useEffect(() => {
    if (hasLoadedVisits.current && visits.length > 0) {
      triggerSave()
    }
  }, [visits, triggerSave])

  // Stable error handler
  const handleError = useCallback((error: string | Error) => {
    const errorMessage = error instanceof Error ? error.message : error
    setError(errorMessage)
    onErrorRef.current?.(errorMessage)
  }, [])

  // Create optimistic visit for immediate UI feedback
  const createOptimisticVisit = useCallback((data: CreateVisitData): ScheduledVisit => {
    return {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      teacherId: data.teacherId,
      teacherName: data.teacherName,
      periodNumber: data.periodNumber,
      portion: data.portion,
      purpose: data.purpose || 'Observation',
      createdAt: new Date()
    }
  }, [])

  // Validate visit data before scheduling
  const validateVisitData = useCallback((data: CreateVisitData) => {
    const errors: string[] = []
    
    if (!data.teacherId) errors.push('Teacher ID is required')
    if (!data.teacherName) errors.push('Teacher name is required')
    if (!data.periodNumber || data.periodNumber < 1) errors.push('Valid period number is required')
    if (!data.portion) errors.push('Visit portion is required')
    if (!data.schoolId) errors.push('School ID is required')
    if (!data.date) errors.push('Date is required')

    // Check for existing visit conflicts
    const existingVisit = visits.find(visit => 
      visit.teacherId === data.teacherId && 
      visit.periodNumber === data.periodNumber &&
      (visit.portion === data.portion || 
       visit.portion === 'full_period' || 
       data.portion === 'full_period')
    )
    
    if (existingVisit) {
      errors.push(`Visit conflict: ${data.teacherName} already has a visit in Period ${data.periodNumber}`)
    }

    return { isValid: errors.length === 0, errors }
  }, [visits])

  // Schedule new visit with optimistic updates and real server action
  const scheduleVisit = useCallback(async (visitData: CreateVisitData): Promise<SchedulingResult> => {
    setError(null)
    
    // Validate input data
    const validation = validateVisitData(visitData)
    if (!validation.isValid) {
      const errorMessage = validation.errors.join(', ')
      handleError(errorMessage)
      return { success: false, error: errorMessage }
    }

    setIsLoading(true)

    try {
      // Create optimistic visit for immediate UI feedback
      const optimisticVisit = createOptimisticVisit(visitData)
      setVisits(prevVisits => [...prevVisits, optimisticVisit])
      
      // Convert to PlannedVisitInput and save to database
      const plannedVisitInput = convertToPlannedVisitInput(optimisticVisit)
      const result = await createPlannedVisit(plannedVisitInput)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create planned visit')
      }
      
      // Update optimistic visit with real ID from server
      setVisits(prevVisits => 
        prevVisits.map(visit => 
          visit.id === optimisticVisit.id 
            ? { ...visit, id: result.data?._id || visit.id }
            : visit
        )
      )
      
      // Notify parent component
      onVisitScheduledRef.current?.(optimisticVisit)
      
      return { success: true, visitId: result.data?._id || optimisticVisit.id }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to schedule visit'
      
      // Rollback optimistic update on failure
      setVisits(prevVisits => prevVisits.filter(visit => 
        !(visit.teacherId === visitData.teacherId && 
          visit.periodNumber === visitData.periodNumber &&
          visit.portion === visitData.portion)
      ))
      
      handleError(errorMessage)
      
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [validateVisitData, createOptimisticVisit, convertToPlannedVisitInput, handleError])

  // Update existing visit with real server action
  const updateVisit = useCallback(async (visitId: string, data: Partial<ScheduledVisit>): Promise<boolean> => {
    setError(null)
    setIsLoading(true)

    const originalVisit = visits.find(visit => visit.id === visitId)
    
    try {
      // Optimistic update
      setVisits(prevVisits => 
        prevVisits.map(visit => 
          visit.id === visitId ? { ...visit, ...data } : visit
        )
      )

      // Convert partial update to PlannedVisitInput format
      const updateData: Partial<PlannedVisitInput> = {}
      
      if (data.purpose) updateData.purpose = data.purpose
      if (data.portion) {
        updateData.assignmentType = data.portion
        updateData.portion = data.portion
      }
      
      const result = await updatePlannedVisit(visitId, updateData)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update planned visit')
      }
      
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update visit'
      
      // Rollback on failure
      if (originalVisit) {
        setVisits(prevVisits => 
          prevVisits.map(visit => 
            visit.id === visitId ? originalVisit : visit
          )
        )
      }
      
      handleError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [visits, handleError])

  // Delete visit with optimistic updates and real server action
  const deleteVisit = useCallback(async (visitId: string): Promise<boolean> => {
    setError(null)
    setIsLoading(true)

    const visitToDelete = visits.find(visit => visit.id === visitId)
    
    try {
      // Optimistic deletion
      setVisits(prevVisits => prevVisits.filter(visit => visit.id !== visitId))
      
      // Delete from database
      const result = await deletePlannedVisit(visitId)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete planned visit')
      }
      
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete visit'
      
      // Rollback deletion on failure
      if (visitToDelete) {
        setVisits(prevVisits => [...prevVisits, visitToDelete])
      }
      
      handleError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [visits, handleError])

  // Load visits on mount and when dependencies change
  useEffect(() => {
    setIsLoading(true)
    setError(null)
    
    const loadVisits = async () => {
      try {
        // Fetch planned visits from database
        const result = await fetchPlannedVisitsByDateAndSchool(date, schoolId)
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to load visits')
        }
        
        // Convert PlannedVisit[] to ScheduledVisit[]
        const scheduledVisits: ScheduledVisit[] = (result.items || []).map(plannedVisit => ({
          id: plannedVisit._id,
          teacherId: plannedVisit.teacherId,
          teacherName: 'Unknown', // You might want to fetch teacher names separately
          periodNumber: plannedVisit.periodNumber || 1,
          portion: plannedVisit.portion || 'full_period',
          purpose: plannedVisit.purpose,
          createdAt: plannedVisit.createdAt || new Date()
        }))
        
        setVisits(scheduledVisits)
        hasLoadedVisits.current = true
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load visits'
        handleError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    loadVisits()
  }, [schoolId, date, handleError])

  return {
    visits,
    scheduleVisit,
    updateVisit,
    deleteVisit,
    isLoading,
    error
  }
} 