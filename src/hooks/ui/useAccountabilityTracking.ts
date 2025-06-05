import { useState, useCallback } from 'react';
import type { TeacherAccountabilityState } from '@zod-schema/visits/schedule-builder-state';

/**
 * Hook for managing teacher accountability tracking
 * Extracted from useVisitScheduleBuilder for better separation of concerns
 */
export function useAccountabilityTracking() {
  const [accountability, setAccountability] = useState<TeacherAccountabilityState[]>([]);

  const updateTeacherAccountability = useCallback((
    teacherId: string,
    isScheduled: boolean,
    isCrossedOff: boolean,
    notes?: string
  ) => {
    setAccountability(prev => [
      ...prev.filter(t => t.teacherId !== teacherId),
      {
        teacherId,
        isScheduled,
        isCrossedOff,
        isCompleted: isScheduled || isCrossedOff,
        notes
      }
    ]);
  }, []);

  const getTeacherAccountability = useCallback((teacherId: string): TeacherAccountabilityState | undefined => {
    return accountability.find(t => t.teacherId === teacherId);
  }, [accountability]);

  const isTeacherAccountable = useCallback((teacherId: string): boolean => {
    const teacherState = accountability.find(t => t.teacherId === teacherId);
    return teacherState?.isCompleted ?? false;
  }, [accountability]);

  const clearAccountability = useCallback(() => {
    setAccountability([]);
  }, []);

  return {
    accountability,
    updateTeacherAccountability,
    getTeacherAccountability,
    isTeacherAccountable,
    clearAccountability
  };
} 