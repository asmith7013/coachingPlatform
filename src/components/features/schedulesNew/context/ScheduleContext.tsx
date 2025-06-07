import React, { createContext, useContext, ReactNode } from 'react';
import { useScheduleBuilder } from '../hooks/useScheduleBuilder';

// Full context type (internal use only)
type ScheduleContextType = ReturnType<typeof useScheduleBuilder>;

// Create context
const ScheduleContext = createContext<ScheduleContextType | null>(null);

// Provider component
interface ScheduleProviderProps {
  schoolId: string;
  date: string;
  children: ReactNode;
}

export function ScheduleProvider({ schoolId, date, children }: ScheduleProviderProps) {
  const scheduleBuilder = useScheduleBuilder({ schoolId, date });
  
  console.log('🏗️ ScheduleProvider rendering with:', { schoolId, date, hasData: !!scheduleBuilder.teachers.length });
  
  return (
    <ScheduleContext.Provider value={scheduleBuilder}>
      {children}
    </ScheduleContext.Provider>
  );
}

// Base hook for internal use
function useScheduleContext(): ScheduleContextType {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('Schedule hooks must be used within ScheduleProvider');
  }
  return context;
}

// ===== SELECTIVE CONTEXT HOOKS =====
// These prevent unnecessary re-renders by exposing only specific state slices

/**
 * Hook for teacher/period selection state and actions
 * Use in: TeacherPeriodCell, DropZoneCell
 */
export function useScheduleSelection() {
  const context = useScheduleContext();
  return {
    selectedTeacher: context.selectedTeacher,
    selectedPeriod: context.selectedPeriod,
    handleTeacherPeriodSelect: context.handleTeacherPeriodSelect
  };
}

/**
 * Hook for drop zone interactions and state
 * Use in: DropZoneCell
 */
export function useDropZoneActions() {
  const context = useScheduleContext();
  return {
    teacherSchedules: context.teacherSchedules,
    eventTypes: context.eventTypes,
    openDropdown: context.openDropdown,
    setOpenDropdown: context.setOpenDropdown,
    getDropZoneItems: context.getDropZoneItems,
    isHalfAvailable: context.isHalfAvailable,
    handlePeriodPortionSelect: context.handlePeriodPortionSelect,
    updateEventType: context.updateEventType,
    removeDropZoneItem: context.removeDropZoneItem
  };
}

/**
 * Hook for teacher planning status
 * Use in: PlanningStatusBar
 */
export function useTeacherPlanning() {
  const context = useScheduleContext();
  return {
    teachers: context.teachers,
    getTeacherPlanning: context.getTeacherPlanning
  };
}

/**
 * Hook for visit data and queries
 * Use in: TeacherPeriodCell, any component showing visit status
 */
export function useVisitData() {
  const context = useScheduleContext();
  return {
    scheduledVisits: context.scheduledVisits,
    getVisit: context.getVisit,
    hasVisit: context.hasVisit,
    isDropZoneFullyScheduled: context.isDropZoneFullyScheduled,
    isTeacherScheduledInDropZone: context.isTeacherScheduledInDropZone
  };
}

/**
 * Hook for schedule grid structure data
 * Use in: ScheduleGrid, components that need grid layout info
 */
export function useScheduleStructure() {
  const context = useScheduleContext();
  return {
    teachers: context.teachers,
    timeSlots: context.timeSlots,
    teacherSchedules: context.teacherSchedules,
    isLoading: context.isLoading,
    error: context.error,
    hasData: context.hasData
  };
}

/**
 * Hook for save status and actions
 * Use in: ScheduleGrid footer, any save indicators
 */
export function useScheduleSaveStatus() {
  const context = useScheduleContext();
  return {
    saveStatus: context.saveStatus
  };
}

/**
 * Hook for selection status display
 * Use in: SelectionStatusFooter
 */
export function useSelectionStatus() {
  const context = useScheduleContext();
  return {
    selectedTeacher: context.selectedTeacher,
    selectedPeriod: context.selectedPeriod,
    selectedPortion: context.selectedPortion,
    teachers: context.teachers
  };
} 