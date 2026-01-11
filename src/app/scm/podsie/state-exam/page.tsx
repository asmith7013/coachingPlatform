"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Alert } from "@/components/core/feedback/Alert";
import { Spinner } from "@/components/core/feedback/Spinner";
import { getStateTestQuestions, getStateTestStats } from "@/app/tools/state-test-scraper/actions/scrape";
import type { StateTestQuestion } from "@/app/tools/state-test-scraper/lib/types";
import { Badge } from "@/components/core/feedback/Badge";
import { LegendItem } from "@/components/core/feedback/Legend";
import { Dialog } from "@/components/composed/dialogs/Dialog";
import { SectionRadioGroup } from "@/components/core/inputs/SectionRadioGroup";
import { ToggleSwitch } from "@/components/core/fields/ToggleSwitch";
import {
  getUnitsWithStandards,
  getSectionsWithStandards,
  type UnitWithStandards,
  type SectionWithStandards,
} from "./actions";

interface ScrapeStats {
  total: number;
  byGrade: Record<string, number>;
  byYear: Record<string, number>;
}

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

  // Normalize standard for comparison
  // Handles: NY-8.G.1.a -> 8.G.1a, NY-8.EE.7a -> 8.EE.7a
  // Removes NY- prefix, CC prefix, and dots before single letter suffixes
  const normalizeStandard = useCallback((std: string) => {
    return std
      .replace(/^NY-/, "")
      .replace(/^CC\s*/, "")
      .replace(/\.([a-z])$/i, "$1"); // Remove dot before single letter suffix (8.G.1.a -> 8.G.1a)
  }, []);

  // Filter questions by search query and unit/section standards
  // Also track which questions matched only via secondary standard
  // Group questions by the standard they matched on
  const { filteredQuestions, secondaryOnlyMatches, questionsByStandard } = useMemo(() => {
    let filtered = questions;
    const secondaryOnly = new Set<string>();
    const byStandard = new Map<string, { questions: StateTestQuestion[]; isSecondaryMatch: Map<string, boolean> }>();

    // Filter by unit/section standards (check both primary and secondary)
    if (filterStandards && filterStandards.length > 0) {
      const normalizedFilterStandards = new Set(filterStandards.map(normalizeStandard));

      // Create a map from normalized standard to original standard for display
      const normalizedToOriginal = new Map<string, string>();
      filterStandards.forEach((std) => {
        normalizedToOriginal.set(normalizeStandard(std), std);
      });

      filtered = filtered.filter((q) => {
        const qPrimaryStandard = normalizeStandard(q.standard);
        const qSecondaryStandard = q.secondaryStandard ? normalizeStandard(q.secondaryStandard) : null;

        const primaryMatches = normalizedFilterStandards.has(qPrimaryStandard);
        const secondaryMatches = qSecondaryStandard && normalizedFilterStandards.has(qSecondaryStandard);

        // Track if this question only matched via secondary standard
        if (!primaryMatches && secondaryMatches) {
          secondaryOnly.add(q.questionId);
        }

        // Group by matching standards (a question can appear in multiple groups)
        if (primaryMatches) {
          const originalStd = normalizedToOriginal.get(qPrimaryStandard) || q.standard;
          if (!byStandard.has(originalStd)) {
            byStandard.set(originalStd, { questions: [], isSecondaryMatch: new Map() });
          }
          byStandard.get(originalStd)!.questions.push(q);
          byStandard.get(originalStd)!.isSecondaryMatch.set(q.questionId, false);
        }
        if (secondaryMatches && qSecondaryStandard) {
          const originalStd = normalizedToOriginal.get(qSecondaryStandard) || q.secondaryStandard!;
          if (!byStandard.has(originalStd)) {
            byStandard.set(originalStd, { questions: [], isSecondaryMatch: new Map() });
          }
          // Only add if not already added via primary match to this same standard
          const existing = byStandard.get(originalStd)!;
          if (!existing.questions.some(eq => eq.questionId === q.questionId)) {
            existing.questions.push(q);
          }
          existing.isSecondaryMatch.set(q.questionId, true);
        }

        return primaryMatches || secondaryMatches;
      });
    }

    return { filteredQuestions: filtered, secondaryOnlyMatches: secondaryOnly, questionsByStandard: byStandard };
  }, [questions, filterStandards, normalizeStandard]);

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
  const unitDistribution = useMemo(() => {
    if (!selectedGrade || questions.length === 0 || units.length === 0) {
      return null;
    }

    // Build a map of normalized standard -> unit number
    const standardToUnit = new Map<string, number>();
    units.forEach((unit) => {
      if (!unit.standards || unit.standards.length === 0) {
        return;
      }
      unit.standards.forEach((std) => {
        standardToUnit.set(normalizeStandard(std), unit.unitNumber);
      });
    });

    // Count MC and CR by unit
    const unitStats = new Map<number, { mc: number; cr: number }>();
    let totalMC = 0;
    let totalCR = 0;

    questions.forEach((q) => {
      const normalizedStd = normalizeStandard(q.standard);
      const unitNum = standardToUnit.get(normalizedStd);

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

    return { rows, totalMC, totalCR };
  }, [selectedGrade, questions, units, normalizeStandard]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6" style={{ maxWidth: "1600px" }}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex gap-6">
            {/* Filters Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 flex-1">
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

            {/* Unit Distribution Table - show when grade is selected */}
            {selectedGrade && unitDistribution && (
              <div className="bg-white rounded-lg shadow-sm p-4 w-80 shrink-0">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Questions by Unit</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-1.5 font-medium text-gray-600"></th>
                      <th className="text-center py-1.5 font-medium text-gray-600">MC</th>
                      <th className="text-center py-1.5 font-medium text-gray-600">CR</th>
                      <th className="text-center py-1.5 font-medium text-gray-400 text-xs">MC %</th>
                      <th className="text-center py-1.5 font-medium text-gray-400 text-xs">CR %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unitDistribution.rows.map((row) => (
                      <tr
                        key={row.unitNumber}
                        className={`border-b border-gray-100 ${
                          selectedUnit === row.unitNumber ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="py-1.5 text-gray-700">Unit {row.unitNumber}</td>
                        <td className="text-center py-1.5 text-gray-900 font-medium">{row.mc}</td>
                        <td className="text-center py-1.5 text-gray-900 font-medium">{row.cr}</td>
                        <td className="text-center py-1.5 text-gray-400 text-xs">{row.mcPct}%</td>
                        <td className="text-center py-1.5 text-gray-400 text-xs">{row.crPct}%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-300 font-semibold">
                      <td className="py-1.5 text-gray-700">Total</td>
                      <td className="text-center py-1.5 text-gray-900">{unitDistribution.totalMC}</td>
                      <td className="text-center py-1.5 text-gray-900">{unitDistribution.totalCR}</td>
                      <td className="text-center py-1.5 text-gray-400"></td>
                      <td className="text-center py-1.5 text-gray-400"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
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
                  <ToggleSwitch
                    checked={groupByStandard}
                    onChange={setGroupByStandard}
                    label="Group by Standard"
                  />
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
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  isSecondaryOnlyMatch = false,
}: {
  question: StateTestQuestion;
  isSecondaryOnlyMatch?: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Primary matches get pink styling, secondary matches get gray styling
  const cardClasses = isSecondaryOnlyMatch
    ? "bg-gray-50 rounded-lg border border-gray-300 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    : "bg-pink-50 rounded-lg border border-pink-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer";

  const headerClasses = isSecondaryOnlyMatch
    ? "px-3 py-1.5 border-b bg-gray-100 border-gray-300"
    : "px-3 py-1.5 border-b bg-pink-100 border-pink-200";

  return (
    <>
      <div
        className={cardClasses}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Summary Header - Always visible */}
        <div className={headerClasses}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Badge intent="primary" appearance="outline" size="xs">
                {question.standard}
              </Badge>
              {question.secondaryStandard && (
                <Badge intent="secondary" appearance="outline" size="xs">
                  {question.secondaryStandard}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>{question.examYear}</span>
              {question.points !== undefined && (
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  {question.points}pt
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="block">
          <img
            src={question.screenshotUrl}
            alt={`Question ${question.questionId}`}
            className="w-full h-80 object-contain bg-gray-50"
            loading="lazy"
          />
        </div>
      </div>

      {/* Question Detail Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
        title={
          <div className="flex items-center gap-2">
            <Badge intent="primary" appearance="outline" size="xs">
              {question.standard}
            </Badge>
            {question.secondaryStandard && (
              <Badge intent="secondary" appearance="outline" size="xs">
                {question.secondaryStandard}
              </Badge>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          {/* Full-size Image */}
          <a
            href={question.screenshotUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={question.screenshotUrl}
              alt={`Question ${question.questionId}`}
              className="w-full object-contain bg-gray-50 rounded-lg hover:opacity-90 transition-opacity"
            />
          </a>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t pt-4">
            <div>
              <div className="text-gray-500 text-xs">Question #</div>
              <div className="font-medium">{question.questionNumber ?? "-"}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Grade</div>
              <div className="font-medium">{question.grade}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Year</div>
              <div className="font-medium">{question.examYear}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Points</div>
              <div className="font-medium">{question.points ?? "-"}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Type</div>
              <div className="font-medium">{question.responseType || question.questionType || "-"}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Answer</div>
              <div className="font-medium">{question.answer || "-"}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">ID</div>
              <div className="font-medium font-mono text-xs">{question.questionId}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Exam</div>
              <div className="font-medium">{question.examTitle}</div>
            </div>
          </div>

          {/* Source Link */}
          <div className="border-t pt-4">
            <a
              href={question.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              View on Problem Attic →
            </a>
          </div>
        </div>
      </Dialog>
    </>
  );
}

function StandardAccordion({
  standard,
  questions,
  isSecondaryMatch,
}: {
  standard: string;
  questions: StateTestQuestion[];
  isSecondaryMatch: Map<string, boolean>;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const sortedQuestions = [...questions].sort((a, b) => {
    // Sort secondary matches last
    const aIsSecondary = isSecondaryMatch.get(a.questionId) || false;
    const bIsSecondary = isSecondaryMatch.get(b.questionId) || false;
    if (aIsSecondary !== bIsSecondary) {
      return aIsSecondary ? 1 : -1;
    }
    return 0;
  });

  return (
    <div id={`standard-${standard}`} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      {/* Accordion Header - Grayscale background */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3">
          <Badge intent="primary" appearance="outline" size="sm">
            {standard}
          </Badge>
          <span className="text-sm text-gray-600">
            {questions.length} {questions.length === 1 ? "question" : "questions"} matched
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sortedQuestions.map((question) => (
              <QuestionCard
                key={`${standard}-${question.questionId}`}
                question={question}
                isSecondaryOnlyMatch={isSecondaryMatch.get(question.questionId) || false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
