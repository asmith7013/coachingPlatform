"use server";

/**
 * Scheduled action to sync current units from Podsie
 *
 * This action is designed to be called from GitHub Actions on a schedule.
 * It syncs all assignments in the current unit for all active sections.
 */

import { getAllSectionConfigs } from "@/app/actions/313/section-overview";
import { getAssignmentContent } from "@/app/actions/313/section-config";
import { syncSectionRampUpProgress } from "@/app/actions/313/podsie-sync";
import { getCurrentUnitsForAllSections } from "@/app/actions/calendar/current-unit";
import type { AssignmentContent } from "@zod-schema/313/podsie/section-config";

const SCHOOL_YEAR = "2025-2026";

// =====================================
// TYPES
// =====================================

export interface SyncCurrentUnitsResult {
  success: boolean;
  totalSections: number;
  totalAssignments: number;
  totalActivities: number;
  successfulSyncs: number;
  failedSyncs: number;
  errors: string[];
  sectionResults: SectionSyncResult[];
}

interface SectionSyncResult {
  school: string;
  classSection: string;
  currentUnit: number | null;
  assignmentsProcessed: number;
  activitiesSynced: number;
  activitiesFailed: number;
  errors: string[];
}

// =====================================
// SYNC SINGLE ASSIGNMENT
// =====================================

async function syncAssignment(
  classSection: string,
  assignment: AssignmentContent
): Promise<{ success: number; failed: number; errors: string[] }> {
  const activities = assignment.podsieActivities || [];
  if (activities.length === 0) {
    console.log(`  [Skip] ${assignment.lessonName}: No podsie activities`);
    return { success: 0, failed: 0, errors: [] };
  }

  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const activity of activities) {
    const activityTypeLabel =
      activity.activityType === 'mastery-check' ? 'Mastery Check' :
      activity.activityType === 'assessment' ? 'Assessment' :
      'Sidekick';

    // Validate required data before sync
    const rootQuestions = activity.podsieQuestionMap
      ?.filter(q => q.isRoot !== false) || [];

    const baseQuestionIds = rootQuestions.length > 0
      ? rootQuestions.map(q => Number(q.questionId))
      : [];

    if (baseQuestionIds.length === 0) {
      const errorMsg = `${assignment.lessonName} (${activityTypeLabel}): Empty question map`;
      console.warn(`  [Skip] ${classSection} - ${errorMsg}`);
      errors.push(errorMsg);
      failed++;
      continue;
    }

    // Build questionIdToNumber map
    const questionIdToNumber: { [questionId: string]: number } = {};
    rootQuestions.forEach(q => {
      questionIdToNumber[q.questionId] = q.questionNumber;
    });

    if (!activity.podsieAssignmentId) {
      const errorMsg = `${assignment.lessonName} (${activityTypeLabel}): Missing podsieAssignmentId`;
      console.warn(`  [Skip] ${classSection} - ${errorMsg}`);
      errors.push(errorMsg);
      failed++;
      continue;
    }

    try {
      const parts = assignment.unitLessonId.split('.');
      const unitCode = `${assignment.grade}.${parts[0]}`;

      console.log(`  [Sync] ${assignment.unitLessonId} - ${activityTypeLabel}: ${baseQuestionIds.length} questions`);

      const result = await syncSectionRampUpProgress(
        classSection,
        assignment.scopeAndSequenceId,
        activity.podsieAssignmentId,
        unitCode,
        assignment.unitLessonId,
        activity.totalQuestions || 0,
        {
          baseQuestionIds,
          questionIdToNumber: Object.keys(questionIdToNumber).length > 0 ? questionIdToNumber : undefined,
          variations: activity.variations ?? 3,
          q1HasVariations: activity.q1HasVariations ?? false,
          activityType: activity.activityType
        }
      );

      if (result.success) {
        console.log(`    ✓ ${result.successfulSyncs}/${result.totalStudents} students synced`);
        success++;
      } else {
        const errorMsg = `${assignment.lessonName} (${activityTypeLabel}): ${result.error || `${result.failedSyncs} students failed`}`;
        console.error(`    ✗ ${errorMsg}`);
        errors.push(errorMsg);
        failed++;
      }
    } catch (err) {
      const errorMsg = `${assignment.lessonName} (${activityTypeLabel}): ${err instanceof Error ? err.message : 'Unknown error'}`;
      console.error(`    ✗ ${errorMsg}`, err);
      errors.push(errorMsg);
      failed++;
    }
  }

  return { success, failed, errors };
}

// =====================================
// MAIN SYNC FUNCTION
// =====================================

/**
 * Sync current units for all active sections
 * This is the main entry point for the scheduled sync
 */
