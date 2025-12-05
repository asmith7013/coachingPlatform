"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { useToast } from "@/components/core/feedback/Toast";
import { Spinner } from "@/components/core/feedback/Spinner";
import { getSectionOptions, getAssignmentContent } from "@actions/313/section-config";
import { syncSectionRampUpProgress } from "@actions/313/podsie-sync";
import type { AssignmentContent } from "@zod-schema/313/section-config";

interface SectionOption {
  school: string;
  classSection: string;
  teacher?: string;
  gradeLevel: string;
  scopeSequenceTag?: string;
}

interface UnitGroup {
  unitNumber: number;
  unitName: string;
  assignments: AssignmentContent[];
}

export default function SectionConfigsUpdatePage() {
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [assignments, setAssignments] = useState<AssignmentContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null); // Track what's syncing: "all", "unit-X", or "assignment-id"
  const [error, setError] = useState<string | null>(null);
  const { showToast, ToastComponent } = useToast();

  // Load sections on mount
  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const result = await getSectionOptions();
      if (result.success && result.data) {
        setSections(result.data);
      }
    } catch (err) {
      console.error("Error loading sections:", err);
      setError("Failed to load sections");
    }
  };

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAssignmentContent(selectedSchool, selectedSection);
      if (result.success && result.data) {
        setAssignments(result.data);
      } else {
        const errorMessage = result.error || "Failed to load assignments";
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Error loading assignments:", err);
      const errorMessage = "Failed to load assignments";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedSchool, selectedSection]);

  
  // Load assignments when section is selected
  useEffect(() => {
    if (selectedSchool && selectedSection) {
      loadAssignments();
    } else {
      setAssignments([]);
    }
  }, [selectedSchool, selectedSection, loadAssignments]);

  // Group assignments by unit
  const unitGroups = useMemo(() => {
    const groups = new Map<number, UnitGroup>();

    assignments.forEach((assignment) => {
      // Extract unit number from unitLessonId (e.g., "2.6" -> 2)
      const unitNumber = parseInt(assignment.unitLessonId.split('.')[0]);

      if (!groups.has(unitNumber)) {
        groups.set(unitNumber, {
          unitNumber,
          unitName: `Unit ${unitNumber}`,
          assignments: []
        });
      }

      groups.get(unitNumber)!.assignments.push(assignment);
    });

    // Convert to array and sort by unit number
    return Array.from(groups.values()).sort((a, b) => a.unitNumber - b.unitNumber);
  }, [assignments]);

  // Sync a single assignment
  const syncAssignment = async (assignment: AssignmentContent, progressBadge?: string) => {
    const activities = assignment.podsieActivities || [];
    if (activities.length === 0) {
      showToast({
        title: 'No Activities',
        description: `${assignment.lessonName} has no Podsie activities to sync`,
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
      return;
    }

    for (const activity of activities) {
      const activityId = `${assignment.scopeAndSequenceId}-${activity.podsieAssignmentId}`;
      setSyncing(activityId);

      try {
        const unitCode = `${assignment.grade}.${assignment.unitLessonId.split('.')[0]}`;
        const baseQuestionIds = activity.podsieQuestionMap
          ?.filter(q => q.isRoot !== false)
          .map(q => Number(q.questionId));

        const result = await syncSectionRampUpProgress(
          selectedSection,
          assignment.scopeAndSequenceId,
          activity.podsieAssignmentId,
          unitCode,
          assignment.unitLessonId,
          activity.totalQuestions || 0,
          {
            baseQuestionIds,
            variations: activity.variations ?? 3,
            q1HasVariations: activity.q1HasVariations ?? false,
            activityType: activity.activityType
          }
        );

        if (result.success) {
          const activityTypeLabel =
            activity.activityType === 'mastery-check' ? 'Mastery Check' :
            activity.activityType === 'assessment' ? 'Assessment' :
            'Sidekick';
          const titlePrefix = progressBadge ? `${progressBadge} ` : '';
          showToast({
            title: `${titlePrefix}${activityTypeLabel} Synced`,
            description: `${assignment.lessonName}: Synced ${result.successfulSyncs} of ${result.totalStudents} students${result.failedSyncs > 0 ? ` (${result.failedSyncs} failed)` : ''}`,
            variant: 'success',
            icon: CheckCircleIcon,
          });
        } else {
          showToast({
            title: 'Sync Failed',
            description: `${assignment.lessonName}: ${result.error || 'Failed to sync from Podsie'}`,
            variant: 'error',
            icon: ExclamationTriangleIcon,
          });
        }
      } catch (err) {
        console.error(`Error syncing assignment ${assignment.lessonName}:`, err);
        showToast({
          title: 'Sync Error',
          description: `${assignment.lessonName}: An unexpected error occurred`,
          variant: 'error',
          icon: ExclamationTriangleIcon,
        });
      }
    }

    setSyncing(null);
  };

  // Sync all assignments in a unit
  const syncUnit = async (unitNumber: number) => {
    setSyncing(`unit-${unitNumber}`);

    const unitAssignments = assignments.filter(a => {
      const num = parseInt(a.unitLessonId.split('.')[0]);
      return num === unitNumber;
    });

    const totalAssignments = unitAssignments.length;

    try {
      for (let i = 0; i < unitAssignments.length; i++) {
        const assignment = unitAssignments[i];
        const progressBadge = `${i + 1}/${totalAssignments}`;
        await syncAssignment(assignment, progressBadge);
      }

      showToast({
        title: 'Unit Sync Complete',
        description: `Successfully synced all ${totalAssignments} assignment${totalAssignments !== 1 ? 's' : ''} in Unit ${unitNumber}`,
        variant: 'success',
        icon: CheckCircleIcon,
      });
    } catch (err) {
      console.error("Error syncing unit:", err);
      showToast({
        title: 'Unit Sync Failed',
        description: `An error occurred while syncing Unit ${unitNumber}`,
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setSyncing(null);
    }
  };

  // Sync all assignments in the section
  const syncAll = async () => {
    setSyncing("all");

    const totalAssignments = assignments.length;

    try {
      for (let i = 0; i < assignments.length; i++) {
        const assignment = assignments[i];
        const progressBadge = `${i + 1}/${totalAssignments}`;
        await syncAssignment(assignment, progressBadge);
      }

      showToast({
        title: 'All Syncs Complete',
        description: `Successfully synced all ${totalAssignments} assignment${totalAssignments !== 1 ? 's' : ''} for ${selectedSection}`,
        variant: 'success',
        icon: CheckCircleIcon,
      });
    } catch (err) {
      console.error("Error syncing all:", err);
      showToast({
        title: 'Sync All Failed',
        description: 'An error occurred while syncing all assignments',
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setSyncing(null);
    }
  };

  // Get activity type label
  const getActivityTypeLabel = (activityType?: string) => {
    switch (activityType) {
      case 'sidekick': return 'Sidekick';
      case 'mastery-check': return 'Mastery Check';
      case 'assessment': return 'Assessment';
      default: return 'Unknown';
    }
  };

  // Get activity type color
  const getActivityTypeColor = (activityType?: string) => {
    switch (activityType) {
      case 'sidekick': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'mastery-check': return 'bg-green-100 text-green-800 border-green-300';
      case 'assessment': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Section Configs Update</h1>
          <p className="text-gray-600">Manage and sync assignments for section configs</p>
        </div>

        {/* Section Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School
              </label>
              <select
                value={selectedSchool}
                onChange={(e) => {
                  setSelectedSchool(e.target.value);
                  setSelectedSection("");
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select school...</option>
                {Array.from(new Set(sections.map(s => s.school))).map(school => (
                  <option key={school} value={school}>{school}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={!selectedSchool}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select section...</option>
                {sections
                  .filter(s => s.school === selectedSchool)
                  .map(section => (
                    <option key={section.classSection} value={section.classSection}>
                      {section.classSection} {section.teacher ? `(${section.teacher})` : ''}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Sync All Button */}
          {selectedSection && assignments.length > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={syncAll}
                disabled={syncing !== null}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  syncing !== null
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                }`}
              >
                <ArrowPathIcon className={`w-5 h-5 ${syncing === "all" ? "animate-spin" : ""}`} />
                {syncing === "all" ? "Syncing All..." : "Sync All Assignments"}
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Spinner size="lg" className="mx-auto mb-2" />
            <p className="text-gray-600">Loading assignments...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Unit Groups */}
        {!loading && selectedSection && unitGroups.length > 0 && (
          <div className="space-y-6">
            {unitGroups.map((unitGroup) => (
              <div key={unitGroup.unitNumber} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {/* Unit Header */}
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Unit {unitGroup.unitNumber}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {unitGroup.assignments.length} assignment{unitGroup.assignments.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => syncUnit(unitGroup.unitNumber)}
                    disabled={syncing !== null}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      syncing !== null
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                    }`}
                  >
                    <ArrowPathIcon className={`w-5 h-5 ${syncing === `unit-${unitGroup.unitNumber}` ? "animate-spin" : ""}`} />
                    {syncing === `unit-${unitGroup.unitNumber}` ? "Syncing..." : "Sync Unit"}
                  </button>
                </div>

                {/* Assignments List */}
                <div className="divide-y divide-gray-200">
                  {unitGroup.assignments.map((assignment, idx) => (
                    <div key={idx} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {assignment.lessonName}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Unit Lesson ID: {assignment.unitLessonId}</span>
                            <span>•</span>
                            <span>Section: {assignment.section}</span>
                            {assignment.grade && (
                              <>
                                <span>•</span>
                                <span>Grade: {assignment.grade}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => syncAssignment(assignment)}
                          disabled={syncing !== null}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            syncing !== null
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                          }`}
                        >
                          <ArrowPathIcon
                            className={`w-4 h-4 ${
                              syncing === `${assignment.scopeAndSequenceId}-${assignment.podsieActivities?.[0]?.podsieAssignmentId}`
                                ? "animate-spin"
                                : ""
                            }`}
                          />
                          Sync
                        </button>
                      </div>

                      {/* Activities */}
                      {assignment.podsieActivities && assignment.podsieActivities.length > 0 && (
                        <div className="space-y-2">
                          {assignment.podsieActivities.map((activity, actIdx) => (
                            <div
                              key={actIdx}
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm border ${getActivityTypeColor(activity.activityType)}`}
                            >
                              <span className="font-medium">{getActivityTypeLabel(activity.activityType)}</span>
                              <span>•</span>
                              <span>Assignment ID: {activity.podsieAssignmentId}</span>
                              <span>•</span>
                              <span>{activity.totalQuestions} questions</span>
                              {activity.active === false && (
                                <>
                                  <span>•</span>
                                  <span className="text-red-600 font-medium">Inactive</span>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && selectedSection && unitGroups.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">No assignments found for this section</p>
          </div>
        )}

        {/* No Section Selected */}
        {!loading && !selectedSection && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">Select a school and section to view assignments</p>
          </div>
        )}
      </div>
      <ToastComponent />
    </div>
  );
}
