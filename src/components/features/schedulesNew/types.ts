import type { LucideIcon } from 'lucide-react';

// Import domain types for re-export and extension
import type {
  TimeSlot as DomainTimeSlot,
  ScheduleAssignmentType,
  HoverZone,
  ScheduleEventData
} from '@domain-types/schedule';

// Re-export commonly used domain types for convenience
export type {
  ScheduleAssignmentType,
  HoverZone,
  ScheduleEventData
};

// ===== EXTENDED TYPES FOR UI COMPONENTS =====

/**
 * TimeSlot interface that extends domain TimeSlot with required UI properties
 * Ensures TimeSlot includes all required properties for components
 */
export interface TimeSlot extends DomainTimeSlot {
  period: number | string;  // ✅ This property is required by components
  label: string;            // ✅ This property is required by components
}

// ===== COMPONENT-SPECIFIC INTERFACES =====


/**
 * Event type options specific to this UI implementation
 * UI-focused configuration for dropdown and display
 */
export interface EventTypeOption {
  value: 'observation' | 'debrief' | 'co-planning' | 'professional-learning';
  label: string;
  icon: LucideIcon;
}

/**
 * UI-specific drop zone item
 * Different from domain PlannedVisit - focused on UI state management
 */
export interface DropZoneItem {
  teacherId: string;
  period: number | string;
  portion: 'first_half' | 'second_half' | 'full_period';
  teacherName: string;
  eventType: EventTypeOption['value'];
}

/**
 * Schedule builder configuration
 * UI-specific settings for the schedule builder interface
 */
export interface ScheduleBuilderConfig {
  enableAutoSave: boolean;
  saveDelay: number;
  showTeacherNames: boolean;
  compactMode: boolean;
}

/**
 * Props interface for useScheduleBuilder hook
 */
export interface UseScheduleBuilderProps {
  schoolId: string;
  date: string; // ISO date string for the schedule
}

/**
 * Teacher planning status for UI indicators
 */
export interface TeacherPlanningStatus {
  observation: boolean;
  meeting: boolean;
} 

export interface ScheduledVisit {
  id: string
  teacherId: string
  teacherName: string
  periodNumber: number
  portion: 'first_half' | 'second_half' | 'full_period'
  purpose?: string
  createdAt: Date
}
