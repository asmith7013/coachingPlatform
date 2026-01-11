"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Alert } from "@/components/core/feedback/Alert";
import { Spinner } from "@/components/core/feedback/Spinner";
import { getStateTestQuestions, getStateTestStats } from "@/app/tools/state-test-scraper/actions/scrape";
import { Badge } from "@/components/core/feedback/Badge";
import { LegendItem } from "@/components/core/feedback/Legend";
import { SectionRadioGroup } from "@/components/core/inputs/SectionRadioGroup";
import { ToggleSwitch } from "@/components/core/fields/ToggleSwitch";
import {
  getUnitsWithStandards,
  getSectionsWithStandards,
  type UnitWithStandards,
  type SectionWithStandards,
} from "./actions";

// Local imports
import { DOMAIN_LABELS } from "./constants";
import {
  normalizeStandard,
  standardMatches,
  extractDomain,
  stripLetterSuffix,
  numericStandardSort,
} from "./hooks";
import {
  QuestionCard,
  StandardAccordion,
  QuestionsByUnitTable,
  StandardsDistributionTable,
  StandardsByUnitTable,
  StandardsUnitMatrix,
} from "./components";
import type {
  ScrapeStats,
  StateTestQuestion,
  UnitDistributionData,
  StandardsDistribution,
  UnitStandardsData,
  QuestionsByStandardData,
} from "./types";

