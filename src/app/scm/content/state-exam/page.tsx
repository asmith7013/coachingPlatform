"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useUrlSyncedState } from "@/hooks/scm/useUrlSyncedState";
import { Alert } from "@/components/core/feedback/Alert";
import { Spinner } from "@/components/core/feedback/Spinner";
import { Skeleton } from "@/components/core/feedback/Skeleton";
import {
  getStateTestQuestions,
  getStateTestStats,
} from "@/app/tools/state-test-scraper/actions/scrape";
import { Dialog } from "@/components/composed/dialogs/Dialog";
import {
  getUnitsWithStandards,
  getSectionsWithStandards,
  type UnitWithStandards,
  type SectionWithStandards,
} from "./actions";

// Local imports
import {
  DOMAIN_COLORS,
  DOMAIN_LABELS,
  STANDARD_DESCRIPTIONS,
} from "./constants";
import { normalizeStandard, standardMatches, extractDomain } from "./hooks";
import {
  StandardAccordion,
  StandardsUnitMatrix,
  PrintSelectionFooter,
} from "./components";
import { printSelectedQuestions } from "./utils";
import type {
  ScrapeStats,
  StateTestQuestion,
  QuestionsByStandardData,
} from "./types";

export default function StateExamQuestionsPage() {
  const [questions, setQuestions] = useState<StateTestQuestion[]>([]);
  const [stats, setStats] = useState<ScrapeStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters (URL-synced for shareability)
  const [selectedGrade, setSelectedGrade] = useUrlSyncedState("g", {
    storageKey: "scm-state-exam-grade",
  });
  const [unitParam, setUnitParam] = useUrlSyncedState("unit", {
    storageKey: "scm-state-exam-unit",
  });
  const selectedUnit = unitParam ? Number(unitParam) : null;
  const setSelectedUnit = useCallback(
    (unit: number | null) => setUnitParam(unit !== null ? String(unit) : ""),
    [setUnitParam],
  );
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [showSubstandards, setShowSubstandards] = useState(true);

  // Units and sections data
  const [units, setUnits] = useState<UnitWithStandards[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [sections, setSections] = useState<SectionWithStandards[]>([]);
  const [unitStandards, setUnitStandards] = useState<string[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);

  // Export modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedForExport, setSelectedForExport] = useState<Set<string>>(
    new Set(),
  );

  // Print selection state
  const [selectedForPrint, setSelectedForPrint] = useState<Set<string>>(
    new Set(),
  );

  // Accordion open state (controlled)
  const [openStandards, setOpenStandards] = useState<Set<string>>(new Set());

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
        setError(
          err instanceof Error ? err.message : "Failed to load questions",
        );
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
        const result = await getSectionsWithStandards(
          selectedGrade,
          selectedUnit,
        );
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
      const sectionId = s.subsection
        ? `${s.section}-${s.subsection}`
        : s.section;
      return sectionId === selectedSection;
    });

    return section?.standards || [];
  }, [selectedUnit, selectedSection, unitStandards, sections]);

  // Filter questions by search query and unit/section standards
  // Also track which questions matched only via secondary standard
  // Group questions by the standard they matched on
  const { filteredQuestions, questionsByStandard } = useMemo(() => {
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
        const qSecondaryStandard = q.secondaryStandard
          ? normalizeStandard(q.secondaryStandard)
          : null;

        const primaryMatchStd = findMatchingFilterStd(qPrimaryStandard);
        const secondaryMatchStd = qSecondaryStandard
          ? findMatchingFilterStd(qSecondaryStandard)
          : null;

        const primaryMatches = primaryMatchStd !== null;
        const secondaryMatches = secondaryMatchStd !== null;

        // Track if this question only matched via secondary standard
        if (!primaryMatches && secondaryMatches) {
          secondaryOnly.add(q.questionId);
        }

        // Group by question's own standard (not the filter standard) to preserve substandards
        if (primaryMatches && primaryMatchStd) {
          const groupKey = normalizeStandard(q.standard);
          if (!byStandard.has(groupKey)) {
            byStandard.set(groupKey, {
              questions: [],
              isSecondaryMatch: new Map(),
            });
          }
          byStandard.get(groupKey)!.questions.push(q);
          byStandard.get(groupKey)!.isSecondaryMatch.set(q.questionId, false);
        }
        if (secondaryMatches && secondaryMatchStd) {
          const groupKey = q.secondaryStandard
            ? normalizeStandard(q.secondaryStandard)
            : secondaryMatchStd;
          if (!byStandard.has(groupKey)) {
            byStandard.set(groupKey, {
              questions: [],
              isSecondaryMatch: new Map(),
            });
          }
          // Only add if not already added via primary match to this same standard
          const existing = byStandard.get(groupKey)!;
          if (
            !existing.questions.some((eq) => eq.questionId === q.questionId)
          ) {
            existing.questions.push(q);
          }
          existing.isSecondaryMatch.set(q.questionId, true);
        }

        return primaryMatches || secondaryMatches;
      });
    } else {
      // No unit filter - group all questions by their primary standard
      filtered.forEach((q) => {
        const primaryStd = normalizeStandard(q.standard);
        if (!byStandard.has(primaryStd)) {
          byStandard.set(primaryStd, {
            questions: [],
            isSecondaryMatch: new Map(),
          });
        }
        byStandard.get(primaryStd)!.questions.push(q);
        byStandard.get(primaryStd)!.isSecondaryMatch.set(q.questionId, false);
      });
    }

    return { filteredQuestions: filtered, questionsByStandard: byStandard };
  }, [questions, filterStandards]);

  // Build a combined standard descriptions map from units data (dynamic from lessons)
  // This supplements the hardcoded STANDARD_DESCRIPTIONS with actual lesson data
  const dynamicStandardDescriptions = useMemo(() => {
    const descriptions: Record<string, string> = {};
    units.forEach((unit) => {
      unit.standardsWithText?.forEach(({ code, text }) => {
        if (code && text) {
          // Normalize the code to match how we display standards
          const normalizedCode = normalizeStandard(code);
          if (!descriptions[normalizedCode]) {
            descriptions[normalizedCode] = text;
          }
        }
      });
    });
    return descriptions;
  }, [units]);

  // Get available grades from stats
  const availableGrades = stats
    ? Object.keys(stats.byGrade).sort((a, b) => parseInt(a) - parseInt(b))
    : [];

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGrade(e.target.value);
    setUnitParam("");
    setSelectedSection("all");
    setSelectedForPrint(new Set()); // Clear print selection on grade change
  };

  // Sort questions by standard (same sorting as main page)
  const sortedFilteredQuestions = useMemo(() => {
    return [...filteredQuestions].sort((a, b) => {
      const stdA = normalizeStandard(a.standard);
      const stdB = normalizeStandard(b.standard);
      return stdA.localeCompare(stdB);
    });
  }, [filteredQuestions]);

  // Export selected questions as JSON
  const handleExportJSON = useCallback(() => {
    const questionsToExport = sortedFilteredQuestions.filter((q) =>
      selectedForExport.has(q.questionId),
    );

    const exportData = {
      exportedAt: new Date().toISOString(),
      filters: {
        grade: selectedGrade,
        unit: selectedUnit,
        section: selectedSection,
      },
      totalQuestions: questionsToExport.length,
      questions: questionsToExport.map((q) => ({
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

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `state-exam-questions-grade${selectedGrade}${selectedUnit ? `-unit${selectedUnit}` : ""}${selectedSection !== "all" ? `-section${selectedSection}` : ""}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportModalOpen(false);
  }, [
    sortedFilteredQuestions,
    selectedForExport,
    selectedGrade,
    selectedUnit,
    selectedSection,
  ]);

  // Print selection handlers
  const handleQuestionSelectionChange = useCallback(
    (questionId: string, selected: boolean) => {
      setSelectedForPrint((prev) => {
        const next = new Set(prev);
        if (selected) {
          next.add(questionId);
        } else {
          next.delete(questionId);
        }
        return next;
      });
    },
    [],
  );

  const handleClearPrintSelection = useCallback(() => {
    setSelectedForPrint(new Set());
  }, []);

  const handlePrint = useCallback(() => {
    const questionsToPrint = filteredQuestions.filter((q) =>
      selectedForPrint.has(q.questionId),
    );
    printSelectedQuestions(questionsToPrint);
  }, [filteredQuestions, selectedForPrint]);

  // Accordion toggle handler
  const handleStandardToggle = useCallback((standard: string) => {
    setOpenStandards((prev) => {
      const next = new Set(prev);
      if (next.has(standard)) {
        next.delete(standard);
      } else {
        next.add(standard);
      }
      return next;
    });
  }, []);

  const handleExpandAll = useCallback((standards: string[]) => {
    setOpenStandards((prev) => {
      const next = new Set(prev);
      standards.forEach((s) => next.add(s));
      return next;
    });
  }, []);

  const handleCollapseAll = useCallback((standards: string[]) => {
    setOpenStandards((prev) => {
      const next = new Set(prev);
      standards.forEach((s) => next.delete(s));
      return next;
    });
  }, []);

  return (
    <div
      className={`min-h-screen bg-gray-50 ${selectedForPrint.size > 0 ? "pb-20" : ""}`}
    >
      <div className="mx-auto p-6" style={{ maxWidth: "1800px" }}>
        <div className="flex gap-6">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-6">
              {/* Title and Grade Filter Card */}
              <div className="bg-white rounded-lg shadow-sm px-6 py-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">State Exam Questions</h1>
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="grade-filter"
                      className="text-sm font-medium text-gray-700"
                    >
                      Grade
                    </label>
                    <select
                      id="grade-filter"
                      value={selectedGrade}
                      onChange={handleGradeChange}
                      disabled={!stats}
                      className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !stats
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : !selectedGrade
                            ? "border-blue-500 ring-2 ring-blue-200 cursor-pointer"
                            : "border-gray-300 cursor-pointer"
                      }`}
                    >
                      <option value="">
                        {!stats ? "Loading grades..." : "Select a grade..."}
                      </option>
                      {availableGrades.map((grade) => (
                        <option key={grade} value={grade}>
                          Grade {grade} ({stats?.byGrade[grade] || 0} questions)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Unit × Standards Matrix - Just below filter card */}
            {selectedGrade && !loading && questions.length > 0 && (
              <div className="mb-6 relative">
                {loadingUnits && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-lg">
                    <Spinner size="md" variant="primary" />
                  </div>
                )}
                <StandardsUnitMatrix
                  questions={questions}
                  units={units}
                  selectedGrade={selectedGrade}
                  selectedUnit={selectedUnit}
                  onUnitClick={(unitNumber) => {
                    setSelectedUnit(unitNumber);
                    setSelectedSection("all");
                    setSelectedForPrint(new Set()); // Clear print selection on unit change
                  }}
                  standardDescriptions={dynamicStandardDescriptions}
                  showSubstandards={showSubstandards}
                  onShowSubstandardsChange={setShowSubstandards}
                />
              </div>
            )}

            {/* Error State */}
            {error && (
              <Alert intent="error">
                <Alert.Title>Error</Alert.Title>
                <Alert.Description>{error}</Alert.Description>
              </Alert>
            )}

            {/* Loading State - Skeleton Grid */}
            {loading && selectedGrade && (
              <div className="space-y-4">
                {/* Skeleton for results summary */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton height="2xl" width="xs" />
                    <Skeleton height="base" width="sm" />
                  </div>
                </div>
                {/* Skeleton grid for question cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                    >
                      <div className="px-3 py-2 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <Skeleton height="sm" width="sm" />
                          <Skeleton height="sm" width="xs" />
                        </div>
                      </div>
                      <div className="p-4">
                        <Skeleton height="3xl" width="full" className="h-64" />
                      </div>
                    </div>
                  ))}
                </div>
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
                {/* Results Summary Card - Standalone */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-blue-600">
                          {filteredQuestions.length}
                        </span>
                        <span className="text-base text-gray-600">
                          total{" "}
                          {filteredQuestions.length === 1
                            ? "question"
                            : "questions"}
                        </span>
                      </div>
                      {selectedUnit !== null && (
                        <div className="flex items-center gap-2 ml-2 pl-3 border-l border-gray-300">
                          <span className="text-base font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
                            {units.find((u) => u.unitNumber === selectedUnit)
                              ?.unitName || `Unit ${selectedUnit}`}
                          </span>
                          {loadingSections && (
                            <Spinner size="xs" variant="primary" />
                          )}
                          <button
                            onClick={() => {
                              setSelectedUnit(null);
                              setSelectedSection("all");
                            }}
                            className="text-gray-400 hover:text-gray-600 cursor-pointer"
                            title="Clear unit filter"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedForExport(
                          new Set(filteredQuestions.map((q) => q.questionId)),
                        );
                        setIsExportModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Export JSON
                    </button>
                  </div>
                </div>

                {/* Questions display - grouped by domain */}
                <div className="mt-4 space-y-4">
                  {(() => {
                    // Sort standards, then group by domain
                    const sortedEntries = Array.from(
                      questionsByStandard.entries(),
                    ).sort(([a], [b]) => {
                      const domainA = extractDomain(a);
                      const domainB = extractDomain(b);
                      if (domainA !== domainB) {
                        return domainA.localeCompare(domainB);
                      }
                      const numA = a
                        .replace(/[^\d.]/g, "")
                        .split(".")
                        .map(Number);
                      const numB = b
                        .replace(/[^\d.]/g, "")
                        .split(".")
                        .map(Number);
                      for (
                        let i = 0;
                        i < Math.max(numA.length, numB.length);
                        i++
                      ) {
                        const diff = (numA[i] || 0) - (numB[i] || 0);
                        if (diff !== 0) return diff;
                      }
                      return a.localeCompare(b);
                    });

                    // Group into domains preserving sort order
                    const domainGroups = new Map<
                      string,
                      typeof sortedEntries
                    >();
                    sortedEntries.forEach((entry) => {
                      const domain = extractDomain(entry[0]);
                      if (!domainGroups.has(domain)) {
                        domainGroups.set(domain, []);
                      }
                      domainGroups.get(domain)!.push(entry);
                    });

                    return Array.from(domainGroups.entries()).map(
                      ([domain, entries]) => {
                        const colors =
                          DOMAIN_COLORS[domain] || DOMAIN_COLORS.Other;
                        const totalQuestions = entries.reduce(
                          (sum, [, data]) => sum + data.questions.length,
                          0,
                        );
                        const domainStandards = entries.map(([s]) => s);
                        const allExpanded = domainStandards.every((s) =>
                          openStandards.has(s),
                        );

                        return (
                          <div
                            key={domain}
                            className={`bg-white rounded-lg border ${colors.border} overflow-hidden`}
                          >
                            {/* Domain header with colored bg and chip-style title */}
                            <div
                              className={`${colors.bg} px-4 py-3 flex items-center justify-between`}
                            >
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white ${colors.border} border`}
                              >
                                <span
                                  className={`w-2.5 h-2.5 rounded-full ${colors.badge}`}
                                ></span>
                                <span className={`font-medium ${colors.text}`}>
                                  {DOMAIN_LABELS[domain] || domain}
                                </span>
                              </span>
                              <div className="flex items-center gap-3">
                                <span className={`text-sm ${colors.text}`}>
                                  {entries.length}{" "}
                                  {entries.length === 1
                                    ? "standard"
                                    : "standards"}{" "}
                                  · {totalQuestions}{" "}
                                  {totalQuestions === 1
                                    ? "question"
                                    : "questions"}
                                </span>
                                <button
                                  onClick={() =>
                                    allExpanded
                                      ? handleCollapseAll(domainStandards)
                                      : handleExpandAll(domainStandards)
                                  }
                                  className={`inline-flex items-center gap-1 text-xs font-medium ${colors.text} bg-white ${colors.border} border rounded px-2 py-1 hover:opacity-70 cursor-pointer`}
                                >
                                  <span>
                                    {allExpanded
                                      ? "Collapse all"
                                      : "Expand all"}
                                  </span>
                                  <svg
                                    className={`w-4 h-4 transition-transform ${allExpanded ? "rotate-180" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 3l5 5 5-5"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 11l5 5 5-5"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            {/* Standard accordions within this domain */}
                            <div className="divide-y divide-gray-200">
                              {entries.map(
                                ([
                                  standard,
                                  { questions: stdQuestions, isSecondaryMatch },
                                ]) => (
                                  <StandardAccordion
                                    key={standard}
                                    standard={standard}
                                    questions={stdQuestions}
                                    isSecondaryMatch={isSecondaryMatch}
                                    contained
                                    standardDescriptions={
                                      dynamicStandardDescriptions
                                    }
                                    selectedQuestions={selectedForPrint}
                                    onQuestionSelectionChange={
                                      handleQuestionSelectionChange
                                    }
                                    showCheckboxes={true}
                                    open={openStandards.has(standard)}
                                    onToggle={handleStandardToggle}
                                  />
                                ),
                              )}
                            </div>
                          </div>
                        );
                      },
                    );
                  })()}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Print Selection Footer */}
      <PrintSelectionFooter
        selectedCount={selectedForPrint.size}
        onClear={handleClearPrintSelection}
        onPrint={handlePrint}
      />

      {/* Export Modal */}
      <Dialog
        open={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Questions"
        size="lg"
      >
        <div className="space-y-4">
          {/* Selection controls */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {selectedForExport.size} of {sortedFilteredQuestions.length}{" "}
                selected
              </span>
              <button
                onClick={() =>
                  setSelectedForExport(
                    new Set(sortedFilteredQuestions.map((q) => q.questionId)),
                  )
                }
                className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Select all
              </button>
              <button
                onClick={() => setSelectedForExport(new Set())}
                className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Deselect all
              </button>
            </div>
          </div>

          {/* Question list with checkboxes - grouped by standard */}
          <div className="max-h-[400px] overflow-y-auto space-y-4">
            {(() => {
              // Group sorted questions by standard
              const byStandard = new Map<string, StateTestQuestion[]>();
              sortedFilteredQuestions.forEach((q) => {
                const std = normalizeStandard(q.standard);
                if (!byStandard.has(std)) {
                  byStandard.set(std, []);
                }
                byStandard.get(std)!.push(q);
              });

              return Array.from(byStandard.entries()).map(
                ([standard, stdQuestions]) => {
                  const domain = extractDomain(standard);
                  const colors = DOMAIN_COLORS[domain] || DOMAIN_COLORS.Other;
                  const description = STANDARD_DESCRIPTIONS[standard];
                  const allSelected = stdQuestions.every((q) =>
                    selectedForExport.has(q.questionId),
                  );
                  const someSelected = stdQuestions.some((q) =>
                    selectedForExport.has(q.questionId),
                  );

                  return (
                    <div
                      key={standard}
                      className={`rounded-lg border ${colors.border} overflow-hidden`}
                    >
                      {/* Standard header with select all for this standard */}
                      <div
                        className={`${colors.bg} px-3 py-2 flex items-center justify-between`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            ref={(el) => {
                              if (el)
                                el.indeterminate = someSelected && !allSelected;
                            }}
                            onChange={(e) => {
                              const newSelected = new Set(selectedForExport);
                              stdQuestions.forEach((q) => {
                                if (e.target.checked) {
                                  newSelected.add(q.questionId);
                                } else {
                                  newSelected.delete(q.questionId);
                                }
                              });
                              setSelectedForExport(newSelected);
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className={`font-semibold ${colors.text}`}>
                            {standard}
                          </span>
                          {description && (
                            <span
                              className={`text-sm ${colors.text} opacity-75`}
                            >
                              {description}
                            </span>
                          )}
                        </div>
                        <span className={`text-sm ${colors.text}`}>
                          {
                            stdQuestions.filter((q) =>
                              selectedForExport.has(q.questionId),
                            ).length
                          }
                          /{stdQuestions.length}
                        </span>
                      </div>

                      {/* Questions in this standard */}
                      <div className="bg-white divide-y divide-gray-100">
                        {stdQuestions.map((q) => (
                          <label
                            key={q.questionId}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedForExport.has(q.questionId)}
                              onChange={(e) => {
                                const newSelected = new Set(selectedForExport);
                                if (e.target.checked) {
                                  newSelected.add(q.questionId);
                                } else {
                                  newSelected.delete(q.questionId);
                                }
                                setSelectedForExport(newSelected);
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <div className="flex-1 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-600">
                                  {q.responseType === "multipleChoice"
                                    ? "Multiple Choice"
                                    : q.responseType === "constructedResponse"
                                      ? "Constructed Response"
                                      : q.questionType || "-"}
                                </span>
                                {q.points !== undefined && (
                                  <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs font-medium">
                                    {q.points}pt
                                  </span>
                                )}
                                <span className="text-gray-500">
                                  {q.examYear}
                                </span>
                              </div>
                              <span className="text-xs text-gray-400 font-mono">
                                {q.questionId}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                },
              );
            })()}
          </div>

          {/* Export button */}
          <div className="flex justify-end pt-3 border-t border-gray-200">
            <button
              onClick={handleExportJSON}
              disabled={selectedForExport.size === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export {selectedForExport.size}{" "}
              {selectedForExport.size === 1 ? "question" : "questions"}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
