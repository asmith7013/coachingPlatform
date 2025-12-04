import { useMemo } from "react";
import { CompletionCheckmark } from "./CompletionCheckmark";

interface RampUpQuestion {
  questionNumber: number;
  completed: boolean;
  completedAt?: string;
  correctScore?: number;
  explanationScore?: number;
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

interface QuestionMapEntry {
  questionNumber: number;
  questionId: string;
  isRoot?: boolean;
  rootQuestionId?: string;
  variantNumber?: number;
}

interface AssignmentProgressTableProps {
  progressData: ProgressData[];
  masteryCheckProgressData?: ProgressData[];
  totalQuestions: number;
  questionMap?: QuestionMapEntry[];
  showZearnColumn?: boolean;
  showDetailedScore?: boolean;
  showAllQuestions?: boolean;
  isAssessment?: boolean;
}

export function AssignmentProgressTable({
  progressData,
  masteryCheckProgressData = [],
  totalQuestions,
  questionMap,
  showZearnColumn = false,
  showDetailedScore = false,
  showAllQuestions = false,
  isAssessment = false,
}: AssignmentProgressTableProps) {
  // Check if we have actual lesson data (students with synced lesson progress)
  const hasLessonData = progressData.some(p => p.totalQuestions > 0);

  // Only show question columns if we have lesson data
  // (Don't show for mastery-check-only assignments)
  const showQuestionColumns = hasLessonData && totalQuestions > 0;

  // Generate question column headers
  // If questionMap is provided and showAllQuestions is true, use all questions (roots + variants)
  // Otherwise, show only root questions
  const questionColumns = useMemo(
    () => {
      if (!showQuestionColumns) return [];

      if (questionMap && questionMap.length > 0) {
        // Filter based on showAllQuestions toggle
        const filteredQuestions = showAllQuestions
          ? questionMap // Show all questions (roots + variants)
          : questionMap.filter(q => q.isRoot); // Show only root questions

        return filteredQuestions.map(q => ({
          questionNumber: q.questionNumber,
          questionId: q.questionId,
          isRoot: q.isRoot,
          variantNumber: q.variantNumber,
          // Display label: "Q2" for root, "Q2-V1" for variant 1, etc.
          label: q.isRoot || q.variantNumber === undefined
            ? `Q${q.questionNumber}`
            : `Q${q.questionNumber}-V${q.variantNumber}`
        }));
      }

      // Fallback: show only root questions
      return Array.from({ length: totalQuestions }, (_, i) => ({
        questionNumber: i + 1,
        questionId: String(i + 1),
        isRoot: true,
        label: `Q${i + 1}`
      }));
    },
    [showQuestionColumns, totalQuestions, questionMap, showAllQuestions]
  );

  // Calculate per-question completion rates (only for synced students)
  const questionStats = useMemo(() => {
    const syncedStudents = progressData.filter((p) => p.totalQuestions > 0);
    return questionColumns.map((col) => {
      const completed = syncedStudents.filter((p) =>
        p.questions.find((q) => q.questionNumber === col.questionNumber && q.completed)
      ).length;
      return {
        ...col,
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
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 min-w-[80px] bg-gray-100">
                Zearn
              </th>
            )}
            {questionColumns.map((col, idx) => (
              <th
                key={`${col.questionId}-${idx}`}
                className="px-3 py-3 text-center text-sm font-semibold text-gray-700 min-w-[50px]"
              >
                {col.label}
              </th>
            ))}
            {masteryCheckProgressData.length > 0 && (
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 min-w-[100px]">
                Mastery Check
              </th>
            )}
            {isAssessment && (
              <>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 min-w-[100px] bg-blue-50">
                  Total Score
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 min-w-[80px] bg-blue-50">
                  %
                </th>
              </>
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
            {questionStats.map((stat, idx) => (
              <td
                key={`${stat.questionId}-${idx}`}
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
            {isAssessment && (
              <>
                <td className="px-4 py-2 text-center text-sm font-bold text-blue-800 bg-blue-100">
                  {(() => {
                    const syncedStudents = progressData.filter((p) => p.totalQuestions > 0);
                    if (syncedStudents.length === 0) return '—';

                    const totalPointsReceived = syncedStudents.reduce((sum, student) => {
                      return sum + student.questions.reduce((qSum, q) => {
                        const correctScore = q.correctScore ?? 0;
                        const explanationScore = q.explanationScore ?? 0;
                        return qSum + correctScore + explanationScore;
                      }, 0);
                    }, 0);
                    const avgPointsReceived = totalPointsReceived / syncedStudents.length;
                    const possiblePoints = totalQuestions * 4;
                    return `${avgPointsReceived.toFixed(1)}/${possiblePoints}`;
                  })()}
                </td>
                <td className="px-4 py-2 text-center text-sm font-bold text-blue-800 bg-blue-100">
                  {(() => {
                    const syncedStudents = progressData.filter((p) => p.totalQuestions > 0);
                    if (syncedStudents.length === 0) return '—';

                    const totalPointsReceived = syncedStudents.reduce((sum, student) => {
                      return sum + student.questions.reduce((qSum, q) => {
                        const correctScore = q.correctScore ?? 0;
                        const explanationScore = q.explanationScore ?? 0;
                        return qSum + correctScore + explanationScore;
                      }, 0);
                    }, 0);
                    const avgPointsReceived = totalPointsReceived / syncedStudents.length;
                    const possiblePoints = totalQuestions * 4;
                    return possiblePoints > 0
                      ? `${Math.round((avgPointsReceived / possiblePoints) * 100)}%`
                      : '—';
                  })()}
                </td>
              </>
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
                    <CompletionCheckmark
                      completed={Boolean(hasSynced && progress.zearnCompleted)}
                      completedAt={progress.zearnCompletionDate}
                      color="purple"
                      size="medium"
                    />
                  </td>
                )}

                {/* Question Checkmarks or Detailed Scores */}
                {questionColumns.map((col, idx) => {
                  if (!hasSynced) {
                    return (
                      <td key={`${col.questionId}-${idx}`} className="px-3 py-3 text-center">
                        <span className="text-gray-300">—</span>
                      </td>
                    );
                  }

                  const question = progress.questions.find(
                    (q) => q.questionNumber === col.questionNumber
                  );
                  const isCompleted = question?.completed ?? false;

                  // Detailed Score Mode
                  if (showDetailedScore) {
                    const correctScore = question?.correctScore;
                    const explanationScore = question?.explanationScore;

                    return (
                      <td key={`${col.questionId}-${idx}`} className="px-3 py-3 text-center">
                        {correctScore !== undefined || explanationScore !== undefined ? (
                          <div className="flex flex-col items-center gap-0.5">
                            {/* Correct/Incorrect Icon */}
                            <div>
                              {correctScore === 1 ? (
                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              ) : correctScore === 0 ? (
                                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <span className="text-gray-300 text-xs">—</span>
                              )}
                            </div>
                            {/* Explanation Score */}
                            <div className="text-xs font-medium text-gray-600">
                              {explanationScore !== undefined ? (
                                <span className={
                                  explanationScore === 3 ? "text-green-700" :
                                  explanationScore === 2 ? "text-yellow-700" :
                                  "text-red-700"
                                }>
                                  {explanationScore}/3
                                </span>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    );
                  }

                  // Regular Checkmark Mode
                  return (
                    <td key={`${col.questionId}-${idx}`} className="px-3 py-3 text-center">
                      <CompletionCheckmark
                        completed={isCompleted}
                        completedAt={question?.completedAt}
                        size="small"
                      />
                    </td>
                  );
                })}

                {/* Mastery Check Column */}
                {masteryCheckProgressData.length > 0 && (
                  <td className="px-4 py-3 text-center">
                    <CompletionCheckmark
                      completed={Boolean(masteryCheckSynced && masteryCheckProgress?.isFullyComplete)}
                      completedAt={
                        masteryCheckProgress?.isFullyComplete
                          ? masteryCheckProgress.questions
                              .filter(q => q.completedAt)
                              .map(q => q.completedAt!)
                              .sort()[0] // Get earliest completion date
                          : undefined
                      }
                      size="large"
                    />
                  </td>
                )}

                {/* Assessment Total Score Columns */}
                {isAssessment && (
                  <>
                    <td className="px-4 py-3 text-center bg-blue-50/50">
                      {hasSynced ? (
                        <span className="text-sm font-semibold text-gray-900">
                          {(() => {
                            const pointsReceived = progress.questions.reduce((sum, q) => {
                              const correctScore = q.correctScore ?? 0;
                              const explanationScore = q.explanationScore ?? 0;
                              return sum + correctScore + explanationScore;
                            }, 0);
                            const possiblePoints = totalQuestions * 4;
                            return `${pointsReceived}/${possiblePoints}`;
                          })()}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center bg-blue-50/50">
                      {hasSynced ? (
                        <span className="text-sm font-bold text-gray-900">
                          {(() => {
                            const pointsReceived = progress.questions.reduce((sum, q) => {
                              const correctScore = q.correctScore ?? 0;
                              const explanationScore = q.explanationScore ?? 0;
                              return sum + correctScore + explanationScore;
                            }, 0);
                            const possiblePoints = totalQuestions * 4;
                            return possiblePoints > 0
                              ? `${Math.round((pointsReceived / possiblePoints) * 100)}%`
                              : '—';
                          })()}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
