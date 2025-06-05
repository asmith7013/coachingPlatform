// ===== IMPORTS =====
// Import types for use in component interfaces
import type {
  PeriodTime,
  ScheduleColumn,
  SelectedTeacherPeriod,
  HoverState,
  HoverZone,
  DraggedTeacher,
  DropZone,
  ScheduleEventData,
  UseScheduleSelectionReturn,
  UseScheduleEventsReturn
} from '@lib/types/domain/schedule'

import type {
  BellScheduleEvent,
  EventSegment
} from '@lib/transformers/domain/schedule-transforms'

import type {
  PlannedVisit,
  ScheduleAssignmentType
} from '@zod-schema/visits/planned-visit'

import type {
  TeacherSchedule,
  BellSchedule
} from '@zod-schema/schedule/schedule'

// ===== RE-EXPORTS =====
// Re-export for consumers
export type {
  PeriodTime,
  ScheduleColumn,
  SelectedTeacherPeriod,
  HoverState,
  HoverZone,
  DraggedTeacher,
  DropZone,
  ScheduleEventData,
  UseScheduleSelectionReturn,
  UseScheduleEventsReturn,
  BellScheduleEvent,
  EventSegment,
  PlannedVisit,
  ScheduleAssignmentType,
  TeacherSchedule,
  BellSchedule
}

// ===== COMPONENT-SPECIFIC INTERFACES =====
// These are new interfaces for consolidated components only

/**
 * Props for the consolidated ScheduleGrid component
 * Combines functionality from multiple existing grid components
 */
export interface ScheduleGridProps {
  columns: ScheduleColumn[]
  periodTimes: PeriodTime[]
  events: BellScheduleEvent[]
  
  // Interactive features
  interactive?: boolean
  plannedVisits?: PlannedVisit[]
  selectedTeacherPeriod?: SelectedTeacherPeriod | null
  activeHoverZone?: HoverState | null
  
  // Event handlers
  onEventClick?: (event: BellScheduleEvent) => void
  onPlannedVisitClick?: (visit: PlannedVisit) => void
  onPeriodAssignment?: (
    periodIndex: number,
    periodTime: PeriodTime,
    assignmentType: ScheduleAssignmentType
  ) => void
  onHoverZoneChange?: (hoverState: HoverState | null) => void
  
  // Selection helpers
  isEventSelected?: (event: BellScheduleEvent) => boolean
  
  // Styling
  className?: string
}

/**
 * Props for the consolidated ScheduleCell component
 * Unifies cell rendering across different schedule contexts
 */
export interface ScheduleCellProps {
  columnIndex: number
  periodIndex: number
  periodTime: PeriodTime
  events: BellScheduleEvent[]
  
  // Cell context
  cellType: 'teacher' | 'planned' | 'period'
  
  // Interactive features
  interactive?: boolean
  isSelected?: boolean
  
  // Event handlers
  onEventClick?: (event: BellScheduleEvent) => void
  
  // Styling
  className?: string
}

/**
 * Props for the enhanced PlannedColumn component
 * Maintains existing functionality with consolidated types
 */
export interface PlannedColumnProps {
  columnIndex: number
  periodIndex: number
  periodTime: PeriodTime
  plannedVisits: PlannedVisit[]
  
  // Interactive features
  selectedTeacherPeriod?: SelectedTeacherPeriod | null
  activeHoverZone?: HoverState | null
  draggedTeacher?: DraggedTeacher | null
  
  // Event handlers
  onPlannedVisitClick?: (visit: PlannedVisit) => void
  onTeacherDrop?: (teacherId: string, dropZone: DropZone) => void
  onHoverZoneChange?: (hoverState: HoverState | null) => void
  onPeriodAssignment?: (
    periodIndex: number,
    periodTime: PeriodTime,
    assignmentType: ScheduleAssignmentType
  ) => void
  
  // Assignment management (using actual AssignmentState from schema)
  activeAssignments?: Array<{ 
    teacherId: string
    timeSlot: {
      startTime: string
      endTime: string
      periodNum?: number
    }
    purpose?: string
    assignmentType: ScheduleAssignmentType
    isTemporary: boolean
    assignedAt?: Date
  }>
  onRemoveAssignment?: (assignment: { teacherId: string; periodIndex: number }) => void
  onEditAssignmentPurpose?: (assignment: { teacherId: string; periodIndex: number }) => void
  
  // Helpers
  getTeacherName?: (teacherId: string) => string
  
  // Styling
  className?: string
} 