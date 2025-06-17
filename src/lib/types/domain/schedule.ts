import type { Visit } from '@zod-schema/visits/visit';
import { ScheduleAssignment } from '@enums';
import type { BellSchedule } from '@/lib/schema/zod-schema/schedules/schedule';

// Note: ScheduleAssignmentType and PlannedVisit were from planned-visit schema
type PlannedVisit = Visit;

// ===== UNIFIED TIME SLOT INTERFACES =====

/**
 * Unified TimeSlot interface that combines visit and general schedule types
 * Supports both duration-based and period-based time slots
 */
export interface TimeSlot {
  startTime: string;
  endTime: string;
  periodNum?: number; // Optional period number for bell schedule alignment
  duration?: number; // Duration in minutes (calculated if not provided)
}

export interface PeriodTime {
    period: number;
    start: string;
    end: string;
  }

/**
 * Schedule filters for querying and display
 */
export interface ScheduleFilters {
  school?: string;
  teacher?: string;
  bellScheduleType?: string;
  date?: string;
}

/**
 * Schedule display configuration
 */
export interface ScheduleDisplay {
  timeSlots: TimeSlot[];
  teacher?: string;
  school?: string;
  date?: string;
}

// ===== CORE SCHEDULE COMPONENT INTERFACES =====

/**
 * Base schedule column configuration
 * Used for grid-based schedule displays
 */
export interface ScheduleColumn {
  id: string;
  title: string;
  subtitle?: string;
}

/**
 * Enhanced schedule column for interactive mode
 * Extends base column with interactive capabilities
 */
export interface InteractiveScheduleColumn extends ScheduleColumn {
  isPlannedColumn?: boolean; // Whether this column supports planned visit assignments
  teacherId?: string; // If this is a teacher-specific column
  canEdit?: boolean; // Whether this column allows editing
}

/**
 * Hover zone types for three-zone interactions
 * Maps to ScheduleAssignmentType for consistency
 */
export type HoverZone = ScheduleAssignment | null;

/**
 * Hover state for interactive schedule components
 * Tracks current hover position and zone
 */
export interface HoverState {
  columnIndex: number;
  periodIndex: number;
  zone: HoverZone;
}

/**
 * Selected teacher period state for schedule interactions
 * Used for teacher assignment and selection tracking
 */
export interface SelectedTeacherPeriod {
  teacherId: string;
  teacherName: string;
  periodIndex: number;
  timeSlot: TimeSlot;
  assignmentType: ScheduleAssignment;
}

// ===== DRAG AND DROP INTERFACES =====

/**
 * Dragged teacher data for drag-and-drop operations
 * Contains teacher identification information
 */
export interface DraggedTeacher {
  teacherId: string;
  teacherName: string;
}

/**
 * Drop zone configuration for teacher assignments
 * Defines where and how teachers can be dropped
 */
export interface DropZone {
  columnIndex: number;
  periodIndex: number;
  timeSlot: TimeSlot;
  zone: ScheduleAssignment;
}

// ===== SCHEDULE GRID COMPONENT PROPS =====
// Note: Legacy BellScheduleGrid and InteractiveScheduleGrid props removed
// These components have been consolidated into the new ScheduleGrid component
// See: src/components/schedule/types.ts for current component interfaces

/**
 * Props for PlannedScheduleColumn component
 * Column-specific props for planned visit displays
 */
export interface PlannedScheduleColumnProps {
  columnIndex: number;
  periodIndex: number;
  periodTime: PeriodTime;
  plannedVisits: PlannedVisit[];
  onPlannedVisitClick?: (visit: PlannedVisit) => void;
  onTeacherDrop?: (teacherId: string, dropZone: DropZone) => void;
  onHoverZoneChange?: (hoverState: HoverState | null) => void;
  activeHoverZone?: HoverState | null;
  draggedTeacher?: DraggedTeacher | null;
  className?: string;
  onRemoveAssignment?: (assignment: ScheduleAssignment) => void;
  onEditAssignmentPurpose?: (assignment: ScheduleAssignment) => void;
  getTeacherName?: (teacherId: string) => string;
}

// ===== THREE-ZONE TIME SLOT INTERFACES =====

/**
 * Props for ThreeZoneTimeSlot component
 * Comprehensive interface for three-zone time slot interactions
 */
export interface ThreeZoneTimeSlotProps {
  timeSlot: TimeSlot;
  periodLabel?: string;
  selectedZone?: HoverZone | null;
  onZoneClick?: (zone: ScheduleAssignment, timeSlot: TimeSlot) => void;
  onHoverChange?: (zone: ScheduleAssignment | null, timeSlot: TimeSlot) => void;
  assignedTeacher?: string | null;
  assignedPurpose?: string | null;
  availableZones?: ScheduleAssignment[];
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  isSelected?: boolean;
  isActive?: boolean;
  isDisabled?: boolean;
  className?: string;
}

// ===== SCHEDULE EVENT HANDLER INTERFACES =====

/**
 * Schedule event data for user interactions
 * Standardizes event handling across schedule components
 */
export interface ScheduleEventData {
  periodIndex: number;
  columnIndex: number;
  timeSlot: TimeSlot;
  assignmentType: ScheduleAssignment;
}

/**
 * Event handlers for schedule interactions
 * Centralizes event handling patterns
 */
export interface ScheduleEventHandlers {
  onCellClick?: (eventData: ScheduleEventData) => void;
  onCellHover?: (eventData: ScheduleEventData | null) => void;
  onTeacherAssign?: (teacherId: string, eventData: ScheduleEventData) => void;
  onTeacherUnassign?: (teacherId: string, eventData: ScheduleEventData) => void;
  onVisitCreate?: (eventData: ScheduleEventData) => void;
  onVisitEdit?: (visit: PlannedVisit) => void;
  onVisitDelete?: (visitId: string) => void;
}

// ===== SCHEDULE STATE MANAGEMENT =====

/**
 * Schedule interaction state
 * Tracks user interactions and selections
 */
export interface ScheduleInteractionState {
  selectedCell?: ScheduleEventData | null;
  hoveredCell?: ScheduleEventData | null;
  selectedTeachers: string[];
  draggedTeacher?: DraggedTeacher | null;
  activeHoverZone?: HoverState | null;
  showPlannedVisits: boolean;
  enableInteractiveMode: boolean;
}

/**
 * Schedule configuration options
 * Customizes schedule display and behavior
 */
export interface ScheduleConfig {
  displayFormat: 'grid' | 'list' | 'compact';
  showPeriodNumbers: boolean;
  showTimeLabels: boolean;
  enableDragDrop: boolean;
  enableHoverZones: boolean;
  enableKeyboardNavigation: boolean;
  highlightConflicts: boolean;
  autoSave: boolean;
}

// ===== UTILITY TYPE ALIASES =====

/**
 * BellScheduleEvent alias for consistency
 * Fixes common misspelling and provides clear naming
 */
export type { BellSchedule };

export { ScheduleAssignment };


// ===== HOOK RETURN TYPES =====


export type { PlannedVisit };