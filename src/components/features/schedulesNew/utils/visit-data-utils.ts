import type { Visit } from '@zod-schema/visits/visit'
import type { ScheduleAssignment } from '@domain-types/schedule'
import { Duration, ScheduleAssignment as ScheduleAssignmentEnum } from '@enums'

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
 * Extract portion information from visit event data
 */
export function extractPortionFromVisit(visit: Visit): ScheduleAssignment {
  // ✅ FIX: Check the actual portion field first
  const portion = visit.events?.[0]?.portion;
  if (portion) {
    return portion as ScheduleAssignment;
  }
  
  // ✅ FALLBACK: Infer from duration if portion not set (backward compatibility)
  const duration = visit.events?.[0]?.duration;
  if (duration === Duration.MIN_30) {
    return ScheduleAssignmentEnum.FIRST_HALF;
  }
  
  // Default to full period for 45 minutes or unspecified
  return ScheduleAssignmentEnum.FULL_PERIOD;
}

/**
 * Extract teacher ID from visit events
 */
export function extractTeacherIdFromVisit(visit: Visit): string {
  return visit.events?.[0]?.staffIds?.[0] || 'unknown'
}

/**
 * ✅ NEW: Extract ALL periods from visit (multiple events may have different periods)
 */
export function extractPeriodsFromVisit(visit: Visit): number[] {
  return visit.events?.map(event => event.periodNumber).filter(p => p !== undefined) as number[] || [];
}

/**
 * ✅ NEW: Extract ALL teacher IDs from visit events
 */
export function extractTeacherIdsFromVisit(visit: Visit): string[] {
  const teacherIds = visit.events?.flatMap(event => event.staffIds || []) || [];
  return [...new Set(teacherIds)]; // Remove duplicates
}

/**
 * ✅ NEW: Extract events for specific period
 */
export function extractEventsForPeriod(visit: Visit, period: number) {
  return visit.events?.filter(event => event.periodNumber === period) || [];
}

/**
 * ✅ NEW: Extract events for specific teacher
 */
export function extractEventsForTeacher(visit: Visit, teacherId: string) {
  return visit.events?.filter(event => event.staffIds?.includes(teacherId)) || [];
}

/**
 * Transform visit to scheduled visit format (LEGACY - for backward compatibility)
 * Used by domain hook selectors
 */
export function transformVisitToScheduledVisit(visit: Visit): {
  id: string
  teacherId: string
  teacherName: string
  periodNumber: number
  portion: ScheduleAssignment
  purpose: string
  createdAt: string
} {
  return {
    id: visit._id,
    teacherId: extractTeacherIdFromVisit(visit),
    teacherName: 'Unknown', // Will be resolved by caller
    periodNumber: extractPeriodFromVisit(visit),
    portion: extractPortionFromVisit(visit),
    purpose: visit.allowedPurpose || 'Observation',
    createdAt: visit.createdAt || new Date().toISOString()
  }
} 