export default function StateExamQuestionsPage() {
  const [questions, setQuestions] = useState<StateTestQuestion[]>([]);
  const [stats, setStats] = useState<ScrapeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>("all");

  // Units and sections data
  const [units, setUnits] = useState<UnitWithStandards[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [sections, setSections] = useState<SectionWithStandards[]>([]);
  const [unitStandards, setUnitStandards] = useState<string[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);

  // Display options
  const [groupByStandard, setGroupByStandard] = useState(true);

  // Expanded domains in sidebar
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());

  // Load stats on mount
  useEffect(() => {
    async function loadStats() {
      const result = await getStateTestStats();
      if (result.success && result.stats) {
        setStats(result.stats);
      }
    }
    loadStats();
  }, []);

  // Load questions when grade filter changes
  useEffect(() => {
    async function loadQuestions() {
      if (!selectedGrade) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await getStateTestQuestions({
          grade: selectedGrade,
        });

        if (result.success && result.questions) {
          setQuestions(result.questions);
        } else {
          setError(result.error || "Failed to load questions");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load questions");
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [selectedGrade]);

  // Load units when grade changes
  useEffect(() => {
    async function loadUnits() {
      if (!selectedGrade) {
        setUnits([]);
        return;
      }

      setLoadingUnits(true);
      try {
        const result = await getUnitsWithStandards(selectedGrade);
        if (result.success && result.units) {
          setUnits(result.units);
        }
      } finally {
        setLoadingUnits(false);
      }
    }

    loadUnits();
  }, [selectedGrade]);

  // Load sections when unit changes
  useEffect(() => {
    async function loadSections() {
      if (!selectedGrade || selectedUnit === null) {
        setSections([]);
        setUnitStandards([]);
        return;
      }

      setLoadingSections(true);
      try {
        const result = await getSectionsWithStandards(selectedGrade, selectedUnit);
        if (result.success) {
          setSections(result.sections || []);
          setUnitStandards(result.allStandards || []);
        }
      } finally {
        setLoadingSections(false);
      }
    }

    loadSections();
  }, [selectedGrade, selectedUnit]);

  // Get standards to filter by based on selected unit/section
  const filterStandards = useMemo(() => {
    if (selectedUnit === null) return null; // No unit filter

    if (selectedSection === "all") {
      return unitStandards; // All standards in the unit
    }

    // Find the specific section and get its standards
    const section = sections.find((s) => {
      const sectionId = s.subsection ? `${s.section}-${s.subsection}` : s.section;
      return sectionId === selectedSection;
    });

    return section?.standards || [];
  }, [selectedUnit, selectedSection, unitStandards, sections]);

  // Filter questions by search query and unit/section standards
  // Also track which questions matched only via secondary standard
  // Group questions by the standard they matched on
  const { filteredQuestions, secondaryOnlyMatches, questionsByStandard } = useMemo(() => {
    let filtered = questions;
    const secondaryOnly = new Set<string>();
    const byStandard = new Map<string, QuestionsByStandardData>();

    // Filter by unit/section standards (check both primary and secondary)
    if (filterStandards && filterStandards.length > 0) {
      const normalizedFilterStandards = filterStandards.map(normalizeStandard);

      // Create a map from normalized standard to original standard for display
      const normalizedToOriginal = new Map<string, string>();
      filterStandards.forEach((std) => {
        normalizedToOriginal.set(normalizeStandard(std), std);
      });

      // Find matching filter standard for a question standard
      const findMatchingFilterStd = (qStd: string): string | null => {
        for (const filterStd of normalizedFilterStandards) {
          if (standardMatches(qStd, filterStd)) {
            return normalizedToOriginal.get(filterStd) || filterStd;
          }
        }
        return null;
      };

      filtered = filtered.filter((q) => {
        const qPrimaryStandard = normalizeStandard(q.standard);
        const qSecondaryStandard = q.secondaryStandard ? normalizeStandard(q.secondaryStandard) : null;

        const primaryMatchStd = findMatchingFilterStd(qPrimaryStandard);
        const secondaryMatchStd = qSecondaryStandard ? findMatchingFilterStd(qSecondaryStandard) : null;

        const primaryMatches = primaryMatchStd !== null;
        const secondaryMatches = secondaryMatchStd !== null;

        // Track if this question only matched via secondary standard
        if (!primaryMatches && secondaryMatches) {
          secondaryOnly.add(q.questionId);
        }

        // Group by matching standards (a question can appear in multiple groups)
        if (primaryMatches && primaryMatchStd) {
          if (!byStandard.has(primaryMatchStd)) {
            byStandard.set(primaryMatchStd, { questions: [], isSecondaryMatch: new Map() });
          }
          byStandard.get(primaryMatchStd)!.questions.push(q);
          byStandard.get(primaryMatchStd)!.isSecondaryMatch.set(q.questionId, false);
        }
        if (secondaryMatches && secondaryMatchStd) {
          if (!byStandard.has(secondaryMatchStd)) {
            byStandard.set(secondaryMatchStd, { questions: [], isSecondaryMatch: new Map() });
          }
          // Only add if not already added via primary match to this same standard
          const existing = byStandard.get(secondaryMatchStd)!;
          if (!existing.questions.some(eq => eq.questionId === q.questionId)) {
            existing.questions.push(q);
          }
          existing.isSecondaryMatch.set(q.questionId, true);
        }

        return primaryMatches || secondaryMatches;
      });
    }

    return { filteredQuestions: filtered, secondaryOnlyMatches: secondaryOnly, questionsByStandard: byStandard };
  }, [questions, filterStandards]);

  // Get available grades from stats
  const availableGrades = stats
    ? Object.keys(stats.byGrade).sort((a, b) => parseInt(a) - parseInt(b))
    : [];

  // Build section options for SectionRadioGroup
  const sectionOptions = useMemo(() => {
    const options = [
      { id: "all", name: "All Sections", inStock: true, count: unitStandards.length },
    ];

    sections.forEach((s) => {
      const sectionId = s.subsection ? `${s.section}-${s.subsection}` : s.section;
      options.push({
        id: sectionId,
        name: s.section === "Ramp Ups" ? "Ramp Ups" : `Section ${s.section}`,
        badge: s.subsection ? `Part ${s.subsection}` : undefined,
        inStock: s.standards.length > 0,
        count: s.standards.length,
      } as { id: string; name: string; badge?: string; inStock: boolean; count: number });
    });

    return options;
  }, [sections, unitStandards]);

  // Compute unit distribution stats (MC/CR counts per unit)
  // Wait for units with standards to be loaded
  const unitsHaveStandards = units.length > 0 && units.some(u => u.standards && u.standards.length > 0);

  const unitDistribution = useMemo((): UnitDistributionData | null => {
    if (!selectedGrade || questions.length === 0 || units.length === 0 || !unitsHaveStandards) {
      return null;
    }

    // Build arrays of normalized standards per unit for matching
    const unitStandardsMap = new Map<number, string[]>();
    units.forEach((unit) => {
      if (!unit.standards || unit.standards.length === 0) {
        return;
      }
      unitStandardsMap.set(unit.unitNumber, unit.standards.map(normalizeStandard));
    });

    // Find which unit a question standard matches (using parent-child matching)
    const findMatchingUnit = (qStd: string): number | undefined => {
      for (const [unitNum, unitStds] of unitStandardsMap) {
        for (const unitStd of unitStds) {
          if (standardMatches(qStd, unitStd)) {
            return unitNum;
          }
        }
      }
      return undefined;
    };

    // Count MC and CR by unit, and track unmatched questions
    const unitStats = new Map<number, { mc: number; cr: number }>();
    const unmatchedByStandard = new Map<string, { mc: number; cr: number }>();
    let totalMC = 0;
    let totalCR = 0;

    questions.forEach((q) => {
      const normalizedStd = normalizeStandard(q.standard);
      const unitNum = findMatchingUnit(normalizedStd);

      if (unitNum !== undefined) {
        if (!unitStats.has(unitNum)) {
          unitStats.set(unitNum, { mc: 0, cr: 0 });
        }
        const stats = unitStats.get(unitNum)!;

        if (q.responseType === "multipleChoice") {
          stats.mc++;
          totalMC++;
        } else if (q.responseType === "constructedResponse") {
          stats.cr++;
          totalCR++;
        }
      } else {
        // Track unmatched questions by standard
        if (!unmatchedByStandard.has(q.standard)) {
          unmatchedByStandard.set(q.standard, { mc: 0, cr: 0 });
        }
        const unmatchedStats = unmatchedByStandard.get(q.standard)!;
        if (q.responseType === "multipleChoice") {
          unmatchedStats.mc++;
        } else if (q.responseType === "constructedResponse") {
          unmatchedStats.cr++;
        }
      }
    });

    // Build sorted array with percentages
    const rows = units
      .map((unit) => {
        const stats = unitStats.get(unit.unitNumber) || { mc: 0, cr: 0 };
        return {
          unitNumber: unit.unitNumber,
          mc: stats.mc,
          cr: stats.cr,
          mcPct: totalMC > 0 ? Math.round((stats.mc / totalMC) * 100) : 0,
          crPct: totalCR > 0 ? Math.round((stats.cr / totalCR) * 100) : 0,
        };
      })
      .sort((a, b) => a.unitNumber - b.unitNumber);

    // Build unmatched questions array
    const unmatchedQuestions = Array.from(unmatchedByStandard.entries())
      .map(([standard, counts]) => ({
        standard,
        questionType: counts.mc > 0 && counts.cr > 0 ? "MC+CR" : counts.mc > 0 ? "MC" : "CR",
        count: counts.mc + counts.cr,
      }))
      .sort((a, b) => b.count - a.count);

    return { rows, totalMC, totalCR, unmatchedQuestions };
  }, [selectedGrade, questions, units, unitsHaveStandards]);

  // Compute standards distribution (count of each standard including secondary)
  const standardsDistribution = useMemo((): StandardsDistribution | null => {
    if (!selectedGrade || questions.length === 0) {
      return null;
    }

    // Helper to check if a standard matches the selected grade
    const isSelectedGradeStandard = (std: string): boolean => {
      const normalized = normalizeStandard(std);
      return normalized.startsWith(`${selectedGrade}.`);
    };

    // Count by parent standard (combining letter suffixes like G.1a, G.1b into G.1)
    // Only count standards from the selected grade
    const standardCounts = new Map<string, { mc: number; cr: number }>();

    questions.forEach((q) => {
      // Normalize and strip letter suffix to combine variants
      const primaryStd = stripLetterSuffix(normalizeStandard(q.standard));
      const secondaryStd = q.secondaryStandard ? stripLetterSuffix(normalizeStandard(q.secondaryStandard)) : null;

      // Count primary standard (only if it matches selected grade)
      if (isSelectedGradeStandard(primaryStd)) {
        if (!standardCounts.has(primaryStd)) {
          standardCounts.set(primaryStd, { mc: 0, cr: 0 });
        }
        const primaryStats = standardCounts.get(primaryStd)!;
        if (q.responseType === "multipleChoice") {
          primaryStats.mc++;
        } else if (q.responseType === "constructedResponse") {
          primaryStats.cr++;
        }
      }

      // Count secondary standard if present (only if it matches selected grade)
      if (secondaryStd && isSelectedGradeStandard(secondaryStd)) {
        if (!standardCounts.has(secondaryStd)) {
          standardCounts.set(secondaryStd, { mc: 0, cr: 0 });
        }
        const secondaryStats = standardCounts.get(secondaryStd)!;
        if (q.responseType === "multipleChoice") {
          secondaryStats.mc++;
        } else if (q.responseType === "constructedResponse") {
          secondaryStats.cr++;
        }
      }
    });

    // Group by domain
    const byDomain = new Map<string, { standards: Array<{ standard: string; mc: number; cr: number }>; totalMC: number; totalCR: number }>();

    standardCounts.forEach((counts, std) => {
      const domain = extractDomain(std);
      if (!byDomain.has(domain)) {
        byDomain.set(domain, { standards: [], totalMC: 0, totalCR: 0 });
      }
      const domainData = byDomain.get(domain)!;
      domainData.standards.push({ standard: std, mc: counts.mc, cr: counts.cr });
      domainData.totalMC += counts.mc;
      domainData.totalCR += counts.cr;
    });

    const sortedDomains = Array.from(byDomain.entries())
      .map(([domain, data]) => ({
        domain,
        label: DOMAIN_LABELS[domain] || domain,
        standards: data.standards.sort(numericStandardSort),
        totalMC: data.totalMC,
        totalCR: data.totalCR,
        total: data.totalMC + data.totalCR,
      }))
      .sort((a, b) => b.total - a.total);

    const grandTotalMC = sortedDomains.reduce((sum, d) => sum + d.totalMC, 0);
    const grandTotalCR = sortedDomains.reduce((sum, d) => sum + d.totalCR, 0);

    return { domains: sortedDomains, grandTotalMC, grandTotalCR };
  }, [selectedGrade, questions]);

  // Compute standards per unit with question counts
  const unitStandardsWithCounts = useMemo((): UnitStandardsData[] | null => {
    if (!selectedGrade || questions.length === 0 || units.length === 0 || !unitsHaveStandards) {
      return null;
    }

    // Count questions per standard (combining letter suffixes)
    const standardQuestionCounts = new Map<string, number>();
    questions.forEach((q) => {
      const primaryStd = stripLetterSuffix(normalizeStandard(q.standard));
      standardQuestionCounts.set(primaryStd, (standardQuestionCounts.get(primaryStd) || 0) + 1);

      if (q.secondaryStandard) {
        const secondaryStd = stripLetterSuffix(normalizeStandard(q.secondaryStandard));
        standardQuestionCounts.set(secondaryStd, (standardQuestionCounts.get(secondaryStd) || 0) + 1);
      }
    });

    // Build unit data with standards and counts
    const unitData = units.map((unit) => {
      // Get unique parent standards for this unit (strip letter suffixes and dedupe)
      const unitStds = unit.standards || [];
      const parentStandardsSet = new Set<string>();
      unitStds.forEach((std) => {
        const parent = stripLetterSuffix(normalizeStandard(std));
        parentStandardsSet.add(parent);
      });

      // Convert to array with counts, sorted numerically, excluding standards with 0 questions
      const standardsWithCounts = Array.from(parentStandardsSet)
        .map((std) => ({
          standard: std,
          count: standardQuestionCounts.get(std) || 0,
          // Extract short form (e.g., "8.G.1" -> "G.1")
          shortForm: std.replace(/^\d+\./, ""),
          // Extract domain (e.g., "8.G.1" -> "G")
          domain: extractDomain(std),
        }))
        .filter((std) => std.count > 0) // Exclude standards with no questions
        .sort((a, b) => {
          // Sort by domain first, then by number
          const aDomain = a.shortForm.split(".")[0];
          const bDomain = b.shortForm.split(".")[0];
          if (aDomain !== bDomain) return aDomain.localeCompare(bDomain);
          const aNum = parseInt(a.shortForm.split(".")[1] || "0", 10);
          const bNum = parseInt(b.shortForm.split(".")[1] || "0", 10);
          return aNum - bNum;
        });

      // Group standards by domain
      const byDomain = new Map<string, typeof standardsWithCounts>();
      standardsWithCounts.forEach((std) => {
        if (!byDomain.has(std.domain)) {
          byDomain.set(std.domain, []);
        }
        byDomain.get(std.domain)!.push(std);
      });

      // Convert to array sorted by total count per domain
      const domainGroups = Array.from(byDomain.entries())
        .map(([domain, stds]) => ({
          domain,
          label: DOMAIN_LABELS[domain] || domain,
          standards: stds,
          totalCount: stds.reduce((sum, s) => sum + s.count, 0),
        }))
        .sort((a, b) => b.totalCount - a.totalCount);

      return {
        unitNumber: unit.unitNumber,
        unitName: unit.unitName || `Unit ${unit.unitNumber}`,
        domainGroups,
      };
    }).sort((a, b) => a.unitNumber - b.unitNumber);

    return unitData;
  }, [selectedGrade, questions, units, unitsHaveStandards]);

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGrade(e.target.value);
    setSelectedUnit(null);
    setSelectedSection("all");
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedUnit(val ? parseInt(val, 10) : null);
    setSelectedSection("all");
  };

  const handleClearFilters = () => {
    setSelectedGrade("");
    setSelectedUnit(null);
    setSelectedSection("all");
  };

  const handleToggleDomain = useCallback((domain: string) => {
    setExpandedDomains(prev => {
      const next = new Set(prev);
      if (next.has(domain)) {
        next.delete(domain);
      } else {
        next.add(domain);
      }
      return next;
    });
  }, []);

  // Export filtered questions as JSON
  const handleExportJSON = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      filters: {
        grade: selectedGrade,
        unit: selectedUnit,
        section: selectedSection,
      },
      totalQuestions: filteredQuestions.length,
      questions: filteredQuestions.map((q) => ({
        questionId: q.questionId,
        standard: q.standard,
        secondaryStandard: q.secondaryStandard,
        grade: q.grade,
        examYear: q.examYear,
        examTitle: q.examTitle,
        questionType: q.questionType,
        responseType: q.responseType,
        points: q.points,
        answer: q.answer,
        questionNumber: q.questionNumber,
        screenshotUrl: q.screenshotUrl,
        sourceUrl: q.sourceUrl,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `state-exam-questions-grade${selectedGrade}${selectedUnit ? `-unit${selectedUnit}` : ""}${selectedSection !== "all" ? `-section${selectedSection}` : ""}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filteredQuestions, selectedGrade, selectedUnit, selectedSection]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6" style={{ maxWidth: "1800px" }}>
        <div className="flex gap-6">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-6">
              {/* Filters Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-4">
                  <h1 className="text-3xl font-bold mb-2">State Exam Questions</h1>
                  <p className="text-gray-600">
                    {selectedGrade
                      ? `Showing ${filteredQuestions.length} questions for Grade ${selectedGrade}`
                      : "Select a grade to view questions"}
                  </p>
                </div>

                {/* Filters Row */}
                <div className="space-y-4">
                  <div className="flex gap-4 items-end">
                    {/* Grade Filter */}
                    <div className="flex-1">
                      <label
                        htmlFor="grade-filter"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Grade
                      </label>
                      <select
                        id="grade-filter"
                        value={selectedGrade}
                        onChange={handleGradeChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                          !selectedGrade
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Select a grade...</option>
                        {availableGrades.map((grade) => (
                          <option key={grade} value={grade}>
                            Grade {grade} ({stats?.byGrade[grade] || 0} questions)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Unit Filter */}
                    <div className="flex-1">
                      <label
                        htmlFor="unit-filter"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Unit
                      </label>
                      <select
                        id="unit-filter"
                        value={selectedUnit ?? ""}
                        onChange={handleUnitChange}
                        disabled={!selectedGrade || loadingUnits}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          selectedGrade && selectedUnit === null
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">
                          {!selectedGrade
                            ? "Select grade first"
                            : loadingUnits
                            ? "Loading units..."
                            : "All Units"}
                        </option>
                        {units.map((unit, index) => (
                          <option key={`${unit.grade}-${unit.unitNumber}-${index}`} value={unit.unitNumber}>
                            {unit.unitName || `Unit ${unit.unitNumber}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Clear Filters */}
                    {(selectedGrade || selectedUnit !== null) && (
                      <div className="flex items-end">
                        <button
                          onClick={handleClearFilters}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Section of Unit - only show when unit is selected */}
                  {selectedGrade && selectedUnit !== null && (
                    <SectionRadioGroup
                      options={sectionOptions}
                      value={selectedSection}
                      onChange={setSelectedSection}
                      label="Section of Unit"
                      disabled={loadingSections}
                      loading={loadingSections}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <Alert intent="error">
                <Alert.Title>Error</Alert.Title>
                <Alert.Description>{error}</Alert.Description>
              </Alert>
            )}

            {/* Loading State */}
            {loading && selectedGrade && (
              <div className="flex justify-center items-center min-h-[400px]">
                <Spinner size="lg" variant="primary" />
              </div>
            )}

            {/* Empty State - No Grade Selected */}
            {!selectedGrade && !loading && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-gray-400 text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Grade to View Questions
                </h3>
                <p className="text-gray-500">
                  Use the grade filter above to see state exam questions.
                </p>
              </div>
            )}

            {/* Empty State - No Results */}
            {selectedGrade && !loading && filteredQuestions.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-gray-400 text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Questions Found
                </h3>
                <p className="text-gray-500">
                  No questions found for this selection.
                </p>
              </div>
            )}

            {/* Questions Grid */}
            {!loading && filteredQuestions.length > 0 && (
              <>
                {/* Results Summary Card */}
                <div className="bg-white rounded-lg border border-gray-200 mb-4">
                  {/* Top row - counts and legend */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Filter includes:</span>
                      <span className="text-2xl font-bold text-blue-600">{filteredQuestions.length}</span>
                      <span className="text-sm text-gray-600">
                        state test {filteredQuestions.length === 1 ? "question" : "questions"}
                      </span>
                    </div>

                    {/* Key/Legend */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mr-2">Key</span>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <LegendItem
                          icon={<Badge intent="primary" appearance="outline" size="xs">NY-6.RP.3a</Badge>}
                          label="Primary Standard"
                        />
                        <LegendItem
                          icon={<Badge intent="secondary" appearance="outline" size="xs">NY-6.NS.5</Badge>}
                          label="Secondary Standard"
                        />
                        <LegendItem
                          icon={
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 border border-primary-300 text-primary text-xs">
                              <span>8.F.1</span>
                              <span className="text-[10px] font-bold bg-primary-500 text-white px-1 py-0.5 rounded-full">5</span>
                            </span>
                          }
                          label="# of questions"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Standards row - toggle and clickable badges */}
                  {filterStandards && filterStandards.length > 0 && (
                    <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        {groupByStandard && (
                          <>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Jump to:</span>
                            {filterStandards.map((std) => {
                              const stdData = questionsByStandard.get(std);
                              const count = stdData?.questions.length || 0;
                              // Hide standards with 0 questions
                              if (count === 0) return null;
                              return (
                                <button
                                  key={std}
                                  onClick={() => {
                                    const element = document.getElementById(`standard-${std}`);
                                    if (element) {
                                      element.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }
                                  }}
                                  className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary-50 border border-primary-300 text-primary hover:bg-primary-100 transition-colors"
                                >
                                  <span className="text-xs font-medium">{std}</span>
                                  <span className="text-[10px] font-bold bg-primary-500 text-white px-1.5 py-0.5 rounded-full">
                                    {count}
                                  </span>
                                </button>
                              );
                            })}
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <ToggleSwitch
                          checked={groupByStandard}
                          onChange={setGroupByStandard}
                          label="Group by Standard"
                        />
                        <button
                          onClick={handleExportJSON}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Export JSON
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Questions display - grouped by standard or flat list */}
                {groupByStandard && questionsByStandard.size > 0 ? (
                  <div className="space-y-4">
                    {Array.from(questionsByStandard.entries())
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([standard, { questions: stdQuestions, isSecondaryMatch }]) => (
                        <StandardAccordion
                          key={standard}
                          standard={standard}
                          questions={stdQuestions}
                          isSecondaryMatch={isSecondaryMatch}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredQuestions.map((question) => (
                      <QuestionCard
                        key={question.questionId}
                        question={question}
                        isSecondaryOnlyMatch={secondaryOnlyMatches.has(question.questionId)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Standards × Unit Matrix - Full width at bottom */}
            {selectedGrade && !loading && questions.length > 0 && (
              <div className="mt-8">
                <StandardsUnitMatrix
                  questions={questions}
                  units={units}
                  selectedGrade={selectedGrade}
                />
              </div>
            )}
          </div>

          {/* Floating Right Sidebar - Always visible */}
          <div className="w-80 shrink-0 sticky top-6 self-start space-y-4 max-h-[calc(100vh-3rem)] overflow-y-auto">
            <QuestionsByUnitTable
              unitDistribution={unitDistribution}
              selectedUnit={selectedUnit}
            />
            <StandardsDistributionTable
              standardsDistribution={standardsDistribution}
              expandedDomains={expandedDomains}
              onToggleDomain={handleToggleDomain}
            />
            <StandardsByUnitTable
              unitStandardsWithCounts={unitStandardsWithCounts}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
