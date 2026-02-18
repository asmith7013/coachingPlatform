"use server";

import { fetchPodsieAttendance } from "../api/fetch-attendance";
import { importAttendanceData } from "../../attendance-import";
import type { AttendanceSyncResult, AttendanceSyncOptions } from "../types";

// =====================================
// SYNC SECTION ATTENDANCE
// =====================================

/**
 * Sync attendance data for a specific section from Podsie
 * @param groupId - Podsie group ID
 * @param section - Class section (e.g., "802")
 * @param options - Sync options including startDate and optional school filter
 */
export async function syncSectionAttendance(
  groupId: string,
  section: string,
  options: AttendanceSyncOptions,
): Promise<AttendanceSyncResult> {
  try {
    // Fetch attendance data from Podsie API
    const attendanceData = await fetchPodsieAttendance(
      groupId,
      options.startDate,
    );

    // Import the fetched data using existing import logic
    // Pass school to filter students (important for sections in multiple schools)
    const importResult = await importAttendanceData(
      attendanceData,
      options.school,
    );

    if (!importResult.success || !importResult.data) {
      return {
        success: false,
        section,
        groupId,
        totalProcessed: 0,
        created: 0,
        updated: 0,
        notTracked: 0,
        error: importResult.error || "Import failed",
        rawData: attendanceData,
      };
    }

    return {
      success: true,
      section,
      groupId,
      totalProcessed: importResult.data.totalProcessed,
      created: importResult.data.created,
      updated: importResult.data.updated,
      notTracked: importResult.data.notTracked,
      errors: importResult.data.errors,
      rawData: attendanceData,
    };
  } catch (error) {
    console.error("Error syncing section attendance:", error);
    return {
      success: false,
      section,
      groupId,
      totalProcessed: 0,
      created: 0,
      updated: 0,
      notTracked: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
