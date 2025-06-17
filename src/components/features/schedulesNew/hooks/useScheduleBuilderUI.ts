/**
 * @fileoverview DEPRECATED - This file is deprecated and will be removed.
 * Migration: Use hooks from @/components/features/schedulesUpdated/hooks instead
 * @deprecated
 */

import { useState, useCallback } from 'react';

/**
 * @deprecated Use useScheduleBuilderUI from @/components/features/schedulesUpdated/hooks instead.
 * This hook will be removed in a future version.
 * Migration: Replace with equivalent hook from schedulesUpdated feature.
 */
export function useScheduleBuilderUI() {
  if (process.env.NODE_ENV === 'development') {
    console.warn('DEPRECATED: useScheduleBuilderUI from schedulesNew is deprecated. Use schedulesUpdated instead.');
  }
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number | string | null>(null);
  const [selectedPortion, setSelectedPortion] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const clearSelections = useCallback(() => {
    setSelectedTeacher(null);
    setSelectedPeriod(null);
    setSelectedPortion(null);
  }, []);

  const handleTeacherPeriodSelect = useCallback((teacherId: string, period: number | string) => {
    // If clicking the same teacher/period that's already selected, deselect
    if (selectedTeacher === teacherId && selectedPeriod === period) {
      clearSelections();
      return;
    }
    
    setSelectedTeacher(teacherId);
    setSelectedPeriod(period);
    setSelectedPortion(null);
  }, [selectedTeacher, selectedPeriod, clearSelections]);

  return {
    // State
    selectedTeacher,
    selectedPeriod,
    selectedPortion,
    openDropdown,
    
    // Setters
    setSelectedTeacher,
    setSelectedPeriod,
    setSelectedPortion,
    setOpenDropdown,
    
    // Actions
    clearSelections,
    handleTeacherPeriodSelect,
    
    // Computed
    hasTeacherSelected: !!selectedTeacher,
    hasPeriodSelected: !!selectedPeriod,
    canScheduleVisit: !!selectedTeacher && !!selectedPeriod,
    hasSelections: !!selectedTeacher || !!selectedPeriod || !!selectedPortion
  };
} 