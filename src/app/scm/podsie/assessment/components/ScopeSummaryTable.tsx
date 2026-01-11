"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useUnitsAndConfig } from "../../progress/hooks/useUnitsAndConfig";
import { fetchRampUpProgress } from "@/app/actions/scm/podsie/podsie-sync";
import type { ProgressData } from "../../progress/types";

interface SectionOption {
  id: string;
  school: string;
  classSection: string;
  displayName: string;
}

interface ScopeSummaryTableProps {
  scopeTag: string;
  sections: SectionOption[];
}

interface SectionAssessmentData {
  sectionId: string;
  sectionName: string;
  school: string;
  unitAverages: Map<number, number>; // unitNumber -> percent
  overallAverage: number | null;
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

// Helper to extract unit number from unitLessonId
function getUnitNumberFromId(unitLessonId: string): number {
  const parts = unitLessonId.split(".");
  return parseInt(parts[0], 10);
}

// Calculate class average for a section's unit assessment
function calculateClassAverage(progressData: ProgressData[], totalQuestions: number): number | null {
  const studentsWithData = progressData.filter((p) => p.totalQuestions > 0);
  if (studentsWithData.length === 0) return null;

  let totalPoints = 0;
  studentsWithData.forEach((p) => {
    p.questions.forEach((q) => {
      totalPoints += (q.correctScore ?? 0) + (q.explanationScore ?? 0);
    });
  });

  const avgPoints = totalPoints / studentsWithData.length;
  const maxPoints = totalQuestions * 4;
  return maxPoints > 0 ? Math.round((avgPoints / maxPoints) * 100) : null;
}

export function ScopeSummaryTable({ scopeTag, sections }: ScopeSummaryTableProps) {
  const [sectionData, setSectionData] = useState<SectionAssessmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [allUnits, setAllUnits] = useState<number[]>([]);

  // Use first section to get units (all sections in same scope have same units)
  const firstSection = sections[0];
  const { units, sectionConfigAssignments, loading: loadingConfig } = useUnitsAndConfig(
    scopeTag,
    firstSection?.classSection || "",
    firstSection?.school
  );

  // Create stable keys
  const unitsKey = units.map((u) => u.unitNumber).join(",");
  const configKey = sectionConfigAssignments.length;
  const sectionsKey = sections.map((s) => s.id).join(",");

  // Load data for all sections
  useEffect(() => {
    if (units.length === 0 || sectionConfigAssignments.length === 0 || sections.length === 0) {
      setSectionData([]);
      setLoading(false);
      return;
    }

    let isCancelled = false;

    const loadData = async () => {
      setLoading(true);
      const results: SectionAssessmentData[] = [];
      const unitNumbers = new Set<number>();

      for (const section of sections) {
        const unitAverages = new Map<number, number>();

        for (const unit of units) {
          const unitAssignments = sectionConfigAssignments.filter((a) => {
            const assignmentUnitNumber = getUnitNumberFromId(a.unitLessonId);
            return assignmentUnitNumber === unit.unitNumber && a.section === "Unit Assessment";
          });

          for (const assignment of unitAssignments) {
            if (isCancelled) return;

            const assessmentActivity = assignment.podsieActivities?.find(
              (activity) => activity.activityType === "assessment"
            );

            if (!assessmentActivity) continue;

            const grade = scopeTag.replace("Grade ", "").replace("Algebra 1", "8");
            const unitCode = `${grade}.${unit.unitNumber}`;

            const result = await fetchRampUpProgress(
              section.classSection,
              unitCode,
              assignment.unitLessonId,
              assessmentActivity.podsieAssignmentId,
              section.school
            );

            if (result.success) {
              const avg = calculateClassAverage(result.data, assessmentActivity.totalQuestions || 0);
              if (avg !== null) {
                unitAverages.set(unit.unitNumber, avg);
                unitNumbers.add(unit.unitNumber);
              }
            }
          }
        }

        // Calculate overall average
        let totalPercent = 0;
        let count = 0;
        unitAverages.forEach((percent) => {
          totalPercent += percent;
          count++;
        });
        const overallAverage = count > 0 ? Math.round(totalPercent / count) : null;

        results.push({
          sectionId: section.id,
          sectionName: section.classSection,
          school: section.school,
          unitAverages,
          overallAverage,
        });
      }

      if (!isCancelled) {
        setSectionData(results);
        setAllUnits(Array.from(unitNumbers).sort((a, b) => a - b));
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeTag, unitsKey, configKey, sectionsKey]);

  // Generate change pairs
  const changePairs = useMemo(() => {
    const pairs: Array<{ fromUnit: number; toUnit: number; label: string }> = [];
    for (let i = 1; i < allUnits.length; i++) {
      pairs.push({
        fromUnit: allUnits[i - 1],
        toUnit: allUnits[i],
        label: `Δ${allUnits[i - 1]}→${allUnits[i]}`,
      });
    }
    return pairs;
  }, [allUnits]);

  // Calculate scope-wide averages per unit
  const scopeAverages = useMemo(() => {
    const averages = new Map<number, number>();
    allUnits.forEach((unitNum) => {
      let total = 0;
      let count = 0;
      sectionData.forEach((section) => {
        const avg = section.unitAverages.get(unitNum);
        if (avg !== undefined) {
          total += avg;
          count++;
        }
      });
      if (count > 0) {
        averages.set(unitNum, Math.round(total / count));
      }
    });
    return averages;
  }, [sectionData, allUnits]);

  // Overall scope average
  const overallScopeAverage = useMemo(() => {
    let total = 0;
    let count = 0;
    scopeAverages.forEach((avg) => {
      total += avg;
      count++;
    });
    return count > 0 ? Math.round(total / count) : null;
  }, [scopeAverages]);

  const isLoading = loadingConfig || loading;

  if (isLoading) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">{scopeTag}</h3>
        </div>
        <div className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (sectionData.length === 0 || allUnits.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">{scopeTag}</h3>
        </div>
        <div className="p-4 text-center text-gray-500 text-sm">
          No assessment data available
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="sticky left-0 bg-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-[140px] z-10">
                {scopeTag}
              </th>
              {allUnits.map((unitNum) => (
                <th
                  key={unitNum}
                  className="px-3 py-3 text-center text-sm font-semibold text-gray-900 min-w-[70px]"
                >
                  Unit {unitNum}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 min-w-[80px] bg-gray-200">
                Avg
              </th>
              {changePairs.map((pair) => (
                <th
                  key={pair.label}
                  className="px-2 py-3 text-center text-xs font-semibold text-gray-600 min-w-[60px] bg-purple-50"
                >
                  {pair.label}
                </th>
              ))}
            </tr>

            {/* Scope Average Row */}
            <tr className="bg-blue-50 border-b-2 border-blue-200">
              <td className="sticky left-0 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800 z-10">
                All Sections
              </td>
              {allUnits.map((unitNum) => {
                const avg = scopeAverages.get(unitNum);
                return (
                  <td key={unitNum} className="px-3 py-2 text-center">
                    {avg !== undefined ? (
                      <span className={`inline-block px-2 py-0.5 rounded text-sm font-bold ${getPercentColor(avg)}`}>
                        {avg}%
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                );
              })}
              <td className="px-4 py-2 text-center bg-blue-100">
                {overallScopeAverage !== null ? (
                  <span className={`inline-block px-2 py-1 rounded text-sm font-bold ${getAverageColor(overallScopeAverage)}`}>
                    {overallScopeAverage}%
                  </span>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              {changePairs.map((pair) => {
                const from = scopeAverages.get(pair.fromUnit);
                const to = scopeAverages.get(pair.toUnit);
                const change = from !== undefined && to !== undefined ? to - from : null;
                return (
                  <td key={pair.label} className="px-2 py-2 text-center bg-purple-50/50">
                    <span className={`text-xs ${change !== null ? getChangeColor(change) : "text-gray-300"}`}>
                      {formatChange(change)}
                    </span>
                  </td>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {sectionData.map((section, idx) => (
              <tr
                key={section.sectionId}
                className={`border-b border-gray-100 hover:bg-gray-50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
              >
                <td className="sticky left-0 bg-inherit px-4 py-2 z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{section.sectionName}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-600 text-white">{section.school}</span>
                  </div>
                </td>
                {allUnits.map((unitNum) => {
                  const avg = section.unitAverages.get(unitNum);
                  return (
                    <td key={unitNum} className="px-3 py-2 text-center">
                      {avg !== undefined ? (
                        <span className={`inline-block px-2 py-0.5 rounded text-sm font-medium ${getPercentColor(avg)}`}>
                          {avg}%
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-2 text-center bg-gray-100/50">
                  {section.overallAverage !== null ? (
                    <span className={`inline-block px-2 py-0.5 rounded text-sm font-bold ${getAverageColor(section.overallAverage)}`}>
                      {section.overallAverage}%
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                {changePairs.map((pair) => {
                  const from = section.unitAverages.get(pair.fromUnit);
                  const to = section.unitAverages.get(pair.toUnit);
                  const change = from !== undefined && to !== undefined ? to - from : null;
                  return (
                    <td key={pair.label} className="px-2 py-2 text-center bg-purple-50/30">
                      <span className={`text-xs ${change !== null ? getChangeColor(change) : "text-gray-300"}`}>
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
    </div>
  );
}
