import type { HoverZone, HoverState, ScheduleAssignmentType } from '@domain-types/schedule'

/**
 * Hover zone utility functions for schedule components
 * Centralizes hover zone logic and interactions
 */

/**
 * Get CSS positioning for hover zones in schedule cells
 * Standardizes zone positioning across components
 */
export function getHoverZonePositioning(zone: HoverZone): React.CSSProperties {
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
 * Get display label for hover zones
 * Consistent zone labeling for UI
 */
export function getHoverZoneLabel(zone: HoverZone): string {
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
 * Create hover state object
 * Standardizes hover state creation
 */
export function createHoverState(
  columnIndex: number,
  periodIndex: number,
  zone: HoverZone
): HoverState {
  return {
    columnIndex,
    periodIndex,
    zone
  }
}

/**
 * Check if two hover states are equal
 * Useful for comparing active hover zones
 */
export function hoverStatesEqual(
  stateA: HoverState | null,
  stateB: HoverState | null
): boolean {
  if (!stateA && !stateB) return true
  if (!stateA || !stateB) return false
  
  return (
    stateA.columnIndex === stateB.columnIndex &&
    stateA.periodIndex === stateB.periodIndex &&
    stateA.zone === stateB.zone
  )
}

/**
 * Check if hover state matches position and zone
 * Convenience function for component logic
 */
export function isHoverStateActive(
  hoverState: HoverState | null,
  columnIndex: number,
  periodIndex: number,
  zone: HoverZone
): boolean {
  return hoverState?.columnIndex === columnIndex && 
         hoverState?.periodIndex === periodIndex && 
         hoverState?.zone === zone
}

/**
 * Get all possible hover zones
 * Useful for iteration or validation
 */
export function getAllHoverZones(): HoverZone[] {
  return ['full_period', 'first_half', 'second_half']
}

/**
 * Validate if a zone is valid hover zone
 * Type guard for runtime validation
 */
export function isValidHoverZone(zone: unknown): zone is HoverZone {
  return zone === 'first_half' || zone === 'second_half' || zone === 'full_period' || zone === null
}

/**
 * Convert hover zone to assignment type
 * Links hover interactions to assignment logic
 */
export function hoverZoneToAssignmentType(zone: HoverZone): ScheduleAssignmentType {
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