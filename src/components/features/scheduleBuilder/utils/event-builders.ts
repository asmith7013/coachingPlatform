import type { TeacherSchedule, Period, BellSchedule } from '@zod-schema/schedule/schedule';
import type { CalendarEvent } from '@composed-components/calendar/weekly';
import { getDayNameFromDate, getDayTypeFromDate } from '@transformers/utils/date-utils';
import { calculateDuration } from './visit-time-calculator';
import { ScheduleColumn } from '@lib/types/domain/schedule';
import { getSubjectColor } from './visit-time-calculator';

export interface EventBuilderContext {
  teacherIndex: number;
  staffMap: Map<string, string>;
  date: string;
  bellSchedule: BellSchedule;
}

/**
 * Build a single calendar event from schedule and period data
 * Uses bell schedule for accurate timing with direct period matching
 */
export function buildCalendarEvent(
  schedule: TeacherSchedule,
  period: Period,
  context: EventBuilderContext
): CalendarEvent | null {
  const dayType = getDayTypeFromDate(context.date);
  
  // Find matching bell schedule period using direct period number matching
  const bellPeriod = context.bellSchedule.classSchedule.find(
    item => item.periodNum === period.periodNum && 
            (item.dayType === dayType || item.dayType === 'uniform')
  );
  
  // If no bell schedule timing found, skip this event
  if (!bellPeriod) {
    return null;
  }
  
  // Calculate duration in 5-minute increments
  const duration = calculateDuration(bellPeriod.startTime, bellPeriod.endTime);
  
  return {
    id: `${schedule.teacher}-${period.periodNum}`,
    title: period.className,
    day: context.teacherIndex,
    startTime: bellPeriod.startTime, // Use actual bell schedule timing
    duration, // Calculated from bell schedule
    color: getSubjectColor(period.className) // Use subject-based color mapping
  };
}

/**
 * Build calendar events for a single teacher's schedule
 * Filters by date and maps periods to events
 */
export function buildTeacherCalendarEvents(
  schedule: TeacherSchedule,
  context: EventBuilderContext
): CalendarEvent[] {
  const dayName = getDayNameFromDate(context.date);
  
  const daySchedule = schedule.scheduleByDay.find(day => 
    day.day.toLowerCase() === dayName.toLowerCase()
  );
  
  if (!daySchedule?.periods) return [];
  
  const events = daySchedule.periods
    .map(period => buildCalendarEvent(schedule, period, context))
    .filter((event): event is CalendarEvent => event !== null);
    
  return events;
}

/**
 * Build all calendar events from multiple teacher schedules
 * Requires bell schedule for accurate timing
 */
export function buildAllCalendarEvents(
  schedules: TeacherSchedule[],
  bellSchedule: BellSchedule,
  staffMap: Map<string, string>,
  date: string
): CalendarEvent[] {
  return schedules.flatMap((schedule, teacherIndex) => 
    buildTeacherCalendarEvents(schedule, {
      teacherIndex,
      staffMap,
      date,
      bellSchedule
    })
  );
}

export function createTeacherColumns(
  schedules: TeacherSchedule[], 
  staffMap: Map<string, string>
): ScheduleColumn[] {
  return schedules.map((schedule) => ({
    id: schedule.teacher,
    title: staffMap.get(schedule.teacher) || `Teacher ${schedule.teacher.slice(-4)}`
  }))
}

export function createVisitColumns(
  schedules: TeacherSchedule[], 
  staffMap: Map<string, string>, 
  maxColumns = 6
): ScheduleColumn[] {
  return schedules.slice(0, maxColumns).map((schedule) => ({
    id: schedule.teacher,
    title: staffMap.get(schedule.teacher) || `Teacher ${schedule.teacher.slice(-4)}`,
    subtitle: 'Visit Schedule'
  }))
} 