"use client";

import { useState, useMemo } from "react";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { useToast } from "@/components/core/feedback/Toast";
import { fetchRampUpProgress, syncSectionRampUpProgress } from "@/app/actions/313/podsie-sync";
import { getSectionConfig } from "@/app/actions/313/section-config";
import { fetchStudentsBySection } from "@/app/actions/313/students";
import type { AssignmentContent } from "@zod-schema/313/section-config";
import { AssignmentCard } from "./components/AssignmentCard";
import { SmartboardDisplay } from "./components/SmartboardDisplay";
import { CreateAssignmentModal } from "./components/CreateAssignmentModal";
import { PageHeader } from "./components/PageHeader";
import { FiltersSection } from "./components/FiltersSection";
import { ProgressOverview } from "./components/ProgressOverview";
import { LoadingState, ProgressLoadingState, NoAssignmentsState, SelectFiltersState } from "./components/EmptyStates";
import { groupAssignmentsByUnitLesson, groupAssignmentsBySection } from "./utils/groupAssignments";
import { getScopeTagForSection, getSchoolForSection, groupSectionsBySchool } from "./utils/sectionHelpers";
import { calculateSummaryStats } from "./utils/progressStats";
import { generateProgressCsv, downloadCsv, generateCsvFilename } from "./utils/exportCsv";
import { useSections } from "./hooks/useSections";
import { useUnitsAndConfig } from "./hooks/useUnitsAndConfig";
import { useLessons } from "./hooks/useLessons";
import { useProgressData } from "./hooks/useProgressData";
import { useLocalStorageString, useLocalStorageNumber } from "./hooks/useLocalStorage";
import type { LessonConfig } from "./types";

export default function PodsieProgressPage() {
  // State
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { showToast, ToastComponent } = useToast();

  // LocalStorage-backed state
  const [selectedSection, setSelectedSection] = useLocalStorageString('podsieProgress_selectedSection');
  const [selectedUnit, setSelectedUnit] = useLocalStorageNumber('podsieProgress_selectedUnit');
  const [selectedLessonSection, setSelectedLessonSection] = useLocalStorageString('podsieProgress_selectedLessonSection');

  // Derived state
  const scopeSequenceTag = useMemo(() => {
    return selectedSection ? getScopeTagForSection(selectedSection) : "";
  }, [selectedSection]);

  // Data hooks
  const { sections, loading: loadingSections, error: sectionsError } = useSections();
  const { units, sectionConfigAssignments, loading: loadingUnits, error: unitsError, setSectionConfigAssignments } = useUnitsAndConfig(scopeSequenceTag, selectedSection);
  const { lessons, sectionOptions, loading: loadingLessons, error: lessonsError } = useLessons(scopeSequenceTag, selectedSection, selectedUnit, selectedLessonSection, sectionConfigAssignments);
  const { progressData, loading: loadingProgress, error: progressError, setProgressData } = useProgressData(selectedSection, selectedUnit, lessons);

  // Derived data
  const sectionGroups = useMemo(() => groupSectionsBySchool(sections), [sections]);
  const groupedAssignments = useMemo(() => groupAssignmentsByUnitLesson(lessons), [lessons]);
  const groupedBySection = useMemo(() => groupAssignmentsBySection(lessons), [lessons]);
  const showingSections = selectedLessonSection === 'all';
  const error = sectionsError || unitsError || lessonsError || progressError;

  // Handlers
  const handleSectionChange = (section: string) => {
    setSelectedSection(section);
    setSelectedUnit(null);
    setSelectedLessonSection("");
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
      const baseQuestionIds = assignment.podsieQuestionMap
        ? assignment.podsieQuestionMap
            .filter(q => q.isRoot !== false) // Include true and undefined
            .map(q => Number(q.questionId))
        : undefined;

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
        {selectedSection && selectedUnit !== null && selectedLessonSection && lessons.length > 0 && (
          <SmartboardDisplay
            assignments={lessons}
            progressData={progressData}
            selectedUnit={selectedUnit}
            selectedSection={selectedSection}
            selectedLessonSection={selectedLessonSection}
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
