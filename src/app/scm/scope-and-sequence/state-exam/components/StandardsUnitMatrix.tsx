"use client";

import { useMemo, useState } from "react";
import { Tooltip } from "@/components/core/feedback/Tooltip";
import { Legend, LegendGroup, LegendItem } from "@/components/core/feedback/Legend";
import { ToggleSwitch } from "@/components/core/fields/ToggleSwitch";
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
  /** Dynamic standard descriptions from lesson data (supplements hardcoded STANDARD_DESCRIPTIONS) */
  standardDescriptions?: Record<string, string>;
  /** Whether to show substandards (controlled from parent) */
  showSubstandards?: boolean;
  /** Callback when showSubstandards toggle changes */
  onShowSubstandardsChange?: (show: boolean) => void;
}

interface StandardRow {
  standard: string;
  shortForm: string;
  domain: string;
  parentStandard: string; // e.g., "7.NS.1" for both "7.NS.1a" and "7.NS.1b"
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
  standardDescriptions = {},
  showSubstandards: showSubstandardsProp,
  onShowSubstandardsChange,
}: StandardsUnitMatrixProps) {
  // Toggle for showing substandards (e.g., 7.NS.1a, 7.NS.1b) vs combined (7.NS.1)
  // Use prop if provided, otherwise use local state
  const [showSubstandardsLocal, setShowSubstandardsLocal] = useState(true);
  const showSubstandards = showSubstandardsProp ?? showSubstandardsLocal;
  const setShowSubstandards = onShowSubstandardsChange ?? setShowSubstandardsLocal;

  // Compute the matrix data
  const matrixData = useMemo(() => {
    if (!selectedGrade || questions.length === 0 || units.length === 0) {
      return null;
    }

    // Helper to normalize standard - optionally strip letter suffix based on toggle
    const processStandard = (std: string): string => {
      const normalized = normalizeStandard(std);
      return showSubstandards ? normalized : stripLetterSuffix(normalized);
    };

    // Count questions per standard (optionally combining letter suffixes)
    const standardQuestionCounts = new Map<string, number>();
    questions.forEach((q) => {
      const primaryStd = processStandard(q.standard);
      // Only count standards from selected grade
      if (primaryStd.startsWith(`${selectedGrade}.`)) {
        standardQuestionCounts.set(primaryStd, (standardQuestionCounts.get(primaryStd) || 0) + 1);
      }

      if (q.secondaryStandard) {
        const secondaryStd = processStandard(q.secondaryStandard);
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
        const parentStd = processStandard(std);
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
          const normalizedUnitStd = normalizeStandard(unitStd);
          const processedUnitStd = showSubstandards ? normalizedUnitStd : stripLetterSuffix(normalizedUnitStd);

          if (showSubstandards) {
            // When showing substandards: match if unit has this exact substandard OR the parent standard
            // e.g., question standard 7.RP.2a should match unit standard 7.RP.2a OR 7.RP.2
            // But NOT 7.RP.2b (a different substandard)
            const parentStd = stripLetterSuffix(std);
            return normalizedUnitStd === std || normalizedUnitStd === parentStd;
          }
          // When combined: both are stripped, so direct comparison
          return processedUnitStd === std || standardMatches(processedUnitStd, std);
        });
        unitPresence.set(unit.unitNumber, hasStandard);
      });

      standardRows.push({
        standard: std,
        shortForm: std.replace(/^\d+\./, ""),
        domain: extractDomain(std),
        parentStandard: stripLetterSuffix(std),
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

    // Sort standards within each domain numerically, keeping substandards together
    byDomain.forEach((rows) => {
      rows.sort((a, b) => {
        // First sort by parent standard number (e.g., NS.1 before NS.2)
        const aParentNum = parseInt(a.parentStandard.split(".").pop() || "0", 10);
        const bParentNum = parseInt(b.parentStandard.split(".").pop() || "0", 10);
        if (aParentNum !== bParentNum) return aParentNum - bParentNum;
        // Then sort by full standard (e.g., NS.1a before NS.1b)
        return a.standard.localeCompare(b.standard);
      });
    });

    // Convert to domain groups sorted alphabetically by domain code (A-D order)
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
      .sort((a, b) => a.domain.localeCompare(b.domain));

    // Get sorted unit numbers
    const sortedUnits = [...units].sort((a, b) => a.unitNumber - b.unitNumber);

    // Calculate coverage for each unit (sum of question counts for standards that unit covers, as % of total)
    const unitCoverage = new Map<number, { percent: number; count: number }>();
    sortedUnits.forEach((unit) => {
      let questionSum = 0;
      standardRows.forEach((row) => {
        if (row.unitPresence.get(unit.unitNumber)) {
          questionSum += row.questionCount;
        }
      });
      const coveragePercent = totalQuestions > 0 ? Math.round((questionSum / totalQuestions) * 100) : 0;
      unitCoverage.set(unit.unitNumber, { percent: coveragePercent, count: questionSum });
    });

    // Find standards not tagged to any unit
    const untaggedStandards: StandardRow[] = standardRows.filter((row) => {
      // Check if this standard is present in ANY unit
      for (const unit of sortedUnits) {
        if (row.unitPresence.get(unit.unitNumber)) {
          return false;
        }
      }
      return true;
    });

    // Calculate untagged coverage
    const untaggedCount = untaggedStandards.reduce((sum, row) => sum + row.questionCount, 0);
    const untaggedPercent = totalQuestions > 0 ? Math.round((untaggedCount / totalQuestions) * 100) : 0;

    return { domainGroups, sortedUnits, totalQuestions, unitCoverage, untaggedStandards, untaggedCount, untaggedPercent };
  }, [questions, units, selectedGrade, showSubstandards]);

  if (!matrixData || matrixData.domainGroups.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Unit × Standards Matrix</h3>
        <p className="text-gray-400 text-sm">Select a grade to view the standards matrix.</p>
      </div>
    );
  }

  const { domainGroups, sortedUnits, unitCoverage, untaggedStandards, untaggedCount, untaggedPercent } = matrixData;

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
        {/* Toggle at top right */}
        <ToggleSwitch
          checked={showSubstandards}
          onChange={setShowSubstandards}
          label="Show Substandards"
        />
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Shows how many state test questions align with each standard taught in each unit.
      </p>

        <div className="overflow-auto max-h-[600px] rounded-lg border border-gray-200">
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
                <th rowSpan={2} className="text-center py-1.5 px-1.5 font-semibold text-gray-700 bg-gray-50 min-w-[45px] border-b-2 border-gray-300">
                  Test %
                </th>
                <th rowSpan={2} className="text-center py-1.5 px-1.5 font-semibold text-gray-700 bg-gray-50 min-w-[40px] border-b-2 border-gray-300">
                  # Qs
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
                    // Dynamic descriptions from lessons take priority, then fall back to hardcoded
                    const description = standardDescriptions[row.standard] || standardDescriptions[row.parentStandard] || STANDARD_DESCRIPTIONS[row.standard] || STANDARD_DESCRIPTIONS[row.parentStandard];
                    const percentColorClass = getPercentColor(row.percent);
                    // Check if this is first of a new parent standard group (when showing substandards)
                    const prevRow = idx > 0 ? group.standards[idx - 1] : null;
                    const isNewParentGroup = showSubstandards && idx > 0 && prevRow && prevRow.parentStandard !== row.parentStandard;
                    return (
                      <th
                        key={row.standard}
                        className={`text-center py-1.5 px-1 font-medium min-w-[42px] ${
                          idx === 0 ? "border-l-2 " + colors.border : ""
                        } ${isNewParentGroup ? "border-l " + colors.border : ""} ${colors.bg}`}
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
                const coverage = unitCoverage.get(unit.unitNumber) || { percent: 0, count: 0 };
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

                    {/* Test % column */}
                    <td className="text-center py-1 px-1.5">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          coverage.percent >= 20
                            ? "bg-green-100 text-green-800"
                            : coverage.percent >= 10
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {coverage.percent}%
                      </span>
                    </td>

                    {/* # Qs column */}
                    <td className="text-center py-1 px-1.5">
                      <span className="text-[11px] font-medium text-gray-600">
                        {coverage.count}
                      </span>
                    </td>

                    {/* Standard columns - show question count if unit covers this standard */}
                    {domainGroups.flatMap((group) =>
                      group.standards.map((row, idx) => {
                        const isPresent = row.unitPresence.get(unit.unitNumber) || false;
                        const colors = DOMAIN_COLORS[group.domain] || DOMAIN_COLORS.Other;
                        // Check if this is first of a new parent standard group (when showing substandards)
                        const prevRow = idx > 0 ? group.standards[idx - 1] : null;
                        const isNewParentGroup = showSubstandards && idx > 0 && prevRow && prevRow.parentStandard !== row.parentStandard;
                        return (
                          <td
                            key={row.standard}
                            className={`text-center py-1.5 px-1 ${idx === 0 ? "border-l-2 " + colors.border : ""} ${isNewParentGroup ? "border-l " + colors.border : ""}`}
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

              {/* "Not in any unit" row - only show if there are untagged standards */}
              {untaggedStandards.length > 0 && (
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  {/* Label column */}
                  <td className="py-2 px-2 sticky left-0 z-10 bg-gray-50">
                    <div className="flex flex-col leading-tight">
                      <span className="text-[11px] font-medium text-gray-500">
                        Not in any unit
                      </span>
                    </div>
                  </td>

                  {/* Test % column */}
                  <td className="text-center py-2 px-1.5">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        untaggedPercent >= 20
                          ? "bg-red-100 text-red-800"
                          : untaggedPercent >= 10
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {untaggedPercent}%
                    </span>
                  </td>

                  {/* # Qs column */}
                  <td className="text-center py-2 px-1.5">
                    <span className="text-[11px] font-medium text-gray-500">
                      {untaggedCount}
                    </span>
                  </td>

                  {/* Standard columns - show badge with question count for untagged standards */}
                  {domainGroups.flatMap((group) =>
                    group.standards.map((row, idx) => {
                      const isUntagged = untaggedStandards.some(u => u.standard === row.standard);
                      const colors = DOMAIN_COLORS[group.domain] || DOMAIN_COLORS.Other;
                      // Check if this is first of a new parent standard group (when showing substandards)
                      const prevRow = idx > 0 ? group.standards[idx - 1] : null;
                      const isNewParentGroup = showSubstandards && idx > 0 && prevRow && prevRow.parentStandard !== row.parentStandard;
                      return (
                        <td
                          key={row.standard}
                          className={`text-center py-2 px-1 ${idx === 0 ? "border-l-2 " + colors.border : ""} ${isNewParentGroup ? "border-l " + colors.border : ""}`}
                        >
                          {isUntagged ? (
                            <span
                              className={`inline-flex items-center justify-center px-1.5 h-5 rounded text-[10px] font-bold ${colors.badge} text-white`}
                            >
                              {row.questionCount}
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-gray-200 text-[10px]">

                            </span>
                          )}
                        </td>
                      );
                    })
                  )}
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Legend at bottom using atomic component */}
        <Legend title="Legend">
          <LegendGroup>
            <LegendItem
              icon={<span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-[10px] font-bold rounded">5</span>}
              label={<span className="text-xs text-gray-600"># questions on state test</span>}
            />
            <LegendItem
              icon={<span className="inline-flex items-center justify-center w-5 h-5 border border-gray-200 text-gray-300 rounded text-[10px]">—</span>}
              label={<span className="text-xs text-gray-600">Not in unit</span>}
            />
          </LegendGroup>
        </Legend>
    </div>
  );
}
