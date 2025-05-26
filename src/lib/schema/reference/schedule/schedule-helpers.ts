import { TeacherSchedule, BellSchedule, Period } from "../../zod-schema/schedule/schedule";

/**
 * Formats a time string to be more readable
 */
export function formatTimeString(timeString: string): string {
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    
    if (isNaN(hour) || isNaN(minute)) return timeString;
    
    const amPm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes.padStart(2, '0')} ${amPm}`;
  } catch (e) {
    console.error('Error formatting time string:', e);
    return timeString;
  }
}

/**
 * Gets a formatted time range display
 */
export function getTimeRangeDisplay(startTime: string, endTime: string): string {
  return `${formatTimeString(startTime)} - ${formatTimeString(endTime)}`;
}

/**
 * Gets the number of teaching periods in a schedule
 */
export function getTeachingPeriodCount(schedule: TeacherSchedule): number {
  let count = 0;
  
  schedule.scheduleByDay?.forEach(day => {
    day.periods?.forEach(period => {
      if (period.periodType === 'class') count++;
    });
  });
  
  return count;
}

/**
 * Gets a display string for a period
 */
export function getPeriodDisplayString(period: Period): string {
  return `Period ${period.periodNum}: ${period.className}${period.room ? ` (Room ${period.room})` : ''}`;
}

/**
 * Gets a schedule type display string
 */
export function getBellScheduleTypeDisplay(schedule: BellSchedule): string {
  switch (schedule.bellScheduleType) {
    case 'uniform': return 'Uniform Schedule';
    case 'weeklyCycle': return 'Weekly Rotation';
    case 'abcCycle': return 'A/B/C Rotation';
    default: return schedule.bellScheduleType;
  }
}