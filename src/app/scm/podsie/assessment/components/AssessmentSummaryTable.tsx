import React, { useMemo } from "react";
import type { LessonConfig, ProgressData } from "../../progress/types";

interface AssessmentData {
  unitNumber: number;
  unitName: string;
  assignment: LessonConfig;
  progressData: ProgressData[];
  totalQuestions: number;
}

interface StudentSummary {
  studentId: string;
  studentName: string;
  scores: Map<number, { points: number; maxPoints: number; percent: number }>;
  averagePercent: number;
}

interface AssessmentSummaryTableProps {
  assessmentData: AssessmentData[];
  selectedUnit: number | null;
  onSelectUnit: (unit: number | null) => void;
}

function getPercentColor(percent: number): string {
  if (percent >= 80) return "bg-green-100 text-green-800";
  if (percent >= 60) return "bg-yellow-100 text-yellow-800";
  if (percent >= 40) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

function getAverageColor(percent: number): string {
  if (percent >= 80) return "bg-green-600 text-white";
  if (percent >= 60) return "bg-yellow-500 text-white";
  if (percent >= 40) return "bg-orange-500 text-white";
  return "bg-red-500 text-white";
}

function getChangeColor(change: number): string {
  if (change > 10) return "text-green-600 font-semibold";
  if (change > 0) return "text-green-500";
  if (change === 0) return "text-gray-500";
  if (change > -10) return "text-red-400";
  return "text-red-600 font-semibold";
}

function formatChange(change: number | null): string {
  if (change === null) return "—";
  if (change > 0) return `+${change}%`;
  if (change === 0) return "0%";
  return `${change}%`;
}

export function AssessmentSummaryTable({
  assessmentData,
  selectedUnit,
  onSelectUnit,
}: AssessmentSummaryTableProps) {
  // Get unique units sorted by unit number
  const units = useMemo(() => {
    const unitMap = new Map<
      number,
      { unitNumber: number; unitName: string; totalQuestions: number }
    >();
    assessmentData.forEach((a) => {
      if (!unitMap.has(a.unitNumber)) {
        unitMap.set(a.unitNumber, {
          unitNumber: a.unitNumber,
          unitName: a.unitName,
          totalQuestions: a.totalQuestions,
        });
      }
    });
    return Array.from(unitMap.values()).sort(
      (a, b) => a.unitNumber - b.unitNumber,
    );
  }, [assessmentData]);

  // Generate change column pairs (e.g., [3, 4], [4, 6] for units 3, 4, 6)
  const changePairs = useMemo(() => {
    const pairs: Array<{ fromUnit: number; toUnit: number; label: string }> =
      [];
    for (let i = 1; i < units.length; i++) {
      pairs.push({
        fromUnit: units[i - 1].unitNumber,
        toUnit: units[i].unitNumber,
        label: `Δ ${units[i - 1].unitNumber}→${units[i].unitNumber}`,
      });
    }
    return pairs;
  }, [units]);

  // Calculate student summaries
  const studentSummaries = useMemo(() => {
    // Collect all unique students
    const studentMap = new Map<
      string,
      { studentId: string; studentName: string }
    >();
    assessmentData.forEach((a) => {
      a.progressData.forEach((p) => {
        if (!studentMap.has(p.studentId)) {
          studentMap.set(p.studentId, {
            studentId: p.studentId,
            studentName: p.studentName,
          });
        }
      });
    });

    // Build summaries for each student
    const summaries: StudentSummary[] = [];

    studentMap.forEach((student) => {
      const scores = new Map<
        number,
        { points: number; maxPoints: number; percent: number }
      >();
      let totalPercent = 0;
      let assessmentCount = 0;

      assessmentData.forEach((a) => {
        const studentProgress = a.progressData.find(
          (p) => p.studentId === student.studentId,
        );
        if (studentProgress && studentProgress.totalQuestions > 0) {
          let points = 0;
          studentProgress.questions.forEach((q) => {
            const correctScore = q.correctScore ?? 0;
            const explanationScore = q.explanationScore ?? 0;
            points += correctScore + explanationScore;
          });
          const maxPoints = a.totalQuestions * 4;
          const percent =
            maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0;
          scores.set(a.unitNumber, { points, maxPoints, percent });
          totalPercent += percent;
          assessmentCount++;
        }
      });

      const averagePercent =
        assessmentCount > 0 ? Math.round(totalPercent / assessmentCount) : 0;

      summaries.push({
        studentId: student.studentId,
        studentName: student.studentName,
        scores,
        averagePercent,
      });
    });

    // Sort by average percent descending
    return summaries.sort((a, b) => b.averagePercent - a.averagePercent);
  }, [assessmentData]);

  // Calculate class averages per unit
  const classAverages = useMemo(() => {
    const averages = new Map<
      number,
      { avgPoints: number; maxPoints: number; percent: number }
    >();

    units.forEach((unit) => {
      const assessment = assessmentData.find(
        (a) => a.unitNumber === unit.unitNumber,
      );
      if (!assessment) return;

      const studentsWithData = assessment.progressData.filter(
        (p) => p.totalQuestions > 0,
      );
      if (studentsWithData.length === 0) {
        averages.set(unit.unitNumber, {
          avgPoints: 0,
          maxPoints: unit.totalQuestions * 4,
          percent: 0,
        });
        return;
      }

      let totalPoints = 0;
      studentsWithData.forEach((p) => {
        p.questions.forEach((q) => {
          totalPoints += (q.correctScore ?? 0) + (q.explanationScore ?? 0);
        });
      });

      const avgPoints = totalPoints / studentsWithData.length;
      const maxPoints = unit.totalQuestions * 4;
      const percent =
        maxPoints > 0 ? Math.round((avgPoints / maxPoints) * 100) : 0;

      averages.set(unit.unitNumber, { avgPoints, maxPoints, percent });
    });

    return averages;
  }, [units, assessmentData]);

  // Calculate overall class average
  const overallClassAverage = useMemo(() => {
    let totalPercent = 0;
    let count = 0;
    classAverages.forEach((avg) => {
      if (avg.maxPoints > 0) {
        totalPercent += avg.percent;
        count++;
      }
    });
    return count > 0 ? Math.round(totalPercent / count) : 0;
  }, [classAverages]);

  // Helper to get change between two units for a student
  const getStudentChange = (
    student: StudentSummary,
    fromUnit: number,
    toUnit: number,
  ): number | null => {
    const fromScore = student.scores.get(fromUnit);
    const toScore = student.scores.get(toUnit);
    if (!fromScore || !toScore) return null;
    return toScore.percent - fromScore.percent;
  };

  // Helper to get class average change between two units
  const getClassChange = (fromUnit: number, toUnit: number): number | null => {
    const fromAvg = classAverages.get(fromUnit);
    const toAvg = classAverages.get(toUnit);
    if (!fromAvg || !toAvg) return null;
    return toAvg.percent - fromAvg.percent;
  };

  if (studentSummaries.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-400 text-2xl mb-2">No data</div>
        <div className="text-gray-600">No student assessment data found</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-200">
            <th className="sticky left-0 bg-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-[200px] z-10">
              Student
            </th>
            {units.map((unit) => (
              <th
                key={unit.unitNumber}
                colSpan={2}
                className={`px-2 py-3 text-center text-sm font-semibold min-w-[140px] cursor-pointer transition-colors ${
                  selectedUnit === unit.unitNumber
                    ? "bg-blue-100 text-blue-900"
                    : "text-gray-900 hover:bg-gray-200"
                }`}
                onClick={() =>
                  onSelectUnit(
                    selectedUnit === unit.unitNumber ? null : unit.unitNumber,
                  )
                }
              >
                <div className="flex flex-col items-center">
                  <span>{unit.unitName}</span>
                  <span className="text-xs font-normal text-gray-500">
                    ({unit.totalQuestions * 4} pts)
                  </span>
                </div>
              </th>
            ))}
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 min-w-[100px] bg-gray-200">
              Average %
            </th>
            {changePairs.map((pair) => (
              <th
                key={pair.label}
                className="px-3 py-3 text-center text-sm font-semibold text-gray-700 min-w-[80px] bg-purple-50"
              >
                {pair.label}
              </th>
            ))}
          </tr>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="sticky left-0 bg-gray-50 px-4 py-2 text-left text-xs font-medium text-gray-500 z-10"></th>
            {units.map((unit) => (
              <React.Fragment key={unit.unitNumber}>
                <th
                  className={`px-2 py-2 text-center text-xs font-medium min-w-[70px] ${
                    selectedUnit === unit.unitNumber
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-500"
                  }`}
                >
                  Score
                </th>
                <th
                  className={`px-2 py-2 text-center text-xs font-medium min-w-[70px] ${
                    selectedUnit === unit.unitNumber
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-500"
                  }`}
                >
                  %
                </th>
              </React.Fragment>
            ))}
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 bg-gray-100"></th>
            {changePairs.map((pair) => (
              <th
                key={`${pair.label}-sub`}
                className="px-3 py-2 text-center text-xs font-medium text-purple-600 bg-purple-50/50"
              >
                Change
              </th>
            ))}
          </tr>

          {/* Class Average Row */}
          <tr className="bg-blue-50 border-b-2 border-blue-200">
            <td className="sticky left-0 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800 z-10">
              Class Average
            </td>
            {units.map((unit) => {
              const avg = classAverages.get(unit.unitNumber);
              return (
                <React.Fragment key={unit.unitNumber}>
                  <td
                    className={`px-2 py-2 text-center text-sm font-semibold ${
                      selectedUnit === unit.unitNumber ? "bg-blue-100" : ""
                    } text-blue-800`}
                  >
                    {avg ? `${avg.avgPoints.toFixed(1)}/${avg.maxPoints}` : "—"}
                  </td>
                  <td
                    className={`px-2 py-2 text-center text-sm font-bold ${
                      selectedUnit === unit.unitNumber ? "bg-blue-100" : ""
                    } text-blue-800`}
                  >
                    {avg ? `${avg.percent}%` : "—"}
                  </td>
                </React.Fragment>
              );
            })}
            <td className="px-4 py-2 text-center">
              <span
                className={`inline-block px-2 py-1 rounded text-sm font-bold ${getAverageColor(overallClassAverage)}`}
              >
                {overallClassAverage}%
              </span>
            </td>
            {changePairs.map((pair) => {
              const change = getClassChange(pair.fromUnit, pair.toUnit);
              return (
                <td
                  key={pair.label}
                  className="px-3 py-2 text-center bg-purple-50/50"
                >
                  <span
                    className={`text-sm font-semibold ${change !== null ? getChangeColor(change) : "text-gray-400"}`}
                  >
                    {formatChange(change)}
                  </span>
                </td>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {studentSummaries.map((student, idx) => (
            <tr
              key={student.studentId}
              className={`border-b border-gray-100 hover:bg-gray-50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
            >
              <td className="sticky left-0 bg-inherit px-4 py-3 text-sm font-medium text-gray-900 z-10">
                {student.studentName}
              </td>
              {units.map((unit) => {
                const score = student.scores.get(unit.unitNumber);
                return (
                  <React.Fragment key={unit.unitNumber}>
                    <td
                      className={`px-2 py-3 text-center text-sm ${
                        selectedUnit === unit.unitNumber ? "bg-blue-50/50" : ""
                      }`}
                    >
                      {score ? `${score.points}/${score.maxPoints}` : "—"}
                    </td>
                    <td
                      className={`px-2 py-3 text-center ${selectedUnit === unit.unitNumber ? "bg-blue-50/50" : ""}`}
                    >
                      {score ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-sm font-medium ${getPercentColor(score.percent)}`}
                        >
                          {score.percent}%
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </React.Fragment>
                );
              })}
              <td className="px-4 py-3 text-center bg-gray-100/50">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-sm font-bold ${getAverageColor(student.averagePercent)}`}
                >
                  {student.averagePercent}%
                </span>
              </td>
              {changePairs.map((pair) => {
                const change = getStudentChange(
                  student,
                  pair.fromUnit,
                  pair.toUnit,
                );
                return (
                  <td
                    key={pair.label}
                    className="px-3 py-3 text-center bg-purple-50/30"
                  >
                    <span
                      className={`text-sm ${change !== null ? getChangeColor(change) : "text-gray-300"}`}
                    >
                      {formatChange(change)}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
