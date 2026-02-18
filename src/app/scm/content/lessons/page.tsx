"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useUrlSyncedState } from "@/hooks/scm/useUrlSyncedState";
import Link from "next/link";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { Spinner } from "@/components/core/feedback/Spinner";
import { Alert } from "@/components/core/feedback/Alert";
import { ToggleSwitch } from "@/components/core/fields/ToggleSwitch";
import {
  fetchLessonsWithUnitOrder,
  getAvailableScopeTags,
  type UnitWithLessons,
} from "./actions";
import { LessonsTable } from "./components/LessonsTable";
import { ExportJsonModal } from "./components/ExportJsonModal";
import type { ScopeSequenceTag } from "@zod-schema/scm/scope-and-sequence/scope-and-sequence";
import {
  StandardsUnitMatrix,
  extractGradeFromTag,
  normalizeStandard,
  type UnitWithStandards,
  type StateTestQuestion,
} from "@/components/scm/scope-and-sequence";
import { getStateTestQuestions } from "@/app/tools/state-test-scraper/actions/scrape";

export default function LessonsOverviewPage() {
  const [gradeParam, setGradeParam] = useUrlSyncedState("ss", {
    storageKey: "scm-content-lessons-grade",
  });
  const selectedGrade = gradeParam as ScopeSequenceTag | "";
  const setSelectedGrade = setGradeParam;
  const [availableGrades, setAvailableGrades] = useState<ScopeSequenceTag[]>(
    [],
  );
  const [units, setUnits] = useState<UnitWithLessons[]>([]);
  const [skillMap, setSkillMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRampUps, setShowRampUps] = useState(false);

  // State test questions for the matrix
  const [stateTestQuestions, setStateTestQuestions] = useState<
    StateTestQuestion[]
  >([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showSubstandards, setShowSubstandards] = useState(true);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Load available grades on mount
  useEffect(() => {
    async function loadGrades() {
      setLoadingGrades(true);
      const result = await getAvailableScopeTags();
      if (result.success && result.data) {
        setAvailableGrades(result.data);
      }
      setLoadingGrades(false);
    }
    loadGrades();
  }, []);

  // Load lessons when grade changes
  useEffect(() => {
    async function loadLessons() {
      if (!selectedGrade) {
        setUnits([]);
        setSkillMap({});
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetchLessonsWithUnitOrder(selectedGrade);
        if (result.success && result.data) {
          setUnits(result.data.units);
          setSkillMap(result.data.skillMap);
        } else {
          setError(result.error || "Failed to load lessons");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load lessons");
      } finally {
        setLoading(false);
      }
    }

    loadLessons();
  }, [selectedGrade]);

  // Load state test questions when grade changes (for the matrix)
  useEffect(() => {
    async function loadStateTestQuestions() {
      if (!selectedGrade) {
        setStateTestQuestions([]);
        return;
      }

      // Extract numeric grade from tag (e.g., "IM-7" -> "7")
      const numericGrade = extractGradeFromTag(selectedGrade);
      if (!numericGrade) {
        setStateTestQuestions([]);
        return;
      }

      setLoadingQuestions(true);
      try {
        const result = await getStateTestQuestions({ grade: numericGrade });
        if (result.success && result.questions) {
          setStateTestQuestions(result.questions);
        }
      } finally {
        setLoadingQuestions(false);
      }
    }

    loadStateTestQuestions();
  }, [selectedGrade]);

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGrade(e.target.value as ScopeSequenceTag | "");
  };

  // Convert UnitWithLessons to UnitWithStandards for the matrix
  const unitsWithStandards: UnitWithStandards[] = useMemo(() => {
    return units.map((unit) => {
      // Collect all unique standards from all lessons in this unit
      const standardsSet = new Set<string>();
      unit.lessons.forEach((lesson) => {
        lesson.standards.forEach((std) => {
          // Only include current and buildingTowards standards
          if (std.context !== "buildingOn") {
            standardsSet.add(normalizeStandard(std.code));
          }
        });
      });
      return {
        unitNumber: unit.order, // Use order as unit number for display
        unitName: unit.unitName,
        standards: Array.from(standardsSet),
      };
    });
  }, [units]);

  // Build dynamic standard descriptions from lesson data
  const dynamicStandardDescriptions = useMemo(() => {
    const descriptions: Record<string, string> = {};
    units.forEach((unit) => {
      unit.lessons.forEach((lesson) => {
        lesson.standards.forEach((std) => {
          if (std.code && std.text) {
            const normalizedCode = normalizeStandard(std.code);
            if (!descriptions[normalizedCode]) {
              descriptions[normalizedCode] = std.text;
            }
          }
        });
      });
    });
    return descriptions;
  }, [units]);

  // Filter units to exclude ramp-ups if toggle is off
  const filteredUnits = useMemo(() => {
    if (showRampUps) return units;

    return units.map((unit) => ({
      ...unit,
      lessons: unit.lessons.filter((lesson) => lesson.section !== "Ramp Ups"),
    }));
  }, [units, showRampUps]);

  // Count total lessons (filtered)
  const totalLessons = filteredUnits.reduce(
    (sum, unit) => sum + unit.lessons.length,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6" style={{ maxWidth: "1800px" }}>
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-sm px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Scope & Sequence
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  View all lessons organized by unit
                </p>
              </div>
              <Link
                href="/scm/content/edit-scope-and-sequence"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <PencilSquareIcon className="w-4 h-4" />
                Edit
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {/* Export JSON */}
              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors border border-gray-300"
              >
                Export JSON
              </button>
              {/* Ramp Ups Toggle */}
              {selectedGrade && (
                <ToggleSwitch
                  checked={showRampUps}
                  onChange={setShowRampUps}
                  label="Show Ramp Ups"
                />
              )}
              {/* Curriculum Selector */}
              <div className="flex items-center gap-3">
                <label
                  htmlFor="grade-filter"
                  className="text-sm font-medium text-gray-700"
                >
                  Curriculum
                </label>
                <select
                  id="grade-filter"
                  value={selectedGrade}
                  onChange={handleGradeChange}
                  disabled={loadingGrades}
                  className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                    !selectedGrade
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select a curriculum...</option>
                  {availableGrades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
                {loadingGrades && <Spinner size="sm" variant="primary" />}
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Alert intent="error" className="mb-6">
            <Alert.Title>Error</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" variant="primary" />
              <p className="text-gray-500">Loading lessons...</p>
            </div>
          </div>
        )}

        {/* Empty State - No Grade Selected */}
        {!selectedGrade && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select a Curriculum to View Lessons
            </h3>
            <p className="text-gray-500">
              Use the curriculum filter above to see all lessons in the scope
              and sequence.
            </p>
          </div>
        )}

        {/* Unit × Standards Matrix Accordion - Shows above units when grade is selected */}
        {selectedGrade &&
          !loading &&
          stateTestQuestions.length > 0 &&
          unitsWithStandards.length > 0 && (
            <div className="mb-3 rounded-lg overflow-hidden border-2 border-slate-300 bg-white shadow-sm">
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => setIsMatrixOpen(!isMatrixOpen)}
                className="w-full bg-slate-100 px-4 py-3 cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="bg-slate-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                      State Test Questions
                    </span>
                    <h2 className="text-base font-semibold text-slate-700 text-left">
                      Unit × Standards Matrix
                    </h2>
                    {loadingQuestions && (
                      <Spinner size="xs" variant="primary" />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {/* <span className="text-slate-600 text-sm">
                    {stateTestQuestions.length} questions across {unitsWithStandards.length} units
                  </span> */}
                    <svg
                      className={`w-5 h-5 text-slate-600 transition-transform ${isMatrixOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Accordion Content */}
              {isMatrixOpen && (
                <div className="relative">
                  {loadingQuestions && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                      <Spinner size="md" variant="primary" />
                    </div>
                  )}
                  <StandardsUnitMatrix
                    questions={stateTestQuestions}
                    units={unitsWithStandards}
                    selectedGrade={extractGradeFromTag(selectedGrade) || ""}
                    standardDescriptions={dynamicStandardDescriptions}
                    showSubstandards={showSubstandards}
                    onShowSubstandardsChange={setShowSubstandards}
                  />
                </div>
              )}
            </div>
          )}

        {/* Lessons Table */}
        {!loading && selectedGrade && filteredUnits.length > 0 && (
          <LessonsTable
            units={filteredUnits}
            skillMap={skillMap}
            totalLessons={totalLessons}
          />
        )}

        {/* Empty State - No Lessons Found */}
        {!loading && selectedGrade && totalLessons === 0 && !error && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Lessons Found
            </h3>
            <p className="text-gray-500">
              No lessons found for {selectedGrade}.
              {!showRampUps &&
                " Try enabling 'Show Ramp Ups' to see more lessons."}
            </p>
          </div>
        )}
      </div>

      <ExportJsonModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        availableGrades={availableGrades}
        selectedGrade={selectedGrade}
        currentUnits={units}
        currentSkillMap={skillMap}
      />
    </div>
  );
}
