import { useState, useCallback } from 'react';
import type { TeacherSelectionState } from '@zod-schema/visits/schedule-builder-state';

/**
 * Hook for managing teacher selection state
 * Extracted from useVisitScheduleBuilder for better separation of concerns
 * ✅ TASK 2.3: Uses optimistic update patterns for immediate UI feedback
 */
export function useTeacherSelection() {
  const [selectedTeachers, setSelectedTeachers] = useState<TeacherSelectionState[]>([]);

  // ✅ TASK 2.3: Enhanced select function with optimistic update pattern
  const selectTeacher = useCallback((teacherId: string, _teacherName: string) => {
    // ✅ TASK 2.3: Optimistic update - immediately update UI
    setSelectedTeachers(prev => [
      ...prev.filter(t => t.teacherId !== teacherId),
      {
        teacherId,
        isSelected: true,
        selectedAt: new Date(), // ✅ TASK 1.4: Date object appropriate for internal state tracking
        selectionOrder: prev.length
      }
    ]);
    
    // TODO: If selection becomes server-persisted, add mutation with rollback:
    // const mutation = useMutation({
    //   mutationFn: () => saveTeacherSelectionToServer(teacherId),
    //   onError: () => {
    //     // Rollback optimistic update
    //     setSelectedTeachers(prev => prev.filter(t => t.teacherId !== teacherId));
    //   }
    // });
    // mutation.mutate();
  }, []);

  // ✅ TASK 2.3: Enhanced deselect function with optimistic update pattern
  const deselectTeacher = useCallback((teacherId: string) => {
    // ✅ TASK 2.3: Optimistic update - immediately update UI
    setSelectedTeachers(prev => prev.filter(t => t.teacherId !== teacherId));
    
    // TODO: If selection becomes server-persisted, add mutation with rollback:
    // const mutation = useMutation({
    //   mutationFn: () => removeTeacherSelectionFromServer(teacherId),
    //   onError: (error, variables, context) => {
    //     // Rollback optimistic update - restore previous teacher
    //     if (context?.previousTeacher) {
    //       setSelectedTeachers(prev => [...prev, context.previousTeacher]);
    //     }
    //   }
    // });
    // mutation.mutate();
  }, []);

  // ✅ TASK 2.3: Enhanced clear function with optimistic update pattern
  const clearSelection = useCallback(() => {
    // ✅ TASK 2.3: Optimistic update - immediately clear UI
    const previousSelection = selectedTeachers;
    setSelectedTeachers([]);
    
    // TODO: If selection becomes server-persisted, add mutation with rollback:
    // const mutation = useMutation({
    //   mutationFn: () => clearTeacherSelectionOnServer(),
    //   onError: () => {
    //     // Rollback optimistic update - restore previous selection
    //     setSelectedTeachers(previousSelection);
    //   }
    // });
    // mutation.mutate();
    
    // Silence unused variable warning for now
    void previousSelection;
  }, [selectedTeachers]);

  const isTeacherSelected = useCallback((teacherId: string): boolean => {
    return selectedTeachers.some(t => t.teacherId === teacherId);
  }, [selectedTeachers]);

  const getSelectionOrder = useCallback((teacherId: string): number | undefined => {
    const teacher = selectedTeachers.find(t => t.teacherId === teacherId);
    return teacher?.selectionOrder;
  }, [selectedTeachers]);

  return {
    selectedTeachers,
    selectTeacher,
    deselectTeacher,
    clearSelection,
    isTeacherSelected,
    getSelectionOrder
  };
} 