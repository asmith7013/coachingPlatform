"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { Spinner } from "@/components/core/feedback/Spinner";
import { useToast } from "@/components/core/feedback/Toast";
import {
  fetchRampUpProgress,
  syncSectionRampUpProgress,
} from "@/app/actions/scm/podsie/podsie-sync";
import { AssignmentCard } from "../../progress/components/AssignmentCard";
import { getScopeTagForSection } from "../../progress/utils/sectionHelpers";
import { calculateSummaryStats } from "../../progress/utils/progressStats";
import { useUnitsAndConfig } from "../../progress/hooks/useUnitsAndConfig";
import { AssessmentSummaryTable } from "./AssessmentSummaryTable";
import type { LessonConfig, ProgressData } from "../../progress/types";

interface AssessmentData {
  unitNumber: number;
  unitName: string;
  assignment: LessonConfig;
  progressData: ProgressData[];
  totalQuestions: number;
}

interface SectionAssessmentAccordionProps {
  sectionId: string;
  sectionName: string;
  school: string;
  color?: string;
}

export function SectionAssessmentAccordion({
  sectionId,
  sectionName,
  school,
  color,
}: SectionAssessmentAccordionProps) {
  // Accordion state
  const [isExpanded, setIsExpanded] = useState(true);

  // Unit and assessment selection state
  const [selectedUnits, setSelectedUnits] = useState<number[]>([]);
  const [selectedAssessmentUnit, setSelectedAssessmentUnit] = useState<
    number | null
  >(null);
  const [allAssessmentData, setAllAssessmentData] = useState<AssessmentData[]>(
    [],
  );
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  const { showToast, ToastComponent } = useToast();

  // Derived scope tag
  const scopeSequenceTag = useMemo(
    () => getScopeTagForSection(sectionName),
    [sectionName],
  );

  // Load units and config
  const {
    units,
    sectionConfigAssignments,
    loading: loadingUnits,
  } = useUnitsAndConfig(scopeSequenceTag, sectionName, school);

  // Helper to extract unit number from unitLessonId (e.g., "3.15" -> 3)
  const getUnitNumberFromId = (unitLessonId: string): number => {
    const parts = unitLessonId.split(".");
    return parseInt(parts[0], 10);
  };

  // Toggle unit selection
  const handleUnitToggle = (unitNumber: number) => {
    const newUnits = selectedUnits.includes(unitNumber)
      ? selectedUnits.filter((u) => u !== unitNumber)
      : [...selectedUnits, unitNumber].sort((a, b) => a - b);
    setSelectedUnits(newUnits);

    if (
      selectedAssessmentUnit === unitNumber &&
      !newUnits.includes(unitNumber)
    ) {
      setSelectedAssessmentUnit(null);
    }
  };

  // Create stable dependency keys
  const selectedUnitsKey = selectedUnits.join(",");

  // Load assessment data for all selected units
  useEffect(() => {
    if (selectedUnits.length === 0) return;
    if (sectionConfigAssignments.length === 0) return;

    let isCancelled = false;

    const loadAssessments = async () => {
      setLoadingAssessments(true);
      const assessments: AssessmentData[] = [];

      for (const unitNumber of selectedUnits) {
        const unitAssignments = sectionConfigAssignments.filter((a) => {
          const assignmentUnitNumber = getUnitNumberFromId(a.unitLessonId);
          return (
            assignmentUnitNumber === unitNumber &&
            a.section === "Unit Assessment"
          );
        });

        for (const assignment of unitAssignments) {
          if (isCancelled) return;

          const assessmentActivity = assignment.podsieActivities?.find(
            (activity) => activity.activityType === "assessment",
          );

          if (!assessmentActivity) continue;

          const grade = scopeSequenceTag
            .replace("Grade ", "")
            .replace("Algebra 1", "8");
          const unitCode = `${grade}.${unitNumber}`;

          const result = await fetchRampUpProgress(
            sectionName,
            unitCode,
            assignment.unitLessonId,
            assessmentActivity.podsieAssignmentId,
            school,
          );

          if (result.success) {
            const unit = units.find((u) => u.unitNumber === unitNumber);

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
  }, [
    sectionId,
    selectedUnitsKey,
    sectionConfigAssignments.length,
    scopeSequenceTag,
  ]);

  // Sync handler
  const handleSyncAssignment = async (assignment: LessonConfig) => {
    if (!assignment.podsieAssignmentId) return;

    try {
      const syncingKey = `${assignment.unitLessonId}-assessment`;
      setSyncing(syncingKey);

      const unitCode = `${assignment.grade}.${assignment.unitNumber}`;

      const rootQuestions = assignment.podsieQuestionMap
        ? assignment.podsieQuestionMap.filter((q) => q.isRoot !== false)
        : [];

      const baseQuestionIds =
        rootQuestions.length > 0
          ? rootQuestions.map((q) => Number(q.questionId))
          : undefined;

      const questionIdToNumber: { [questionId: string]: number } = {};
      if (rootQuestions.length > 0) {
        rootQuestions.forEach((q) => {
          questionIdToNumber[q.questionId] = q.questionNumber;
        });
      }

      const result = await syncSectionRampUpProgress(
        sectionName,
        assignment.scopeAndSequenceId,
        assignment.podsieAssignmentId,
        unitCode,
        assignment.unitLessonId,
        assignment.totalQuestions || 0,
        {
          testMode: false,
          baseQuestionIds,
          questionIdToNumber:
            Object.keys(questionIdToNumber).length > 0
              ? questionIdToNumber
              : undefined,
          variations: assignment.variations ?? 3,
          q1HasVariations: assignment.q1HasVariations ?? false,
          activityType: assignment.activityType,
        },
        school,
      );

      if (result.success) {
        showToast({
          title: "Assessment Synced",
          description: `${assignment.lessonName}: Synced ${result.successfulSyncs} of ${result.totalStudents} students`,
          variant: "success",
          icon: CheckCircleIcon,
        });

        // Reload progress data
        const progressResult = await fetchRampUpProgress(
          sectionName,
          unitCode,
          assignment.unitLessonId,
          assignment.podsieAssignmentId,
          school,
        );

        if (progressResult.success) {
          setAllAssessmentData((prev) =>
            prev.map((a) =>
              a.assignment.podsieAssignmentId === assignment.podsieAssignmentId
                ? { ...a, progressData: progressResult.data }
                : a,
            ),
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

  // Get selected assessment for detailed view
  const selectedAssessment =
    selectedAssessmentUnit !== null
      ? allAssessmentData.find((a) => a.unitNumber === selectedAssessmentUnit)
      : null;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Section Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 border-b border-gray-200 cursor-pointer"
        style={{ backgroundColor: color || "#4F46E5" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDownIcon className="h-5 w-5 text-white" />
            ) : (
              <ChevronRightIcon className="h-5 w-5 text-white" />
            )}
            <h2 className="text-lg font-bold text-white">{sectionName}</h2>
            <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full">
              {school}
            </span>
            {loadingUnits && (
              <span className="text-sm text-white/80 ml-2">Loading...</span>
            )}
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6">
          {/* Unit Selector */}
          {units.length > 0 && (
            <div className="mb-6">
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
          {loadingUnits && (
            <div className="text-center py-8">
              <Spinner size="md" className="mx-auto mb-2" />
              <p className="text-gray-600">Loading units...</p>
            </div>
          )}

          {/* No units selected message */}
          {!loadingUnits && selectedUnits.length === 0 && units.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              Select units above to view assessment data
            </div>
          )}

          {/* Assessment Content */}
          {selectedUnits.length > 0 && (
            <>
              {loadingAssessments ? (
                <div className="text-center py-12">
                  <Spinner size="lg" className="mx-auto mb-2" />
                  <p className="text-gray-600">Loading assessment data...</p>
                </div>
              ) : allAssessmentData.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Assessments Found
                  </h3>
                  <p className="text-gray-600">
                    No unit assessments found for the selected units.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Table */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Assessment Summary
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
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
                      <h3 className="text-sm font-semibold text-gray-900">
                        Detailed Scores: {selectedAssessment.unitName}
                      </h3>
                      <AssignmentCard
                        assignment={selectedAssessment.assignment}
                        progressData={selectedAssessment.progressData}
                        syncing={
                          syncing ===
                          `${selectedAssessment.assignment.unitLessonId}-assessment`
                        }
                        onSync={() =>
                          handleSyncAssignment(selectedAssessment.assignment)
                        }
                        calculateSummaryStats={calculateSummaryStats}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <ToastComponent />
    </div>
  );
}
