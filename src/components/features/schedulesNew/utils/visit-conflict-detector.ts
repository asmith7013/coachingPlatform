/**
 * @fileoverview DEPRECATED - Visit conflict detection utilities
 * 
 * These utilities are deprecated and will be removed in a future version.
 * Please migrate to the new schedule system at src/components/features/schedulesUpdated/
 * 
 * Migration path:
 * - Use the new conflict detection utilities in the schedulesUpdated feature
 * - Follow the new schema-first architecture patterns
 * - Use proper schema validation and type safety
 * 
 * @deprecated Use the new schedule system at src/components/features/schedulesUpdated/
 */

// src/components/features/schedulesNew/utils/visit-conflict-detector.ts

// ===== SIMPLE INTERFACES =====
export interface ConflictCheckData {
  teacherId: string
  periodNumber: number
  portion: string
}

export interface ConflictResult {
  hasConflict: boolean
  message?: string
  conflictingVisit?: {
    id: string
    teacherName: string
    portion: string
  }
}

export interface ScheduledVisitMinimal {
  id: string
  teacherId: string
  teacherName: string
  periodNumber: number
  portion: string
}

/**
 * Simple conflict detector following single responsibility principle
 * Focuses only on conflict detection logic, no UI or complex transformations
 */
/**
 * @deprecated Use the new schedule system at src/components/features/schedulesUpdated/
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
  private hasTimeConflict(existing: string, newPortion: string): boolean {
    // Full period conflicts with everything
    if (existing === 'full_period' || newPortion === 'full_period') {
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
    availablePortions: string[]
  } {
    const existingVisit = this.existingVisits.find(visit => 
      visit.teacherId === teacherId && visit.periodNumber === periodNumber
    )

    if (!existingVisit) {
      return {
        available: true,
        availablePortions: ['first_half', 'second_half', 'full_period']
      }
    }

    if (existingVisit.portion === 'full_period') {
      return {
        available: false,
        availablePortions: []
      }
    }

    // If they have first_half, second_half is available and vice versa
    const availablePortions: string[] = []
    if (existingVisit.portion === 'first_half') {
      availablePortions.push('second_half')
    } else if (existingVisit.portion === 'second_half') {
      availablePortions.push('first_half')
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
