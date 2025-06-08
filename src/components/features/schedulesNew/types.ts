// src/components/features/schedulesNew/types.ts
import type { ScheduleAssignmentType } from '@domain-types/schedule'

// ===== USE DOMAIN TYPES DIRECTLY =====
// Import domain types as needed by components - types file keeps minimal interface only

// ===== REMOVE UNNECESSARY TYPE ALIASES =====
// Instead of creating PlannedVisit/ScheduledVisit, use Visit directly with selectors

// ===== MINIMAL UI STATE (Only What's Actually UI-Specific) =====
export interface ScheduleUIState {
  selectedTeacher: string | null
  selectedPeriod: number | null
  selectedPortion: ScheduleAssignmentType | null
  openDropdown: string | null
}

// ===== COMPONENT PROPS (Simplified) =====
export interface ScheduleBuilderProps {
  schoolId: string
  date: string
  mode?: 'create' | 'edit'
  visitId?: string
}

// ===== VISIT OPERATIONS (Use Domain Types) =====
export interface VisitCreationData {
  teacherId: string
  periodNumber: number
  portion: ScheduleAssignmentType
  purpose: string
  // Domain hooks will handle schoolId, date, coachId from context
}

export interface VisitUpdateData {
  purpose?: string
  portion?: ScheduleAssignmentType
}

// ===== HELPER TYPES FOR CONFLICT DETECTION =====
export interface ConflictCheckData {
  teacherId: string
  periodNumber: number
  portion: ScheduleAssignmentType
}

export interface ConflictResult {
  hasConflict: boolean
  message?: string
}

