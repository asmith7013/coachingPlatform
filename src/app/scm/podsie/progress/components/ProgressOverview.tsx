import { ArrowPathIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { LessonProgressCard } from "./LessonProgressCard";
import { LessonConfig, ProgressData, SummaryStats } from "../types";
import { groupAssignmentsByUnitLesson, groupAssignmentsBySection } from "../utils/groupAssignments";

interface ProgressOverviewProps {
  selectedUnit: number;
  selectedLessonSection: string;
  lessons: LessonConfig[];
  progressData: ProgressData[];
  syncing: string | null;
  syncingAll: boolean;
  onSyncAll: () => void;
  onExportCsv: () => void;
  exportingCsv: boolean;
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
  onExportCsv,
  exportingCsv,
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
  const groupedBySection = groupAssignmentsBySection(lessons);
  const showingSections = selectedLessonSection === 'all';

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Unit {selectedUnit}: {
            // Handle special cases: "All", single letter sections, and sections with subsections (e.g., "C:1")
            selectedLessonSection === 'all'
              ? 'All Lessons'
              : selectedLessonSection.includes(':')
              ? (() => {
                  const [section] = selectedLessonSection.split(':');
                  return section === 'Ramp Ups' || section === 'Unit Assessment'
                    ? section
                    : `Section ${section}`;
                })()
              : selectedLessonSection.length === 1
              ? `Section ${selectedLessonSection}`
              : selectedLessonSection
          }
          {selectedLessonSection.includes(':') && (
            <span className="text-sm px-2 py-0.5 rounded bg-gray-200 text-gray-600 font-medium">
              Part {selectedLessonSection.split(':')[1]}
            </span>
          )}
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
        <div className="flex items-center gap-2">
          <button
            onClick={onExportCsv}
            disabled={exportingCsv || lessons.length === 0}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              exportingCsv || lessons.length === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            }`}
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            {exportingCsv ? "Exporting..." : "Export CSV"}
          </button>
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
      </div>

      {/* Progress Cards Grid */}
      {showingSections ? (
        // When showing "All", group by section
        <div className="space-y-6">
          {groupedBySection.map(({ section, subsection, sectionDisplayName, assignments }) => (
            <div key={`section-progress-${section}${subsection !== undefined ? `:${subsection}` : ''}`}>
              {/* Section Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 px-3 py-1 rounded-r mb-3">
                <h4 className="text-sm font-semibold text-blue-900">{sectionDisplayName}</h4>
              </div>

              {/* Progress Cards for this section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pl-4">
                {assignments.map(({ lesson, masteryCheck }) => {
                  const cardId = `assignment-${lesson.section}-${lesson.unitLessonId}-${lesson.podsieAssignmentId}`;
                  return (
                    <LessonProgressCard
                      key={`progress-${lesson.podsieAssignmentId}`}
                      lesson={lesson}
                      masteryCheck={masteryCheck || undefined}
                      progressData={progressData}
                      calculateSummaryStats={calculateSummaryStats}
                      sectionName={section}
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
          ))}
        </div>
      ) : (
        // When showing a specific section, single grid
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
      )}
    </div>
  );
}
