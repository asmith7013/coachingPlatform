/**
 * Visit Time Calculator - Simplified Period-Portion Approach
 * 
 * This utility handles the core data model where visits are stored as:
 * { periodNumber: 2, portion: 'first_half' }
 * 
 * Time calculations are performed on-demand for display purposes only.
 */

import { CalendarEvent } from '@/components/composed/calendar/weekly'
import type { BellSchedule, ClassScheduleItem } from '@/lib/schema/zod-schema/schedule/schedule'

// Core data structure - simple and intuitive
export interface VisitSchedule {
  teacherId: string
  periodNumber: number
  portion: 'first_half' | 'second_half' | 'full_period'
  purpose?: string
  date: string
}

// Time range for display purposes only
export interface TimeRange {
  startTime: string
  endTime: string
}

// Conflict detection result
export interface ConflictResult {
  hasConflict: boolean
  type?: 'period_overlap' | 'teacher_conflict' | 'capacity_exceeded'
  message?: string
  suggestions?: string[]
}

/**
 * Visit Time Calculator
 * Handles all time-related calculations and conflict detection
 */
export class VisitTimeCalculator {
  /**
   * Calculate time range for a visit based on bell schedule
   * Only used for display purposes - not stored in database
   */
  static getTimeRange(visit: VisitSchedule, bellSchedule: BellSchedule): TimeRange {
    // Find the period in the bell schedule
    const period = bellSchedule.classSchedule.find((p: ClassScheduleItem) => p.periodNum === visit.periodNumber)
    
    if (!period) {
      throw new Error(`Period ${visit.periodNumber} not found in bell schedule`)
    }

    const periodStart = period.startTime
    const periodEnd = period.endTime

    switch (visit.portion) {
      case 'first_half': {
        const midpoint = this.getMidpoint(periodStart, periodEnd)
        return { startTime: periodStart, endTime: midpoint }
      }
      case 'second_half': {
        const midpoint = this.getMidpoint(periodStart, periodEnd)
        return { startTime: midpoint, endTime: periodEnd }
      }
      case 'full_period':
        return { startTime: periodStart, endTime: periodEnd }
      default:
        throw new Error(`Invalid portion type: ${visit.portion}`)
    }
  }

  /**
   * Get human-readable display label for a visit
   * Matches user mental model: "First half of Period 2"
   */
  static getDisplayLabel(visit: VisitSchedule): string {
    const portionLabels = {
      first_half: 'First half',
      second_half: 'Second half',
      full_period: 'Full period'
    }

    return `${portionLabels[visit.portion]} of Period ${visit.periodNumber}`
  }

  /**
   * Detect conflicts between two visits
   * Simple logic: same period + overlapping portions
   */
  static detectConflict(visit1: VisitSchedule, visit2: VisitSchedule): ConflictResult {
    // Must be same date to conflict
    if (visit1.date !== visit2.date) {
      return { hasConflict: false }
    }

    // Same teacher cannot be in two places at once
    if (visit1.teacherId === visit2.teacherId) {
      return this.detectTeacherConflict(visit1, visit2)
    }

    // Period overlap detection
    if (visit1.periodNumber === visit2.periodNumber) {
      return this.detectPeriodOverlap(visit1, visit2)
    }

    return { hasConflict: false }
  }

  /**
   * Calculate midpoint time between two time strings
   * Helper for splitting periods into halves
   */
  static getMidpoint(startTime: string, endTime: string): string {
    const start = new Date(`1970-01-01T${startTime}`)
    const end = new Date(`1970-01-01T${endTime}`)
    const midpoint = new Date((start.getTime() + end.getTime()) / 2)
    return midpoint.toISOString().substr(11, 5)
  }

  /**
   * Check if multiple visits can coexist in the same period
   * Rules: max 2 teachers, no portion conflicts
   */
  static canScheduleMultiple(visits: VisitSchedule[]): ConflictResult {
    if (visits.length <= 1) {
      return { hasConflict: false }
    }

    // Max 2 teachers per period
    if (visits.length > 2) {
      return {
        hasConflict: true,
        type: 'capacity_exceeded',
        message: 'Maximum 2 teachers can be scheduled in the same period',
        suggestions: ['Select a different period', 'Remove one teacher selection']
      }
    }

    // Check for portion conflicts between the 2 visits
    if (visits.length === 2) {
      const [visit1, visit2] = visits
      
      // Same teacher conflict
      if (visit1.teacherId === visit2.teacherId) {
        return {
          hasConflict: true,
          type: 'teacher_conflict',
          message: 'Cannot schedule the same teacher twice in one period',
          suggestions: ['Select a different teacher', 'Choose a different time slot']
        }
      }

      // Portion overlap conflict
      if (this.portionsOverlap(visit1.portion, visit2.portion)) {
        return {
          hasConflict: true,
          type: 'period_overlap',
          message: 'Time portions overlap',
          suggestions: [
            'Select non-overlapping portions (e.g., first half + second half)',
            'Choose a different period'
          ]
        }
      }
    }

    return { hasConflict: false }
  }

