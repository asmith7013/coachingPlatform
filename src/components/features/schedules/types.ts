import type { NYCPSStaff } from "@zod-schema/core/staff";
import type { TeacherSchedule } from "@zod-schema/schedules/schedule-documents";
import type {
  BellScheduleBlock,
  VisitScheduleBlock,
} from "@zod-schema/schedules/schedule-events";
import { ScheduleAssignment } from "@enums";
import { ScheduleAssignmentType } from "@enums";

// =====================================
// USE EXISTING SCHEMA TYPES WITH MINIMAL EXTENSIONS
// =====================================

// =====================================
// PURE UI COMPONENT PROP TYPES
// =====================================

export interface ScheduleGridProps {
  teachers: NYCPSStaff[];
  timeSlots: BellScheduleBlock[];
  visits: VisitScheduleBlock[];
  onCellClick?: (teacherId: string, period: number) => void;
  onPortionSelect?: (
    teacherId: string,
    period: number,
    portion: ScheduleAssignmentType,
  ) => Promise<void>;
  selectedTeacher?: string;
  selectedPeriod?: number;

  // Footer props
  selectedPortion?: ScheduleAssignmentType;
  onRequestClear?: () => void;
  clearResult?: ClearScheduleResult | null;
  isClearing?: boolean;
  scheduleStatus?: "ready" | "loading" | "error";
  scheduleStatusText?: string;
  onExport?: () => void;
  isExporting?: boolean;
  showExport?: boolean;

  className?: string;
}

export interface TeacherPeriodCellProps {
  teacher: NYCPSStaff;
  period: number;
  timeSlot: BellScheduleBlock;
  visitBlock?: VisitScheduleBlock;
  schedule?: TeacherSchedule;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface DropZoneCellProps {
  period: number;
  visits: VisitScheduleBlock[];
  teachers: NYCPSStaff[];
  onPortionSelect?: (
    teacherId: string,
    period: number,
    portion: ScheduleAssignmentType,
  ) => Promise<void>;
  selectedTeacher?: string;
  selectedPeriod?: number;
  className?: string;
}

export interface PlanningStatusBarProps {
  teachers: NYCPSStaff[];
  visits: VisitScheduleBlock[];
  className?: string;
}

export interface ScheduleLegendProps {
  className?: string;
}

export interface SchedulePreviewProps {
  teacherSchedules: TeacherSchedule[];
  isLoading?: boolean;
  error?: boolean;
  showTitle?: boolean;
  maxDaysPreview?: number;
  className?: string;
}

export interface SelectionStatusFooterProps {
  selectedTeacher?: string;
  selectedPeriod?: number;
  selectedPortion?: ScheduleAssignment;
  teachers: NYCPSStaff[];
  visits: VisitScheduleBlock[];
  onRequestClear?: () => void;
  clearResult?: ClearScheduleResult | null;
  isLoading?: boolean;
  className?: string;
}

export interface ScheduleActionFooterProps {
  status?: "ready" | "loading" | "error";
  statusText?: string;
  onExport?: () => void;
  isExporting?: boolean;
  showExport?: boolean;
  className?: string;
}

// =====================================
// UTILITY TYPES (only if needed for component logic)
// =====================================

// Planning status computed from visits - minimal interface for UI display
export interface TeacherPlanningStatus {
  observation: boolean;
  meeting: boolean;
}

// Drop zone item for display - derived from VisitScheduleBlock data
export type DropZoneItem = {
  id: string;
  blockId: string;
  teacherId: string;
  teacherName: string;
  portion: ScheduleAssignmentType;
  purpose: string;
};

// Clear operation result - minimal interface for parent-child communication
export interface ClearScheduleResult {
  success: boolean;
  message: string;
}

export interface ScheduleFooterProps {
  // Selection state
  selectedTeacher?: string;
  selectedPeriod?: number;
  selectedPortion?: ScheduleAssignmentType;
  teachers: NYCPSStaff[];
  visits: VisitScheduleBlock[];

  // Clear functionality
  onRequestClear?: () => void;
  clearResult?: ClearScheduleResult | null;
  isClearing?: boolean;

  // Schedule status and actions
  scheduleStatus?: "ready" | "loading" | "error";
  scheduleStatusText?: string;
  onExport?: () => void;
  isExporting?: boolean;
  showExport?: boolean;

  className?: string;
}
