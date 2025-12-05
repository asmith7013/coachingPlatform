"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/24/solid";
import { useToast } from "@/components/core/feedback/Toast";
import { Spinner } from "@/components/core/feedback/Spinner";
import { getAllSectionConfigs } from "@/app/actions/313/section-overview";
import { getAssignmentContent } from "@actions/313/section-config";
import { syncSectionRampUpProgress } from "@actions/313/podsie-sync";
import type { AssignmentContent } from "@zod-schema/313/podsie/section-config";
import { MultiSectionSelector, SectionCard } from "./components";
import { getSectionColors } from "@/app/scm/podsie/velocity/utils/colors";

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
  currentLesson: string;
  currentActivity: string;
}

export default function BulkSyncPage() {
  const [sectionOptions, setSectionOptions] = useState<SectionOption[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [sectionsData, setSectionsData] = useState<Map<string, SectionWithUnits>>(new Map());
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
      const result = await getAllSectionConfigs();

      if (result.success && result.data) {
        const options: SectionOption[] = [];
        result.data.forEach((schoolGroup) => {
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

        // Select all sections by default
        setSelectedSections(options.map(opt => opt.id));

        // Compute colors for all sections
        const colors = getSectionColors(options);
        setSectionColors(colors);
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

  // Sync a single assignment
  const syncAssignment = async (
    section: string,
    assignment: AssignmentContent,
    onProgress?: (lesson: string, activity: string) => void
  ) => {
    const activities = assignment.podsieActivities || [];
    if (activities.length === 0) return;

    for (const activity of activities) {
      const activityTypeLabel =
        activity.activityType === 'mastery-check' ? 'Mastery Check' :
        activity.activityType === 'assessment' ? 'Assessment' :
        'Sidekick';

      // Update progress callback
      if (onProgress) {
        onProgress(assignment.lessonName, activityTypeLabel);
      }

      try {
        const parts = assignment.unitLessonId.split('.');
        const unitCode = `${assignment.grade}.${parts[0]}`;
        const baseQuestionIds = activity.podsieQuestionMap
          ?.filter(q => q.isRoot !== false)
          .map(q => Number(q.questionId));

        await syncSectionRampUpProgress(
          section,
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
      } catch (err) {
        console.error(`Error syncing assignment ${assignment.lessonName}:`, err);
      }
    }
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
          // Update progress state
          setSyncProgress({
            totalAssignments,
            completedAssignments,
            currentSchool: section.school,
            currentSection: section.classSection,
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

          // Sync the assignment
          await syncAssignment(section.classSection, assignment, (lesson, activity) => {
            setSyncProgress(prev => prev ? {
              ...prev,
              currentLesson: lesson,
              currentActivity: activity
            } : null);
          });

          completedAssignments++;
        }
      }

      // Hide progress toast
      progressToast.hideToast();

      // Show success toast
      resultToast.showToast({
        title: "Sync Complete!",
        description: `Successfully synced ${totalAssignments} assignments across ${sectionsData.size} section${sectionsData.size !== 1 ? 's' : ''}`,
        variant: "success",
        icon: CheckCircleIcon,
      });
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

    // Show initial progress toast
    progressToast.showToast({
      title: "Syncing Section Progress",
      description: `Starting sync for ${section.classSection}...`,
      variant: "info",
      icon: InformationCircleIcon,
    });

    try {
      for (const assignment of sectionData.assignments) {
        // Update progress state
        setSyncProgress({
          totalAssignments,
          completedAssignments,
          currentSchool: section.school,
          currentSection: section.classSection,
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

        await syncAssignment(section.classSection, assignment, (lesson, activity) => {
          setSyncProgress(prev => prev ? {
            ...prev,
            currentLesson: lesson,
            currentActivity: activity
          } : null);
        });

        completedAssignments++;
      }

      // Hide progress toast
      progressToast.hideToast();

      // Show success toast
      resultToast.showToast({
        title: "Section Sync Complete!",
        description: `Successfully synced ${totalAssignments} assignments for ${section.classSection}`,
        variant: "success",
        icon: CheckCircleIcon,
      });
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

        await syncAssignment(section.classSection, assignment, (lesson, activity) => {
          setSyncProgress(prev => prev ? {
            ...prev,
            currentLesson: lesson,
            currentActivity: activity
          } : null);
        });

        completedAssignments++;
      }

      // Hide progress toast
      progressToast.hideToast();

      // Show success toast
      resultToast.showToast({
        title: "Unit Sync Complete!",
        description: `Successfully synced ${totalAssignments} assignments in Unit ${unitNumber}`,
        variant: "success",
        icon: CheckCircleIcon,
      });
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
            {/* Sync All Button with Progress */}
            {sectionsData.size > 0 && (
              <div className="flex items-center gap-3">
                {syncing && syncProgress && (
                  <div className="flex-shrink-0 w-48">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(syncProgress.completedAssignments / syncProgress.totalAssignments) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 mt-1 text-center">
                      {syncProgress.completedAssignments} / {syncProgress.totalAssignments}
                    </div>
                  </div>
                )}
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
              </div>
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

        {/* Sections Display */}
        {!loading && sectionsData.size > 0 && (
          <div className="space-y-8">
            {Array.from(sectionsData.entries()).map(([sectionId, sectionData]) => (
              <SectionCard
                key={sectionId}
                sectionName={sectionData.classSection}
                teacher={sectionData.teacher}
                gradeLevel={sectionData.gradeLevel}
                assignmentsCount={sectionData.assignments.length}
                unitGroups={sectionData.unitGroups}
                syncing={syncing}
                onSyncSection={() => syncSection(sectionId)}
                onSyncUnit={(unitNumber) => syncUnit(sectionId, unitNumber)}
              />
            ))}
          </div>
        )}

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
