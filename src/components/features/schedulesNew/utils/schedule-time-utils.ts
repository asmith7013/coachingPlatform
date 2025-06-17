/**
 * @fileoverview DEPRECATED - Schedule time utilities
 * 
 * These utilities are deprecated and will be removed in a future version.
 * Please migrate to the new schedule system at src/components/features/schedulesUpdated/
 * 
 * Migration path:
 * - Use the new time utilities in the schedulesUpdated feature
 * - Follow the new schema-first architecture patterns
 * - Use proper schema validation and type safety
 * 
 * @deprecated Use the new schedule system at src/components/features/schedulesUpdated/
 */

/**
 * Schedule Time Utilities
 * Centralized time calculations for schedule components
 * Eliminates duplication across hooks and components
 */

import { ScheduleAssignment } from '@enums';

/**
 * Calculate time slot for a period number with fallback
 * Replaces duplicated logic in useScheduleBuilder and useVisitScheduling
 */
/**
 * @deprecated Use the new schedule system at src/components/features/schedulesUpdated/
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

/**
 * Calculate time slot for a specific portion of a period
 * Handles ScheduleAssignment enum values correctly
 */
export function calculatePeriodPortionTimeSlot(
  periodNumber: number | string, 
  portion: ScheduleAssignment
): { startTime: string; endTime: string } {
  const fullPeriod = calculatePeriodTimeSlot(periodNumber);
  
  if (portion === ScheduleAssignment.FULL_PERIOD) {
    return fullPeriod;
  }
  
  const midpoint = calculateMidpointTime(fullPeriod.startTime, fullPeriod.endTime);
  
  if (portion === ScheduleAssignment.FIRST_HALF) {
    return {
      startTime: fullPeriod.startTime,
      endTime: midpoint
    };
  } else { // ScheduleAssignment.SECOND_HALF
    return {
      startTime: midpoint,
      endTime: fullPeriod.endTime
    };
  }
}



