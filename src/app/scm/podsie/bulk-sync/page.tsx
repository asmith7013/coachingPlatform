"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/24/solid";
import { useToast } from "@/components/core/feedback/Toast";
import { Spinner } from "@/components/core/feedback/Spinner";
import { getAllSectionConfigs } from "@/app/actions/scm/section-overview";
import { getAssignmentContent } from "@actions/scm/section-config";
import { syncSectionRampUpProgress } from "@actions/scm/podsie-sync";
import { getCurrentUnitsForAllSections, type CurrentUnitInfo } from "@/app/actions/calendar/current-unit";
import type { AssignmentContent } from "@zod-schema/scm/podsie/section-config";
import { MultiSectionSelector } from "./components";
import { getSectionColors } from "@/hooks/scm";

interface SectionOption {
  id: string;
  school: string;
  classSection: string;
  teacher?: string;
  gradeLevel: string;
  displayName: string;
}

interface UnitGroup {
  unitNumber: number;
  unitName: string;
  assignments: AssignmentContent[];
}

interface SectionWithUnits {
  classSection: string;
  school: string;
  teacher?: string;
  gradeLevel: string;
  assignments: AssignmentContent[];
  unitGroups: UnitGroup[];
}

interface SyncProgress {
  totalAssignments: number;
  completedAssignments: number;
  currentSchool: string;
  currentSection: string;
  currentUnit: number;
  currentUnitLessonId: string;
  currentLesson: string;
  currentActivity: string;
}

const SCHOOL_YEAR = "2025-2026";

