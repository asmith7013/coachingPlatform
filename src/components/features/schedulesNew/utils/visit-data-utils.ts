import { ScheduleAssignmentType } from '@/lib/schema/enum/shared-enums'
import type { Visit } from '@zod-schema/visits/visit'

/**
 * Utility functions for extracting data from visit objects
 * These are pure functions moved from the previous manual transformation logic
 */

/**
 * Extract period number from visit data
 * TODO: Enhance when visit schema includes period information
 */
export function extractPeriodFromVisit(_visit: Visit): number {
  // For now, default to period 1
  // This should be enhanced when the visit schema includes period metadata
  return 1
}

/**
 * Extract portion information from visit duration
 */
export function extractPortionFromVisit(visit: Visit): ScheduleAssignmentType {
  const duration = visit.events?.[0]?.duration
  
  if (duration === '22') {
    return 'first_half' // 22 minutes = half period
  }
  
  // Default to full period for 45 minutes or unspecified
  return 'full_period'
}

/**
 * Extract teacher ID from visit events
 */
export function extractTeacherIdFromVisit(visit: Visit): string {
  return visit.events?.[0]?.staff?.[0] || 'unknown'
}

/**
 * Transform visit to scheduled visit format
 * Used by domain hook selectors
 */
export function transformVisitToScheduledVisit(visit: Visit): {
  id: string
  teacherId: string
  teacherName: string
  periodNumber: number
  portion: ScheduleAssignmentType
  purpose: string
  createdAt: Date
} {
  return {
    id: visit._id,
    teacherId: extractTeacherIdFromVisit(visit),
    teacherName: 'Unknown', // Will be resolved by caller
    periodNumber: extractPeriodFromVisit(visit),
    portion: extractPortionFromVisit(visit),
    purpose: visit.allowedPurpose || 'observation',
    createdAt: visit.createdAt || new Date()
  }
} 