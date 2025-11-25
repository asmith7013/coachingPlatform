import { useMemo } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon as CheckCircleOutlineIcon } from "@heroicons/react/24/outline";

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
  questions: RampUpQuestion[];
  totalQuestions: number;
  completedCount: number;
  percentComplete: number;
  isFullyComplete: boolean;
  lastSyncedAt?: string;
}

interface AssignmentProgressTableProps {
  progressData: ProgressData[];
  masteryCheckProgressData?: ProgressData[];
  totalQuestions: number;
}

export function AssignmentProgressTable({
  progressData,
  masteryCheckProgressData = [],
  totalQuestions,
}: AssignmentProgressTableProps) {
  // Generate question column headers
  const questionColumns = Array.from(
    { length: totalQuestions },
    (_, i) => i + 1
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
            const hasSynced = progress.totalQuestions > 0;

            // Find matching mastery check data for this student
            const masteryCheckProgress = masteryCheckProgressData.find(
              mc => mc.studentId === progress.studentId
            );
            const masteryCheckSynced = masteryCheckProgress && masteryCheckProgress.totalQuestions > 0;

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

                  return (
                    <td key={qNum} className="px-3 py-3 text-center">
                      {isCompleted ? (
                        <CheckCircleIcon
                          className="w-5 h-5 text-green-600 mx-auto"
                          title={`Question ${qNum} completed`}
                        />
                      ) : (
                        <CheckCircleOutlineIcon
                          className="w-5 h-5 text-gray-300 mx-auto"
                          title={`Question ${qNum} not completed`}
                        />
                      )}
                    </td>
                  );
                })}

                {/* Mastery Check Column */}
                {masteryCheckProgressData.length > 0 && (
                  <td className="px-4 py-3 text-center">
                    {masteryCheckSynced ? (
                      masteryCheckProgress.isFullyComplete ? (
                        <CheckCircleIcon
                          className="w-7 h-7 text-green-600 mx-auto"
                          title="Mastery check completed"
                        />
                      ) : (
                        <CheckCircleOutlineIcon
                          className="w-7 h-7 text-gray-300 mx-auto"
                          title="Mastery check not completed"
                        />
                      )
                    ) : (
                      <span className="text-gray-400">—</span>
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
