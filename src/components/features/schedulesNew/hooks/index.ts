// ✅ SIMPLIFIED EXPORTS: Clean, focused hooks
export { useScheduleData } from './useScheduleData'
export { useScheduleActions } from './useScheduleActions'
export { useScheduleState } from './useScheduleState'

// ✅ PATTERN: Feature hooks should be:
// 1. useScheduleData - composes domain hooks, minimal transformation
// 2. useScheduleActions - feature-specific operations + domain delegation  
// 3. useScheduleState - pure UI state management
//
// Everything else should either be:
// - In domain hooks (useVisits, useSchools, etc.)
// - In components as local state
// - In utils as pure functions
//
// ✅ ARCHITECTURE: This follows the DRY principle by:
// - Eliminating duplicate CRUD operations (delegated to domain hooks)
// - Removing redundant state management (pure UI state only)
// - Consolidating data transformation (domain hook selectors)
// - Providing clear separation of concerns
