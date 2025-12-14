// =====================================
// ATTENDANCE SYNC TYPES
// =====================================

/**
 * Result of syncing attendance for a single section
 */
export interface AttendanceSyncResult {
  success: boolean;
  section: string;
  groupId: string;
  totalProcessed: number;
  created: number;
  updated: number;
  notTracked: number;
  errors?: string[];
  error?: string;
  rawData?: unknown;  // Raw API response for debugging
}

/**
 * Options for attendance sync operations
 */
export interface AttendanceSyncOptions {
  startDate: string;  // ISO format YYYY-MM-DD
  endDate?: string;   // Optional, defaults to today
}
