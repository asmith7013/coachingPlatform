// accept conditionally - needs further review later


import { useState, useCallback, useMemo } from 'react'
import type { 
  VisitScheduleBuilderState,
} from '@zod-schema/visits/schedule-builder-state'
import type { DropZone } from '@components/composed/calendar/schedule/types'
import { handleClientError } from '@error/handlers/client'
import { logError } from '@error/core/logging'

// Import composable hooks
import { useTeacherSelection } from '@hooks/ui/useTeacherSelection'
import { useDragAndDrop } from '@hooks/ui/useDragAndDrop'
import { useAccountabilityTracking } from '@hooks/ui/useAccountabilityTracking'
import { useStatePersistence } from '@hooks/ui/useStatePersistence'
import { useAssignmentManagement } from '@hooks/ui/useAssignmentManagement'

// Import planned visit hook
import { usePlannedVisits } from '@hooks/domain/usePlannedVisits'

/**
 * Enhanced visit schedule builder hook using composition pattern
 * Leverages existing infrastructure and follows established patterns
 */
export function useVisitScheduleBuilder(
  initialDate: Date,
  schoolId: string,
  coachId: string
) {
  // Compose functionality from specialized hooks
  const teacherSelection = useTeacherSelection()
  const dragAndDrop = useDragAndDrop()
  const accountability = useAccountabilityTracking()
  const persistence = useStatePersistence()
  const assignments = useAssignmentManagement(initialDate)
  
  // Use planned visit entity hook for data operations
  const plannedVisits = usePlannedVisits.withBulk()

  // Core builder state (simplified with composition)
  const [builderState, setBuilderState] = useState<VisitScheduleBuilderState>({
    date: initialDate,
    school: schoolId,
    coach: coachId,
    uiState: {
      selectedTeachers: [],
      multiSelectMode: false,
      activeAssignments: [],
      teacherAccountability: [],
      showAccountabilityGrid: true,
      autoAssignPurposes: false,
      hasUnsavedChanges: false,
    },
    isPersisted: false,
    isLocalBackup: false,
  })

  // Track unsaved changes based on composed state
  const hasUnsavedChanges = useMemo(() => {
    return teacherSelection.selectedTeachers.length > 0 ||
           assignments.activeAssignments.length > 0 ||
           accountability.accountability.length > 0
  }, [
    teacherSelection.selectedTeachers,
    assignments.activeAssignments,
    accountability.accountability
  ])

  // Enhanced drop handler with better error handling
  const handleTeacherDrop = useCallback(async (teacherId: string, dropZone: DropZone) => {
    try {
      const result = await assignments.createAssignment(teacherId, dropZone)
      
      if (result.success && result.assignment) {
        // Update accountability
        accountability.updateTeacherAccountability(teacherId, true, false)
        dragAndDrop.stopDragging()
        return result
      } else if (result.hasConflicts) {
        // Let component handle conflict display
        return result
      } else {
        throw new Error(result.error || 'Failed to create assignment')
      }
    } catch (error) {
      const errorMessage = handleClientError(error, 'VisitScheduleBuilder.handleTeacherDrop')
      logError(error, { 
        component: 'VisitScheduleBuilder', 
        operation: 'handleTeacherDrop' 
      })
      return { success: false, error: errorMessage }
    }
  }, [assignments, accountability, dragAndDrop])

  // Enhanced save with planned visit creation
  const saveState = useCallback(async () => {
    try {
      // Create planned visits from assignments
      if (assignments.activeAssignments.length > 0) {
        const result = await plannedVisits.createFromAssignments(
          assignments.activeAssignments,
          { date: initialDate, school: schoolId, coach: coachId }
        )
        
        if (!result?.success) {
          throw new Error('Failed to create planned visits')
        }
      }

      // Save the current state
      const currentState = {
        ...builderState,
        uiState: {
          ...builderState.uiState,
          selectedTeachers: teacherSelection.selectedTeachers,
          activeAssignments: assignments.activeAssignments,
          teacherAccountability: accountability.accountability,
          hasUnsavedChanges: false,
          lastSavedAt: new Date()
        }
      }

      const saveResult = await persistence.saveState(currentState)
      
      if (saveResult.success) {
        setBuilderState(prev => ({
          ...prev,
          isPersisted: true,
          sessionId: saveResult.sessionId,
          uiState: {
            ...prev.uiState,
            hasUnsavedChanges: false,
            lastSavedAt: new Date()
          }
        }))
      }

      return saveResult
    } catch (error) {
      const errorMessage = handleClientError(error, 'VisitScheduleBuilder.saveState')
      logError(error, { 
        component: 'VisitScheduleBuilder', 
        operation: 'saveState' 
      })
      return { success: false, error: errorMessage }
    }
  }, [
    assignments,
    accountability,
    teacherSelection,
    plannedVisits,
    persistence,
    builderState,
    initialDate,
    schoolId,
    coachId
  ])

  // Enhanced load state
  const loadState = useCallback(async (sessionId: string) => {
    const result = await persistence.loadState(sessionId)
    // Note: Individual hooks maintain their own state, 
    // components can handle state restoration as needed
    return result
  }, [persistence])

  return {
    // Composed functionality
    ...teacherSelection,
    ...dragAndDrop,
    ...accountability,
    
    // Enhanced assignment management
    activeAssignments: assignments.activeAssignments,
    handleTeacherDrop,
    
    // State and persistence
    builderState,
    hasUnsavedChanges,
    saveState,
    loadState,
    
    // Loading states from composed hooks
    isLoading: persistence.isLoading,
    isSaving: persistence.isSaving || plannedVisits.isBulkCreating,
    
    // Error states
    bulkCreateError: plannedVisits.bulkCreateError,
  }
} 