export default function BulkSyncPage() {
  const [sectionOptions, setSectionOptions] = useState<SectionOption[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [sectionsData, setSectionsData] = useState<Map<string, SectionWithUnits>>(new Map());
  const [currentUnits, setCurrentUnits] = useState<CurrentUnitInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [sectionColors, setSectionColors] = useState<Map<string, string>>(new Map());

  // Toast instances for live progress tracking
  const progressToast = useToast();
  const resultToast = useToast();

  // Load sections on mount
  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    setLoading(true);
    try {
      // Load sections and current units in parallel
      const [sectionsResult, currentUnitsResult] = await Promise.all([
        getAllSectionConfigs(),
        getCurrentUnitsForAllSections(SCHOOL_YEAR)
      ]);

      if (sectionsResult.success && sectionsResult.data) {
        const options: SectionOption[] = [];
        sectionsResult.data.forEach((schoolGroup) => {
          schoolGroup.sections.forEach((section) => {
            options.push({
              id: section.id,
              school: schoolGroup.school,
              classSection: section.classSection,
              teacher: section.teacher,
              gradeLevel: section.gradeLevel,
              displayName: section.teacher ? `${section.classSection} (${section.teacher})` : section.classSection,
            });
          });
        });
        setSectionOptions(options);

        // No sections selected by default
        setSelectedSections([]);

        // Compute colors for all sections
        const colors = getSectionColors(options);
        setSectionColors(colors);
      }

      if (currentUnitsResult.success && currentUnitsResult.data) {
        setCurrentUnits(currentUnitsResult.data);
      }
    } catch (err) {
      console.error("Error loading sections:", err);
      setError("Failed to load sections");
    } finally {
      setLoading(false);
    }
  };

  // Toggle section selection
  const handleToggleSection = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Load assignments for selected sections
  const loadSelectedSections = useCallback(async () => {
    if (selectedSections.length === 0) {
      setSectionsData(new Map());
      return;
    }

    setLoading(true);
    setError(null);
    const newSectionsData = new Map<string, SectionWithUnits>();

    try {
      // Get the actual section objects for selected IDs
      const sectionsToLoad = sectionOptions.filter(opt => selectedSections.includes(opt.id));

      // Load assignments for each selected section
      for (const section of sectionsToLoad) {
        const result = await getAssignmentContent(section.school, section.classSection);
        if (result.success && result.data) {
          const assignments = result.data;

          // Group assignments by unit
          const unitGroupsMap = new Map<number, UnitGroup>();
          assignments.forEach((assignment) => {
            const parts = assignment.unitLessonId.split('.');
            const unitNumber = parseInt(parts[0]);
            if (!unitGroupsMap.has(unitNumber)) {
              unitGroupsMap.set(unitNumber, {
                unitNumber,
                unitName: `Unit ${unitNumber}`,
                assignments: []
              });
            }
            unitGroupsMap.get(unitNumber)!.assignments.push(assignment);
          });

          const unitGroups = Array.from(unitGroupsMap.values()).sort((a, b) => a.unitNumber - b.unitNumber);

          newSectionsData.set(section.id, {
            classSection: section.classSection,
            school: section.school,
            teacher: section.teacher,
            gradeLevel: section.gradeLevel,
            assignments,
            unitGroups
          });
        }
      }

      setSectionsData(newSectionsData);
    } catch (err) {
      console.error("Error loading sections:", err);
      setError("Failed to load section assignments");
    } finally {
      setLoading(false);
    }
  }, [selectedSections, sectionOptions]);

  // Load sections when selection changes
  useEffect(() => {
    loadSelectedSections();
  }, [selectedSections, loadSelectedSections]);

  // Sync a single assignment - returns { success, failed, errors }
  const syncAssignment = async (
    section: string,
    assignment: AssignmentContent,
    onProgress?: (lesson: string, activity: string) => void
  ): Promise<{ success: number; failed: number; errors: string[] }> => {
    const activities = assignment.podsieActivities || [];
    if (activities.length === 0) {
      console.warn(`[Sync] Skipping ${assignment.lessonName}: No podsie activities`);
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

      // Update progress callback
      if (onProgress) {
        onProgress(assignment.lessonName, activityTypeLabel);
      }

      // Validate required data before sync
      const rootQuestions = activity.podsieQuestionMap
        ?.filter(q => q.isRoot !== false) || [];

      const baseQuestionIds = rootQuestions.length > 0
        ? rootQuestions.map(q => Number(q.questionId))
        : [];

      if (baseQuestionIds.length === 0) {
        const errorMsg = `${assignment.lessonName} (${activityTypeLabel}): Empty question map`;
        console.warn(`[Sync] Skipping ${section} - ${errorMsg}`);
        errors.push(errorMsg);
        failed++;
        continue;
      }

      // Build questionIdToNumber map: questionId -> actual questionNumber
      // This ensures sync stores data at correct positions (e.g., 1, 2, 4, 6... not 1, 2, 3, 4...)
      const questionIdToNumber: { [questionId: string]: number } = {};
      rootQuestions.forEach(q => {
        questionIdToNumber[q.questionId] = q.questionNumber;
      });

      if (!activity.podsieAssignmentId) {
        const errorMsg = `${assignment.lessonName} (${activityTypeLabel}): Missing podsieAssignmentId`;
        console.warn(`[Sync] Skipping ${section} - ${errorMsg}`);
        errors.push(errorMsg);
        failed++;
        continue;
      }

      try {
        const parts = assignment.unitLessonId.split('.');
        const unitCode = `${assignment.grade}.${parts[0]}`;

        console.log(`[Sync] ${section} - ${assignment.lessonName} (${activityTypeLabel}): ${baseQuestionIds.length} questions, assignment ${activity.podsieAssignmentId}`);

        const result = await syncSectionRampUpProgress(
          section,
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
          console.log(`[Sync] ${section} - ${assignment.lessonName}: ${result.successfulSyncs}/${result.totalStudents} students synced`);
          success++;
        } else {
          const errorMsg = `${assignment.lessonName} (${activityTypeLabel}): ${result.error || `${result.failedSyncs} students failed`}`;
          console.error(`[Sync] ${section} - ${errorMsg}`);
          errors.push(errorMsg);
          failed++;
        }
      } catch (err) {
        const errorMsg = `${assignment.lessonName} (${activityTypeLabel}): ${err instanceof Error ? err.message : 'Unknown error'}`;
        console.error(`[Sync] ${section} - ${errorMsg}`, err);
        errors.push(errorMsg);
        failed++;
      }
    }

    return { success, failed, errors };
  };

  // Sync all selected sections
  const syncAllSections = async () => {
    if (sectionsData.size === 0) return;

    setSyncing(true);

    // Calculate total assignments across all sections
    let totalAssignments = 0;
    sectionsData.forEach(sectionData => {
      totalAssignments += sectionData.assignments.length;
    });

    let completedAssignments = 0;
    let totalSuccess = 0;
    let totalFailed = 0;
    const allErrors: string[] = [];

    // Show initial progress toast
    progressToast.showToast({
      title: "Syncing All Sections",
      description: `Starting sync for ${sectionsData.size} section${sectionsData.size !== 1 ? 's' : ''}...`,
      variant: "info",
      icon: InformationCircleIcon,
    });

    try {
      // Iterate through each section
      for (const [sectionId, sectionData] of sectionsData) {
        const section = sectionOptions.find(opt => opt.id === sectionId);
        if (!section) continue;

        // Iterate through each assignment in the section
        for (const assignment of sectionData.assignments) {
          // Extract unit number from unitLessonId (e.g., "1.01" -> unit 1)
          const parts = assignment.unitLessonId.split('.');
          const unitNumber = parseInt(parts[0]);

          // Update progress state
          setSyncProgress({
            totalAssignments,
            completedAssignments,
            currentSchool: section.school,
            currentSection: section.classSection,
            currentUnit: unitNumber,
            currentUnitLessonId: assignment.unitLessonId,
            currentLesson: assignment.lessonName,
            currentActivity: ''
          });

          // Update progress toast
          progressToast.showToast({
            title: `Syncing All Sections (${completedAssignments}/${totalAssignments})`,
            description: `${section.school} - ${section.classSection} | Lesson: ${assignment.lessonName}`,
            variant: "info",
            icon: InformationCircleIcon,
          });

          // Sync the assignment and collect results
          const result = await syncAssignment(section.classSection, assignment, (lesson, activity) => {
            setSyncProgress(prev => prev ? {
              ...prev,
              currentLesson: lesson,
              currentActivity: activity
            } : null);
          });

          totalSuccess += result.success;
          totalFailed += result.failed;
          allErrors.push(...result.errors.map(e => `${section.classSection}: ${e}`));

          completedAssignments++;
        }
      }

      // Hide progress toast
      progressToast.hideToast();

      // Show result toast with error summary if any
      if (allErrors.length > 0) {
        console.error("[Sync] Errors:", allErrors);
        resultToast.showToast({
          title: "Sync Complete with Errors",
          description: `${totalSuccess} activities synced, ${totalFailed} failed. Check console for details.`,
          variant: "warning",
          icon: ExclamationTriangleIcon,
        });
      } else {
        resultToast.showToast({
          title: "Sync Complete!",
          description: `Successfully synced ${totalSuccess} activities across ${sectionsData.size} section${sectionsData.size !== 1 ? 's' : ''}`,
          variant: "success",
          icon: CheckCircleIcon,
        });
      }
    } catch (err) {
      console.error("Error syncing sections:", err);
      progressToast.hideToast();
      resultToast.showToast({
        title: "Sync Failed",
        description: "An error occurred while syncing",
        variant: "error",
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setSyncing(false);
      setSyncProgress(null);
    }
  };

  // Sync a single section
  const syncSection = async (sectionId: string) => {
    const sectionData = sectionsData.get(sectionId);
    const section = sectionOptions.find(opt => opt.id === sectionId);
    if (!sectionData || !section) return;

    setSyncing(true);

    const totalAssignments = sectionData.assignments.length;
    let completedAssignments = 0;
    let totalSuccess = 0;
    let totalFailed = 0;
    const allErrors: string[] = [];

    // Show initial progress toast
    progressToast.showToast({
      title: "Syncing Section Progress",
      description: `Starting sync for ${section.classSection}...`,
      variant: "info",
      icon: InformationCircleIcon,
    });

    try {
      for (const assignment of sectionData.assignments) {
        // Extract unit number from unitLessonId (e.g., "1.01" -> unit 1)
        const parts = assignment.unitLessonId.split('.');
        const unitNumber = parseInt(parts[0]);

        // Update progress state
        setSyncProgress({
          totalAssignments,
          completedAssignments,
          currentSchool: section.school,
          currentSection: section.classSection,
          currentUnit: unitNumber,
          currentUnitLessonId: assignment.unitLessonId,
          currentLesson: assignment.lessonName,
          currentActivity: ''
        });

        // Update progress toast
        progressToast.showToast({
          title: `Syncing ${section.classSection} (${completedAssignments}/${totalAssignments})`,
          description: `Lesson: ${assignment.lessonName}`,
          variant: "info",
          icon: InformationCircleIcon,
        });

        const result = await syncAssignment(section.classSection, assignment, (lesson, activity) => {
          setSyncProgress(prev => prev ? {
            ...prev,
            currentLesson: lesson,
            currentActivity: activity
          } : null);
        });

        totalSuccess += result.success;
        totalFailed += result.failed;
        allErrors.push(...result.errors);

        completedAssignments++;
      }

      // Hide progress toast
      progressToast.hideToast();

      // Show result toast with error summary if any
      if (allErrors.length > 0) {
        console.error(`[Sync] ${section.classSection} Errors:`, allErrors);
        resultToast.showToast({
          title: "Section Sync Complete with Errors",
          description: `${totalSuccess} activities synced, ${totalFailed} failed. Check console for details.`,
          variant: "warning",
          icon: ExclamationTriangleIcon,
        });
      } else {
        resultToast.showToast({
          title: "Section Sync Complete!",
          description: `Successfully synced ${totalSuccess} activities for ${section.classSection}`,
          variant: "success",
          icon: CheckCircleIcon,
        });
      }
    } catch (err) {
      console.error("Error syncing section:", err);
      progressToast.hideToast();
      resultToast.showToast({
        title: "Section Sync Failed",
        description: `An error occurred while syncing ${section.classSection}`,
        variant: "error",
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setSyncing(false);
      setSyncProgress(null);
    }
  };

  // Sync a single unit within a section
  const syncUnit = async (sectionId: string, unitNumber: number) => {
    const sectionData = sectionsData.get(sectionId);
    const section = sectionOptions.find(opt => opt.id === sectionId);
    if (!sectionData || !section) return;

    const unitAssignments = sectionData.assignments.filter(a => {
      const parts = a.unitLessonId.split('.');
      const num = parseInt(parts[0]);
      return num === unitNumber;
    });

    setSyncing(true);

    const totalAssignments = unitAssignments.length;
    let completedAssignments = 0;
    let totalSuccess = 0;
    let totalFailed = 0;
    const allErrors: string[] = [];

    // Show initial progress toast
    progressToast.showToast({
      title: "Syncing Unit Progress",
      description: `Starting sync for Unit ${unitNumber}...`,
      variant: "info",
      icon: InformationCircleIcon,
    });

    try {
      for (const assignment of unitAssignments) {
        // Update progress state
        setSyncProgress({
          totalAssignments,
          completedAssignments,
          currentSchool: section.school,
          currentSection: section.classSection,
          currentUnit: unitNumber,
          currentUnitLessonId: assignment.unitLessonId,
          currentLesson: assignment.lessonName,
          currentActivity: ''
        });

        // Update progress toast
        progressToast.showToast({
          title: `Syncing Unit ${unitNumber} - ${section.classSection} (${completedAssignments}/${totalAssignments})`,
          description: `Lesson: ${assignment.lessonName}`,
          variant: "info",
          icon: InformationCircleIcon,
        });

        const result = await syncAssignment(section.classSection, assignment, (lesson, activity) => {
          setSyncProgress(prev => prev ? {
            ...prev,
            currentLesson: lesson,
            currentActivity: activity
          } : null);
        });

        totalSuccess += result.success;
        totalFailed += result.failed;
        allErrors.push(...result.errors);

        completedAssignments++;
      }

      // Hide progress toast
      progressToast.hideToast();

      // Show result toast with error summary if any
      if (allErrors.length > 0) {
        console.error(`[Sync] Unit ${unitNumber} Errors:`, allErrors);
        resultToast.showToast({
          title: "Unit Sync Complete with Errors",
          description: `${totalSuccess} activities synced, ${totalFailed} failed. Check console for details.`,
          variant: "warning",
          icon: ExclamationTriangleIcon,
        });
      } else {
        resultToast.showToast({
          title: "Unit Sync Complete!",
          description: `Successfully synced ${totalSuccess} activities in Unit ${unitNumber}`,
          variant: "success",
          icon: CheckCircleIcon,
        });
      }
    } catch (err) {
      console.error("Error syncing unit:", err);
      progressToast.hideToast();
      resultToast.showToast({
        title: "Unit Sync Failed",
        description: `An error occurred while syncing Unit ${unitNumber}`,
        variant: "error",
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setSyncing(false);
      setSyncProgress(null);
    }
  };

  // Sync a specific lesson section (Ramp Up, A, B, C, D) within a unit for a class section
  const syncLessonSection = async (sectionId: string, unitNumber: number, lessonSection: string) => {
    const sectionData = sectionsData.get(sectionId);
    const section = sectionOptions.find(opt => opt.id === sectionId);
    if (!sectionData || !section) return;

    const lessonSectionAssignments = sectionData.assignments.filter(a => {
      const parts = a.unitLessonId.split('.');
      const num = parseInt(parts[0]);
      return num === unitNumber && (a.section || 'Unknown') === lessonSection;
    });

    if (lessonSectionAssignments.length === 0) return;

    setSyncing(true);

    const totalAssignments = lessonSectionAssignments.length;
    let completedAssignments = 0;
    let totalSuccess = 0;
    let totalFailed = 0;
    const allErrors: string[] = [];

    const sectionLabel = lessonSection === 'Ramp Ups' ? 'Ramp Up' : `Section ${lessonSection}`;

    // Show initial progress toast
    progressToast.showToast({
      title: `Syncing ${sectionLabel}`,
      description: `Starting sync for Unit ${unitNumber} ${sectionLabel}...`,
      variant: "info",
      icon: InformationCircleIcon,
    });

    try {
      for (const assignment of lessonSectionAssignments) {
        // Update progress state
        setSyncProgress({
          totalAssignments,
          completedAssignments,
          currentSchool: section.school,
          currentSection: section.classSection,
          currentUnit: unitNumber,
          currentUnitLessonId: assignment.unitLessonId,
          currentLesson: assignment.lessonName,
          currentActivity: ''
        });

        // Update progress toast
        progressToast.showToast({
          title: `Syncing ${sectionLabel} - ${section.classSection} (${completedAssignments}/${totalAssignments})`,
          description: `Lesson: ${assignment.lessonName}`,
          variant: "info",
          icon: InformationCircleIcon,
        });

        const result = await syncAssignment(section.classSection, assignment, (lesson, activity) => {
          setSyncProgress(prev => prev ? {
            ...prev,
            currentLesson: lesson,
            currentActivity: activity
          } : null);
        });

        totalSuccess += result.success;
        totalFailed += result.failed;
        allErrors.push(...result.errors);

        completedAssignments++;
      }

      // Hide progress toast
      progressToast.hideToast();

      // Show result toast with error summary if any
      if (allErrors.length > 0) {
        console.error(`[Sync] ${sectionLabel} Errors:`, allErrors);
        resultToast.showToast({
          title: `${sectionLabel} Sync Complete with Errors`,
          description: `${totalSuccess} activities synced, ${totalFailed} failed. Check console for details.`,
          variant: "warning",
          icon: ExclamationTriangleIcon,
        });
      } else {
        resultToast.showToast({
          title: `${sectionLabel} Sync Complete!`,
          description: `Successfully synced ${totalSuccess} activities in Unit ${unitNumber} ${sectionLabel}`,
          variant: "success",
          icon: CheckCircleIcon,
        });
      }
    } catch (err) {
      console.error("Error syncing lesson section:", err);
      progressToast.hideToast();
      resultToast.showToast({
        title: `${sectionLabel} Sync Failed`,
        description: `An error occurred while syncing Unit ${unitNumber} ${sectionLabel}`,
        variant: "error",
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setSyncing(false);
      setSyncProgress(null);
    }
  };

  // Get current units for selected sections only
  const selectedCurrentUnits = currentUnits.filter(cu => {
    const sectionOpt = sectionOptions.find(
      opt => opt.school === cu.school && opt.classSection === cu.classSection
    );
    return sectionOpt && selectedSections.includes(sectionOpt.id);
  });

  // Sync only the current unit for each selected section
  const syncCurrentUnits = async () => {
    if (selectedCurrentUnits.length === 0) return;

    setSyncing(true);

    // Calculate total assignments across all current units
    let totalAssignments = 0;
    const sectionsToSync: Array<{
      sectionOpt: SectionOption;
      sectionData: SectionWithUnits;
      currentUnitInfo: CurrentUnitInfo;
      unitAssignments: AssignmentContent[];
    }> = [];

    for (const cu of selectedCurrentUnits) {
      if (cu.currentUnit === null) continue;

      const sectionOpt = sectionOptions.find(
        opt => opt.school === cu.school && opt.classSection === cu.classSection
      );
      if (!sectionOpt) continue;

      const sectionData = sectionsData.get(sectionOpt.id);
      if (!sectionData) continue;

      // Filter assignments to only include those in the current unit
      const unitAssignments = sectionData.assignments.filter(a => {
        const parts = a.unitLessonId.split('.');
        const unitNum = parseInt(parts[0]);
        return unitNum === cu.currentUnit;
      });

      if (unitAssignments.length > 0) {
        sectionsToSync.push({ sectionOpt, sectionData, currentUnitInfo: cu, unitAssignments });
        totalAssignments += unitAssignments.length;
      }
    }

    if (totalAssignments === 0) {
      resultToast.showToast({
        title: "No Assignments",
        description: "No assignments found in current units for selected sections",
        variant: "info",
        icon: InformationCircleIcon,
      });
      setSyncing(false);
      return;
    }

    let completedAssignments = 0;
    let totalSuccess = 0;
    let totalFailed = 0;
    const allErrors: string[] = [];

    progressToast.showToast({
      title: "Syncing Current Units",
      description: `Starting sync for ${sectionsToSync.length} section${sectionsToSync.length !== 1 ? 's' : ''}...`,
      variant: "info",
      icon: InformationCircleIcon,
    });

    try {
      for (const { sectionOpt, currentUnitInfo, unitAssignments } of sectionsToSync) {
        for (const assignment of unitAssignments) {
          const parts = assignment.unitLessonId.split('.');
          const unitNumber = parseInt(parts[0]);

          setSyncProgress({
            totalAssignments,
            completedAssignments,
            currentSchool: sectionOpt.school,
            currentSection: sectionOpt.classSection,
            currentUnit: unitNumber,
            currentUnitLessonId: assignment.unitLessonId,
            currentLesson: assignment.lessonName,
            currentActivity: ''
          });

          progressToast.showToast({
            title: `Syncing Current Units (${completedAssignments}/${totalAssignments})`,
            description: `${sectionOpt.classSection} Unit ${currentUnitInfo.currentUnit} | ${assignment.lessonName}`,
            variant: "info",
            icon: InformationCircleIcon,
          });

          const result = await syncAssignment(sectionOpt.classSection, assignment, (lesson, activity) => {
            setSyncProgress(prev => prev ? {
              ...prev,
              currentLesson: lesson,
              currentActivity: activity
            } : null);
          });

          totalSuccess += result.success;
          totalFailed += result.failed;
          allErrors.push(...result.errors.map(e => `${sectionOpt.classSection}: ${e}`));

          completedAssignments++;
        }
      }

      progressToast.hideToast();

      // Show result toast with error summary if any
      if (allErrors.length > 0) {
        console.error("[Sync] Current Units Errors:", allErrors);
        resultToast.showToast({
          title: "Current Units Sync Complete with Errors",
          description: `${totalSuccess} activities synced, ${totalFailed} failed. Check console for details.`,
          variant: "warning",
          icon: ExclamationTriangleIcon,
        });
      } else {
        resultToast.showToast({
          title: "Current Units Sync Complete!",
          description: `Successfully synced ${totalSuccess} activities across ${sectionsToSync.length} section${sectionsToSync.length !== 1 ? 's' : ''}`,
          variant: "success",
          icon: CheckCircleIcon,
        });
      }
    } catch (err) {
      console.error("Error syncing current units:", err);
      progressToast.hideToast();
      resultToast.showToast({
        title: "Sync Failed",
        description: "An error occurred while syncing current units",
        variant: "error",
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setSyncing(false);
      setSyncProgress(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Toast Components */}
        <progressToast.ToastComponent />
        <resultToast.ToastComponent />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Sync</h1>
              <p className="text-gray-600">Sync assignments across selected sections</p>
            </div>
            {/* Sync All Button */}
            {sectionsData.size > 0 && (
              <button
                onClick={syncAllSections}
                disabled={syncing}
                className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                  syncing
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                }`}
              >
                <ArrowPathIcon className={`w-5 h-5 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing..." : "Sync All Selected"}
              </button>
            )}
          </div>
        </div>

        {/* Section Selection */}
        <MultiSectionSelector
          sections={sectionOptions}
          selectedSections={selectedSections}
          onToggle={handleToggleSection}
          sectionColors={sectionColors}
        />

        {/* Current Units Card - shows only when sections are selected and have assignments loaded */}
        {selectedSections.length > 0 && sectionsData.size > 0 && selectedCurrentUnits.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg shadow p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-900 mb-2">Current Units by Section</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedCurrentUnits.map((cu) => {
                    const sectionOpt = sectionOptions.find(
                      opt => opt.school === cu.school && opt.classSection === cu.classSection
                    );
                    const color = sectionOpt ? sectionColors.get(sectionOpt.id) : '#6B7280';
                    return (
                      <div
                        key={`${cu.school}-${cu.classSection}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-amber-200 shadow-sm"
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-medium text-gray-900">{cu.classSection}</span>
                        <span className="text-gray-400">→</span>
                        {cu.currentUnit !== null ? (
                          <span className="text-amber-700 font-semibold">Unit {cu.currentUnit}</span>
                        ) : (
                          <span className="text-gray-400 italic text-sm">No schedule</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={syncCurrentUnits}
                disabled={syncing || selectedCurrentUnits.every(cu => cu.currentUnit === null)}
                className={`ml-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
                  syncing || selectedCurrentUnits.every(cu => cu.currentUnit === null)
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-amber-600 text-white hover:bg-amber-700 cursor-pointer"
                }`}
              >
                <ArrowPathIcon className={`w-5 h-5 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing..." : "Sync Current Units"}
              </button>
            </div>
          </div>
        )}

        {/* Sync Progress Card */}
        {syncing && syncProgress && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Sync Progress</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {syncProgress.currentSchool} - {syncProgress.currentSection}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {syncProgress.completedAssignments} / {syncProgress.totalAssignments}
                  </div>
                  <div className="text-xs text-gray-600">
                    {Math.round((syncProgress.completedAssignments / syncProgress.totalAssignments) * 100)}% Complete
                  </div>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                  style={{ width: `${(syncProgress.completedAssignments / syncProgress.totalAssignments) * 100}%` }}
                >
                  {syncProgress.completedAssignments > 0 && (
                    <span className="text-xs font-medium text-white">
                      {Math.round((syncProgress.completedAssignments / syncProgress.totalAssignments) * 100)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <div className="font-medium">Currently Syncing:</div>
                <div className="mt-1 pl-2 space-y-0.5">
                  <div><span className="font-medium">Section:</span> {syncProgress.currentSection}</div>
                  <div><span className="font-medium">Unit:</span> {syncProgress.currentUnit} (Lesson {syncProgress.currentUnitLessonId})</div>
                  <div><span className="font-medium">Lesson:</span> {syncProgress.currentLesson}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Spinner size="lg" className="mx-auto mb-2" />
            <p className="text-gray-600">Loading sections...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Sections Display - Grouped by School → Class Section → Unit → Lesson Section */}
        {!loading && sectionsData.size > 0 && (() => {
          // Group sections by school
          const sectionsBySchool = new Map<string, Array<[string, SectionWithUnits]>>();
          Array.from(sectionsData.entries()).forEach(([sectionId, sectionData]) => {
            const school = sectionData.school;
            if (!sectionsBySchool.has(school)) {
              sectionsBySchool.set(school, []);
            }
            sectionsBySchool.get(school)!.push([sectionId, sectionData]);
          });

          // Define lesson section order
          const lessonSectionOrder = ['Ramp Ups', 'A', 'B', 'C', 'D', 'E', 'F', 'Unit Assessment'];
          const getLessonSectionLabel = (section: string) => {
            if (section === 'Ramp Ups') return 'Ramp Up';
            if (section === 'Unit Assessment') return 'Unit Assessment';
            return `Section ${section}`;
          };

          // Get lesson sections for assignments in a unit
          const getLessonSections = (assignments: AssignmentContent[]) => {
            const sections = new Set<string>();
            assignments.forEach(a => sections.add(a.section || 'Unknown'));
            return lessonSectionOrder.filter(s => sections.has(s));
          };

          return (
            <div className="space-y-10">
              {Array.from(sectionsBySchool.entries()).map(([school, classSections]) => (
                <div key={school} className="space-y-6">
                  {/* School Header */}
                  <div className="bg-gray-800 text-white px-6 py-3 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold">{school}</h2>
                    <p className="text-sm text-gray-300">
                      {classSections.length} class{classSections.length !== 1 ? 'es' : ''} • {classSections.reduce((sum, [, s]) => sum + s.assignments.length, 0)} total assignments
                    </p>
                  </div>

                  {/* Class Sections within School (802, 803, etc.) */}
                  <div className="space-y-8 pl-4">
                    {classSections.map(([sectionId, sectionData]) => (
                      <div key={sectionId} className="space-y-4">
                        {/* Class Section Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-lg shadow-sm flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold">{sectionData.classSection}</h3>
                            <p className="text-sm text-blue-100">
                              {sectionData.teacher && `${sectionData.teacher} • `}
                              Grade {sectionData.gradeLevel} • {sectionData.assignments.length} assignments
                            </p>
                          </div>
                          <button
                            onClick={() => syncSection(sectionId)}
                            disabled={syncing}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              syncing
                                ? "bg-white/20 text-white/60 cursor-not-allowed"
                                : "bg-white text-blue-700 hover:bg-blue-50 cursor-pointer"
                            }`}
                          >
                            <ArrowPathIcon className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                            Sync All
                          </button>
                        </div>

                        {/* Units within Class Section */}
                        <div className="space-y-4 pl-4">
                          {sectionData.unitGroups.map((unitGroup) => (
                            <div key={unitGroup.unitNumber} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                              {/* Unit Header */}
                              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900">Unit {unitGroup.unitNumber}</h4>
                                  <p className="text-sm text-gray-600">{unitGroup.assignments.length} assignments</p>
                                </div>
                                <button
                                  onClick={() => syncUnit(sectionId, unitGroup.unitNumber)}
                                  disabled={syncing}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    syncing
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : "bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
                                  }`}
                                >
                                  <ArrowPathIcon className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                                  Sync Unit
                                </button>
                              </div>

                              {/* Lesson Sections within Unit (Ramp Up, A, B, C, D) */}
                              <div className="divide-y divide-gray-100">
                                {getLessonSections(unitGroup.assignments).map((lessonSection) => {
                                  const sectionAssignments = unitGroup.assignments.filter(a => (a.section || 'Unknown') === lessonSection);
                                  if (sectionAssignments.length === 0) return null;

                                  return (
                                    <div key={lessonSection} className="p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-semibold ${
                                            lessonSection === 'Ramp Ups' ? 'bg-amber-100 text-amber-800' :
                                            lessonSection === 'Unit Assessment' ? 'bg-red-100 text-red-800' :
                                            'bg-emerald-100 text-emerald-800'
                                          }`}>
                                            {getLessonSectionLabel(lessonSection)}
                                          </span>
                                          <span className="text-sm text-gray-500">
                                            {sectionAssignments.length} assignment{sectionAssignments.length !== 1 ? 's' : ''}
                                          </span>
                                        </div>
                                        <button
                                          onClick={() => syncLessonSection(sectionId, unitGroup.unitNumber, lessonSection)}
                                          disabled={syncing}
                                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                                            syncing
                                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                              : "bg-gray-600 text-white hover:bg-gray-700 cursor-pointer"
                                          }`}
                                        >
                                          <ArrowPathIcon className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
                                          Sync
                                        </button>
                                      </div>

                                      {/* Assignment list */}
                                      <div className="bg-gray-50 rounded-lg p-2">
                                        <div className="flex flex-wrap gap-1.5">
                                          {sectionAssignments.map((assignment, idx) => (
                                            <div
                                              key={idx}
                                              className="text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200 truncate max-w-[200px]"
                                              title={`${assignment.unitLessonId}: ${assignment.lessonName}`}
                                            >
                                              {assignment.unitLessonId}: {assignment.lessonName}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* No Sections Selected */}
        {!loading && selectedSections.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">Select sections above to view and sync assignments</p>
          </div>
        )}

        {/* Sections Selected but No Data */}
        {!loading && selectedSections.length > 0 && sectionsData.size === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">Loading assignments for selected sections...</p>
          </div>
        )}
      </div>
    </div>
  );
}
