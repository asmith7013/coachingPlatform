import type { BellScheduleEvent, EventSegment } from '@transformers/domain/schedule-transforms'

// REUSE: Import PeriodTime from existing utilities instead of redefining
import type { PeriodTime } from '@/lib/domain/schedule/schedule-calendar-utils'

// Import planned visit types for interactive mode
import type { PlannedVisit, TimeSlot, ScheduleAssignmentType } from '@zod-schema/visits/planned-visit'

export interface ScheduleColumn {
  id: string
  title: string
  subtitle?: string
}

// Interactive mode enhancements (Task 2.1)
export interface InteractiveScheduleColumn extends ScheduleColumn {
  isPlannedColumn?: boolean // Whether this column supports planned visit assignments
  teacherId?: string // If this is a teacher-specific column
  canEdit?: boolean // Whether this column allows editing
}

// Hover zone types for interactive mode (Tasks 2.2-2.3)
export type HoverZone = 'full_period' | 'first_half' | 'second_half' | null

export interface HoverState {
  columnIndex: number
  periodIndex: number
  zone: HoverZone
}

// Drag and drop interfaces (Task 2.4)
export interface DraggedTeacher {
  teacherId: string
  teacherName: string
}

export interface DropZone {
  columnIndex: number
  periodIndex: number
  timeSlot: TimeSlot
  zone: ScheduleAssignmentType
}

// Enhanced props for interactive BellScheduleGrid
export interface BellScheduleGridProps {
  columns: ScheduleColumn[]
  events: BellScheduleEvent[]
  periodTimes: PeriodTime[]
  onEventClick?: (event: BellScheduleEvent) => void
  className?: string
  
  // Interactive mode props (Task 2.1)
  interactive?: boolean
  plannedVisits?: PlannedVisit[]
  onPlannedVisitClick?: (visit: PlannedVisit) => void
  
  // Drag and drop handlers (Task 2.4)
  onTeacherDrop?: (teacherId: string, dropZone: DropZone) => void
  onHoverZoneChange?: (hoverState: HoverState | null) => void
  
  // Visual feedback state (Task 2.3)
  activeHoverZone?: HoverState | null
  draggedTeacher?: DraggedTeacher | null
}

// Re-export types from existing utilities and transformers
export type { PeriodTime, BellScheduleEvent, EventSegment, PlannedVisit, TimeSlot, ScheduleAssignmentType } 