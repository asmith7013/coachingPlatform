/**
 * Schedule Time Utilities
 * Centralized time calculations for schedule components
 * Eliminates duplication across hooks and components
 */

/**
 * Calculate time slot for a period number with fallback
 * Replaces duplicated logic in useScheduleBuilder and useVisitScheduling
 */
export function calculatePeriodTimeSlot(periodNumber: number | string): { startTime: string; endTime: string } {
  const periodNum = typeof periodNumber === 'number' ? periodNumber : parseInt(String(periodNumber));
  const baseStartHour = 8; // 8:00 AM
  const periodLengthMinutes = 45;
  
  const startMinutes = (periodNum - 1) * periodLengthMinutes;
  const startHour = baseStartHour + Math.floor(startMinutes / 60);
  const startMinute = startMinutes % 60;
  const endMinutes = startMinutes + periodLengthMinutes;
  const endHour = baseStartHour + Math.floor(endMinutes / 60);
  const endMinute = endMinutes % 60;
  
  return {
    startTime: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
    endTime: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
  };
}

/**
 * Calculate midpoint time between two time strings
 * Replaces duplicated logic in ThreeZoneTimeSlot and visit-time-calculator
 */
export function calculateMidpointTime(startTime: string, endTime: string): string {
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);
  const midpoint = new Date((start.getTime() + end.getTime()) / 2);
  return midpoint.toISOString().substr(11, 5);
}



