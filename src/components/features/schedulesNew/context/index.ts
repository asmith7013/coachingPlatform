/**
 * @fileoverview DEPRECATED - SchedulesNew context exports
 * 
 * These context providers and hooks are deprecated and will be removed in a future version.
 * Please migrate to the new schedule system at src/components/features/schedulesUpdated/
 * 
 * Migration path:
 * - Use the new ScheduleProvider from the schedulesUpdated feature
 * - Use the new useScheduleComposition and useScheduleUI hooks
 * - Follow the new schema-first architecture patterns
 * 
 * @deprecated Use the new schedule system at src/components/features/schedulesUpdated/
 */

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