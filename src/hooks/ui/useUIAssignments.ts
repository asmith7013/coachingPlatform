// src/hooks/ui/useUIAssignments.ts
import { useState, useCallback } from 'react';
import type { AssignmentState } from '@zod-schema/visits/schedule-builder-state';
import type { DropZone } from '@domain-types/schedule';

export function useUIAssignments() {
  const [activeAssignments, setActiveAssignments] = useState<AssignmentState[]>([]);
  
  const createAssignment = useCallback((
    teacherId: string, 
    dropZone: DropZone
  ) => {
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

    return assignment;
  }, []);

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