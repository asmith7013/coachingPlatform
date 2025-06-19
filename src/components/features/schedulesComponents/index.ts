// =====================================
// PURE UI SCHEDULE COMPONENTS
// =====================================

// Main container component
export { ScheduleBuilderContainer } from './ScheduleBuilderContainer';

// Main components
export { ScheduleGrid } from './ScheduleGrid';
export { TeacherPeriodCell } from './TeacherPeriodCell';
export { DropZoneCell } from './DropZoneCell';

// Supporting components
export { PlanningStatusBar } from './PlanningStatusBar';
export { ScheduleLegend } from './ScheduleLegend';
export { SchedulePreview } from './SchedulePreview';
export { SelectionStatusFooter } from './SelectionStatusFooter';

// Dialog components
export { ClearScheduleDialog } from './ClearScheduleDialog';

// Hooks
export * from './hooks';

// Utility exports
export * from './utils';
export {
  createScheduleComponentsErrorContext,
  createScheduleComponentsDataErrorContext
} from './utils';

// Types
export * from './types'; 