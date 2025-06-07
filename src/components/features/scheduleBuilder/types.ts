// src/components/features/scheduleBuilder/types.ts

// ===== IMPORTS FROM DOMAIN TYPES =====
import type {
  PeriodTime,
  ScheduleColumn,
  SelectedTeacherPeriod,
  HoverState,
  DraggedTeacher,
  DropZone,
  PlannedVisit,
  ScheduleAssignmentType,
  TimeSlot
} from '@domain-types/schedule';
import type { CalendarEvent } from '@composed-components/calendar/weekly';

// Import transformer types

// ===== SCHEDULE BUILDER SPECIFIC TYPES =====

// NEW: Bell Schedule Event Types (extend existing CalendarEvent)
export interface BellScheduleEvent extends CalendarEvent {
  period: number
  columnIndex: number
  startPosition: 'start' | 'middle'
  totalDuration: number
}

export interface EventSegment extends CalendarEvent {
  period: number
  segmentDuration: number
  position: 'start' | 'middle' | 'full'
  isFirst: boolean
  isLast: boolean
  parentEventId: string
  originalEvent: BellScheduleEvent
}


/**
 * Visit portion type for three-zone functionality
 * Alias of ScheduleAssignmentType for component clarity
 */
export type VisitPortion = ScheduleAssignmentType;

/**
 * Period portion selection for three-zone mode
 * Simplified interface for portion selection
 */
export interface PeriodPortionSelection {
  periodNumber: number;
  portion: VisitPortion;
}

/**
 * Conflict warning for schedule validation
 * Used in schedule builder UI feedback
 */
export interface ConflictWarning {
  type: 'period_overlap' | 'teacher_conflict' | 'capacity_exceeded';
  message: string;
  suggestions?: string[];
}

// ===== CORE COMPONENT PROPS =====

/**
 * Props for the consolidated ScheduleGrid component
 * Combines functionality from multiple grid implementations
 */
export interface ScheduleGridProps {
  // Core data
  columns: ScheduleColumn[];
  periodTimes: PeriodTime[];
  events: BellScheduleEvent[];
  
  // Interactive features
  interactive?: boolean;
  plannedVisits?: PlannedVisit[];
  selectedTeacherPeriod?: SelectedTeacherPeriod | null;
  activeHoverZone?: HoverState | null;
  draggedTeacher?: DraggedTeacher | null;
  
  // Three-zone specific features
  threeZoneMode?: boolean;
  onPeriodPortionSelect?: (selection: PeriodPortionSelection) => void;
  selectedPortions?: Map<string, VisitPortion>; // "teacherId-periodNumber" -> portion
  
  // Event handlers
  onEventClick?: (event: BellScheduleEvent) => void;
  onPlannedVisitClick?: (visit: PlannedVisit) => void;
  onPeriodAssignment?: (
    periodIndex: number,
    periodTime: PeriodTime,
    assignmentType: ScheduleAssignmentType
  ) => void;
  onHoverZoneChange?: (hoverState: HoverState | null) => void;
  onTeacherDrop?: (teacherId: string, dropZone: DropZone) => void;
  
  // Selection helpers
  isEventSelected?: (event: BellScheduleEvent) => boolean;
  
  // Styling
  className?: string;
}

/**
 * Enhanced props for three-zone mode
 * Ensures required props for three-zone functionality
 */
export interface ThreeZoneScheduleGridProps extends ScheduleGridProps {
  threeZoneMode: true;
  onPeriodPortionSelect: (selection: PeriodPortionSelection) => void;
  selectedPortions?: Map<string, VisitPortion>;
}

/**
 * Props for the consolidated ScheduleCell component
 * Unified cell rendering across contexts
 */
export interface ScheduleCellProps {
  columnIndex: number;
  periodIndex: number;
  periodTime: PeriodTime;
  events: BellScheduleEvent[];
  
  // Cell context
  cellType: 'teacher' | 'planned' | 'period';
  
  // Interactive features
  interactive?: boolean;
  isSelected?: boolean;
  
  // Three-zone features
  threeZoneMode?: boolean;
  onPortionClick?: (periodNumber: number, portion: VisitPortion) => void;
  selectedPortion?: VisitPortion | null;
  
  // Event handlers
  onEventClick?: (event: BellScheduleEvent) => void;
  
  // Styling
  className?: string;
}

/**
 * Props for PlannedVisitsColumn component
 * Specific to planned visits column functionality
 */
export interface PlannedColumnProps {
  columnIndex: number;
  periodIndex: number;
  periodTime: PeriodTime;
  plannedVisits: PlannedVisit[];
  
  // Interactive features
  selectedTeacherPeriod?: SelectedTeacherPeriod | null;
  activeHoverZone?: HoverState | null;
  draggedTeacher?: DraggedTeacher | null;
  
