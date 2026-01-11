"use client";

import { useMemo } from "react";
import { Tooltip } from "@/components/core/feedback/Tooltip";
import { DOMAIN_LABELS, DOMAIN_COLORS, STANDARD_DESCRIPTIONS } from "../constants";
import { normalizeStandard, stripLetterSuffix, extractDomain, standardMatches } from "../hooks";
import type { StateTestQuestion } from "../types";

interface UnitWithStandards {
  unitNumber: number;
  unitName?: string;
  standards?: string[];
}

interface StandardsUnitMatrixProps {
  questions: StateTestQuestion[];
  units: UnitWithStandards[];
  selectedGrade: string;
  selectedUnit?: number | null;
  onUnitClick?: (unitNumber: number | null) => void;
}

interface StandardRow {
  standard: string;
  shortForm: string;
  domain: string;
  questionCount: number;
  percent: number;
  unitPresence: Map<number, boolean>; // unitNumber -> hasQuestions
}

interface DomainGroup {
  domain: string;
  label: string;
  standards: StandardRow[];
  totalQuestions: number;
  totalPercent: number;
}

export function StandardsUnitMatrix({
  questions,
  units,
  selectedGrade,
  selectedUnit,
  onUnitClick,
}: StandardsUnitMatrixProps) {
  // Compute the matrix data
  const matrixData = useMemo(() => {
    if (!selectedGrade || questions.length === 0 || units.length === 0) {
      return null;
    }

    // Count questions per standard (parent standard, combining letter suffixes)
    const standardQuestionCounts = new Map<string, number>();
    questions.forEach((q) => {
      const primaryStd = stripLetterSuffix(normalizeStandard(q.standard));
      // Only count standards from selected grade
      if (primaryStd.startsWith(`${selectedGrade}.`)) {
        standardQuestionCounts.set(primaryStd, (standardQuestionCounts.get(primaryStd) || 0) + 1);
      }

      if (q.secondaryStandard) {
        const secondaryStd = stripLetterSuffix(normalizeStandard(q.secondaryStandard));
        if (secondaryStd.startsWith(`${selectedGrade}.`)) {
          standardQuestionCounts.set(secondaryStd, (standardQuestionCounts.get(secondaryStd) || 0) + 1);
        }
      }
    });

    const totalQuestions = Array.from(standardQuestionCounts.values()).reduce((sum, count) => sum + count, 0);

    // Build map of which standards belong to which units
    const standardToUnits = new Map<string, Set<number>>();
    units.forEach((unit) => {
      if (!unit.standards || unit.standards.length === 0) return;
      unit.standards.forEach((std) => {
        const parentStd = stripLetterSuffix(normalizeStandard(std));
        if (!standardToUnits.has(parentStd)) {
          standardToUnits.set(parentStd, new Set());
        }
        standardToUnits.get(parentStd)!.add(unit.unitNumber);
      });
    });

    // Build standard rows with unit presence
    const standardRows: StandardRow[] = [];
    standardQuestionCounts.forEach((count, std) => {
      const unitPresence = new Map<number, boolean>();
      units.forEach((unit) => {
        // Check if this unit contains this standard (or a child of it)
        const unitStds = unit.standards || [];
        const hasStandard = unitStds.some((unitStd) => {
          const normalizedUnitStd = stripLetterSuffix(normalizeStandard(unitStd));
          return normalizedUnitStd === std || standardMatches(normalizedUnitStd, std);
        });
        unitPresence.set(unit.unitNumber, hasStandard);
      });

      standardRows.push({
        standard: std,
        shortForm: std.replace(/^\d+\./, ""),
        domain: extractDomain(std),
        questionCount: count,
        percent: totalQuestions > 0 ? Math.round((count / totalQuestions) * 100) : 0,
        unitPresence,
      });
    });

    // Group by domain
    const byDomain = new Map<string, StandardRow[]>();
    standardRows.forEach((row) => {
      if (!byDomain.has(row.domain)) {
        byDomain.set(row.domain, []);
      }
      byDomain.get(row.domain)!.push(row);
    });

    // Sort standards within each domain numerically
    byDomain.forEach((rows) => {
      rows.sort((a, b) => {
        const aNum = parseInt(a.shortForm.split(".")[1] || "0", 10);
        const bNum = parseInt(b.shortForm.split(".")[1] || "0", 10);
        return aNum - bNum;
      });
    });

    // Convert to domain groups sorted by total questions
    const domainGroups: DomainGroup[] = Array.from(byDomain.entries())
      .map(([domain, standards]) => {
        const totalDomainQuestions = standards.reduce((sum, s) => sum + s.questionCount, 0);
        return {
          domain,
          label: DOMAIN_LABELS[domain] || domain,
          standards,
          totalQuestions: totalDomainQuestions,
          totalPercent: totalQuestions > 0 ? Math.round((totalDomainQuestions / totalQuestions) * 100) : 0,
        };
      })
      .sort((a, b) => b.totalQuestions - a.totalQuestions);

    // Get sorted unit numbers
    const sortedUnits = [...units].sort((a, b) => a.unitNumber - b.unitNumber);

    // Calculate coverage for each unit (sum of question counts for standards that unit covers, as % of total)
    const unitCoverage = new Map<number, number>();
    sortedUnits.forEach((unit) => {
      let questionSum = 0;
      standardRows.forEach((row) => {
        if (row.unitPresence.get(unit.unitNumber)) {
          questionSum += row.questionCount;
        }
      });
      const coveragePercent = totalQuestions > 0 ? Math.round((questionSum / totalQuestions) * 100) : 0;
      unitCoverage.set(unit.unitNumber, coveragePercent);
    });

    return { domainGroups, sortedUnits, totalQuestions, unitCoverage };
  }, [questions, units, selectedGrade]);

  if (!matrixData || matrixData.domainGroups.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Unit × Standards Matrix</h3>
        <p className="text-gray-400 text-sm">Select a grade to view the standards matrix.</p>
      </div>
    );
  }

  const { domainGroups, sortedUnits, unitCoverage } = matrixData;

  // Calculate max percent for color scaling
  const maxPercent = Math.max(...domainGroups.flatMap(g => g.standards.map(s => s.percent)));

  // Get color class for percent value
  const getPercentColor = (percent: number): string => {
    if (percent === 0) return "text-gray-400";
    if (percent >= maxPercent * 0.7) return "bg-green-100 text-green-800";
    if (percent >= maxPercent * 0.4) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold text-gray-700">Unit × Standards Matrix</h3>
        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="font-medium">Legend:</span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-[10px] font-bold rounded">5</span>
            <span># questions on state test</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-flex items-center justify-center w-5 h-5 border border-gray-200 text-gray-300 rounded">—</span>
            <span>Not in unit</span>
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Shows how many state test questions align with each standard taught in each unit.
      </p>

        <div className="overflow-auto max-h-[600px]">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-20">
              {/* Domain/Cluster header row */}
              <tr className="border-b border-gray-200">
                <th rowSpan={2} className="text-left py-1.5 px-2 font-semibold text-gray-700 bg-gray-50 sticky left-0 z-30 min-w-[80px] border-b-2 border-gray-300">
                  <div className="flex flex-col">
                    <span>Unit</span>
                    <span className="text-[10px] font-normal text-blue-500">click to filter</span>
                  </div>
                </th>
                <th rowSpan={2} className="text-center py-1.5 px-1.5 font-semibold text-gray-700 bg-gray-50 min-w-[50px] border-b-2 border-gray-300">
                  Cov.
                </th>
                {/* Domain group headers - two rows: full label on top, abbreviation left + percentage right below */}
                {domainGroups.map((group) => {
                  const colors = DOMAIN_COLORS[group.domain] || DOMAIN_COLORS.Other;
                  const domainPercentColorClass = getPercentColor(group.totalPercent);
                  return (
                    <th
                      key={group.domain}
                      colSpan={group.standards.length}
                      className={`text-center py-1 px-2 font-semibold text-xs border-l-2 ${colors.border} ${colors.bg} ${colors.text}`}
                    >
                      <div className="flex flex-col leading-tight">
                        {/* First row: full label - darker */}
                        
                        {/* Second row: abbreviation left, percentage right - lighter */}
                        <div className="flex items-center justify-between gap-1">
                          {/* <span className="font-bold">{group.domain}</span> */}
                          <span className="text-[14px] font-bold">{group.label}</span>
                          <span className={`text-[12px] px-1 rounded ${domainPercentColorClass}`}>{group.totalPercent}%</span>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
              {/* Standards row */}
              <tr className="border-b-2 border-gray-300">
                {/* Standards as column headers, grouped by domain */}
                {domainGroups.flatMap((group) =>
                  group.standards.map((row, idx) => {
                    const colors = DOMAIN_COLORS[group.domain] || DOMAIN_COLORS.Other;
                    const description = STANDARD_DESCRIPTIONS[row.standard];
                    const percentColorClass = getPercentColor(row.percent);
                    return (
                      <th
                        key={row.standard}
                        className={`text-center py-1.5 px-1 font-medium min-w-[42px] ${
                          idx === 0 ? "border-l-2 " + colors.border : ""
                        } ${colors.bg}`}
                      >
                        <Tooltip
                          content={
                            description
                              ? `${row.standard}: ${description} (${row.percent}%, ${row.questionCount} questions)`
                              : `${row.standard} (${row.percent}%, ${row.questionCount} questions)`
                          }
                          position="top"
                        >
                          <div className="cursor-help flex flex-col items-center leading-tight">
                            <span className={`text-[11px] ${colors.text}`}>{row.shortForm}</span>
                            <span className={`text-[10px] px-1 rounded ${percentColorClass}`}>{row.percent}%</span>
                          </div>
                        </Tooltip>
                      </th>
                    );
                  })
                )}
              </tr>
            </thead>
            <tbody>
              {sortedUnits.map((unit, unitIndex) => {
                const percentSum = unitCoverage.get(unit.unitNumber) || 0;
                const isSelected = selectedUnit === unit.unitNumber;
                const isMuted = selectedUnit !== null && selectedUnit !== undefined && !isSelected;
                return (
                  <tr
                    key={unit.unitNumber}
                    onClick={() => onUnitClick?.(isSelected ? null : unit.unitNumber)}
                    className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      unitIndex === sortedUnits.length - 1 ? "border-b-2 border-gray-300" : ""
                    } ${isSelected ? "bg-blue-50" : ""} ${isMuted ? "opacity-40" : ""}`}
                  >
                    {/* Unit name column - two lines: title on top (without "Unit X - " prefix), abbreviation below */}
                    <td className="py-1 px-2 sticky left-0 z-10 bg-white">
                      <div className="flex flex-col leading-tight">
                        {/* Unit title (without "Unit X - " prefix) - darker */}
                        <span className={`text-[11px] font-medium truncate max-w-[100px] ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                          {unit.unitName?.replace(/^Unit\s*\d+\s*[-–]\s*/i, "") || `Unit ${unit.unitNumber}`}
                        </span>
                        {/* Abbreviation - lighter */}
                        <span className={`text-xs ${isSelected ? "text-blue-500" : "text-gray-500"}`}>U{unit.unitNumber}</span>
                      </div>
                    </td>

                    {/* Coverage column */}
                    <td className="text-center py-1 px-1.5">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          percentSum >= 20
                            ? "bg-green-100 text-green-800"
                            : percentSum >= 10
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {percentSum}%
                      </span>
                    </td>

                    {/* Standard columns - show question count if unit covers this standard */}
                    {domainGroups.flatMap((group) =>
                      group.standards.map((row, idx) => {
                        const isPresent = row.unitPresence.get(unit.unitNumber) || false;
                        const colors = DOMAIN_COLORS[group.domain] || DOMAIN_COLORS.Other;
                        return (
                          <td
                            key={row.standard}
                            className={`text-center py-1.5 px-1 ${idx === 0 ? "border-l-2 " + colors.border : ""}`}
                          >
                            {isPresent ? (
                              <span
                                className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold ${colors.badge} text-white`}
                              >
                                {row.questionCount}
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-gray-200 text-gray-300 text-[10px]">
                                —
                              </span>
                            )}
                          </td>
                        );
                      })
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
    </div>
  );
}
