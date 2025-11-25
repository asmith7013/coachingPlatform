import { useMemo } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
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
  progressData: ProgressData[];
  syncing: boolean;
  onSync: (testMode: boolean) => void;
  calculateSummaryStats: (data: ProgressData[]) => {
    avgCompletion: number;
    fullyComplete: number;
    totalStudents: number;
    syncedStudents: number;
  };
}

export function AssignmentCard({
  assignment,
  progressData,
  syncing,
  onSync,
  calculateSummaryStats,
}: AssignmentCardProps) {
  // Filter progress data to only show this assignment's data
  // Use podsieAssignmentId to distinguish between lesson and mastery-check with same unitLessonId
  const filteredProgressData = useMemo(
    () => progressData.filter(p =>
      p.podsieAssignmentId
        ? p.podsieAssignmentId === assignment.podsieAssignmentId
        : p.rampUpId === assignment.unitLessonId
    ),
    [progressData, assignment.podsieAssignmentId, assignment.unitLessonId]
  );

  const summaryStats = useMemo(
    () => calculateSummaryStats(filteredProgressData),
    [filteredProgressData, calculateSummaryStats]
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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {assignment.lessonName}
            </h3>
            <p className="text-sm text-gray-500">
              {formatUnitLesson(assignment.unitLessonId)} • {assignment.totalQuestions} questions
              {assignment.section && (
                <span className="ml-2 text-gray-600">
                  Section: {assignment.section}
                </span>
              )}
              {!assignment.podsieAssignmentId && (
                <span className="text-yellow-600 ml-2">
                  (No Podsie ID configured)
                </span>
              )}
            </p>
          </div>
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
            {syncing ? "Syncing..." : "Sync from Podsie"}
          </button>
        </div>

        {/* Summary Stats */}
        {filteredProgressData.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {summaryStats.totalStudents}
              </div>
              <div className="text-xs text-gray-500">Students</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">
                {summaryStats.avgCompletion}%
              </div>
              <div className="text-xs text-gray-500">Avg Completion</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                {summaryStats.fullyComplete}
              </div>
              <div className="text-xs text-gray-500">Fully Complete</div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Table */}
      <AssignmentProgressTable
        progressData={filteredProgressData}
        totalQuestions={assignment.totalQuestions}
      />
    </div>
  );
}
