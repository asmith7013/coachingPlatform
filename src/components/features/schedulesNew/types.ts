// src/components/features/schedulesNew/types.ts
// Remove duplicate type definitions and import from schema
export type { 
  VisitCreationData, 
  VisitUpdateData, 
  ConflictCheckData,
  TeacherPeriodQuery,
  EventOperation
} from '@zod-schema/schedule/schedule-actions';

import { ScheduleAssignment } from '@enums';

// Keep only UI-specific types
export interface ScheduleUIState {
  selectedTeacher: string | null
  selectedPeriod: number | null
  selectedPortion: ScheduleAssignment | null
  openDropdown: string | null
}

export interface ScheduleBuilderProps {
  schoolId: string
  date: string
  mode?: 'create' | 'edit'
  visitId?: string
}

export interface ConflictResult {
  hasConflict: boolean
  message?: string
}

