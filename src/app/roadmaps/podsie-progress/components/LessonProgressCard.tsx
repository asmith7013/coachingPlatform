import { useMemo } from "react";

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

interface ProgressData {
  studentId: string;
  studentName: string;
  unitCode: string;
  rampUpId: string;
  rampUpName?: string;
  podsieAssignmentId?: string;
  questions: Array<{ questionNumber: number; completed: boolean }>;
  totalQuestions: number;
  completedCount: number;
  percentComplete: number;
  isFullyComplete: boolean;
  lastSyncedAt?: string;
}

interface LessonProgressCardProps {
  lesson: LessonConfig;
  masteryCheck?: LessonConfig;
  progressData: ProgressData[];
  calculateSummaryStats: (data: ProgressData[]) => {
    avgCompletion: number;
    fullyComplete: number;
    totalStudents: number;
    syncedStudents: number;
  };
  onClick?: () => void;
}

export function LessonProgressCard({
  lesson,
  masteryCheck,
  progressData,
  calculateSummaryStats,
  onClick,
}: LessonProgressCardProps) {
  // Calculate lesson progress
  const lessonProgress = useMemo(() => {
    const lessonProgressData = progressData.filter(
      p => p.podsieAssignmentId
        ? p.podsieAssignmentId === lesson.podsieAssignmentId
        : p.rampUpId === lesson.unitLessonId
    );
    const stats = calculateSummaryStats(lessonProgressData);
    return Math.round(stats.avgCompletion);
  }, [progressData, lesson, calculateSummaryStats]);

  // Calculate mastery check progress if it exists
  const masteryCheckProgress = useMemo(() => {
    if (!masteryCheck) return null;

    const masteryCheckProgressData = progressData.filter(
      p => p.podsieAssignmentId
        ? p.podsieAssignmentId === masteryCheck.podsieAssignmentId
        : p.rampUpId === masteryCheck.unitLessonId
    );
    const stats = calculateSummaryStats(masteryCheckProgressData);
    return Math.round(stats.avgCompletion);
  }, [progressData, masteryCheck, calculateSummaryStats]);

  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 p-5 mb-4 shadow-sm flex flex-col h-full cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all"
    >
      <h3 className="text-base font-semibold text-gray-900 mb-3">
        {lesson.lessonName}
      </h3>

      <div className="space-y-3 mt-auto">
        {/* Lesson Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">Lesson Progress</span>
            <span className="text-xs font-bold text-blue-700">{lessonProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all bg-gradient-to-r from-blue-500 to-blue-600"
              style={{ width: `${lessonProgress}%` }}
            />
          </div>
        </div>

        {/* Mastery Check Progress Bar (if exists) */}
        {masteryCheck && masteryCheckProgress !== null && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">Mastery Check Progress</span>
              <span className="text-xs font-bold text-green-700">{masteryCheckProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all bg-gradient-to-r from-green-500 to-green-600"
                style={{ width: `${masteryCheckProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
