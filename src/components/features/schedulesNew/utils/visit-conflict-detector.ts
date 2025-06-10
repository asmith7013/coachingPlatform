// src/components/features/schedulesNew/utils/visit-conflict-detector.ts
import { ScheduleAssignment } from '@enums'

// ===== SIMPLE INTERFACES =====
export interface ConflictCheckData {
  teacherId: string
  periodNumber: number
  portion: ScheduleAssignment
}

export interface ConflictResult {
  hasConflict: boolean
  message?: string
  conflictingVisit?: {
    id: string
    teacherName: string
    portion: ScheduleAssignment
  }
}

export interface ScheduledVisitMinimal {
  id: string
  teacherId: string
  teacherName: string
  periodNumber: number
  portion: ScheduleAssignment
}

/**
 * Simple conflict detector following single responsibility principle
 * Focuses only on conflict detection logic, no UI or complex transformations
 */
export class VisitConflictDetector {
  constructor(private existingVisits: ScheduledVisitMinimal[]) {}

  /**
   * Check if a new visit would conflict with existing visits
   * Simple, clear logic without over-engineering
   */
  checkConflict(newVisit: ConflictCheckData): ConflictResult {
    const conflictingVisit = this.existingVisits.find(existing => 
      existing.teacherId === newVisit.teacherId && 
      existing.periodNumber === newVisit.periodNumber &&
      this.hasTimeConflict(existing.portion, newVisit.portion)
    )

    if (conflictingVisit) {
      return {
        hasConflict: true,
        message: `${conflictingVisit.teacherName} already has a ${conflictingVisit.portion.replace('_', ' ')} visit in Period ${newVisit.periodNumber}`,
        conflictingVisit: {
          id: conflictingVisit.id,
          teacherName: conflictingVisit.teacherName,
          portion: conflictingVisit.portion
        }
      }
    }

    return { hasConflict: false }
  }

  /**
   * Simple time conflict logic
   * No complex algorithms - just clear business rules
   */
  private hasTimeConflict(existing: ScheduleAssignment, newPortion: ScheduleAssignment): boolean {
    // Full period conflicts with everything
    if (existing === ScheduleAssignment.FULL_PERIOD || newPortion === ScheduleAssignment.FULL_PERIOD) {
      return true
    }
    
    // Same portion conflicts
    if (existing === newPortion) {
      return true
    }
    
    // Different halves don't conflict
    return false
  }

  /**
   * Get all conflicts for multiple visits (batch validation)
   */
  checkMultipleConflicts(newVisits: ConflictCheckData[]): ConflictResult[] {
    return newVisits.map(visit => this.checkConflict(visit))
  }

  /**
   * Check if a teacher is available for any time slot in a period
   */
  isTeacherAvailableInPeriod(teacherId: string, periodNumber: number): {
    available: boolean
    availablePortions: ScheduleAssignment[]
  } {
    const existingVisit = this.existingVisits.find(visit => 
      visit.teacherId === teacherId && visit.periodNumber === periodNumber
    )

    if (!existingVisit) {
      return {
        available: true,
        availablePortions: [ScheduleAssignment.FIRST_HALF, ScheduleAssignment.SECOND_HALF, ScheduleAssignment.FULL_PERIOD]
      }
    }

    if (existingVisit.portion === ScheduleAssignment.FULL_PERIOD) {
      return {
        available: false,
        availablePortions: []
      }
    }

    // If they have first_half, second_half is available and vice versa
    const availablePortions: ScheduleAssignment[] = []
    if (existingVisit.portion === ScheduleAssignment.FIRST_HALF) {
      availablePortions.push(ScheduleAssignment.SECOND_HALF)
    } else if (existingVisit.portion === ScheduleAssignment.SECOND_HALF) {
      availablePortions.push(ScheduleAssignment.FIRST_HALF)
    }

    return {
      available: availablePortions.length > 0,
      availablePortions
    }
  }
}

/**
 * Factory function following your established patterns
 * Simple, no over-engineering
 */
export function createConflictDetector(existingVisits: ScheduledVisitMinimal[]): VisitConflictDetector {
  return new VisitConflictDetector(existingVisits)
}

/**
 * Validation helper for required fields
 * Follows your existing validation patterns
 */
export function validateConflictCheckData(data: unknown): data is ConflictCheckData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as ConflictCheckData).teacherId === 'string' &&
    typeof (data as ConflictCheckData).periodNumber === 'number' &&
    typeof (data as ConflictCheckData).portion === 'string' &&
    Object.values(ScheduleAssignment).includes((data as ConflictCheckData).portion)
  )
}

/**
 * Utility function for quick conflict check without creating detector instance
 * For one-off checks
 */
export function hasVisitConflict(
  newVisit: ConflictCheckData,
  existingVisits: ScheduledVisitMinimal[]
): boolean {
  const detector = createConflictDetector(existingVisits)
  return detector.checkConflict(newVisit).hasConflict
}