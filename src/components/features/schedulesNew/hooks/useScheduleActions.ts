import { useCallback, useMemo } from 'react'
import { useVisits } from '@/hooks/domain/useVisits'
import { useCoachId } from '@hooks/auth/useCoachData'
import { createConflictDetector } from '../utils/visit-conflict-detector'
import type { Visit } from '@zod-schema/visits/visit'
import type { VisitCreationData, VisitUpdateData, ConflictCheckData } from '../types'
import { ScheduleAssignmentType } from '@/lib/schema/enum/shared-enums'

export interface UseScheduleActionsProps {
  schoolId: string
  date: string
  visits: Visit[]
  mode?: 'create' | 'edit'
  visitId?: string
}

/**
 * Pure delegation to domain CRUD operations
 * Feature logic: conflict detection only
 */
export function useScheduleActions({ 
  schoolId, 
  date, 
  visits, 
  mode = 'create', 
  visitId 
}: UseScheduleActionsProps) {
  const coachId = useCoachId()
  
  // ✅ DELEGATE: Use domain hook manager for all CRUD
  const visitsManager = useVisits.manager()
  
  // ✅ FEATURE LOGIC: Conflict detection using existing visits
  const conflictDetector = useMemo(() => {
    const conflictData = visits.map(visit => ({
      id: visit._id,
      teacherId: extractTeacherId(visit),
      teacherName: 'Teacher', // Will be resolved by UI
      periodNumber: extractPeriodNumber(visit),
      portion: extractPortion(visit)
    }))
    return createConflictDetector(conflictData)
  }, [visits])

  const scheduleVisit = useCallback(async (data: VisitCreationData) => {
    try {
      // ✅ FEATURE VALIDATION: Check conflicts
      const conflict = conflictDetector.checkConflict({
        teacherId: data.teacherId,
        periodNumber: data.periodNumber,
        portion: data.portion
      })
      
      if (conflict.hasConflict) {
        return { success: false, error: conflict.message }
      }

      // ✅ DELEGATE: Let domain hook construct the visit
      const visitData = {
        date: new Date(date),
        school: schoolId,
        coach: coachId || 'unknown',
        gradeLevelsSupported: [],
        allowedPurpose: data.purpose,
        modeDone: 'In-person' as const,
        events: [{
          eventType: 'observation' as const,
          staff: [data.teacherId],
          duration: data.portion === 'full_period' ? '45' : '22'
        }],
        owners: [coachId || 'unknown']
      }

      if (mode === 'create') {
        const result = await visitsManager.createAsync?.(visitData)
        return { success: !!result, error: result ? undefined : 'Failed to create visit' }
      }
      
      if (mode === 'edit' && visitId) {
        const result = await visitsManager.updateAsync?.(visitId, visitData)
        return { success: !!result, error: result ? undefined : 'Failed to update visit' }
      }
      
      return { success: false, error: 'Invalid mode' }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Operation failed' 
      }
    }
  }, [conflictDetector, schoolId, date, coachId, mode, visitId, visitsManager])

  const updateVisit = useCallback(async (visitId: string, updates: VisitUpdateData) => {
    try {
      // ✅ DELEGATE: Use domain hook update
      const visitUpdates = {
        ...(updates.purpose && { allowedPurpose: updates.purpose })
      }
      const result = await visitsManager.updateAsync?.(visitId, visitUpdates)
      return { success: !!result, error: result ? undefined : 'Failed to update visit' }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Update failed' 
      }
    }
  }, [visitsManager])

  const deleteVisit = useCallback(async (visitId: string) => {
    try {
      // ✅ DELEGATE: Use domain hook delete
      const result = await visitsManager.deleteAsync?.(visitId)
      return { success: !!result, error: result ? undefined : 'Failed to delete visit' }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Delete failed' 
      }
    }
  }, [visitsManager])

  // ✅ QUERY HELPERS: Simple visit lookups
  const getVisitForTeacherPeriod = useCallback((teacherId: string, period: number): Visit | undefined => {
    return visits.find(visit => 
      extractTeacherId(visit) === teacherId && 
      extractPeriodNumber(visit) === period
    )
  }, [visits])

  const hasVisitConflict = useCallback((data: ConflictCheckData): boolean => {
    return conflictDetector.checkConflict(data).hasConflict
  }, [conflictDetector])

  return {
    // CRUD operations (delegated)
    scheduleVisit,
    updateVisit,
    deleteVisit,
    
    // Query helpers
    getVisitForTeacherPeriod,
    hasVisitConflict,
    
    // Status from domain hooks
    isLoading: visitsManager.isCreating || visitsManager.isUpdating || visitsManager.isDeleting,
    error: visitsManager.createError || visitsManager.updateError || visitsManager.deleteError
  }
}

// ✅ SIMPLE EXTRACTION HELPERS (Move to utils if needed elsewhere)
function extractTeacherId(visit: Visit): string {
  return visit.events?.[0]?.staff?.[0] || 'unknown'
}

function extractPeriodNumber(_visit: Visit): number {
  // TODO: Enhance when visit schema includes period info
  return 1
}

function extractPortion(visit: Visit): ScheduleAssignmentType {
  const duration = visit.events?.[0]?.duration
  return duration === '22' ? 'first_half' : 'full_period'
} 