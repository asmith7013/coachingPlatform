import { useState, useCallback } from 'react';
import type { DraggedTeacher, HoverState } from '@components/composed/calendar/schedule/types';

/**
 * Hook for managing drag and drop state
 * Extracted from useVisitScheduleBuilder for better separation of concerns
 */
export function useDragAndDrop() {
  const [dragState, setDragState] = useState<{
    draggedTeacher: DraggedTeacher | null;
    activeHoverZone: HoverState | null;
  }>({
    draggedTeacher: null,
    activeHoverZone: null
  });

  const startDragging = useCallback((teacherId: string, teacherName: string) => {
    setDragState(prev => ({
      ...prev,
      draggedTeacher: { teacherId, teacherName }
    }));
  }, []);

  const stopDragging = useCallback(() => {
    setDragState(prev => ({
      ...prev,
      draggedTeacher: null,
      activeHoverZone: null
    }));
  }, []);

  const updateHoverZone = useCallback((hoverState: HoverState | null) => {
    setDragState(prev => ({
      ...prev,
      activeHoverZone: hoverState
    }));
  }, []);

  return {
    draggedTeacher: dragState.draggedTeacher,
    activeHoverZone: dragState.activeHoverZone,
    startDragging,
    stopDragging,
    updateHoverZone
  };
} 