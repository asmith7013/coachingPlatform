"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/24/solid";
import { useToast } from "@/components/core/feedback/Toast";
import { Spinner } from "@/components/core/feedback/Spinner";
import { getSectionOptions, getAssignmentContent } from "@actions/313/section-config";
import { syncSectionRampUpProgress } from "@actions/313/podsie-sync";
import type { AssignmentContent } from "@zod-schema/313/podsie/section-config";
import { SchoolSelector, SectionCard } from "./components";

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
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [sectionsData, setSectionsData] = useState<Map<string, SectionWithUnits>>(new Map());
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);

  // Toast instances for live progress tracking
  const progressToast = useToast();
  const resultToast = useToast();

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

  // Load all sections for the selected school
  const loadSchoolSections = useCallback(async () => {
    if (!selectedSchool) return;

    setLoading(true);
    setError(null);
    setSectionsData(new Map());

    try {
      const schoolSections = sections.filter(s => s.school === selectedSchool);
      const newSectionsData = new Map<string, SectionWithUnits>();

      // Load assignments for each section
      for (const section of schoolSections) {
        const result = await getAssignmentContent(selectedSchool, section.classSection);
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

          newSectionsData.set(section.classSection, {
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
      console.error("Error loading school sections:", err);
      setError("Failed to load sections for school");
    } finally {
      setLoading(false);
    }
  }, [selectedSchool, sections]);

  // Load school sections when school is selected
  useEffect(() => {
    if (selectedSchool) {
      loadSchoolSections();
    } else {
      setSectionsData(new Map());
    }
  }, [selectedSchool, loadSchoolSections]);

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

  // Sync all sections in the school
  const syncAllSchool = async () => {
    if (!selectedSchool || sectionsData.size === 0) return;

    setSyncing(true);

    // Calculate total assignments across all sections
    let totalAssignments = 0;
    sectionsData.forEach(sectionData => {
      totalAssignments += sectionData.assignments.length;
    });

    let completedAssignments = 0;

    // Show initial progress toast
    progressToast.showToast({
      title: "Syncing School Progress",
      description: `Starting sync for ${selectedSchool}...`,
      variant: "info",
      icon: InformationCircleIcon,
    });

    try {
      // Iterate through each section
      for (const [sectionName, sectionData] of sectionsData) {
        // Iterate through each assignment in the section
        for (const assignment of sectionData.assignments) {
          // Update progress state
          setSyncProgress({
            totalAssignments,
            completedAssignments,
            currentSchool: selectedSchool,
            currentSection: sectionName,
            currentLesson: assignment.lessonName,
            currentActivity: ''
          });

          // Update progress toast
          progressToast.showToast({
            title: `Syncing ${selectedSchool} (${completedAssignments}/${totalAssignments})`,
            description: `Section: ${sectionName} | Lesson: ${assignment.lessonName}`,
            variant: "info",
            icon: InformationCircleIcon,
          });

          // Sync the assignment
          await syncAssignment(sectionName, assignment, (lesson, activity) => {
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
        title: "School Sync Complete!",
        description: `Successfully synced ${totalAssignments} assignments across ${sectionsData.size} sections in ${selectedSchool}`,
        variant: "success",
        icon: CheckCircleIcon,
      });
    } catch (err) {
      console.error("Error syncing school:", err);
      progressToast.hideToast();
      resultToast.showToast({
        title: "School Sync Failed",
        description: `An error occurred while syncing ${selectedSchool}`,
        variant: "error",
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setSyncing(false);
      setSyncProgress(null);
    }
  };

  // Sync a single section
  const syncSection = async (sectionName: string) => {
    const sectionData = sectionsData.get(sectionName);
    if (!sectionData) return;

    setSyncing(true);

    const totalAssignments = sectionData.assignments.length;
    let completedAssignments = 0;

    // Show initial progress toast
    progressToast.showToast({
      title: "Syncing Section Progress",
      description: `Starting sync for ${sectionName}...`,
      variant: "info",
      icon: InformationCircleIcon,
    });

    try {
      for (const assignment of sectionData.assignments) {
        // Update progress state
        setSyncProgress({
          totalAssignments,
          completedAssignments,
          currentSchool: selectedSchool,
          currentSection: sectionName,
          currentLesson: assignment.lessonName,
          currentActivity: ''
        });

        // Update progress toast
        progressToast.showToast({
          title: `Syncing ${sectionName} (${completedAssignments}/${totalAssignments})`,
          description: `Lesson: ${assignment.lessonName}`,
          variant: "info",
          icon: InformationCircleIcon,
        });

        await syncAssignment(sectionName, assignment, (lesson, activity) => {
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
        description: `Successfully synced ${totalAssignments} assignments for ${sectionName}`,
        variant: "success",
        icon: CheckCircleIcon,
      });
    } catch (err) {
      console.error("Error syncing section:", err);
      progressToast.hideToast();
      resultToast.showToast({
        title: "Section Sync Failed",
        description: `An error occurred while syncing ${sectionName}`,
        variant: "error",
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setSyncing(false);
      setSyncProgress(null);
    }
  };

  // Sync a single unit within a section
  const syncUnit = async (sectionName: string, unitNumber: number) => {
    const sectionData = sectionsData.get(sectionName);
    if (!sectionData) return;

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
          currentSchool: selectedSchool,
          currentSection: sectionName,
          currentLesson: assignment.lessonName,
          currentActivity: ''
        });

        // Update progress toast
        progressToast.showToast({
          title: `Syncing Unit ${unitNumber} - ${sectionName} (${completedAssignments}/${totalAssignments})`,
          description: `Lesson: ${assignment.lessonName}`,
          variant: "info",
          icon: InformationCircleIcon,
        });

        await syncAssignment(sectionName, assignment, (lesson, activity) => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Sync</h1>
          <p className="text-gray-600">Sync assignments across entire schools or sections</p>
        </div>

        {/* School Selection */}
        <SchoolSelector
          schools={Array.from(new Set(sections.map(s => s.school)))}
          selectedSchool={selectedSchool}
          onSchoolChange={setSelectedSchool}
          hasSections={sectionsData.size > 0}
          syncing={syncing}
          syncProgress={syncProgress}
          onSyncAll={syncAllSchool}
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
        {!loading && selectedSchool && sectionsData.size > 0 && (
          <div className="space-y-8">
            {Array.from(sectionsData.entries()).map(([sectionName, sectionData]) => (
              <SectionCard
                key={sectionName}
                sectionName={sectionName}
                teacher={sectionData.teacher}
                gradeLevel={sectionData.gradeLevel}
                assignmentsCount={sectionData.assignments.length}
                unitGroups={sectionData.unitGroups}
                syncing={syncing}
                onSyncSection={() => syncSection(sectionName)}
                onSyncUnit={(unitNumber) => syncUnit(sectionName, unitNumber)}
              />
            ))}
          </div>
        )}

        {/* No School Selected */}
        {!loading && !selectedSchool && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">Select a school to view sections and assignments</p>
          </div>
        )}

        {/* No Sections Found */}
        {!loading && selectedSchool && sectionsData.size === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">No sections found for this school</p>
          </div>
        )}
      </div>
    </div>
  );
}
