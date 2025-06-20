import React, { createContext, useContext, ReactNode } from 'react';
import { useScheduleUI } from '../hooks/useScheduleUI';
import type { ScheduleContextType } from '../types';

const ScheduleContext = createContext<ScheduleContextType | null>(null);

interface ScheduleProviderProps {
  children: ReactNode;
}

export function ScheduleProvider({ children }: ScheduleProviderProps) {
  const { uiState, selectTeacherPeriod, clearSelection } = useScheduleUI();

  const contextValue: ScheduleContextType = {
    selectedTeacher: uiState.selectedTeacher,
    selectedPeriod: uiState.selectedPeriod,
    selectTeacher: (teacherId: string) => selectTeacherPeriod(teacherId, uiState.selectedPeriod || 1),
    selectPeriod: (period: number) => selectTeacherPeriod(uiState.selectedTeacher || '', period),
    clearSelection
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