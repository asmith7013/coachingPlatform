/**
 * @fileoverview DEPRECATED - This file is deprecated and will be removed.
 * Migration: Use types from @/components/features/schedulesUpdated/types instead
 * @deprecated
 */

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

