// src/components/features/schedulesUpdated/types.ts

import { PeriodType } from "@enums";
import { ReactNode } from 'react';

export interface ScheduleDisplayData {
  schoolId: string;
  date: string;
  teachers: TeacherWithSchedule[];
  bellSchedule: BellScheduleDisplay | null;
  timeSlots: TimeSlotDisplay[];
}

export interface TeacherWithSchedule {
  _id: string;
  staffName: string;
  schedule: TeacherScheduleDisplay | null;
}

export interface BellScheduleDisplay {
  _id: string;
  name: string;
  timeBlocks: TimeSlotDisplay[];
}

export interface TimeSlotDisplay {
  periodNumber: number;
  periodName?: string;
  startTime: string;
  endTime: string;
}

export interface TeacherScheduleDisplay {
  _id: string;
  teacherId: string;
  timeBlocks: TeacherPeriodDisplay[];
}

export interface TeacherPeriodDisplay {
  periodNumber: number;
  className: string;
  room: string;
  activityType: PeriodType;
  subject?: string;
  gradeLevel?: string;
}

// Add error-related types
export interface ScheduleError extends Error {
  context?: {
    schoolId?: string;
    date?: string;
    operation?: string;
    component?: string;
  };
}

// Update ScheduleContextType to include enhanced error information
export interface ScheduleContextType {
  // Display data
  displayData: ScheduleDisplayData | null;
  isLoading: boolean;
  error: Error | null;
  
  // UI state
  selectedTeacher: string | null;
  selectedPeriod: number | null;
  
  // Actions
  selectTeacher: (teacherId: string) => void;
  selectPeriod: (period: number) => void;
  clearSelection: () => void;
  
  // Operations
  createVisitSchedule: (data: unknown) => Promise<{ success: boolean; error?: string }>;
  updateVisitSchedule: (id: string, data: unknown) => Promise<{ success: boolean; error?: string }>;
  deleteVisitSchedule: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // Enhanced error information
  hasError?: boolean;
  errorContext?: {
    schoolId: string;
    date: string;
    lastOperation?: string;
  };
}

// Provider props
export interface ScheduleProviderProps {
  schoolId: string;
  date: string;
  mode?: 'create' | 'edit';
  visitId?: string;
  children: ReactNode;
}

// Legacy compatibility type
export interface ScheduleBuilderProps {
  schoolId: string;
  date: string;
  mode?: 'create' | 'edit';
  visitId?: string;
}
