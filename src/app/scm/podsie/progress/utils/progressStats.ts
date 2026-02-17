import { ProgressData, SummaryStats } from "../types";

// Calculate summary stats for progress data
export function calculateSummaryStats(data: ProgressData[]): SummaryStats {
  const studentsWithProgress = data.filter((p) => p.totalQuestions > 0);
  if (studentsWithProgress.length === 0) {
    return {
      avgCompletion: 0,
      fullyComplete: 0,
      totalStudents: data.length,
      syncedStudents: 0,
    };
  }

  const avgCompletion = Math.round(
    studentsWithProgress.reduce((sum, p) => sum + p.percentComplete, 0) /
      studentsWithProgress.length,
  );
  const fullyComplete = studentsWithProgress.filter(
    (p) => p.isFullyComplete,
  ).length;

  return {
    avgCompletion,
    fullyComplete,
    totalStudents: data.length,
    syncedStudents: studentsWithProgress.length,
  };
}
