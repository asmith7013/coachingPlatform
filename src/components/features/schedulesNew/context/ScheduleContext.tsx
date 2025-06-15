import React, { createContext, useContext, ReactNode } from 'react';
import { useScheduleData, useScheduleActions, useScheduleState } from '../hooks';
import type { TimeSlot, Visit } from '@zod-schema/visits/visit';
import type { NYCPSStaff } from '@zod-schema/core/staff';
import type { TeacherSchedule } from '@zod-schema/schedule/schedule';
import type { VisitCreationData, VisitUpdateData, ScheduleUIState, ConflictCheckData } from '../types';
import type { School } from '@zod-schema/core/school';

// ✅ SCHEMA-FIRST: Use schema types directly, no transformations
interface ScheduleContextType {
  // Core props
  schoolId: string;
  date: string;
  mode: 'create' | 'edit';
  visitId?: string;
  
  // Data (direct schema types) - ✅ NO TRANSFORMATIONS
  teachers: NYCPSStaff[];
  timeSlots: TimeSlot[];     // Direct from bell schedule schema
  visits: Visit[];
  teacherSchedules: TeacherSchedule[]; // Direct from teacher schedule schema
  school: School;
  isLoading: boolean;
  error: unknown;
  
  // UI state
  uiState: ScheduleUIState;
  selectTeacherPeriod: (teacherId: string, period: number) => void;
  clearSelection: () => void;
  toggleDropdown: (dropdownId: string | null) => void;
  
  // Operations (delegated to domain hooks)
  scheduleVisit: (data: VisitCreationData) => Promise<{ success: boolean; error?: string }>;
  updateVisit: (visitId: string, updates: VisitUpdateData) => Promise<{ success: boolean; error?: string }>;
  deleteVisit: (visitId: string) => Promise<{ success: boolean; error?: string }>;
  removeEventFromVisit: (visitId: string, eventIndex: number) => Promise<{ success: boolean; error?: string }>;
  clearAllVisits: () => Promise<{ success: boolean; deletedCount: number; error?: string }>;
  
  // Helpers (pure functions, no state)
  getVisitForTeacherPeriod: (teacherId: string, period: number) => Visit | undefined;
  hasVisitConflict: (data: ConflictCheckData) => boolean;
}

// Create context
const ScheduleContext = createContext<ScheduleContextType | null>(null);

// Provider component
interface ScheduleProviderProps {
  schoolId: string;
  date: string;
  mode?: 'create' | 'edit';
  visitId?: string;
  children: ReactNode;
}

export function ScheduleProvider({ 
  schoolId, 
  date, 
  mode = 'create',
  visitId,
  children 
}: ScheduleProviderProps) {
  // ✅ COMPOSE FOCUSED HOOKS: Each with single responsibility
  const scheduleData = useScheduleData({ schoolId, date, mode, visitId });
  const scheduleActions = useScheduleActions({ 
    schoolId, 
    date, 
    visits: scheduleData.visits, 
    mode, 
    visitId 
  });
  const scheduleState = useScheduleState();
  
  const contextValue: ScheduleContextType = {
    // Core props
    schoolId,
    date,
    mode,
    visitId,
    
    // Data (direct schema types) - ✅ NO TRANSFORMATIONS
    teachers: scheduleData.teachers,
    timeSlots: scheduleData.timeSlots as unknown as TimeSlot[],           // ClassScheduleItem[] - no transformation
    visits: scheduleData.visits,
    teacherSchedules: scheduleData.teacherSchedules, // TeacherSchedule[] - no transformation
    school: scheduleData.school as School,
    isLoading: Boolean(scheduleData.isLoading || scheduleActions.isLoading),
    error: scheduleData.error || scheduleActions.error,
    
    // UI state
    uiState: scheduleState.uiState,
    selectTeacherPeriod: scheduleState.selectTeacherPeriod,
    clearSelection: scheduleState.clearSelection,
    toggleDropdown: scheduleState.toggleDropdown,
    
    // Operations (delegated)
    scheduleVisit: scheduleActions.scheduleVisit,
    updateVisit: scheduleActions.updateVisit,
    deleteVisit: scheduleActions.deleteVisit,
    removeEventFromVisit: scheduleActions.removeEventFromVisit,
    clearAllVisits: scheduleActions.clearAllVisits,
    
    // Helpers
    getVisitForTeacherPeriod: scheduleActions.getVisitForTeacherPeriod,
    hasVisitConflict: scheduleActions.hasVisitConflict
  };
  
  return (
    <ScheduleContext.Provider value={contextValue}>
      {children}
    </ScheduleContext.Provider>
  );
}

// Base hook for internal use
export function useScheduleContext(): ScheduleContextType {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('Schedule hooks must be used within ScheduleProvider');
  }
  return context;
}
