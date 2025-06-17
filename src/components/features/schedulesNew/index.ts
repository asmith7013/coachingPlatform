/**
 * @fileoverview DEPRECATED - SchedulesNew feature exports
 * 
 * This entire feature module is deprecated and will be removed in a future version.
 * Please migrate to the new schedule system at src/components/features/schedulesUpdated/
 * 
 * Migration path:
 * - Use the new ScheduleDisplayTestPage for schedule display
 * - Use the new useScheduleComposition and useScheduleUI hooks for schedule logic
 * - Follow the new schema-first architecture patterns
 * 
 * @deprecated Use the new schedule system at src/components/features/schedulesUpdated/
 */

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
export * from './utils/schedule-time-utils'; 