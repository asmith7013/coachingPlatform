import { useState, useCallback } from 'react';
import { handleClientError } from '@error/handlers/client';
import type { AssignmentState } from '@zod-schema/visits/schedule-builder-state';
import type { DropZone } from '@components/composed/calendar/schedule/types';
import { checkTeacherScheduleConflicts } from '@actions/visits/planned-visits';

/**
 * Hook for managing assignment state and operations
 * Extracted from useVisitScheduleBuilder for better separation of concerns
 */
export function useAssignmentManagement(date: Date) {
  const [activeAssignments, setActiveAssignments] = useState<AssignmentState[]>([]);

  const createAssignment = useCallback(async (
    teacherId: string, 
    dropZone: DropZone
  ) => {
    try {
      // Check for conflicts first
      const conflictCheck = await checkTeacherScheduleConflicts(
        teacherId,
        date.toISOString().split('T')[0],
        dropZone.timeSlot
      );

      if (conflictCheck.hasConflicts) {
        console.warn('Scheduling conflict detected:', conflictCheck.conflicts);
        // Return conflict info for component to handle
        return { 
          success: false, 
          hasConflicts: true, 
          conflicts: conflictCheck.conflicts 
        };
      }

      // Create assignment
      const assignment: AssignmentState = {
        teacherId,
        timeSlot: dropZone.timeSlot,
        assignmentType: dropZone.zone,
        isTemporary: false,
        assignedAt: new Date()
      };

      setActiveAssignments(prev => [
        ...prev.filter(
          a => !(a.teacherId === teacherId && 
                 a.timeSlot.startTime === dropZone.timeSlot.startTime &&
                 a.timeSlot.endTime === dropZone.timeSlot.endTime)
        ),
        assignment
      ]);

      return { success: true, assignment };
    } catch (error) {
      const errorMessage = handleClientError(error, 'AssignmentManagement.createAssignment');
      return { success: false, error: errorMessage };
    }
  }, [date]);

  const removeAssignment = useCallback((teacherId: string, timeSlot: { startTime: string; endTime: string }) => {
    setActiveAssignments(prev => 
      prev.filter(a => 
        !(a.teacherId === teacherId && 
          a.timeSlot.startTime === timeSlot.startTime &&
          a.timeSlot.endTime === timeSlot.endTime)
      )
    );
  }, []);

  const updateAssignmentPurpose = useCallback((
    teacherId: string, 
    timeSlot: { startTime: string; endTime: string }, 
    purpose: string
  ) => {
    setActiveAssignments(prev => 
      prev.map(assignment => 
        assignment.teacherId === teacherId && 
        assignment.timeSlot.startTime === timeSlot.startTime &&
        assignment.timeSlot.endTime === timeSlot.endTime
          ? { ...assignment, purpose }
          : assignment
      )
    );
  }, []);

  const clearAssignments = useCallback(() => {
    setActiveAssignments([]);
  }, []);

  const getAssignment = useCallback((
    teacherId: string, 
    timeSlot: { startTime: string; endTime: string }
  ): AssignmentState | undefined => {
    return activeAssignments.find(a => 
      a.teacherId === teacherId && 
      a.timeSlot.startTime === timeSlot.startTime &&
      a.timeSlot.endTime === timeSlot.endTime
    );
  }, [activeAssignments]);

  return {
    activeAssignments,
    createAssignment,
    removeAssignment,
    updateAssignmentPurpose,
    clearAssignments,
    getAssignment
  };
} 