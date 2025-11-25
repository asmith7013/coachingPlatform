import { useMemo, useState } from "react";
import { ArrowPathIcon, PencilIcon } from "@heroicons/react/24/outline";
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
}

interface RampUpQuestion {
  questionNumber: number;
  completed: boolean;
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
  onSync: (testMode: boolean) => void;
  onMasteryCheckSync?: (testMode: boolean) => void;
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

  // Filter progress data to only show this assignment's data
  // Use podsieAssignmentId to distinguish between lesson and mastery-check with same unitLessonId
  const filteredProgressData = useMemo(
    () => {
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
    [progressData, assignment.podsieAssignmentId, assignment.unitLessonId]
  );

  // Filter mastery check progress data if provided
  const filteredMasteryCheckData = useMemo(
    () => {
      if (!masteryCheckAssignment) return [];

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
    },
    [progressData, masteryCheckAssignment]
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
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <button
                  onClick={() => onSync(false)}
                  disabled={syncing || !assignment.podsieAssignmentId}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    syncing || !assignment.podsieAssignmentId
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                  }`}
                >
                  <ArrowPathIcon
                    className={`w-5 h-5 ${syncing ? "animate-spin" : ""}`}
                  />
                  {syncing ? "Syncing Lesson..." : "Sync Lesson"}
                </button>
                {masteryCheckAssignment && onMasteryCheckSync && (
                  <button
                    onClick={() => onMasteryCheckSync(false)}
                    disabled={masteryCheckSyncing || !masteryCheckAssignment.podsieAssignmentId}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      masteryCheckSyncing || !masteryCheckAssignment.podsieAssignmentId
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                    }`}
                  >
                    <ArrowPathIcon
                      className={`w-5 h-5 ${masteryCheckSyncing ? "animate-spin" : ""}`}
                    />
                    {masteryCheckSyncing ? "Syncing Mastery..." : "Sync Mastery Check"}
                  </button>
                )}
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

      {/* Progress Table */}
      <div className="overflow-x-auto">
        <AssignmentProgressTable
          progressData={filteredProgressData}
          masteryCheckProgressData={filteredMasteryCheckData}
          totalQuestions={assignment.totalQuestions}
        />
      </div>
    </div>
  );
}
