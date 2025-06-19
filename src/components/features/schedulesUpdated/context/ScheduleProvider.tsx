import React, { createContext, useContext, ReactNode } from 'react';
import { useScheduleDisplayData, useScheduleUI } from '../hooks';
import { ScheduleErrorBoundary } from './ScheduleErrorBoundary';
import { logError } from '@error/core/logging';
import { createScheduleErrorContext } from '../utils/schedule-error-utils';
import type { ScheduleContextType, ScheduleBuilderProps } from '../types';

const ScheduleContext = createContext<ScheduleContextType | null>(null);

interface ScheduleProviderProps extends ScheduleBuilderProps {
  children: ReactNode;
}

export function ScheduleProvider({ 
  schoolId, 
  date, 
  mode: _mode = 'create',
  visitId: _visitId,
  children 
}: ScheduleProviderProps) {
  const scheduleDisplayData = useScheduleDisplayData(schoolId, date);
  const { uiState, selectTeacherPeriod, clearSelection } = useScheduleUI();

  const contextValue: ScheduleContextType = {
    displayData: scheduleDisplayData.data,
    isLoading: scheduleDisplayData.isLoading,
    error: scheduleDisplayData.error,
    
    selectedTeacher: uiState.selectedTeacher,
    selectedPeriod: uiState.selectedPeriod,
    
    selectTeacher: (teacherId: string) => selectTeacherPeriod(teacherId, uiState.selectedPeriod || 1),
    selectPeriod: (period: number) => selectTeacherPeriod(uiState.selectedTeacher || '', period),
    clearSelection,
    
    // Enhanced operations with error handling
    createVisitSchedule: async (data: unknown) => {
      try {
        // Placeholder implementation
        logError(
          new Error('createVisitSchedule not implemented'),
          createScheduleErrorContext('createVisitSchedule', { data, schoolId, date })
        );
        return { success: false, error: 'Not implemented' };
      } catch (error) {
        logError(error, createScheduleErrorContext('createVisitSchedule', { schoolId, date }));
        return { success: false, error: 'Operation failed' };
      }
    },
    updateVisitSchedule: async (id: string, data: unknown) => {
      try {
        logError(
          new Error('updateVisitSchedule not implemented'),
          createScheduleErrorContext('updateVisitSchedule', { id, data, schoolId, date })
        );
        return { success: false, error: 'Not implemented' };
      } catch (error) {
        logError(error, createScheduleErrorContext('updateVisitSchedule', { id, schoolId, date }));
        return { success: false, error: 'Operation failed' };
      }
    },
    deleteVisitSchedule: async (id: string) => {
      try {
        logError(
          new Error('deleteVisitSchedule not implemented'),
          createScheduleErrorContext('deleteVisitSchedule', { id, schoolId, date })
        );
        return { success: false, error: 'Not implemented' };
      } catch (error) {
        logError(error, createScheduleErrorContext('deleteVisitSchedule', { id, schoolId, date }));
        return { success: false, error: 'Operation failed' };
      }
    }
  };
  
  return (
    <ScheduleErrorBoundary schoolId={schoolId} date={date}>
      <ScheduleContext.Provider value={contextValue}>
        {children}
      </ScheduleContext.Provider>
    </ScheduleErrorBoundary>
  );
}

export function useScheduleContext(): ScheduleContextType {
  const context = useContext(ScheduleContext);
  if (!context) {
    const error = new Error('Schedule hooks must be used within ScheduleProvider');
    logError(error, createScheduleErrorContext('useScheduleContext', {
      severity: 'error',
      category: 'system'
    }));
    throw error;
  }
  return context;
} 