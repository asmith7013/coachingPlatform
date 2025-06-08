// Export the main provider and base context
export {
  ScheduleProvider,
  useScheduleContext
} from './ScheduleContext';

// Import for internal use in simplified hooks
import { useScheduleContext } from './ScheduleContext';

// ✅ SIMPLIFIED COMPATIBILITY HOOKS - only for essential functionality

export function useScheduleSelection() {
  const context = useScheduleContext();
  return {
    selectedTeacher: context.uiState.selectedTeacher,
    selectedPeriod: context.uiState.selectedPeriod,
    selectedPortion: context.uiState.selectedPortion,
    selectTeacherPeriod: context.selectTeacherPeriod,
    clearSelection: context.clearSelection
  };
}

export function useScheduleOperations() {
  const context = useScheduleContext();
  return {
    scheduleVisit: context.scheduleVisit,
    updateVisit: context.updateVisit,
    deleteVisit: context.deleteVisit,
    hasVisitConflict: context.hasVisitConflict
  };
}

export function useScheduleStructure() {
  const context = useScheduleContext();
  return {
    teachers: context.teachers,
    timeSlots: context.timeSlots,
    teacherSchedules: context.teacherSchedules,
    visits: context.visits,
    isLoading: context.isLoading,
    error: context.error
  };
} 