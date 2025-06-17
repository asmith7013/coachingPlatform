/**
 * @fileoverview DEPRECATED - Visit data utilities
 * 
 * These utilities are deprecated and will be removed in a future version.
 * Please migrate to the new schedule system at src/components/features/schedulesUpdated/
 * 
 * Migration path:
 * - Use the new visit utilities in the schedulesUpdated feature
 * - Follow the new schema-first architecture patterns
 * - Use proper schema validation and type safety
 * 
 * @deprecated Use the new schedule system at src/components/features/schedulesUpdated/
 */

import type { Event } from '@/lib/schema/zod-schema/schedules/schedule';
import type { Visit } from '@zod-schema/visits/visit'

/**
 * Utility functions for extracting data from visit objects
 * These are pure functions moved from the previous manual transformation logic
 */

/**
 * Extract period number from visit data
 */
export function extractPeriodFromVisit(visit: Visit): number {
  // Get period from event data if available
  const periodFromEvent = visit.events?.[0]?.periodNumber;
  if (periodFromEvent && typeof periodFromEvent === 'number') {
    return periodFromEvent;
  }
  
  // Fallback to period 1 if not found
  console.warn('⚠️ Period not found in visit data, defaulting to 1. Visit ID:', visit._id);
  return 1;
}


/**
 * Extract teacher ID from visit events
 */
export function extractTeacherIdFromVisit(visit: Visit): string {
  return visit.sessionLinks?.[0]?.staffIds?.[0] || 'unknown'
}

/**
 * ✅ NEW: Extract ALL periods from visit (multiple events may have different periods)
 */
export function extractPeriodsFromVisit(visit: Visit): number[] {
  return visit.events?.map((event: Event) => event.periodNumber).filter(p => p !== undefined) as number[] || [];
}

/**
 * ✅ NEW: Extract ALL teacher IDs from visit events
 */
export function extractTeacherIdsFromVisit(visit: Visit): string[] {
  const teacherIds = visit.events?.flatMap((event: Event) => event.staffIds || []) || [];
  return [...new Set(teacherIds)]; // Remove duplicates
}

/**
 * ✅ NEW: Extract events for specific period
 */
/**
 * @deprecated Use the new schedule system at src/components/features/schedulesUpdated/
 */
export function extractEventsForPeriod(visit: Visit, period: number) {
  return visit.events?.filter((event: Event) => event.periodNumber === period) || [];
}

/**
 * ✅ NEW: Extract events for specific teacher
 */
export function extractEventsForTeacher(visit: Visit, teacherId: string) {
  return visit.events?.filter(event => event.staffIds?.includes(teacherId)) || [];
}
