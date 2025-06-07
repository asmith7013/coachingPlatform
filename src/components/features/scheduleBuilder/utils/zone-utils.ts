import type { HoverZone, ScheduleAssignmentType } from '@domain-types/schedule'

/**
 * Zone utility functions for schedule components
 * Centralizes hover zone and assignment zone operations
 */

/**
 * Convert HoverZone to ScheduleAssignmentType
 * Standardizes zone type mapping across components
 */
export function getAssignmentType(zone: HoverZone): ScheduleAssignmentType {
  switch (zone) {
    case 'first_half': 
      return 'first_half'
    case 'second_half': 
      return 'second_half'
    case 'full_period':
    default: 
      return 'full_period'
  }
}

/**
 * Get display label for a zone
 * Consistent zone labeling across components
 */
export function getZoneDisplayLabel(zone: HoverZone): string {
  switch (zone) {
    case 'first_half':
      return 'First Half'
    case 'second_half':
      return 'Second Half'
    case 'full_period':
      return 'Full Period'
    default:
      return 'Unknown Zone'
  }
}

/**
 * Get CSS positioning for hover zones
 * Standardizes zone positioning across components
 */
export function getZonePositioning(zone: HoverZone): React.CSSProperties {
  switch (zone) {
    case 'first_half':
      return { 
        top: '0', 
        left: '0', 
        right: '0', 
        height: '50%' 
      }
    case 'second_half':
      return { 
        bottom: '0', 
        left: '0', 
        right: '0', 
        height: '50%' 
      }
    case 'full_period':
    default:
      return { 
        top: '0', 
        left: '0', 
        right: '0', 
        bottom: '0' 
      }
  }
}

/**
 * Validate if a zone is valid
 * Ensures zone values are within expected range
 */
export function isValidZone(zone: unknown): zone is HoverZone {
  return zone === 'first_half' || zone === 'second_half' || zone === 'full_period' || zone === null
}

/**
 * Get all possible zones
 * Useful for iteration or validation
 */
export function getAllZones(): HoverZone[] {
  return ['full_period', 'first_half', 'second_half']
}

/**
 * Check if zone requires specific teacher assignment
 * Some zones might have different assignment rules
 */
export function requiresTeacherAssignment(zone: HoverZone): boolean {
  // All current zones require teacher assignment, but this allows for future flexibility
  return zone !== null
} 