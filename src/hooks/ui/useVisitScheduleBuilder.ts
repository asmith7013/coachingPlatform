// accept conditionally - needs further review later


import { useState, useCallback, useMemo } from 'react'
import type { HoverState, DropZone } from '@domain-types/schedule'
import { handleClientError } from '@error/handlers/client'
import { logError } from '@error/core/logging'
import { useUIAssignments } from './useUIAssignments'
import { useServerAssignments } from '@hooks/domain/useServerAssignments'

/**
 * Simplified visit schedule builder hook focused on actual component needs
 * Follows established patterns and eliminates state duplication
 */
export function useVisitScheduleBuilder(
  initialDate: Date,
  schoolId: string,
  coachId: string
) {
  // Use the separated assignment management hooks
  const uiAssignments = useUIAssignments()
  const serverAssignments = useServerAssignments(initialDate)
  
  // Minimal hover state for UI feedback (no complex drag/drop needed)
  const [activeHoverZone, setActiveHoverZone] = useState<HoverState | null>(null)

  // Enhanced drop handler with conflict checking and better error handling
  const handleTeacherDrop = useCallback(async (teacherId: string, dropZone: DropZone) => {
    try {
      // Check for conflicts first
      const conflictResult = await serverAssignments.checkConflicts(teacherId, dropZone.timeSlot)
      
      if (conflictResult.hasConflicts) {
        // Let component handle conflict display
        return { 
          success: false, 
          hasConflicts: true, 
          conflicts: conflictResult.conflicts 
        }
      }

      // Create assignment in UI state
      const assignment = uiAssignments.createAssignment(teacherId, dropZone)
      
      // Clear hover state on successful drop
      setActiveHoverZone(null)
      return { success: true, assignment }
    } catch (error) {
      const errorMessage = handleClientError(error, 'VisitScheduleBuilder.handleTeacherDrop')
      logError(error, { 
        component: 'VisitScheduleBuilder', 
        operation: 'handleTeacherDrop' 
      })
      return { success: false, error: errorMessage }
    }
  }, [uiAssignments, serverAssignments])

  // Simple save function
  const saveState = useCallback(async () => {
    try {
      if (uiAssignments.activeAssignments.length > 0) {
        const result = await serverAssignments.saveAssignmentsAsPlannedVisits(
          uiAssignments.activeAssignments,
          schoolId, 
          coachId
        );
        
        if (!result?.success) {
          throw new Error(result?.error || 'Failed to create planned visits');
        }

        // Clear assignments after successful save
        uiAssignments.clearAssignments()
      }

      return { success: true }
    } catch (error) {
      const errorMessage = handleClientError(error, 'VisitScheduleBuilder.saveState')
      logError(error, { 
        component: 'VisitScheduleBuilder', 
        operation: 'saveState' 
      })
      return { success: false, error: errorMessage }
    }
  }, [uiAssignments, serverAssignments, schoolId, coachId])

  // Simple hover zone update
  const updateHoverZone = useCallback((hoverState: HoverState | null) => {
    setActiveHoverZone(hoverState)
  }, [])

  // Compute unsaved changes from assignment state
  const hasUnsavedChanges = useMemo(() => {
    return uiAssignments.activeAssignments.length > 0
  }, [uiAssignments.activeAssignments])

  return {
    // Core data - exactly what component needs
    activeAssignments: uiAssignments.activeAssignments,
    
    // Core actions - exactly what component needs  
    handleTeacherDrop,
    updateHoverZone,
    saveState,
    
    // Core state - exactly what component needs
    activeHoverZone,
    hasUnsavedChanges
  }
} 