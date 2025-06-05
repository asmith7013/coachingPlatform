// ===== COMPONENT EXPORTS =====
// Export consolidated schedule components

export { ScheduleGrid } from './ScheduleGrid'
export { ScheduleCell } from './ScheduleCell'
export { PlannedColumn } from './PlannedColumn'

// ===== HOOK EXPORTS =====
// Export schedule-related hooks

export { useScheduleSelection } from './useScheduleSelection'
export type { 
  SelectionState, 
  SelectionActions, 
  UseScheduleSelectionOptions 
} from './useScheduleSelection'

// ===== TYPE EXPORTS =====
// Export essential types for consumers

export type {
  // Component props
  ScheduleGridProps,
  ScheduleCellProps,
  PlannedColumnProps,
  
  // Core schedule types (re-exported for convenience)
  BellScheduleEvent,
  EventSegment,
  PeriodTime,
  ScheduleColumn,
  PlannedVisit,
  
  // Selection and interaction types
  SelectedTeacherPeriod,
  HoverState,
  HoverZone,
  ScheduleAssignmentType,
  DraggedTeacher,
  DropZone,
  
  // Schedule data types
  TeacherSchedule,
  BellSchedule,
  ScheduleEventData,
  
  // Hook return types
  UseScheduleSelectionReturn,
  UseScheduleEventsReturn
} from './types' 