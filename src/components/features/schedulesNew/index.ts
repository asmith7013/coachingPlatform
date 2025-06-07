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
export { useScheduleBuilder } from './hooks/useScheduleBuilder';
export { useScheduleBuilderUI } from './hooks/useScheduleBuilderUI';
export { useVisitScheduling } from './hooks/useVisitScheduling';

// Utilities
export * from './utils/schedule-data-utils';
export * from './utils/schedule-time-utils'; 