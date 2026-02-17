// =====================================
// PODSIE SYNC - MAIN EXPORTS
// =====================================

// Types
export type {
  PodsieAssignmentInfo,
  SyncResult,
  SyncSectionResult,
  SyncOptions,
  StudentRampUpProgressData,
  ProcessedQuestionData,
} from "./types";

// API Functions
export { fetchPodsieAssignmentQuestions } from "./api/fetch-questions";
export { fetchPodsieResponses } from "./api/fetch-responses";
export {
  fetchAssignedAssignments,
  getSampleStudentEmailForSection,
  fetchAssignmentsForSection,
} from "./api/fetch-assignments";

// Processing Functions
export { processResponsesToQuestions } from "./processing/process-responses";

// Sync Functions
export { syncStudentRampUpProgress } from "./sync/sync-student";
export { syncSectionRampUpProgress } from "./sync/sync-section";

// Query Functions
export { fetchRampUpProgress } from "./query/fetch-progress";

// Bulk Match Functions
export {
  bulkFetchAndMatch,
  saveSingleMatch,
  bulkSaveMatches,
  type BulkMatchResult,
  type AssignmentMatchResult,
  type ConflictResult,
  type SaveMatchInput,
  type AvailableLesson,
} from "./bulk-match";
