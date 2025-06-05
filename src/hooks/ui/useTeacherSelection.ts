import { useState, useCallback } from 'react';
import type { TeacherSelectionState } from '@zod-schema/visits/schedule-builder-state';

/**
 * Hook for managing teacher selection state
 * Extracted from useVisitScheduleBuilder for better separation of concerns
 */
export function useTeacherSelection() {
  const [selectedTeachers, setSelectedTeachers] = useState<TeacherSelectionState[]>([]);

  const selectTeacher = useCallback((teacherId: string, _teacherName: string) => {
    setSelectedTeachers(prev => [
      ...prev.filter(t => t.teacherId !== teacherId),
      {
        teacherId,
        isSelected: true,
        selectedAt: new Date(),
        selectionOrder: prev.length
      }
    ]);
  }, []);

  const deselectTeacher = useCallback((teacherId: string) => {
    setSelectedTeachers(prev => prev.filter(t => t.teacherId !== teacherId));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTeachers([]);
  }, []);

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