import { useMemo } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon as CheckCircleOutlineIcon } from "@heroicons/react/24/outline";

/**
 * Component for rendering completion checkmark with different styles
 * - Today: ● Fully filled dark green solid checkmark
 * - Yesterday/Prior: ○ Dark green outline with white/transparent center
 */
function CompletionCheckmark({
  iconStyle,
  title,
}: {
  iconStyle: "today" | "yesterday" | "prior" | "default";
  title: string;
}) {
  if (iconStyle === "today") {
    // ● Fully filled dark green solid checkmark (only for today)
    return (
      <div className="group relative inline-block">
        <CheckCircleIcon className="w-5 h-5 text-green-700 mx-auto" />
        <span className="invisible group-hover:visible absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap">
          {title}
        </span>
      </div>
    );
  }

  if (iconStyle === "yesterday" || iconStyle === "prior") {
    // ○ Dark green outline with white/transparent center (using outline icon)
    return (
      <div className="group relative inline-block">
        <CheckCircleOutlineIcon className="w-5 h-5 text-green-700 mx-auto" />
        <span className="invisible group-hover:visible absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap">
          {title}
        </span>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="group relative inline-block">
      <CheckCircleIcon className="w-5 h-5 text-green-600 mx-auto" />
      <span className="invisible group-hover:visible absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap">
        {title}
      </span>
    </div>
  );
}

/**
 * Helper function to determine the green shade based on completion date
 * Returns the appropriate styling info and formatted date string
 */
function getCompletionStyle(completedAt?: string): {
  iconStyle: "today" | "yesterday" | "prior" | "default";
  formattedDate: string;
  dateLabel: string;
} {
  if (!completedAt) {
    return {
      iconStyle: "default",
      formattedDate: "",
      dateLabel: "",
    };
  }

  // Parse the completion date (which is in ISO format from Podsie)
  const completedDate = new Date(completedAt);

  // Get today's date at midnight in local timezone
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get yesterday's date at midnight
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Get the completion date at midnight in local timezone
  const completedDateOnly = new Date(
    completedDate.getFullYear(),
    completedDate.getMonth(),
    completedDate.getDate()
  );

  // Format the date for tooltip
  const formattedDate = completedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Debug logging (remove after testing)
  // console.log('Date comparison:', {
  //   completedAt,
  //   completedDateOnly: completedDateOnly.toISOString(),
  //   today: today.toISOString(),
  //   yesterday: yesterday.toISOString(),
  //   isToday: completedDateOnly.getTime() === today.getTime(),
  //   isYesterday: completedDateOnly.getTime() === yesterday.getTime(),
  // });

  // Determine the style based on when it was completed
  if (completedDateOnly.getTime() === today.getTime()) {
    return {
      iconStyle: "today",
      formattedDate,
      dateLabel: "today",
    };
  } else if (completedDateOnly.getTime() === yesterday.getTime()) {
    return {
      iconStyle: "yesterday",
      formattedDate,
      dateLabel: "yesterday",
    };
  } else {
    return {
      iconStyle: "prior",
      formattedDate,
      dateLabel: "prior",
    };
  }
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
  questions: RampUpQuestion[];
  totalQuestions: number;
  completedCount: number;
  percentComplete: number;
  isFullyComplete: boolean;
  lastSyncedAt?: string;
  zearnCompleted?: boolean;
  zearnCompletionDate?: string;
}

interface AssignmentProgressTableProps {
  progressData: ProgressData[];
  masteryCheckProgressData?: ProgressData[];
  totalQuestions: number;
  showZearnColumn?: boolean;
}

export function AssignmentProgressTable({
  progressData,
  masteryCheckProgressData = [],
  totalQuestions,
  showZearnColumn = false,
}: AssignmentProgressTableProps) {
  // Check if we have actual lesson data (students with synced lesson progress)
  const hasLessonData = progressData.some(p => p.totalQuestions > 0);

  // Only show question columns if we have lesson data
  // (Don't show for mastery-check-only assignments)
  const showQuestionColumns = hasLessonData && totalQuestions > 0;

  // Generate question column headers
  const questionColumns = useMemo(
    () =>
      showQuestionColumns
        ? Array.from({ length: totalQuestions }, (_, i) => i + 1)
        : [],
    [showQuestionColumns, totalQuestions]
  );

  // Calculate per-question completion rates (only for synced students)
  const questionStats = useMemo(() => {
    const syncedStudents = progressData.filter((p) => p.totalQuestions > 0);
    return questionColumns.map((qNum) => {
      const completed = syncedStudents.filter((p) =>
        p.questions.find((q) => q.questionNumber === qNum && q.completed)
      ).length;
      return {
        questionNumber: qNum,
        completed,
        total: syncedStudents.length,
        percent:
          syncedStudents.length > 0
            ? Math.round((completed / syncedStudents.length) * 100)
            : 0,
      };
    });
  }, [progressData, questionColumns]);

  if (progressData.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-400 text-2xl mb-2">👥</div>
        <div className="text-gray-600">No students found in this section</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          {/* Question Headers */}
          <tr className="bg-gray-100 border-b border-gray-200">
            <th className="sticky left-0 bg-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-[200px] z-10">
              Student
            </th>
            {showZearnColumn && (
              <th className="px-4 py-3 text-center text-sm font-semibold text-purple-900 min-w-[80px] bg-purple-50">
                Zearn
              </th>
            )}
            {questionColumns.map((qNum) => (
              <th
                key={qNum}
                className="px-3 py-3 text-center text-sm font-semibold text-gray-700 min-w-[50px]"
              >
                Q{qNum}
              </th>
            ))}
            {masteryCheckProgressData.length > 0 && (
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 min-w-[100px]">
                Mastery Check
              </th>
            )}
          </tr>

          {/* Class Completion Row */}
          <tr className="bg-blue-50 border-b border-gray-200">
            <td className="sticky left-0 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800 z-10">
              Class Completion
            </td>
            {showZearnColumn && (
              <td className="px-4 py-2 text-center text-sm font-bold text-purple-800 bg-purple-50">
                {(() => {
                  const studentsWithData = progressData.filter((p) => p.totalQuestions > 0);
                  const zearnCompleted = studentsWithData.filter(p => p.zearnCompleted).length;
                  return studentsWithData.length > 0
                    ? Math.round((zearnCompleted / studentsWithData.length) * 100)
                    : 0;
                })()}%
              </td>
            )}
            {questionStats.map((stat) => (
              <td
                key={stat.questionNumber}
                className="px-3 py-2 text-center text-xs font-medium text-blue-700"
              >
                {stat.percent}%
              </td>
            ))}
            {masteryCheckProgressData.length > 0 && (
              <td className="px-4 py-2 text-center text-sm font-bold text-blue-800">
                {(() => {
                  const synced = masteryCheckProgressData.filter((p) => p.totalQuestions > 0);
                  const completed = synced.filter(p => p.isFullyComplete).length;
                  return synced.length > 0
                    ? Math.round((completed / synced.length) * 100)
                    : 0;
                })()}%
              </td>
            )}
          </tr>
        </thead>

        <tbody>
          {progressData.map((progress, idx) => {
            // Find matching mastery check data for this student
            const masteryCheckProgress = masteryCheckProgressData.find(
              mc => mc.studentId === progress.studentId
            );
            const masteryCheckSynced = masteryCheckProgress && masteryCheckProgress.totalQuestions > 0;

            // Student has synced if they have lesson data OR mastery check data
            const hasSynced = progress.totalQuestions > 0 || masteryCheckSynced;

            return (
              <tr
                key={progress.studentId}
                className={`border-b border-gray-100 hover:bg-gray-50 ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                }`}
              >
                {/* Student Name */}
                <td className="sticky left-0 bg-inherit px-4 py-3 text-sm font-medium text-gray-900 z-10">
                  <div className="flex items-center gap-2">
                    <span className={!hasSynced ? "text-gray-400" : ""}>
                      {progress.studentName}
                    </span>
                    {!hasSynced && (
                      <span className="text-xs text-gray-400 italic">
                        (not synced)
                      </span>
                    )}
                  </div>
                  {/* Progress bar - commented out */}
                  {/* {hasSynced && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all bg-green-600"
                        style={{
                          width: `${(() => {
                            // Lesson progress is worth 75%
                            const lessonProgress = progress.percentComplete * 0.75;
                            // Mastery check is worth 25% (only if it exists and is synced)
                            const masteryProgress = masteryCheckSynced && masteryCheckProgress?.isFullyComplete ? 25 : 0;
                            return Math.round(lessonProgress + masteryProgress);
                          })()}%`
                        }}
                      />
                    </div>
                  )} */}
                </td>

                {/* Zearn Column */}
                {showZearnColumn && (
                  <td className="px-4 py-3 text-center bg-purple-50/30">
                    {hasSynced && progress.zearnCompleted ? (
                      <div className="group relative inline-block">
                        <CheckCircleIcon
                          className="w-6 h-6 text-purple-600 mx-auto"
                          title={`Zearn lesson completed${progress.zearnCompletionDate ? ` on ${progress.zearnCompletionDate}` : ''}`}
                        />
                        {progress.zearnCompletionDate && (
                          <span className="invisible group-hover:visible absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap">
                            Completed: {progress.zearnCompletionDate}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                )}

                {/* Question Checkmarks */}
                {questionColumns.map((qNum) => {
                  if (!hasSynced) {
                    return (
                      <td key={qNum} className="px-3 py-3 text-center">
                        <span className="text-gray-300">—</span>
                      </td>
                    );
                  }

                  const question = progress.questions.find(
                    (q) => q.questionNumber === qNum
                  );
                  const isCompleted = question?.completed ?? false;
                  const completionInfo = isCompleted
                    ? getCompletionStyle(question?.completedAt)
                    : null;

                  return (
                    <td key={qNum} className="px-3 py-3 text-center">
                      {isCompleted ? (
                        <CompletionCheckmark
                          iconStyle={completionInfo?.iconStyle || "default"}
                          title={
                            completionInfo?.formattedDate
                              ? `Question ${qNum} completed on ${completionInfo.formattedDate}`
                              : `Question ${qNum} completed`
                          }
                        />
                      ) : (
                        <span className="text-gray-400 text-xs" title={`Question ${qNum} not completed`}>
                          —
                        </span>
                      )}
                    </td>
                  );
                })}

                {/* Mastery Check Column */}
                {masteryCheckProgressData.length > 0 && (
                  <td className="px-4 py-3 text-center">
                    {masteryCheckSynced && masteryCheckProgress.isFullyComplete ? (
                      <div className="group relative inline-block">
                        <CheckCircleIcon
                          className="w-7 h-7 text-green-600 mx-auto"
                          title={`Mastery check completed${masteryCheckProgress.lastSyncedAt ? ` on ${new Date(masteryCheckProgress.lastSyncedAt).toLocaleDateString()}` : ''}`}
                        />
                        {masteryCheckProgress.lastSyncedAt && (
                          <span className="invisible group-hover:visible absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap">
                            Completed: {new Date(masteryCheckProgress.lastSyncedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
