/**
 * @fileoverview DEPRECATED - SchedulesNew hooks exports
 * 
 * These hooks are deprecated and will be removed in a future version.
 * Please migrate to the new schedule system at src/components/features/schedulesUpdated/
 * 
 * Migration path:
 * - Use the new useScheduleComposition hook for data composition
 * - Use the new useScheduleUI hook for UI state management
 * - Follow the new schema-first architecture patterns
 * 
 * @deprecated Use the new schedule system at src/components/features/schedulesUpdated/
 */

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
