import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { LessonProgressCard } from "./LessonProgressCard";
import { LessonConfig, ProgressData, SummaryStats } from "../types";
import { groupAssignmentsByUnitLesson } from "../utils/groupAssignments";

interface ProgressOverviewProps {
  selectedUnit: number;
  selectedLessonSection: string;
  lessons: LessonConfig[];
  progressData: ProgressData[];
  syncing: string | null;
  syncingAll: boolean;
  onSyncAll: () => void;
  calculateSummaryStats: (data: ProgressData[]) => SummaryStats;
}

export function ProgressOverview({
  selectedUnit,
  selectedLessonSection,
  lessons,
  progressData,
  syncing,
  syncingAll,
  onSyncAll,
  calculateSummaryStats,
}: ProgressOverviewProps) {
  // Calculate overall progress for all assignments in this section
  const allAssignmentProgressData = lessons.flatMap(assignment => {
    return progressData.filter(p =>
      p.podsieAssignmentId
        ? p.podsieAssignmentId === assignment.podsieAssignmentId
        : p.rampUpId === assignment.unitLessonId
    );
  });

  const overallStats = calculateSummaryStats(allAssignmentProgressData);
  const overallProgress = Math.round(overallStats.avgCompletion);

  // Group lessons with their matching mastery checks
  const groupedAssignments = groupAssignmentsByUnitLesson(lessons);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Unit {selectedUnit}: {
            // Add "Section" prefix for single letter sections (A, B, C, etc.)
            // but not for "Ramp Ups" or "Unit Assessment"
            selectedLessonSection.length === 1
              ? `Section ${selectedLessonSection}`
              : selectedLessonSection
          }
        </h2>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {lessons.length} {lessons.length === 1 ? 'Assignment' : 'Assignments'}
        </span>
        <div className="flex-1 flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-3 max-w-md">
            <div
              className="h-3 rounded-full transition-all bg-gradient-to-r from-blue-500 to-blue-600"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="text-sm font-bold text-blue-700 min-w-[3rem]">{overallProgress}%</span>
        </div>
        <button
          onClick={onSyncAll}
          disabled={syncingAll || syncing !== null}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            syncingAll || syncing !== null
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
          }`}
        >
          <ArrowPathIcon className={`w-5 h-5 ${syncingAll ? "animate-spin" : ""}`} />
          {syncingAll ? "Syncing All..." : "Sync All"}
        </button>
      </div>

      {/* Progress Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {groupedAssignments.map(({ lesson, masteryCheck }) => {
          const cardId = `assignment-${lesson.section}-${lesson.unitLessonId}-${lesson.podsieAssignmentId}`;
          return (
            <LessonProgressCard
              key={`progress-${lesson.podsieAssignmentId}`}
              lesson={lesson}
              masteryCheck={masteryCheck || undefined}
              progressData={progressData}
              calculateSummaryStats={calculateSummaryStats}
              sectionName={selectedLessonSection}
              onClick={() => {
                const element = document.getElementById(cardId);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
