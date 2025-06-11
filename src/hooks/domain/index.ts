// ✅ SINGLE SOURCE: Import from subdirectories, re-export at top level
// This provides clean separation while maintaining backward compatibility

// Staff hooks - use subdirectory versions as canonical
export * from './staff/useNYCPSStaff'
export * from './staff/useTeachingLabStaff'
export * from './staff/useUserStaff'

// Schedule hooks - use subdirectory versions as canonical
export * from './schedule/useBellSchedules'
export * from './schedule/useTeacherSchedules'

// Core entity hooks
export * from './useSchools'
export * from './useLookFors'
export * from './useVisits'
// export * from './useVisitsWithTransforms' - Removed during simplification
export * from './useCoachingActionPlans'

// Observation hooks
export * from './observations/useContextualNotes';
export * from './observations/useClassroomObservations';

// Composite hooks
export * from './useSchoolDailyView'

// ✅ CLEAN ARCHITECTURE: All domain hooks organized by responsibility
// - staff/ - Staff-related domain hooks
// - schedule/ - Schedule-related domain hooks  
// - Root level - Core entity and composite hooks
//
// This structure follows single responsibility principle while
// maintaining a clean top-level export interface

