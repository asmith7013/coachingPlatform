import { useState, useCallback } from "react";

export interface ScheduleUIState {
  selectedTeacher: string | null;
  selectedPeriod: number | null;
  openDropdown: string | null;
}

export interface ScheduleUIActions {
  selectTeacherPeriod: (teacherId: string, period: number) => void;
  clearSelection: () => void;
  toggleDropdown: (dropdownId: string | null) => void;
}

/**
 * Pure UI state management - no data fetching or business logic
 */
export function useScheduleUI() {
  const [uiState, setUIState] = useState<ScheduleUIState>({
    selectedTeacher: null,
    selectedPeriod: null,
    openDropdown: null,
  });

  const selectTeacherPeriod = useCallback(
    (teacherId: string, period: number) => {
      setUIState((prev) => ({
        ...prev,
        selectedTeacher: teacherId,
        selectedPeriod: period,
      }));
    },
    [],
  );

  const clearSelection = useCallback(() => {
    setUIState((prev) => ({
      ...prev,
      selectedTeacher: null,
      selectedPeriod: null,
    }));
  }, []);

  const toggleDropdown = useCallback((dropdownId: string | null) => {
    setUIState((prev) => ({ ...prev, openDropdown: dropdownId }));
  }, []);

  return {
    uiState,
    selectTeacherPeriod,
    clearSelection,
    toggleDropdown,
  };
}
