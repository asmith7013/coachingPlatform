/**
 * @fileoverview DEPRECATED - ScheduleContext provider
 * 
 * This context is deprecated and will be removed in a future version.
 * Please migrate to the new schedule system at src/components/features/schedulesUpdated/
 * 
 * Migration path:
 * - Use the new ScheduleProvider from the schedulesUpdated feature
 * - Use the new useScheduleComposition and useScheduleUI hooks
 * - Follow the new schema-first architecture patterns
 * 
 * @deprecated Use the new schedule system at src/components/features/schedulesUpdated/
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useScheduleData, useScheduleActions, useScheduleState } from '../hooks';
import type { Visit } from '@zod-schema/visits/visit';
import type { NYCPSStaff } from '@zod-schema/core/staff';
import type { TeacherSchedule, ConflictCheckData, Event } from '@/lib/schema/zod-schema/schedules/schedule';
import type { ScheduleUIState } from '../types';
import type { School } from '@zod-schema/core/school';
import { VisitEvent } from '@/lib/schema/zod-schema/schedules/schedule-events';

// ✅ SCHEMA-FIRST: Use schema types directly, no transformations
interface ScheduleContextType {
  // Core props
  schoolId: string;
  date: string;
  mode: 'create' | 'edit';
  visitId?: string;
  
  // Data (direct schema types) - ✅ NO TRANSFORMATIONS
  teachers: NYCPSStaff[];
  timeSlots: Event[];     // Direct from bell schedule schema
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
  scheduleVisit: (data: VisitEvent) => Promise<{ success: boolean; error?: string }>;
  updateVisit: (visitId: string, updates: VisitEvent) => Promise<{ success: boolean; error?: string }>;
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

/**
 * @deprecated Use the new schedule system at src/components/features/schedulesUpdated/
 */
export function ScheduleProvider({ 
  schoolId, 
  date, 
  mode = 'create',
  visitId,
  children 
}: ScheduleProviderProps) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('ScheduleProvider is deprecated. Use the new schedule system at src/components/features/schedulesUpdated/');
  }
  // ✅ COMPOSE FOCUSED HOOKS: Each with single responsibility
  const scheduleData = useScheduleData({ schoolId, date, mode, visitId });
  const scheduleActions = useScheduleActions({ 
    schoolId, 
    date, 
    visits: scheduleData.visits, 
    mode, 
    visitId,
    coachingActionPlanId: '123' // TODO: get from context
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
    timeSlots: scheduleData.timeSlots as unknown as Event[],           // ClassScheduleItem[] - no transformation
    visits: scheduleData.visits,
    teacherSchedules: scheduleData.teacherSchedules as unknown as TeacherSchedule[], // TeacherSchedule[] - no transformation
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
