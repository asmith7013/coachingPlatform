"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { useToast } from "@/components/core/feedback/Toast";
import { fetchRampUpProgress, syncSectionRampUpProgress } from "@/app/actions/scm/podsie/podsie-sync";
import { getSectionConfig } from "@/app/actions/scm/podsie/section-config";
import { fetchStudentsBySection } from "@/app/actions/scm/student/students";
import type { AssignmentContent } from "@zod-schema/scm/podsie/section-config";
import { AssignmentCard } from "./components/AssignmentCard";
import { SmartboardDisplay } from "./components/smartboard";
import { PacingProgressCard } from "./components/pacing";
import { CreateAssignmentModal } from "./components/CreateAssignmentModal";
import { PageHeader } from "./components/PageHeader";
import { FiltersSection } from "./components/FiltersSection";
import { ProgressOverview } from "./components/ProgressOverview";
import { LoadingState, ProgressLoadingState, NoAssignmentsState, SelectFiltersState } from "./components/EmptyStates";
import { groupAssignmentsByUnitLesson, groupAssignmentsBySection } from "./utils/groupAssignments";
import { getScopeTagForSection, getSchoolForSection, groupSectionsBySchool } from "./utils/sectionHelpers";
import { calculateSummaryStats } from "./utils/progressStats";
import { generateProgressCsv, downloadCsv, generateCsvFilename } from "./utils/exportCsv";
import { useSectionOptions } from "@/hooks/scm";
import { useUnitsAndConfig } from "./hooks/useUnitsAndConfig";
import { useLessons } from "./hooks/useLessons";
import { useProgressData } from "./hooks/useProgressData";
import { usePacingData } from "./hooks/usePacingData";
import { useLocalStorageString } from "./hooks/useLocalStorage";
import type { LessonConfig } from "./types";

// Helper to get/set per-section localStorage values
function getPerSectionValue(section: string, key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`podsieProgress_${key}_${section}`);
}

function setPerSectionValue(section: string, key: string, value: string | null) {
  if (typeof window === 'undefined') return;
  const fullKey = `podsieProgress_${key}_${section}`;
  if (value !== null && value !== '') {
    localStorage.setItem(fullKey, value);
  } else {
    localStorage.removeItem(fullKey);
  }
}

