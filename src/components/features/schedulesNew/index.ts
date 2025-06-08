export { ScheduleBuilder } from './ScheduleBuilder';
export { ScheduleProvider } from './context';
export * from './types';

// Individual components (if needed elsewhere)
export { DropZoneCell } from './DropZoneCell';
export { PlanningStatusBar } from './PlanningStatusBar';
export { ScheduleGrid } from './ScheduleGrid';
export { ScheduleLegend } from './ScheduleLegend';
export { SelectionStatusFooter } from './SelectionStatusFooter';
export { TeacherPeriodCell } from './TeacherPeriodCell';

// Hooks
// useScheduleBuilder has been eliminated - use focused hooks instead
export { useScheduleBuilderUI } from './hooks/useScheduleBuilderUI';

// Utilities
export * from './utils/schedule-data-utils';
export * from './utils/schedule-time-utils'; 