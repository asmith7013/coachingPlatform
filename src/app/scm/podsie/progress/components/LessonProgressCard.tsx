import { useMemo } from "react";

interface LessonConfig {
  unitLessonId: string;
  lessonName: string;
  grade: string;
  podsieAssignmentId: string;
  totalQuestions: number;
  section?: string;
  unitNumber: number;
  activityType?: 'sidekick' | 'mastery-check' | 'assessment';
  hasZearnActivity?: boolean;
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
  zearnCompleted?: boolean;
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
  sectionName?: string;
}

export function LessonProgressCard({
  lesson,
  masteryCheck,
  progressData,
  calculateSummaryStats,
  onClick,
  sectionName,
}: LessonProgressCardProps) {
  // Extract lesson number from unitLessonId (e.g., "4.3" -> "3")
  const lessonNumber = lesson.unitLessonId.includes('.')
    ? lesson.unitLessonId.split('.')[1]
    : lesson.unitLessonId;

  // Check if we should show the lesson number (hide for Ramp Ups and Unit Assessment)
  const showLessonNumber = sectionName !== 'Ramp Ups' && sectionName !== 'Unit Assessment';
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

  // Calculate Zearn progress if the lesson has Zearn
  const zearnProgress = useMemo(() => {
    if (!lesson.hasZearnActivity) return null;

    const lessonProgressData = progressData.filter(
      p => p.podsieAssignmentId
        ? p.podsieAssignmentId === lesson.podsieAssignmentId
        : p.rampUpId === lesson.unitLessonId
    );

    if (lessonProgressData.length === 0) return 0;

    const zearnCompleted = lessonProgressData.filter(p => p.zearnCompleted).length;
    return Math.round((zearnCompleted / lessonProgressData.length) * 100);
  }, [progressData, lesson]);

  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 p-5 mb-4 shadow-sm flex flex-col h-full cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all"
    >
      {/* Header with lesson number */}
      <div className="mb-3">
        {showLessonNumber && (
          <div className="text-xs font-semibold text-indigo-600 mb-1">
            Lesson {lessonNumber}
          </div>
        )}
        <h3 className="text-base font-semibold text-gray-900">
          {lesson.lessonName}
        </h3>
      </div>

      <div className="space-y-3 mt-auto">
        {/* Zearn Progress Bar (if exists) */}
        {zearnProgress !== null && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-purple-700">Zearn</span>
              <span className="text-xs font-bold text-purple-700">{zearnProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all bg-gradient-to-r from-purple-500 to-purple-600"
                style={{ width: `${zearnProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Sidekick Progress Bar (if lesson is sidekick) */}
        {lesson.activityType === 'sidekick' && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">Sidekick</span>
              <span className="text-xs font-bold text-blue-700">{lessonProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all bg-gradient-to-r from-blue-500 to-blue-600"
                style={{ width: `${lessonProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Mastery Check Progress Bar (if lesson is mastery-check OR if separate masteryCheck exists) */}
        {lesson.activityType === 'mastery-check' && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">Mastery Check</span>
              <span className="text-xs font-bold text-green-700">{lessonProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all bg-gradient-to-r from-green-500 to-green-600"
                style={{ width: `${lessonProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Separate Mastery Check Progress Bar (if paired with a sidekick lesson) */}
        {masteryCheck && masteryCheckProgress !== null && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">Mastery Check</span>
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
