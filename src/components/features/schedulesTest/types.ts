// src/components/features/schedulesUpdated/types.ts

import { ReactNode } from 'react';

// Only UI-specific state - no data structure types
export interface ScheduleUIState {
  selectedTeacher: string | null;
  selectedPeriod: number | null;
}

// Context type - UI state only
export interface ScheduleContextType {
  // UI state
  selectedTeacher: string | null;
  selectedPeriod: number | null;
  
  // UI actions
  selectTeacher: (teacherId: string) => void;
  selectPeriod: (period: number) => void;
  clearSelection: () => void;
}

// Provider props
export interface ScheduleProviderProps {
  children: ReactNode;
}

// Legacy compatibility type for test pages
export interface ScheduleBuilderProps {
  schoolId: string;
  date: string;
  mode?: 'create' | 'edit';
  visitId?: string;
}