export async function syncCurrentUnits(): Promise<SyncCurrentUnitsResult> {
  console.log('🚀 Starting current units sync...');
  const startTime = Date.now();

  const result: SyncCurrentUnitsResult = {
    success: false,
    totalSections: 0,
    totalAssignments: 0,
    totalActivities: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    errors: [],
    sectionResults: []
  };

  try {
    // Step 1: Load all sections and current units
    console.log('\n📋 Loading sections and current units...');
    const [sectionsResult, currentUnitsResult] = await Promise.all([
      getAllSectionConfigs(),
      getCurrentUnitsForAllSections(SCHOOL_YEAR)
    ]);

    if (!sectionsResult.success || !sectionsResult.data) {
      result.errors.push('Failed to load sections: ' + ('error' in sectionsResult ? sectionsResult.error : 'Unknown error'));
      return result;
    }

    if (!currentUnitsResult.success || !currentUnitsResult.data) {
      result.errors.push('Failed to load current units: ' + ('error' in currentUnitsResult ? currentUnitsResult.error : 'Unknown error'));
      return result;
    }

    // Build lookup map for sections
    interface SectionInfo {
      id: string;
      school: string;
      classSection: string;
      gradeLevel: string;
    }
    const sectionMap = new Map<string, SectionInfo>();
    sectionsResult.data.forEach((schoolGroup) => {
      schoolGroup.sections.forEach((section) => {
        const key = `${schoolGroup.school}|${section.classSection}`;
        sectionMap.set(key, {
          id: section.id,
          school: schoolGroup.school,
          classSection: section.classSection,
          gradeLevel: section.gradeLevel
        });
      });
    });

    // Filter to sections that have current units
    const sectionsWithCurrentUnits = currentUnitsResult.data.filter(cu => cu.currentUnit !== null);
    console.log(`📊 Found ${sectionsWithCurrentUnits.length} sections with active current units`);

    if (sectionsWithCurrentUnits.length === 0) {
      result.success = true;
      result.errors.push('No sections have current units scheduled for today');
      return result;
    }

    // Step 2: Load assignment content for each section and sync
    for (const currentUnitInfo of sectionsWithCurrentUnits) {
      const sectionKey = `${currentUnitInfo.school}|${currentUnitInfo.classSection}`;
      const sectionInfo = sectionMap.get(sectionKey);

      if (!sectionInfo) {
        console.warn(`⚠️ Section not found: ${sectionKey}`);
        continue;
      }

      console.log(`\n📚 Processing ${currentUnitInfo.school} - ${currentUnitInfo.classSection} (Unit ${currentUnitInfo.currentUnit})`);

      const sectionResult: SectionSyncResult = {
        school: currentUnitInfo.school,
        classSection: currentUnitInfo.classSection,
        currentUnit: currentUnitInfo.currentUnit,
        assignmentsProcessed: 0,
        activitiesSynced: 0,
        activitiesFailed: 0,
        errors: []
      };

      try {
        // Load assignment content
        const contentResult = await getAssignmentContent(currentUnitInfo.school, currentUnitInfo.classSection);

        if (!contentResult.success || !contentResult.data) {
          sectionResult.errors.push('Failed to load assignment content');
          result.sectionResults.push(sectionResult);
          continue;
        }

        // Filter assignments to current unit only
        const currentUnitAssignments = contentResult.data.filter(a => {
          const parts = a.unitLessonId.split('.');
          const unitNum = parseInt(parts[0]);
          return unitNum === currentUnitInfo.currentUnit;
        });

        console.log(`  Found ${currentUnitAssignments.length} assignments in Unit ${currentUnitInfo.currentUnit}`);
        result.totalSections++;
        result.totalAssignments += currentUnitAssignments.length;

        // Sync each assignment
        for (const assignment of currentUnitAssignments) {
          const syncResult = await syncAssignment(currentUnitInfo.classSection, assignment);

          sectionResult.assignmentsProcessed++;
          sectionResult.activitiesSynced += syncResult.success;
          sectionResult.activitiesFailed += syncResult.failed;
          sectionResult.errors.push(...syncResult.errors);

          result.totalActivities += syncResult.success + syncResult.failed;
          result.successfulSyncs += syncResult.success;
          result.failedSyncs += syncResult.failed;
        }
      } catch (err) {
        const errorMsg = `Error processing section: ${err instanceof Error ? err.message : 'Unknown error'}`;
        sectionResult.errors.push(errorMsg);
        result.errors.push(`${currentUnitInfo.classSection}: ${errorMsg}`);
      }

      result.sectionResults.push(sectionResult);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Sync completed in ${duration}s`);
    console.log(`   Sections: ${result.totalSections}`);
    console.log(`   Assignments: ${result.totalAssignments}`);
    console.log(`   Activities synced: ${result.successfulSyncs}`);
    console.log(`   Activities failed: ${result.failedSyncs}`);

    result.success = result.failedSyncs === 0;
    return result;

  } catch (error) {
    result.errors.push(`Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('💥 Fatal error during sync:', error);
    return result;
  }
}
