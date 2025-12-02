import { useMemo, useState } from "react";
import { ArrowPathIcon, PencilIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon as CheckCircleOutlineIcon } from "@heroicons/react/24/outline";
import { AssignmentProgressTable } from "./AssignmentProgressTable";

interface LessonConfig {
  unitLessonId: string;
  lessonName: string;
  grade: string;
  podsieAssignmentId: string;
  totalQuestions: number;
  section?: string;
  unitNumber: number;
  assignmentType?: 'lesson' | 'mastery-check';
  hasZearnLesson?: boolean;
}

interface RampUpQuestion {
  questionNumber: number;
  completed: boolean;
  completedAt?: string;
}

interface ProgressData {
  studentId: string;
  studentName: string;
  unitCode: string;
  rampUpId: string;
  rampUpName?: string;
  podsieAssignmentId?: string;
  questions: RampUpQuestion[];
  totalQuestions: number;
  completedCount: number;
  percentComplete: number;
  isFullyComplete: boolean;
  lastSyncedAt?: string;
}

interface AssignmentCardProps {
  assignment: LessonConfig;
  masteryCheckAssignment?: LessonConfig;
  progressData: ProgressData[];
  syncing: boolean;
  masteryCheckSyncing?: boolean;
  onSync: (testMode: boolean) => Promise<void>;
  onMasteryCheckSync?: (testMode: boolean) => Promise<void>;
  calculateSummaryStats: (data: ProgressData[]) => {
    avgCompletion: number;
    fullyComplete: number;
    totalStudents: number;
    syncedStudents: number;
  };
}

