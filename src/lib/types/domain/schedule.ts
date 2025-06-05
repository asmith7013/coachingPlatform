/**
 * Schedule domain types
 * Re-exports types from Zod schemas for centralized imports
 */

import { Period } from '@zod-schema/schedule/schedule';

// Re-export types directly from the schema
export type {
    ClassScheduleItem,
    AssignedCycleDay,
    BellScheduleInput,
    BellSchedule,
    Period,
    ScheduleByDay,
    TeacherScheduleInput,
    TeacherSchedule
} from '@zod-schema/schedule/schedule';

// Additional schedule-related types
export interface ScheduleFilters {
    school?: string;
    teacher?: string;
    bellScheduleType?: string;
    date?: string;
}

export type TimeSlot = {
  startTime: string;
  endTime: string;
  duration: number; // in minutes
};

export type ScheduleDisplay = {
  periods: Record<string, Period[]>;
  timeSlots: TimeSlot[];
  teacher?: string;
  school?: string;
  date?: string;
};

