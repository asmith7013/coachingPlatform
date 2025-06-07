import type { BellSchedule } from '@zod-schema/schedule/schedule';
import { getDayTypeFromDate as getDayTypeFromDateUtil } from '@transformers/utils/date-utils';
import { getAllPeriodTimes } from './visit-time-calculator';
import type { PeriodTime } from '@domain-types/schedule';

/**
 * Extract period times from bell schedule for a specific day
 * Uses direct period numbers - NO time-based matching
 */
export function extractPeriodTimes(
  bellSchedule: BellSchedule | undefined, 
  dayType: string = 'uniform'
): PeriodTime[] {
  if (!bellSchedule?.classSchedule?.length) {
    return [];
  }
  
  // Use the new transformer function
  return getAllPeriodTimes(bellSchedule, dayType);
}

/**
 * Get day type from date string (utility)
 */
export function getDayTypeFromDate(dateString: string): string {
  return getDayTypeFromDateUtil(dateString);
}

/**
 * @deprecated Use direct period numbers instead of time-based matching
 * This function is kept for backward compatibility but should not be used
 */
export function getPeriodFromStartTime(_startTime: string, _periodTimes: PeriodTime[]): number {
  console.warn('getPeriodFromStartTime is deprecated. Use direct period numbers instead.');
  return 0; // Always return invalid period to force migration
}