  // Event handlers
  onPlannedVisitClick?: (visit: PlannedVisit) => void;
  onTeacherDrop?: (teacherId: string, dropZone: DropZone) => void;
  onHoverZoneChange?: (hoverState: HoverState | null) => void;
  onPeriodAssignment?: (
    periodIndex: number,
    periodTime: PeriodTime,
    assignmentType: ScheduleAssignmentType
  ) => void;
  
  // Assignment management (simplified from complex domain types)
  activeAssignments?: Array<{
    teacherId: string;
    timeSlot: TimeSlot;
    purpose?: string;
    assignmentType: ScheduleAssignmentType;
    isTemporary: boolean;
    assignedAt?: Date;
  }>;
  onRemoveAssignment?: (assignment: { teacherId: string; periodIndex: number }) => void;
  onEditAssignmentPurpose?: (assignment: { teacherId: string; periodIndex: number }) => void;
  
  // Helpers
  getTeacherName?: (teacherId: string) => string;
  
  // Styling
  className?: string;
}

/**
 * Props for ThreeZoneTimeSlot component
 * Specific to three-zone time slot functionality
 */
export interface ThreeZoneTimeSlotProps {
  // Core data (simplified - period-based approach)
  periodNumber: number;
  timeStart: string;
  timeEnd: string;
  
  // Selection state
  selectedPortion?: VisitPortion | null;
  onSelect?: (periodNumber: number, portion: VisitPortion) => void;
  
  // Assignment display
  assignedTeacher?: string | null;
  assignedPurpose?: string | null;
  
  // Configuration
  periodLabel?: string;
  availablePortions?: VisitPortion[];
  
  // State
  isSelected?: boolean;
  isActive?: boolean;
  isDisabled?: boolean;
  
  // Styling
  className?: string;
}

// ===== ACCOUNTABILITY COMPONENT TYPES =====

/**
 * Props for teacher accountability components
 * Used in accountability grid and related features
 */
export interface TeacherAccountabilityProps {
  teacherId: string;
  teacherName: string;
  isScheduled: boolean;
  isCrossedOff: boolean;
  isCompleted: boolean;
  notes?: string;
  onToggleCrossedOff?: (teacherId: string) => void;
  onToggleCompleted?: (teacherId: string) => void;
  onUpdateNotes?: (teacherId: string, notes: string) => void;
  className?: string;
}

/**
 * Props for purpose assignment dropdown
 * Specific to purpose selection functionality
 */
export interface PurposeAssignmentProps {
  assignment: {
    teacherId: string;
    timeSlot: TimeSlot;
    assignmentType: ScheduleAssignmentType;
  };
  predefinedPurposes: string[];
  recentPurposes: string[];
  currentPurpose?: string;
  onPurposeSelect: (purpose: string) => void;
  onCustomPurpose: (purpose: string) => void;
  className?: string;
}

// ===== HOOK RETURN TYPES =====

/**
 * Return type for schedule builder state hooks
 * Standardizes state management patterns
 */
export interface UseScheduleBuilderReturn {
  // State
  selectedTeachers: string[];
  activeAssignments: Array<{
    teacherId: string;
    timeSlot: TimeSlot;
    purpose?: string;
    assignmentType: ScheduleAssignmentType;
    isTemporary: boolean;
  }>;
  draggedTeacher: DraggedTeacher | null;
  activeHoverZone: HoverState | null;
  
  // Actions
  selectTeacher: (teacherId: string) => void;
  deselectTeacher: (teacherId: string) => void;
  clearSelection: () => void;
  assignTeacher: (teacherId: string, timeSlot: TimeSlot, assignmentType: ScheduleAssignmentType) => void;
  removeAssignment: (teacherId: string, timeSlot: TimeSlot) => void;
  updateAssignmentPurpose: (teacherId: string, timeSlot: TimeSlot, purpose: string) => void;
  
  // Drag & Drop
  startDrag: (teacher: DraggedTeacher) => void;
  endDrag: () => void;
  setHoverZone: (hoverState: HoverState | null) => void;
  
  // Persistence
  saveState: () => Promise<void>;
  hasUnsavedChanges: boolean;
}

/**
 * Return type for three-zone functionality hooks
 * Specific to three-zone mode state management
 */
export interface UseThreeZoneModeReturn {
  selectedPortions: Map<string, VisitPortion>;
  selectPortion: (teacherId: string, periodNumber: number, portion: VisitPortion) => void;
  clearPortion: (teacherId: string, periodNumber: number) => void;
  clearAllPortions: () => void;
  getSelectedPortion: (teacherId: string, periodNumber: number) => VisitPortion | null;
  hasSelections: boolean;
}