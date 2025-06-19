// Core schedule helpers - VisitScheduleBlock only
export {
  getTeacherName,
  getTeacherById,
  isPortionScheduled,
  getBlocksForPeriod,
  getBlocksForTeacherPeriod,
  hasBlockInPeriod,
  hasTeacherBlockInPeriod,
  getTeacherPlanningStatus,
  getEventLabel,
  getPortionLabel,
  isPeriodPortionAvailable,
  createDropZoneItems,
  getTotalBlocksCount
} from './schedule-helpers';

// Styling helpers
export {
  getEventStyling,
  getTeacherCellStyle,
  getPlanningIconStyle
} from './schedule-styling-helpers';

// Error handling utilities
export {
  createScheduleComponentsErrorContext,
  createScheduleComponentsDataErrorContext
} from './schedule-error-utils'; 