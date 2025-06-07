import { useMemo } from 'react'
import type { TeacherSchedule, BellSchedule } from '@zod-schema/schedule/schedule'
import { 
  validateSchedules,
  transformSchedulesToBellScheduleEvents,
} from '@/components/features/scheduleBuilder/transformers/schedule-transforms'
import type { BellScheduleEvent } from '@/components/features/scheduleBuilder/types'
import { 
  extractPeriodTimes, 
  getDayTypeFromDate 
} from '@/components/features/scheduleBuilder/utils/schedule-calendar-utils'

export interface ScheduleDisplayResult {
  validatedSchedules: TeacherSchedule[];
  staffMap: Map<string, string>;
  periodTimes: Array<{ period: number; start: string; end: string }>;
  events: BellScheduleEvent[];
  hasBellSchedule: boolean;
  error?: string;
}

export function useScheduleDisplay(
  schedules: TeacherSchedule[],
  staff: Array<{ _id: string; staffName: string }>,
  date: string,
  bellSchedule?: BellSchedule
): ScheduleDisplayResult {
  return useMemo(() => {
    // Check for bell schedule first
    if (!bellSchedule) {
      return { 
        validatedSchedules: [], 
        staffMap: new Map(), 
        periodTimes: [], 
        events: [],
        hasBellSchedule: false,
        error: 'Bell schedule is required but not found for this school'
      }
    }

    if (!schedules.length || !staff.length) {
      return { 
        validatedSchedules: [], 
        staffMap: new Map(), 
        periodTimes: [], 
        events: [],
        hasBellSchedule: true
      }
    }

    const validatedSchedules = validateSchedules(schedules)
    
    // Create simple staff map from the provided staff data
    const staffMap = new Map(staff.map(s => [s._id, s.staffName]))
    
    const dayType = getDayTypeFromDate(date)
    const periodTimes = extractPeriodTimes(bellSchedule, dayType)
    
    // If no period times extracted, it's an error
    if (!periodTimes.length) {
      return {
        validatedSchedules: [],
        staffMap: new Map(),
        periodTimes: [],
        events: [],
        hasBellSchedule: true,
        error: `No period times found for day type "${dayType}" in bell schedule`
      }
    }
    
    const events = transformSchedulesToBellScheduleEvents(
      validatedSchedules, 
      staffMap, 
      date, 
      periodTimes
    )

    return { 
      validatedSchedules, 
      staffMap, 
      periodTimes, 
      events, 
      hasBellSchedule: true 
    }
  }, [schedules, staff, date, bellSchedule])
} 