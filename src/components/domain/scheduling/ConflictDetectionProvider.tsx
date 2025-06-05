'use client'

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import type { AssignmentState } from '@zod-schema/visits/schedule-builder-state'
import type { PlannedVisit, TimeSlot } from '@zod-schema/visits/planned-visit'

interface ConflictInfo {
  type: 'teacher_double_booking' | 'time_overlap' | 'scheduling_conflict'
  teacherId: string
  timeSlot: TimeSlot
  conflictingAssignment?: AssignmentState | PlannedVisit
  severity: 'warning' | 'error'
  message: string
}

interface ConflictDetectionContextValue {
  // Conflict state
  conflicts: ConflictInfo[]
  hasConflicts: boolean
  
  // Conflict detection methods
  checkAssignmentConflict: (
    teacherId: string, 
    timeSlot: TimeSlot, 
    assignmentType: string
  ) => ConflictInfo[]
  
  validateDropZone: (
    teacherId: string, 
    timeSlot: TimeSlot, 
    assignmentType: string
  ) => { canDrop: boolean; conflicts: ConflictInfo[] }
  
  // State management
  addConflict: (conflict: ConflictInfo) => void
  removeConflict: (teacherId: string, timeSlot: TimeSlot) => void
  clearConflicts: () => void
}

const ConflictDetectionContext = createContext<ConflictDetectionContextValue | null>(null)

export function useConflictDetection() {
  const context = useContext(ConflictDetectionContext)
  if (!context) {
    throw new Error('useConflictDetection must be used within ConflictDetectionProvider')
  }
  return context
}

interface ConflictDetectionProviderProps {
  children: React.ReactNode
  activeAssignments: AssignmentState[]
  existingPlannedVisits: PlannedVisit[]
  preventConflicts?: boolean // Whether to prevent or just warn
}

export function ConflictDetectionProvider({
  children,
  activeAssignments,
  existingPlannedVisits,
  preventConflicts = false
}: ConflictDetectionProviderProps) {
  const [conflicts, setConflicts] = useState<ConflictInfo[]>([])

  // Helper function to check time slot overlap
  const timeSlotOverlaps = useCallback((slot1: TimeSlot, slot2: TimeSlot): boolean => {
    const start1 = new Date(`1970-01-01T${slot1.startTime}`)
    const end1 = new Date(`1970-01-01T${slot1.endTime}`)
    const start2 = new Date(`1970-01-01T${slot2.startTime}`)
    const end2 = new Date(`1970-01-01T${slot2.endTime}`)

    return start1 < end2 && start2 < end1
  }, [])

  // Check for assignment conflicts (Task 3.4)
  const checkAssignmentConflict = useCallback((
    teacherId: string,
    timeSlot: TimeSlot,
    assignmentType: string
  ): ConflictInfo[] => {
    const foundConflicts: ConflictInfo[] = []

    // Check against active assignments
    activeAssignments.forEach(assignment => {
      if (assignment.teacherId === teacherId && timeSlotOverlaps(assignment.timeSlot, timeSlot)) {
        foundConflicts.push({
          type: 'teacher_double_booking',
          teacherId,
          timeSlot,
          conflictingAssignment: assignment,
          severity: 'error',
          message: `Teacher is already assigned during ${assignment.timeSlot.startTime}-${assignment.timeSlot.endTime}`
        })
      }
    })

    // Check against existing planned visits
    existingPlannedVisits.forEach(visit => {
      if (visit.teacherId === teacherId && timeSlotOverlaps(visit.timeSlot, timeSlot)) {
        foundConflicts.push({
          type: 'scheduling_conflict',
          teacherId,
          timeSlot,
          conflictingAssignment: visit,
          severity: 'warning',
          message: `Teacher has existing visit scheduled during ${visit.timeSlot.startTime}-${visit.timeSlot.endTime}`
        })
      }
    })

    // Check for overlapping assignments in same time slot (different assignment types)
    if (assignmentType !== 'full_period') {
      const sameTimeAssignments = activeAssignments.filter(assignment =>
        assignment.timeSlot.startTime === timeSlot.startTime &&
        assignment.timeSlot.endTime === timeSlot.endTime &&
        assignment.assignmentType !== 'full_period'
      )

      if (sameTimeAssignments.length > 0 && assignmentType === 'full_period') {
        foundConflicts.push({
          type: 'time_overlap',
          teacherId,
          timeSlot,
          severity: 'error',
          message: 'Cannot assign full period when partial assignments exist'
        })
      }
    }

    return foundConflicts
  }, [activeAssignments, existingPlannedVisits, timeSlotOverlaps])

  // Validate drop zone for drag and drop (Task 3.3)
  const validateDropZone = useCallback((
    teacherId: string,
    timeSlot: TimeSlot,
    assignmentType: string
  ) => {
    const conflicts = checkAssignmentConflict(teacherId, timeSlot, assignmentType)
    const hasErrors = conflicts.some(c => c.severity === 'error')

    return {
      canDrop: preventConflicts ? !hasErrors : true,
      conflicts
    }
  }, [checkAssignmentConflict, preventConflicts])

  // Conflict management methods
  const addConflict = useCallback((conflict: ConflictInfo) => {
    setConflicts(prev => [
      ...prev.filter(c => 
        !(c.teacherId === conflict.teacherId && 
          c.timeSlot.startTime === conflict.timeSlot.startTime &&
          c.timeSlot.endTime === conflict.timeSlot.endTime)
      ),
      conflict
    ])
  }, [])

  const removeConflict = useCallback((teacherId: string, timeSlot: TimeSlot) => {
    setConflicts(prev => prev.filter(c => 
      !(c.teacherId === teacherId && 
        c.timeSlot.startTime === timeSlot.startTime &&
        c.timeSlot.endTime === timeSlot.endTime)
    ))
  }, [])

  const clearConflicts = useCallback(() => {
    setConflicts([])
  }, [])

  // Computed values
  const hasConflicts = useMemo(() => conflicts.length > 0, [conflicts])

  const contextValue: ConflictDetectionContextValue = {
    conflicts,
    hasConflicts,
    checkAssignmentConflict,
    validateDropZone,
    addConflict,
    removeConflict,
    clearConflicts
  }

  return (
    <ConflictDetectionContext.Provider value={contextValue}>
      {children}
    </ConflictDetectionContext.Provider>
  )
}

// Conflict Display Component for visual feedback
export function ConflictWarningBanner() {
  const { conflicts, hasConflicts } = useConflictDetection()

  if (!hasConflicts) return null

  const errorConflicts = conflicts.filter(c => c.severity === 'error')
  const warningConflicts = conflicts.filter(c => c.severity === 'warning')

  return (
    <div className="space-y-2">
      {/* Error conflicts */}
      {errorConflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-sm font-medium text-red-800 mb-2">
            Assignment Conflicts ({errorConflicts.length})
          </div>
          <div className="space-y-1">
            {errorConflicts.map((conflict, index) => (
              <div key={`error-${index}`} className="text-sm text-red-700">
                • {conflict.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning conflicts */}
      {warningConflicts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="text-sm font-medium text-amber-800 mb-2">
            Scheduling Warnings ({warningConflicts.length})
          </div>
          <div className="space-y-1">
            {warningConflicts.map((conflict, index) => (
              <div key={`warning-${index}`} className="text-sm text-amber-700">
                • {conflict.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 