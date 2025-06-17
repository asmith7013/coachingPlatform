import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useScheduleComposition, useScheduleUI } from '../hooks';
import { useVisitSchedules } from '@/hooks/domain/schedules';
import type { ScheduleContextType, ScheduleBuilderProps } from '../types';
import type { VisitSchedule, VisitScheduleInput } from '@zod-schema/schedules/schedule-documents';
import type { ServerActionResult } from '@/lib/types/core/cache';

const ScheduleContext = createContext<ScheduleContextType | null>(null);

interface ScheduleProviderProps extends ScheduleBuilderProps {
  children: ReactNode;
}

export function ScheduleProvider({ 
  schoolId, 
  date, 
  mode = 'create',
  visitId,
  children 
}: ScheduleProviderProps) {
  // Composition: data + UI state
  const scheduleData = useScheduleComposition({ schoolId, date, mode, visitId });
  const { uiState, selectTeacherPeriod, clearSelection, toggleDropdown } = useScheduleUI();
  
  // Operations: pure delegation to domain hooks
  const visitScheduleManager = useVisitSchedules.manager;
  
  const createVisitSchedule = useCallback(async (data: VisitScheduleInput): Promise<ServerActionResult<VisitSchedule>> => {
    const result = await visitScheduleManager.createAsync(data);
    return result || { success: false, error: 'Creation failed' };
  }, [visitScheduleManager]);
  
  const updateVisitSchedule = useCallback(async (id: string, data: Partial<VisitScheduleInput>): Promise<ServerActionResult<VisitSchedule>> => {
    const result = await visitScheduleManager.updateAsync(id, data);
    return result || { success: false, error: 'Update failed' };
  }, [visitScheduleManager]);
  
  const deleteVisitSchedule = useCallback(async (id: string): Promise<ServerActionResult<VisitSchedule>> => {
    const result = await visitScheduleManager.deleteAsync(id);
    return result || { success: false, error: 'Deletion failed' };
  }, [visitScheduleManager]);

  const contextValue: ScheduleContextType = {
    // Props
    schoolId,
    date,
    mode,
    visitId,
    
    // Data (direct composition)
    ...scheduleData,
    
    // UI state
    uiState,
    selectTeacherPeriod,
    clearSelection,
    toggleDropdown,
    
    // Operations (pure delegation)
    createVisitSchedule,
    updateVisitSchedule,
    deleteVisitSchedule
  };
  
  return (
    <ScheduleContext.Provider value={contextValue}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useScheduleContext(): ScheduleContextType {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('Schedule hooks must be used within ScheduleProvider');
  }
  return context;
} 