import type { BellScheduleEvent, EventSegment } from '@transformers/domain/schedule-transforms'
import type { PlannedVisit, TimeSlot, ScheduleAssignmentType } from '@zod-schema/visits/planned-visit'

/**
 * Schedule Domain Types - Single Source of Truth
 * Consolidated and simplified from multiple locations to reduce complexity
 */

// ==========================================
// CORE SCHEDULE TYPES (from Zod schemas)
// ==========================================

// Re-export types directly from the schema for centralized access
export type {
    ClassScheduleItem,
    AssignedCycleDay,
    BellScheduleInput,
    BellSchedule,
    Period,
    ScheduleByDay,
    TeacherScheduleInput,
    TeacherSchedule
} from '@zod-schema/schedule/schedule'

// ==========================================
// SHARED SCHEDULE INTERFACES
// ==========================================

/**
 * Period timing information - SINGLE definition for entire codebase
 * Replaces duplicate definitions in schedule-calendar-utils.ts and ScheduleGrid.tsx
 */
export interface PeriodTime {
  period: number
  start: string
  end: string
}

/**
 * Schedule column definition - SINGLE definition for entire codebase
 * Replaces duplicate definition in ScheduleGrid.tsx
 */
export interface ScheduleColumn {
  id: string
  title: string
  subtitle?: string
}

/**
 * Schedule filters for data queries
 */
export interface ScheduleFilters {
    school?: string
    teacher?: string
    bellScheduleType?: string
    date?: string
}

// ==========================================
// INTERACTIVE SCHEDULE TYPES
// ==========================================

/**
 * Hover zone types for interactive mode
 */
export type HoverZone = 'full_period' | 'first_half' | 'second_half' | null

export interface HoverState {
  columnIndex: number
  periodIndex: number
  zone: HoverZone
}

/**
 * Teacher selection state for period assignments
 */
export interface SelectedTeacherPeriod {
  teacherId: string
  teacherName: string
  period: number
  columnIndex: number
}

// ==========================================
// COMPONENT PROPS INTERFACES (simplified)
// ==========================================

/**
 * Base schedule grid props - simplified from over-complex BellScheduleGridProps
 */
export interface ScheduleGridProps {
  columns: ScheduleColumn[]
  events: BellScheduleEvent[]
  periodTimes: PeriodTime[]
  className?: string
}

/**
 * Interactive schedule props - clean extension of base props
 */
export interface InteractiveScheduleProps extends ScheduleGridProps {
  // Event handlers
  onEventClick?: (event: BellScheduleEvent) => void
  onPlannedVisitClick?: (visit: PlannedVisit) => void
  onPeriodAssignment?: (
    periodIndex: number,
    periodTime: PeriodTime,
    assignmentType: ScheduleAssignmentType
  ) => void
  onHoverZoneChange?: (hoverState: HoverState | null) => void
  
  // Interactive data
  plannedVisits?: PlannedVisit[]
  selectedTeacherPeriod?: SelectedTeacherPeriod | null
  activeHoverZone?: HoverState | null
  interactive?: boolean

  // UI state
  isEventSelected?: (event: BellScheduleEvent) => boolean
}

// ==========================================
// LEGACY TYPES (deprecated)
// ==========================================

/**
 * @deprecated Legacy drag-and-drop interface. Use period assignment pattern instead.
 */
export interface DropZone {
  columnIndex: number
  periodIndex: number
  timeSlot: TimeSlot
  zone: ScheduleAssignmentType
}

// ==========================================
// RE-EXPORTS FOR CONVENIENCE
// ==========================================

export type { 
  BellScheduleEvent, 
  EventSegment, 
  PlannedVisit, 
  TimeSlot, 
  ScheduleAssignmentType 
} 