export function AssignmentCard({
  assignment,
  masteryCheckAssignment,
  progressData,
  syncing,
  masteryCheckSyncing,
  onSync,
  onMasteryCheckSync,
  calculateSummaryStats: _calculateSummaryStats,
}: AssignmentCardProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [syncingBoth, setSyncingBoth] = useState(false);

  // Handler to sync both lesson and mastery check (or just lesson if no mastery check)
  const handleSyncBoth = async () => {
    setSyncingBoth(true);
    try {
      // Sync lesson first
      await onSync(false);
      // Then sync mastery check if it exists
      if (masteryCheckAssignment && onMasteryCheckSync) {
        await onMasteryCheckSync(false);
      }
    } finally {
      setSyncingBoth(false);
    }
  };

  // Check if this is a standalone mastery check (mastery check without a paired lesson)
  const isStandaloneMasteryCheck = assignment.assignmentType === 'mastery-check' && !masteryCheckAssignment;

  // Filter progress data to only show this assignment's data
  // Use podsieAssignmentId to distinguish between lesson and mastery-check with same unitLessonId
  const filteredProgressData = useMemo(
    () => {
      // For standalone mastery checks, we need to get all students from the section
      // so the table can show rows with blank lesson columns
      if (isStandaloneMasteryCheck) {
        // Get all unique students from the progress data for this section
        const allStudents = progressData.filter(p =>
          p.podsieAssignmentId === assignment.podsieAssignmentId ||
          p.rampUpId === assignment.unitLessonId
        );

        // Deduplicate by studentId
        const seen = new Set();
        const uniqueStudents = allStudents.filter(p => {
          if (seen.has(p.studentId)) {
            return false;
          }
          seen.add(p.studentId);
          return true;
        });

        // Create empty lesson progress data for each student (so they appear in the table)
        return uniqueStudents.map(p => ({
          ...p,
          questions: [], // No lesson questions for standalone mastery check
          totalQuestions: 0,
          completedCount: 0,
          percentComplete: 0,
          isFullyComplete: false
        }));
      }

      const filtered = progressData.filter(p =>
        p.podsieAssignmentId
          ? p.podsieAssignmentId === assignment.podsieAssignmentId
          : p.rampUpId === assignment.unitLessonId
      );

      // Deduplicate by studentId (keep only the first occurrence of each student)
      const seen = new Set();
      return filtered.filter(p => {
        if (seen.has(p.studentId)) {
          return false;
        }
        seen.add(p.studentId);
        return true;
      });
    },
    [progressData, assignment.podsieAssignmentId, assignment.unitLessonId, isStandaloneMasteryCheck, assignment]
  );

  // Filter mastery check progress data if provided
  const filteredMasteryCheckData = useMemo(
    () => {
      // If there's a separate mastery check assignment, use its data
      if (masteryCheckAssignment) {
        const filtered = progressData.filter(p =>
          p.podsieAssignmentId
            ? p.podsieAssignmentId === masteryCheckAssignment.podsieAssignmentId
            : p.rampUpId === masteryCheckAssignment.unitLessonId
        );

        // Deduplicate by studentId (keep only the first occurrence of each student)
        const seen = new Set();
        return filtered.filter(p => {
          if (seen.has(p.studentId)) {
            return false;
          }
          seen.add(p.studentId);
          return true;
        });
      }

      // If this is a standalone mastery check, use the assignment's data
      if (isStandaloneMasteryCheck) {
        const filtered = progressData.filter(p =>
          p.podsieAssignmentId
            ? p.podsieAssignmentId === assignment.podsieAssignmentId
            : p.rampUpId === assignment.unitLessonId
        );

        // Deduplicate by studentId (keep only the first occurrence of each student)
        const seen = new Set();
        return filtered.filter(p => {
          if (seen.has(p.studentId)) {
            return false;
          }
          seen.add(p.studentId);
          return true;
        });
      }

      return [];
    },
    [progressData, masteryCheckAssignment, assignment, isStandaloneMasteryCheck]
  );

  // Format unitLessonId as "Unit X, Lesson Y"
  const formatUnitLesson = (unitLessonId: string) => {
    const parts = unitLessonId.split('.');
    if (parts.length === 2) {
      return `Unit ${parts[0]}, Lesson ${parts[1]}`;
    }
    return unitLessonId;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-visible">
      {/* Card Header - Sticky */}
      <div className="sticky top-0 z-30 bg-gray-50 border-b border-gray-200 px-6 py-4 shadow-md rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {assignment.lessonName}
            </h3>
            <p className="text-sm text-gray-500">
              {formatUnitLesson(assignment.unitLessonId)} • {assignment.totalQuestions} questions • Section: {assignment.section}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Legend Key - White Card */}
            <div className="bg-white border border-gray-300 rounded-lg px-3 py-2">
              <div className="flex items-center gap-3 text-xs text-gray-700">
                <div className="flex items-center gap-1">
                  <CheckCircleIcon className="w-4 h-4 text-green-700" />
                  <span className="font-medium">Today</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircleOutlineIcon className="w-4 h-4 text-green-700" />
                  <span className="font-medium">Earlier</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {isEditMode ? (
                <>
                  {/* Single Sync Button */}
                  <button
                    onClick={handleSyncBoth}
                    disabled={
                      syncingBoth ||
                      syncing ||
                      masteryCheckSyncing ||
                      !assignment.podsieAssignmentId ||
                      (masteryCheckAssignment && !masteryCheckAssignment.podsieAssignmentId)
                    }
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      syncingBoth ||
                      syncing ||
                      masteryCheckSyncing ||
                      !assignment.podsieAssignmentId ||
                      (masteryCheckAssignment && !masteryCheckAssignment.podsieAssignmentId)
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                    }`}
                  >
                    <ArrowPathIcon
                      className={`w-5 h-5 ${syncingBoth || syncing || masteryCheckSyncing ? "animate-spin" : ""}`}
                    />
                    {syncingBoth || syncing || masteryCheckSyncing
                      ? "Syncing..."
                      : masteryCheckAssignment
                        ? "Sync Both"
                        : "Sync"}
                  </button>
                </>
              ) : null}
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                  isEditMode
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <PencilIcon className="w-4 h-4" />
                {isEditMode ? "Done" : "Edit"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Table */}
      <div className="overflow-x-auto">
        <AssignmentProgressTable
          progressData={filteredProgressData}
          masteryCheckProgressData={filteredMasteryCheckData}
          totalQuestions={assignment.totalQuestions}
          showZearnColumn={assignment.hasZearnLesson ?? false}
        />
      </div>
    </div>
  );
}
