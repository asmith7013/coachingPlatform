"use server";

/**
 * Scheduled action to sync attendance from Podsie
 *
 * This action is designed to be called from GitHub Actions on a schedule.
 * It syncs attendance data for all active sections from the previous day.
 */

import { fetchSectionConfigs } from "@/app/actions/scm/podsie/section-config";
import { syncSectionAttendance } from "@/app/actions/scm/student/attendance-sync";
import type { AttendanceSyncResult } from "@/app/actions/scm/student/attendance-sync";

// =====================================
// TYPES
// =====================================

export interface SyncAllAttendanceResult {
  success: boolean;
  totalSections: number;
  sectionsProcessed: number;
  sectionsFailed: number;
  totalRecords: number;
  created: number;
  updated: number;
  notTracked: number;
  errors: string[];
  sectionResults: AttendanceSyncResult[];
  startDate: string;
}

export interface SyncAllAttendanceOptions {
  /** Start date in YYYY-MM-DD format. Defaults to yesterday */
  startDate?: string;
  /** Optional list of section IDs to sync. If not provided, syncs all sections with groupId */
  sectionIds?: string[];
}

// =====================================
// MAIN SYNC FUNCTION
// =====================================

/**
 * Sync attendance for all active sections
 * This is the main entry point for the scheduled sync
 */
export async function syncAllAttendance(
  options: SyncAllAttendanceOptions = {}
): Promise<SyncAllAttendanceResult> {
  console.log('🚀 Starting attendance sync...');
  const startTime = Date.now();

  // Default to yesterday if no start date provided
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const startDate = options.startDate || yesterday.toISOString().split('T')[0];

  console.log(`📅 Syncing attendance from ${startDate} to today`);

  const result: SyncAllAttendanceResult = {
    success: false,
    totalSections: 0,
    sectionsProcessed: 0,
    sectionsFailed: 0,
    totalRecords: 0,
    created: 0,
    updated: 0,
    notTracked: 0,
    errors: [],
    sectionResults: [],
    startDate
  };

  try {
    // Step 1: Load all sections with groupId
    console.log('\n📋 Loading sections...');
    const sectionsResponse = await fetchSectionConfigs();

    if (!sectionsResponse.success || !sectionsResponse.items) {
      result.errors.push('Failed to fetch sections: ' + (sectionsResponse.error || 'Unknown error'));
      return result;
    }

    // Filter sections that have groupId (required for Podsie API)
    interface SectionWithGroupId {
      _id?: string;
      id?: string;
      classSection: string;
      groupId: string;
      school: string;
    }

    const sectionsWithGroupId = sectionsResponse.items
      .filter((s): s is SectionWithGroupId & typeof s => Boolean(s.groupId))
      .map(s => ({
        id: String(s._id || s.id),
        classSection: String(s.classSection),
        groupId: String(s.groupId),
        school: String(s.school)
      }));

    // Optionally filter by provided section IDs
    const sectionsToSync = options.sectionIds
      ? sectionsWithGroupId.filter(s => options.sectionIds!.includes(s.id))
      : sectionsWithGroupId;

    console.log(`📊 Found ${sectionsToSync.length} sections with groupId to sync`);
    result.totalSections = sectionsToSync.length;

    if (sectionsToSync.length === 0) {
      result.success = true;
      result.errors.push('No sections found with groupId configured');
      return result;
    }

    // Step 2: Sync each section
    for (const section of sectionsToSync) {
      console.log(`\n📚 Syncing ${section.school} - ${section.classSection}...`);

      try {
        const syncResult = await syncSectionAttendance(
          section.groupId,
          section.classSection,
          { startDate }
        );

        result.sectionResults.push(syncResult);

        if (syncResult.success) {
          result.sectionsProcessed++;
          result.totalRecords += syncResult.totalProcessed;
          result.created += syncResult.created;
          result.updated += syncResult.updated;
          result.notTracked += syncResult.notTracked;
          console.log(`  ✓ ${syncResult.totalProcessed} records (${syncResult.created} new, ${syncResult.updated} updated)`);
        } else {
          result.sectionsFailed++;
          const errorMsg = `${section.classSection}: ${syncResult.error || 'Unknown error'}`;
          result.errors.push(errorMsg);
          console.error(`  ✗ ${syncResult.error || 'Failed'}`);
        }
      } catch (err) {
        result.sectionsFailed++;
        const errorMsg = `${section.classSection}: ${err instanceof Error ? err.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        result.sectionResults.push({
          success: false,
          section: section.classSection,
          groupId: section.groupId,
          totalProcessed: 0,
          created: 0,
          updated: 0,
          notTracked: 0,
          error: errorMsg
        });
        console.error(`  ✗ ${errorMsg}`);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Attendance sync completed in ${duration}s`);
    console.log(`   Sections processed: ${result.sectionsProcessed}/${result.totalSections}`);
    console.log(`   Sections failed: ${result.sectionsFailed}`);
    console.log(`   Total records: ${result.totalRecords}`);
    console.log(`   Created: ${result.created}`);
    console.log(`   Updated: ${result.updated}`);
    console.log(`   Not tracked: ${result.notTracked}`);

    result.success = result.sectionsFailed === 0;
    return result;

  } catch (error) {
    result.errors.push(`Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('💥 Fatal error during attendance sync:', error);
    return result;
  }
}
