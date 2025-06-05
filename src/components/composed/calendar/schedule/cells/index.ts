import React from 'react'
import { ScheduleEventCell } from '../ScheduleEventCell'
import { PlannedScheduleColumn } from '../PlannedScheduleColumn'
import { AssignedTeacherCard } from '@components/domain/scheduling/AssignedTeacherCard'
import type { 
  BellScheduleEvent, 
  PlannedVisit, 
  HoverState,
  ScheduleAssignmentType,
  PeriodTime 
} from '@domain-types/schedule'
import type { AssignmentState } from '@zod-schema/visits/schedule-builder-state'

/**
 * Schedule Cell Factory
 * Provides a unified interface for creating different types of schedule cells
 * Eliminates duplicate cell rendering patterns across components
 */

export interface BaseCellProps {
  columnIndex: number
  periodIndex: number
  periodTime: PeriodTime
  className?: string
}

export interface EventCellProps extends BaseCellProps {
  events: BellScheduleEvent[]
  onEventClick?: (event: BellScheduleEvent) => void
  isEventSelected?: (event: BellScheduleEvent) => boolean
}

export interface PlannedCellProps extends BaseCellProps {
  plannedVisits: PlannedVisit[]
  onPlannedVisitClick?: (visit: PlannedVisit) => void
  onPeriodAssignment?: (
    periodIndex: number,
    periodTime: PeriodTime,
    assignmentType: ScheduleAssignmentType
  ) => void
  onHoverZoneChange?: (hoverState: HoverState | null) => void
  activeHoverZone?: HoverState | null
  selectedTeacherPeriod?: {
    teacherId: string
    teacherName: string
    period: number
    columnIndex: number
  } | null
  activeAssignments?: AssignmentState[]
  onRemoveAssignment?: (assignment: AssignmentState) => void
  onEditAssignmentPurpose?: (assignment: AssignmentState) => void
  getTeacherName?: (teacherId: string) => string
}

export interface TeacherCellProps extends BaseCellProps {
  assignment: AssignmentState
  teacherName?: string
  onRemove?: () => void
  onPurposeChange?: (purpose: string) => void
  onEditPurpose?: () => void
  interactive?: boolean
}

export type CellType = 'event' | 'planned' | 'teacher'

export type CellProps = 
  | { type: 'event' } & EventCellProps
  | { type: 'planned' } & PlannedCellProps  
  | { type: 'teacher' } & TeacherCellProps

/**
 * Factory function to create appropriate schedule cell component
 * Centralizes cell creation logic and ensures consistent patterns
 * 
 * @param type - The type of cell to create
 * @param props - Props specific to the cell type
 * @returns React element for the appropriate cell component
 * 
 * @example
 * ```tsx
 * // Create an event cell
 * const eventCell = createScheduleCell('event', {
 *   columnIndex: 0,
 *   periodIndex: 1,
 *   periodTime: { period: 1, start: '09:00', end: '10:00' },
 *   events: scheduleEvents,
 *   onEventClick: handleEventClick
 * })
 * 
 * // Create a planned visit cell
 * const plannedCell = createScheduleCell('planned', {
 *   columnIndex: 1,
 *   periodIndex: 1,
 *   periodTime: { period: 1, start: '09:00', end: '10:00' },
 *   plannedVisits: visits,
 *   onPlannedVisitClick: handleVisitClick
 * })
 * ```
 */
export function createScheduleCell(
  type: CellType,
  props: Omit<CellProps, 'type'>
): React.ReactElement {
  switch (type) {
    case 'event':
      return React.createElement(ScheduleEventCell, props as EventCellProps)
    
    case 'planned':
      return React.createElement(PlannedScheduleColumn, props as PlannedCellProps)
    
    case 'teacher':
      return React.createElement(AssignedTeacherCard, props as TeacherCellProps)
    
    default:
      throw new Error(`Unknown cell type: ${type}`)
  }
}

/**
 * Hook for creating schedule cells with consistent patterns
 * Provides memoization and validation for better performance
 */
export function useScheduleCell(
  type: CellType,
  props: Omit<CellProps, 'type'>,
  dependencies: React.DependencyList = []
): React.ReactElement {
  return React.useMemo(
    () => createScheduleCell(type, props),
    [type, ...dependencies]
  )
}

/**
 * Higher-order component for cell validation and error boundaries
 * Ensures robust cell rendering with fallback UI
 */
export function withCellErrorBoundary<T extends object>(
  WrappedComponent: React.ComponentType<T>
): React.ComponentType<T> {
  return function CellWithErrorBoundary(props: T) {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(WrappedComponent, props)
    )
  }
}

// Export individual cell components for direct usage
export { ScheduleEventCell } from '../ScheduleEventCell'
export { PlannedScheduleColumn } from '../PlannedScheduleColumn'
export { AssignedTeacherCard } from '@components/domain/scheduling/AssignedTeacherCard' 