"use client";

import { useState, useMemo, useEffect } from "react";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { useToast } from "@/components/core/feedback/Toast";
import { fetchRampUpProgress, syncSectionRampUpProgress } from "@/app/actions/scm/podsie/podsie-sync";
import { MultiSectionSelector } from "@/app/scm/podsie/bulk-sync/components";
import { AssignmentCard } from "../progress/components/AssignmentCard";
import { LoadingState } from "../progress/components/EmptyStates";
import { getScopeTagForSection } from "../progress/utils/sectionHelpers";
import { calculateSummaryStats } from "../progress/utils/progressStats";
import { useSectionOptions } from "@/hooks/scm";
import { useUnitsAndConfig } from "../progress/hooks/useUnitsAndConfig";
import type { LessonConfig, ProgressData } from "../progress/types";
import { AssessmentSummaryTable } from "./components/AssessmentSummaryTable";
import { Spinner } from "@/components/core/feedback/Spinner";

interface SectionOption {
  id: string;
  school: string;
  classSection: string;
  displayName: string;
}

interface AssessmentData {
  unitNumber: number;
  unitName: string;
  assignment: LessonConfig;
  progressData: ProgressData[];
  totalQuestions: number;
}

export default function AssessmentPage() {
  // State
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<number[]>([]);
  const [selectedAssessmentUnit, setSelectedAssessmentUnit] = useState<number | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [allAssessmentData, setAllAssessmentData] = useState<AssessmentData[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const { showToast, ToastComponent } = useToast();

  // Data hooks
  const {
    sectionOptions: rawSectionOptions,
    sectionColors,
    loading: loadingSections,
    error: sectionsError,
  } = useSectionOptions();

  // Transform section options to local type
  const sectionOptions: SectionOption[] = useMemo(() => {
    return rawSectionOptions.map((opt) => ({
      id: opt.id,
      school: opt.school,
      classSection: opt.classSection,
      displayName: opt.displayName,
    }));
  }, [rawSectionOptions]);

  // Get selected section data
  const selectedSectionData = useMemo(() => {
    if (selectedSections.length === 0) return null;
    return sectionOptions.find((s) => s.id === selectedSections[0]) || null;
  }, [sectionOptions, selectedSections]);

  // Derived scope and config
  const scopeSequenceTag = useMemo(() => {
    if (!selectedSectionData) return "";
    return getScopeTagForSection(selectedSectionData.classSection);
  }, [selectedSectionData]);

  const { units, sectionConfigAssignments, loading: loadingUnits, error: unitsError } = useUnitsAndConfig(
    scopeSequenceTag,
    selectedSectionData?.classSection || "",
    selectedSectionData?.school
  );

  const error = sectionsError || unitsError;

  // Toggle section selection (only allow single selection for now to keep it simple)
  const handleToggleSection = (sectionId: string) => {
    if (selectedSections.includes(sectionId)) {
      setSelectedSections([]);
      setSelectedUnits([]);
      setSelectedAssessmentUnit(null);
      setAllAssessmentData([]);
    } else {
      setSelectedSections([sectionId]);
      setSelectedUnits([]);
      setSelectedAssessmentUnit(null);
      setAllAssessmentData([]);
    }
  };

  // Toggle unit selection
  const handleUnitToggle = (unitNumber: number) => {
    const newUnits = selectedUnits.includes(unitNumber)
      ? selectedUnits.filter((u) => u !== unitNumber)
      : [...selectedUnits, unitNumber].sort((a, b) => a - b);
    setSelectedUnits(newUnits);

    if (selectedAssessmentUnit === unitNumber && !newUnits.includes(unitNumber)) {
      setSelectedAssessmentUnit(null);
    }
  };

  // Helper to extract unit number from unitLessonId (e.g., "3.15" -> 3, "4.RU1" -> 4)
  const getUnitNumberFromId = (unitLessonId: string): number => {
    const parts = unitLessonId.split(".");
    return parseInt(parts[0], 10);
  };

  // Create stable dependency keys to avoid unnecessary re-renders
  const selectedUnitsKey = selectedUnits.join(",");
  const sectionId = selectedSectionData?.id || "";

  // Load assessment data for all selected units
  useEffect(() => {
    // Skip if no section or units selected
    if (!selectedSectionData || selectedUnits.length === 0) {
      return;
    }

    // Skip if sectionConfigAssignments not loaded yet
    if (sectionConfigAssignments.length === 0) {
      return;
    }

    let isCancelled = false;

    const loadAssessments = async () => {
      setLoadingAssessments(true);
      const assessments: AssessmentData[] = [];

      for (const unitNumber of selectedUnits) {
        // Find assessment assignments for this unit from sectionConfigAssignments
        // We need to filter by unit (extracted from unitLessonId) and find Unit Assessment section
        const unitAssignments = sectionConfigAssignments.filter((a) => {
          const assignmentUnitNumber = getUnitNumberFromId(a.unitLessonId);
          return assignmentUnitNumber === unitNumber && a.section === "Unit Assessment";
        });

        for (const assignment of unitAssignments) {
          if (isCancelled) return;

          // Get the assessment activity from podsieActivities
          const assessmentActivity = assignment.podsieActivities?.find(
            (activity) => activity.activityType === "assessment"
          );

          if (!assessmentActivity) continue;

          const grade = scopeSequenceTag.replace("Grade ", "").replace("Algebra 1", "8");
          const unitCode = `${grade}.${unitNumber}`;

          // Fetch progress data for this assessment
          const result = await fetchRampUpProgress(
            selectedSectionData.classSection,
            unitCode,
            assignment.unitLessonId,
            assessmentActivity.podsieAssignmentId,
            selectedSectionData.school
          );

          if (result.success) {
            const unit = units.find((u) => u.unitNumber === unitNumber);

            // Build LessonConfig from the assignment and activity
            const lessonConfig: LessonConfig = {
              scopeAndSequenceId: assignment.scopeAndSequenceId,
              unitLessonId: assignment.unitLessonId,
              lessonName: assignment.lessonName,
              grade,
              podsieAssignmentId: assessmentActivity.podsieAssignmentId,
              totalQuestions: assessmentActivity.totalQuestions || 0,
              podsieQuestionMap: assessmentActivity.podsieQuestionMap,
              variations: assessmentActivity.variations ?? 3,
              q1HasVariations: assessmentActivity.q1HasVariations ?? false,
              section: assignment.section,
              subsection: assignment.subsection,
              unitNumber,
              activityType: "assessment",
            };

            assessments.push({
              unitNumber,
              unitName: unit?.unitName || `Unit ${unitNumber}`,
              assignment: lessonConfig,
              progressData: result.data,
              totalQuestions: assessmentActivity.totalQuestions || 0,
            });
          }
        }
      }

      if (!isCancelled) {
        setAllAssessmentData(assessments);
        setLoadingAssessments(false);
      }
    };

    loadAssessments();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, selectedUnitsKey, sectionConfigAssignments.length, scopeSequenceTag]);

  // Sync handler
  const handleSyncAssignment = async (assignment: LessonConfig) => {
    if (!selectedSectionData || !assignment.podsieAssignmentId) return;

    try {
      const syncingKey = `${assignment.unitLessonId}-assessment`;
      setSyncing(syncingKey);

      const unitCode = `${assignment.grade}.${assignment.unitNumber}`;

      const rootQuestions = assignment.podsieQuestionMap
        ? assignment.podsieQuestionMap.filter((q) => q.isRoot !== false)
        : [];

      const baseQuestionIds = rootQuestions.length > 0 ? rootQuestions.map((q) => Number(q.questionId)) : undefined;

      const questionIdToNumber: { [questionId: string]: number } = {};
      if (rootQuestions.length > 0) {
        rootQuestions.forEach((q) => {
          questionIdToNumber[q.questionId] = q.questionNumber;
        });
      }

      const result = await syncSectionRampUpProgress(
        selectedSectionData.classSection,
        assignment.scopeAndSequenceId,
        assignment.podsieAssignmentId,
        unitCode,
        assignment.unitLessonId,
        assignment.totalQuestions || 0,
        {
          testMode: false,
          baseQuestionIds,
          questionIdToNumber: Object.keys(questionIdToNumber).length > 0 ? questionIdToNumber : undefined,
          variations: assignment.variations ?? 3,
          q1HasVariations: assignment.q1HasVariations ?? false,
          activityType: assignment.activityType,
        },
        selectedSectionData.school
      );

      if (result.success) {
        showToast({
          title: "Assessment Synced",
          description: `${assignment.lessonName}: Synced ${result.successfulSyncs} of ${result.totalStudents} students`,
          variant: "success",
          icon: CheckCircleIcon,
        });

        // Reload progress data for the specific assessment
        const progressResult = await fetchRampUpProgress(
          selectedSectionData.classSection,
          unitCode,
          assignment.unitLessonId,
          assignment.podsieAssignmentId,
          selectedSectionData.school
        );

        if (progressResult.success) {
          setAllAssessmentData((prev) =>
            prev.map((a) =>
              a.assignment.podsieAssignmentId === assignment.podsieAssignmentId
                ? { ...a, progressData: progressResult.data }
                : a
            )
          );
        }
      } else {
        showToast({
          title: "Sync Failed",
          description: result.error || "Failed to sync from Podsie",
          variant: "error",
          icon: ExclamationTriangleIcon,
        });
      }
    } catch (err) {
      console.error("Error syncing:", err);
      showToast({
        title: "Sync Failed",
        description: "An unexpected error occurred while syncing",
        variant: "error",
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setSyncing(null);
    }
  };

  // Render: Loading
  if (loadingSections) {
    return <LoadingState />;
  }

  // Get the selected assessment for detailed view
  const selectedAssessment = selectedAssessmentUnit !== null
    ? allAssessmentData.find((a) => a.unitNumber === selectedAssessmentUnit)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto" style={{ maxWidth: "1600px" }}>
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Unit Assessments</h1>
          <p className="text-gray-600 text-sm mt-1">
            View and compare unit assessment scores across students
          </p>
        </div>

        {/* Section Selector */}
        <div className="mb-6">
          <MultiSectionSelector
            sections={sectionOptions}
            selectedSections={selectedSections}
            onToggle={handleToggleSection}
            sectionColors={sectionColors}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* No Sections Selected */}
        {selectedSections.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">Select a section above to view unit assessments</p>
          </div>
        )}

        {/* Unit Selector */}
        {selectedSectionData && units.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Units to Compare
            </label>
            <div className="flex flex-wrap gap-2">
              {units.map((unit) => (
                <button
                  key={unit.unitNumber}
                  onClick={() => handleUnitToggle(unit.unitNumber)}
                  disabled={loadingUnits}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    selectedUnits.includes(unit.unitNumber)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } ${loadingUnits ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Unit {unit.unitNumber}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading Units */}
        {selectedSectionData && loadingUnits && (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-200 mb-6">
            <Spinner size="md" className="mx-auto mb-2" />
            <p className="text-gray-600">Loading units...</p>
          </div>
        )}

        {/* Content Area */}
        {selectedSectionData && selectedUnits.length > 0 && (
          <>
            {loadingAssessments ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Spinner size="lg" className="mx-auto mb-2" />
                <p className="text-gray-600">Loading assessment data...</p>
              </div>
            ) : allAssessmentData.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-gray-400 text-4xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Found</h3>
                <p className="text-gray-600">No unit assessments found for the selected units.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Assessment Summary</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Click on a unit column header to view detailed scores
                    </p>
                  </div>
                  <AssessmentSummaryTable
                    assessmentData={allAssessmentData}
                    selectedUnit={selectedAssessmentUnit}
                    onSelectUnit={setSelectedAssessmentUnit}
                  />
                </div>

                {/* Detailed Assessment View */}
                {selectedAssessment && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Detailed Scores: {selectedAssessment.unitName}
                    </h2>
                    <AssignmentCard
                      assignment={selectedAssessment.assignment}
                      progressData={selectedAssessment.progressData}
                      syncing={syncing === `${selectedAssessment.assignment.unitLessonId}-assessment`}
                      onSync={() => handleSyncAssignment(selectedAssessment.assignment)}
                      calculateSummaryStats={calculateSummaryStats}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <ToastComponent />
      </div>
    </div>
  );
}