  /**
   * Get available portions for a period given existing visits
   */
  static getAvailablePortions(
    periodNumber: number,
    existingVisits: VisitSchedule[]
  ): Array<'first_half' | 'second_half' | 'full_period'> {
    const periodVisits = existingVisits.filter(v => v.periodNumber === periodNumber)
    
    if (periodVisits.length === 0) {
      return ['first_half', 'second_half', 'full_period']
    }

    if (periodVisits.length >= 2) {
      return [] // Period is full
    }

    const existingPortion = periodVisits[0].portion
    
    if (existingPortion === 'full_period') {
      return [] // Cannot add anything to a full period visit
    }

    if (existingPortion === 'first_half') {
      return ['second_half'] // Only second half available
    }

    if (existingPortion === 'second_half') {
      return ['first_half'] // Only first half available
    }

    return ['first_half', 'second_half', 'full_period']
  }

  // Private helper methods

  private static detectTeacherConflict(visit1: VisitSchedule, visit2: VisitSchedule): ConflictResult {
    // Same teacher, check if time periods overlap
    if (visit1.periodNumber === visit2.periodNumber) {
      if (this.portionsOverlap(visit1.portion, visit2.portion)) {
        return {
          hasConflict: true,
          type: 'teacher_conflict',
          message: `Teacher cannot be scheduled for overlapping time slots in Period ${visit1.periodNumber}`,
          suggestions: ['Select non-overlapping portions', 'Choose a different period']
        }
      }
    }

    return { hasConflict: false }
  }

  private static detectPeriodOverlap(visit1: VisitSchedule, visit2: VisitSchedule): ConflictResult {
    if (this.portionsOverlap(visit1.portion, visit2.portion)) {
      return {
        hasConflict: true,
        type: 'period_overlap',
        message: `Time portions overlap in Period ${visit1.periodNumber}`,
        suggestions: [
          'Select non-overlapping portions (e.g., first half + second half)',
          'Choose a different period'
        ]
      }
    }

    return { hasConflict: false }
  }

  private static portionsOverlap(
    portion1: 'first_half' | 'second_half' | 'full_period',
    portion2: 'first_half' | 'second_half' | 'full_period'
  ): boolean {
    // Full period overlaps with everything
    if (portion1 === 'full_period' || portion2 === 'full_period') {
      return true
    }

    // First half and second half don't overlap
    if (
      (portion1 === 'first_half' && portion2 === 'second_half') ||
      (portion1 === 'second_half' && portion2 === 'first_half')
    ) {
      return false
    }

    // Same portions overlap
    return portion1 === portion2
  }
} 

/**
 * Calculate duration in 5-minute increments from start and end times
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return Math.round((endMinutes - startMinutes) / 5); // Convert to 5-minute increments
}

// /**
//  * Get period timing information from bell schedule
//  */
// export function getPeriodTiming(
//   periodNum: number, 
//   bellSchedule: BellSchedule,
//   dayType: string = 'uniform'
// ): { start: string; end: string } | null {
//   const bellPeriod = bellSchedule.classSchedule.find(
//     item => item.periodNum === periodNum && 
//             (item.dayType === dayType || item.dayType === 'uniform')
//   );
  
//   return bellPeriod ? {
//     start: bellPeriod.startTime,
//     end: bellPeriod.endTime
//   } : null;
// }

/**
 * Get all period times for a day from bell schedule
 */
export function getAllPeriodTimes(
  bellSchedule: BellSchedule,
  dayType: string = 'uniform'
): Array<{ period: number; start: string; end: string }> {
  return bellSchedule.classSchedule
    .filter(item => item.dayType === dayType || item.dayType === 'uniform')
    .map(item => ({
      period: item.periodNum,
      start: item.startTime,
      end: item.endTime
    }))
    .sort((a, b) => a.period - b.period);
}

/**
 * Subject color mapping (moved from schedule-calendar-utils.ts)
 */
export function getSubjectColor(className: string): CalendarEvent['color'] {
  const SUBJECT_COLORS = {
    'math': 'blue',
    'english': 'blue', 
    'ela': 'blue',
    'science': 'blue',
    'history': 'blue',
    'social': 'blue',
    'prep': 'gray',
    'lunch': 'pink', 
    'meeting': 'pink',
    'sped': 'purple'
  } as const;
  
  const lowerClassName = className.toLowerCase();
  for (const [subject, color] of Object.entries(SUBJECT_COLORS)) {
    if (lowerClassName.includes(subject)) return color;
  }
  
  return 'blue'; // Default to blue
} 