export default function PodsieProgressPage() {
  // State
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [excludeRampUps, setExcludeRampUps] = useState(false);
  const [hideEmptySections, setHideEmptySections] = useState(true);
  const { showToast, ToastComponent } = useToast();

  // LocalStorage-backed state for selected section (global)
  const [selectedSection, setSelectedSection] = useLocalStorageString('podsieProgress_selectedSection');

  // Per-section state for unit and lesson section (keyed by groupId)
  const [selectedUnit, setSelectedUnitState] = useState<number | null>(null);
  const [selectedLessonSection, setSelectedLessonSectionState] = useState<string>("");
  const [loadedGroupId, setLoadedGroupId] = useState<string | null>(null);

  // Derived state
  const scopeSequenceTag = useMemo(() => {
    return selectedSection ? getScopeTagForSection(selectedSection) : "";
  }, [selectedSection]);

  // Data hooks
  const { sections, loading: loadingSections, error: sectionsError } = useSectionOptions();
  const { units, sectionConfigAssignments, groupId, loading: loadingUnits, error: unitsError, setSectionConfigAssignments } = useUnitsAndConfig(scopeSequenceTag, selectedSection);
  const { lessons, sectionOptions, loading: loadingLessons, error: lessonsError } = useLessons(scopeSequenceTag, selectedSection, selectedUnit, selectedLessonSection, sectionConfigAssignments);
  // For pacing, we need ALL lessons in the unit (not filtered by selectedLessonSection)
  const { lessons: allLessonsInUnit } = useLessons(scopeSequenceTag, selectedSection, selectedUnit, 'all', sectionConfigAssignments);
  const { progressData, loading: loadingProgress, error: progressError, setProgressData } = useProgressData(selectedSection, selectedUnit, lessons);
  const pacingData = usePacingData(selectedSection, selectedUnit, allLessonsInUnit, progressData, excludeRampUps, undefined, hideEmptySections);

  // Derived data
  const sectionGroups = useMemo(() => groupSectionsBySchool(sections), [sections]);
  const groupedAssignments = useMemo(() => groupAssignmentsByUnitLesson(lessons), [lessons]);
  const groupedBySection = useMemo(() => groupAssignmentsBySection(lessons), [lessons]);
  const showingSections = selectedLessonSection === 'all';
  const error = sectionsError || unitsError || lessonsError || progressError;

  // Load per-section values when groupId becomes available (keyed by groupId)
  useEffect(() => {
    if (groupId && groupId !== loadedGroupId) {
      const savedUnit = getPerSectionValue(groupId, 'unit');
      const savedLessonSection = getPerSectionValue(groupId, 'lessonSection');

      setSelectedUnitState(savedUnit ? parseInt(savedUnit, 10) : null);
      setSelectedLessonSectionState(savedLessonSection || "");
      setLoadedGroupId(groupId);
    } else if (!selectedSection) {
      setSelectedUnitState(null);
      setSelectedLessonSectionState("");
      setLoadedGroupId(null);
    }
  }, [groupId, loadedGroupId, selectedSection]);

  // Persist unit to per-section localStorage (keyed by groupId)
  const setSelectedUnit = useCallback((unit: number | null) => {
    setSelectedUnitState(unit);
    if (groupId) {
      setPerSectionValue(groupId, 'unit', unit !== null ? unit.toString() : null);
    }
  }, [groupId]);

  // Persist lesson section to per-section localStorage (keyed by groupId)
  const setSelectedLessonSection = useCallback((lessonSection: string) => {
    setSelectedLessonSectionState(lessonSection);
    if (groupId) {
      setPerSectionValue(groupId, 'lessonSection', lessonSection || null);
    }
  }, [groupId]);

  // Handlers
  const handleSectionChange = (section: string) => {
    setSelectedSection(section);
    setLoadedGroupId(null); // Reset so new groupId triggers load
    setSelectedUnitState(null);
    setSelectedLessonSectionState("");
  };

  const handleUnitChange = (unit: number | null) => {
    setSelectedUnit(unit);
    setSelectedLessonSection("");
  };

  const handleSyncAssignment = async (assignment: LessonConfig, testMode: boolean = false, progressBadge?: string) => {
    if (!selectedSection || !assignment.podsieAssignmentId) return;

    try {
      const syncingKey = `${assignment.unitLessonId}-${assignment.activityType || 'default'}`;
      setSyncing(syncingKey);

      const unitCode = `${assignment.grade}.${selectedUnit}`;

      // Extract base question IDs (root questions only) from the question map
      // NEW format: Filter for isRoot === true or isRoot === undefined (backwards compat)
      // If isRoot field is not present, treat question as root
      const rootQuestions = assignment.podsieQuestionMap
        ? assignment.podsieQuestionMap.filter(q => q.isRoot !== false)
        : [];

      const baseQuestionIds = rootQuestions.length > 0
        ? rootQuestions.map(q => Number(q.questionId))
        : undefined;

      // Build questionIdToNumber map: questionId -> actual questionNumber
      // This ensures sync stores data at correct positions (e.g., 1, 2, 4, 6... not 1, 2, 3, 4...)
      const questionIdToNumber: { [questionId: string]: number } = {};
      if (rootQuestions.length > 0) {
        rootQuestions.forEach(q => {
          questionIdToNumber[q.questionId] = q.questionNumber;
        });
      }

      // DEBUG: Log sync parameters for RU3
      console.log(`[SYNC DEBUG] Assignment: ${assignment.lessonName} (${assignment.unitLessonId})`);
      console.log(`[SYNC DEBUG] Root questions (${rootQuestions.length}):`, rootQuestions.map(q => `Q${q.questionNumber}:${q.questionId}`).join(', '));
      console.log(`[SYNC DEBUG] baseQuestionIds:`, baseQuestionIds);
      console.log(`[SYNC DEBUG] questionIdToNumber:`, questionIdToNumber);

      const result = await syncSectionRampUpProgress(
        selectedSection,
        assignment.scopeAndSequenceId,
        assignment.podsieAssignmentId,
        unitCode,
        assignment.unitLessonId,
        assignment.totalQuestions || 0,
        {
          testMode,
          baseQuestionIds,
          questionIdToNumber: Object.keys(questionIdToNumber).length > 0 ? questionIdToNumber : undefined,
          variations: assignment.variations ?? 3,
          q1HasVariations: assignment.q1HasVariations ?? false,
          activityType: assignment.activityType
        }
      );

      if (result.success) {
        const activityTypeLabel =
          assignment.activityType === 'mastery-check' ? 'Mastery Check' :
          assignment.activityType === 'assessment' ? 'Assessment' :
          'Sidekick';
        const titlePrefix = progressBadge ? `${progressBadge} ` : '';
        showToast({
          title: `${titlePrefix}${activityTypeLabel} Synced`,
          description: `${assignment.lessonName}: Synced ${result.successfulSyncs} of ${result.totalStudents} students${result.failedSyncs > 0 ? ` (${result.failedSyncs} failed)` : ''}`,
          variant: 'success',
          icon: CheckCircleIcon,
        });

        // Reload progress data for the specific assignment
        const progressResult = await fetchRampUpProgress(
          selectedSection,
          unitCode,
          assignment.unitLessonId,
          assignment.podsieAssignmentId
        );

        if (progressResult.success) {
          setProgressData(prevData => {
            const filtered = prevData.filter(p => p.podsieAssignmentId !== assignment.podsieAssignmentId);
            const newData = progressResult.data.filter(p => p.podsieAssignmentId === assignment.podsieAssignmentId);
            return [...filtered, ...newData];
          });
        }
      } else {
        showToast({
          title: 'Sync Failed',
          description: result.error || 'Failed to sync from Podsie',
          variant: 'error',
          icon: ExclamationTriangleIcon,
        });
      }
    } catch (err) {
      console.error("Error syncing:", err);
      showToast({
        title: 'Sync Failed',
        description: 'An unexpected error occurred while syncing',
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setSyncing(null);
    }
  };

  const handleSyncAll = async () => {
    if (lessons.length === 0) return;

    setSyncingAll(true);
    const totalLessons = lessons.length;

    try {
      for (let i = 0; i < lessons.length; i++) {
        const assignment = lessons[i];
        const progressBadge = `${i + 1}/${totalLessons}`;
        await handleSyncAssignment(assignment, false, progressBadge);
      }

      // After all syncs complete, refresh full progress data to update pacing
      const grade = lessons[0]?.grade || "8";
      const unitCode = `${grade}.${selectedUnit}`;
      const fullProgressResult = await fetchRampUpProgress(selectedSection, unitCode);
      if (fullProgressResult.success) {
        setProgressData(fullProgressResult.data);
      }

      showToast({
        title: 'All Syncs Complete',
        description: `Successfully synced all ${totalLessons} assignment${totalLessons !== 1 ? 's' : ''} in ${selectedLessonSection}`,
        variant: 'success',
        icon: CheckCircleIcon,
      });
    } catch (err) {
      console.error("Error syncing all:", err);
      showToast({
        title: 'Sync All Failed',
        description: 'An error occurred while syncing all lessons',
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setSyncingAll(false);
    }
  };

  const handleExportCsv = async () => {
    if (!selectedSection || lessons.length === 0) return;

    setExportingCsv(true);
    try {
      // Fetch students for this section to get email addresses
      const studentsResult = await fetchStudentsBySection(selectedSection);

      if (!studentsResult.success || !studentsResult.items) {
        showToast({
          title: 'Export Failed',
          description: 'Could not fetch student data for export',
          variant: 'error',
          icon: ExclamationTriangleIcon,
        });
        return;
      }

      // Generate CSV content
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const csvContent = generateProgressCsv(lessons, progressData, studentsResult.items as any);

      // Generate filename based on current filters
      const filename = generateCsvFilename(
        selectedSection,
        selectedUnit,
        selectedLessonSection
      );

      // Trigger download
      downloadCsv(csvContent, filename);

      showToast({
        title: 'CSV Exported',
        description: `Successfully exported ${lessons.length} assignment${lessons.length !== 1 ? 's' : ''} to ${filename}`,
        variant: 'success',
        icon: CheckCircleIcon,
      });
    } catch (err) {
      console.error("Error exporting CSV:", err);
      showToast({
        title: 'Export Failed',
        description: 'An unexpected error occurred while exporting CSV',
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setExportingCsv(false);
    }
  };

  const handleCreateModalSuccess = async () => {
    setShowCreateModal(false);
    // Reload section config to get updated assignments
    if (selectedSection) {
      const school = getSchoolForSection(selectedSection);
      const configResult = await getSectionConfig(school, selectedSection);
      if (configResult.success && configResult.data) {
        const assignmentsWithScope = (configResult.data.assignmentContent || []).map((assignment: AssignmentContent) => ({
          ...assignment,
          scopeSequenceTag: configResult.data.scopeSequenceTag
        }));
        setSectionConfigAssignments(assignmentsWithScope);
      }
    }
  };

  // Render: Loading
  if (loadingSections && sections.length === 0) {
    return <LoadingState />;
  }

  // Render: Main Page
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6" style={{ maxWidth: "1600px" }}>
        {/* Header and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <PageHeader onCreateClick={() => setShowCreateModal(true)} />

          <FiltersSection
            selectedSection={selectedSection}
            sectionGroups={sectionGroups}
            onSectionChange={handleSectionChange}
            selectedUnit={selectedUnit}
            units={units}
            loadingUnits={loadingUnits}
            onUnitChange={handleUnitChange}
            selectedLessonSection={selectedLessonSection}
            sectionOptions={sectionOptions}
            loadingLessons={loadingLessons}
            onLessonSectionChange={setSelectedLessonSection}
          />

          {error && (
            <div className="p-4 rounded-lg mb-4 bg-red-50 border border-red-200">
              <span className="text-red-800">{error}</span>
            </div>
          )}
        </div>

        {/* Pacing Progress Card - separate card below filters */}
        {selectedSection && selectedUnit !== null && selectedLessonSection && lessons.length > 0 && (
          <PacingProgressCard
            pacingData={pacingData}
            selectedUnit={selectedUnit}
            excludeRampUps={excludeRampUps}
            onExcludeRampUpsChange={setExcludeRampUps}
            hideEmptySections={hideEmptySections}
            onHideEmptySectionsChange={setHideEmptySections}
          />
        )}

        {/* Content Area */}
        {selectedSection && selectedUnit !== null && selectedLessonSection ? (
          loadingLessons || loadingProgress ? (
            <ProgressLoadingState loadingLessons={loadingLessons} />
          ) : lessons.length === 0 ? (
            <NoAssignmentsState selectedUnit={selectedUnit} selectedLessonSection={selectedLessonSection} />
          ) : (
            <div className="space-y-8">
              {/* Progress Overview */}
              <ProgressOverview
                selectedUnit={selectedUnit}
                selectedLessonSection={selectedLessonSection}
                lessons={lessons}
                progressData={progressData}
                syncing={syncing}
                syncingAll={syncingAll}
                onSyncAll={handleSyncAll}
                onExportCsv={handleExportCsv}
                exportingCsv={exportingCsv}
                calculateSummaryStats={calculateSummaryStats}
              />

              {/* Assignment Cards */}
              <div className="space-y-6">
                {showingSections ? (
                  // When showing "All", group by section with headers
                  groupedBySection.map(({ section, sectionDisplayName, assignments }) => (
                    <div key={`section-${section}`} className="space-y-4">
                      {/* Section Header */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 px-4 py-2 rounded-r">
                        <h3 className="text-lg font-semibold text-blue-900">{sectionDisplayName}</h3>
                      </div>

                      {/* Assignments in this section */}
                      <div className="space-y-6 pl-4">
                        {assignments.map(({ lesson, masteryCheck }) => {
                          const cardId = `assignment-${lesson.section}-${lesson.unitLessonId}-${lesson.podsieAssignmentId}`;
                          return (
                            <div key={cardId} id={cardId}>
                              <AssignmentCard
                                assignment={lesson}
                                masteryCheckAssignment={masteryCheck || undefined}
                                progressData={progressData}
                                syncing={syncing === `${lesson.unitLessonId}-${lesson.activityType || 'default'}`}
                                masteryCheckSyncing={masteryCheck ? syncing === `${masteryCheck.unitLessonId}-${masteryCheck.activityType || 'default'}` : false}
                                onSync={(testMode) => handleSyncAssignment(lesson, testMode)}
                                onMasteryCheckSync={masteryCheck ? (testMode) => handleSyncAssignment(masteryCheck, testMode) : undefined}
                                calculateSummaryStats={calculateSummaryStats}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  // When showing a specific section, no section headers needed
                  groupedAssignments.map(({ lesson, masteryCheck }) => {
                    const cardId = `assignment-${lesson.section}-${lesson.unitLessonId}-${lesson.podsieAssignmentId}`;
                    return (
                      <div key={cardId} id={cardId}>
                        <AssignmentCard
                          assignment={lesson}
                          masteryCheckAssignment={masteryCheck || undefined}
                          progressData={progressData}
                          syncing={syncing === `${lesson.unitLessonId}-${lesson.activityType || 'default'}`}
                          masteryCheckSyncing={masteryCheck ? syncing === `${masteryCheck.unitLessonId}-${masteryCheck.activityType || 'default'}` : false}
                          onSync={(testMode) => handleSyncAssignment(lesson, testMode)}
                          onMasteryCheckSync={masteryCheck ? (testMode) => handleSyncAssignment(masteryCheck, testMode) : undefined}
                          calculateSummaryStats={calculateSummaryStats}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )
        ) : (
          <SelectFiltersState />
        )}

        {/* Smartboard Display */}
        {selectedSection && selectedUnit !== null && selectedLessonSection && lessons.length > 0 && scopeSequenceTag && (
          <SmartboardDisplay
            assignments={lessons}
            progressData={progressData}
            selectedUnit={selectedUnit}
            selectedSection={selectedSection}
            selectedLessonSection={selectedLessonSection}
            scopeSequenceTag={scopeSequenceTag}
            grade={lessons[0]?.grade || ""}
            calculateSummaryStats={calculateSummaryStats}
            onSyncAll={handleSyncAll}
            syncingAll={syncingAll}
          />
        )}

        {/* Create Assignment Modal */}
        {showCreateModal && (
          <CreateAssignmentModal
            scopeSequenceTag={scopeSequenceTag}
            selectedUnit={selectedUnit}
            selectedSection={selectedSection}
            sections={sections}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateModalSuccess}
          />
        )}

        <ToastComponent />
      </div>
    </div>
  );
}
