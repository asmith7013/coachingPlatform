"use client";

import { useState, useEffect, useMemo } from "react";
import { Alert } from "@/components/core/feedback/Alert";
import { Spinner } from "@/components/core/feedback/Spinner";
import { Button } from "@/components/core/Button";
import {
  getStateTestQuestions,
  getStateTestStats,
  bulkUpdateStateTestQuestions,
} from "@/app/tools/state-test-scraper/actions/scrape";
import type { StateTestQuestion } from "@/app/tools/state-test-scraper/lib/types";

interface ScrapeStats {
  total: number;
  byGrade: Record<string, number>;
  byYear: Record<string, number>;
}

interface JsonUpdateEntry {
  secondaryStandard?: string;
  responseType?: "multipleChoice" | "constructedResponse";
  points?: number;
  answer?: string;
}

// User's JSON format from docs/nyse/*.json files
interface NYSEJsonEntry {
  Year: string;
  Exam: string;
  Type: "MC" | "CR";
  "Q#": number;
  Grade: number;
  Standards: {
    primary: string;
    secondary: string;
  };
  Cluster: string;
  Answer?: string;
  Points: number;
}

interface PendingUpdate {
  questionId: string;
  secondaryStandard?: string;
  responseType?: "multipleChoice" | "constructedResponse";
  points?: number;
  answer?: string;
  questionNumber?: number;
}

export default function StateExamEditPage() {
  const [questions, setQuestions] = useState<StateTestQuestion[]>([]);
  const [stats, setStats] = useState<ScrapeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Filters
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  // JSON input
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Pending updates (merged from JSON input)
  const [pendingUpdates, setPendingUpdates] = useState<
    Map<string, PendingUpdate>
  >(new Map());

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

  // Load questions when filters change
  useEffect(() => {
    async function loadQuestions() {
      if (!selectedGrade || !selectedYear) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setPendingUpdates(new Map());
      setJsonInput("");
      setJsonError(null);

      try {
        const result = await getStateTestQuestions({
          grade: selectedGrade,
          examYear: selectedYear,
        });

        if (result.success && result.questions) {
          // Sort by pageIndex to maintain original order
          const sorted = [...result.questions].sort(
            (a, b) => a.pageIndex - b.pageIndex
          );
          setQuestions(sorted);
        } else {
          setError(result.error || "Failed to load questions");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load questions"
        );
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [selectedGrade, selectedYear]);

  // Get available grades and years from stats
  const availableGrades = stats
    ? Object.keys(stats.byGrade).sort((a, b) => parseInt(a) - parseInt(b))
    : [];

  const availableYears = stats
    ? Object.keys(stats.byYear).sort((a, b) => parseInt(b) - parseInt(a))
    : [];

  // Check if JSON is in NYSE format (has Q#, Type, Standards fields)
  const isNYSEFormat = (data: unknown[]): data is NYSEJsonEntry[] => {
    if (data.length === 0) return false;
    const first = data[0] as Record<string, unknown>;
    return "Q#" in first && "Type" in first && "Standards" in first;
  };

  // Parse JSON input and merge with questions
  const handleApplyJson = () => {
    setJsonError(null);

    if (!jsonInput.trim()) {
      setJsonError("Please enter JSON data");
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput) as unknown[];

      if (!Array.isArray(parsed)) {
        setJsonError("JSON must be an array");
        return;
      }

      const newPendingUpdates = new Map<string, PendingUpdate>();

      // Handle NYSE format (from docs/nyse/*.json files)
      // Match by standard - the JSON's Standards.primary should match the question's standard
      // This helps identify missing questions when counts don't match
      if (isNYSEFormat(parsed)) {
        const mismatches: string[] = [];
        const maxLen = Math.max(parsed.length, questions.length);

        for (let i = 0; i < maxLen; i++) {
          const entry = parsed[i];
          const question = questions[i];

          // Check for missing entries on either side
          if (!entry) {
            mismatches.push(`#${i + 1}: No JSON entry (question has standard ${question?.standard})`);
            continue;
          }
          if (!question) {
            mismatches.push(`#${i + 1}: No question (JSON has Q#${entry["Q#"]}, standard ${entry.Standards.primary})`);
            continue;
          }

          // Compare standards - normalize both formats
          // JSON uses "NY-X.Y.Z", DB may use "CC X.Y.Z" or "NY-X.Y.Z"
          const jsonStandard = entry.Standards.primary;
          const dbStandard = question.standard;

          // Extract just the standard code for comparison (e.g., "6.RP.3a")
          const jsonCode = jsonStandard.replace(/^NY-/, "").replace(/^CC\s*/, "");
          const dbCode = dbStandard.replace(/^NY-/, "").replace(/^CC\s*/, "");

          // Track mismatches as warnings but still apply (position-based matching)
          if (jsonCode !== dbCode) {
            mismatches.push(
              `#${i + 1}: JSON Q#${entry["Q#"]} "${jsonStandard}" ≠ DB "${dbStandard}"`
            );
          }

          // Create the update (trust position-based matching)
          const responseType: "multipleChoice" | "constructedResponse" =
            entry.Type === "MC" ? "multipleChoice" : "constructedResponse";

          newPendingUpdates.set(question.questionId, {
            questionId: question.questionId,
            responseType,
            answer: entry.Answer || undefined,
            questionNumber: entry["Q#"],
            points: entry.Points,
            ...(entry.Standards.secondary && {
              secondaryStandard: entry.Standards.secondary,
            }),
          });
        }

        if (mismatches.length > 0) {
          setJsonError(
            `Found ${mismatches.length} mismatch(es):\n${mismatches.slice(0, 10).join("\n")}${mismatches.length > 10 ? `\n... and ${mismatches.length - 10} more` : ""}`
          );
        }

        // Still apply the valid matches
        if (newPendingUpdates.size > 0) {
          setPendingUpdates(newPendingUpdates);
          return;
        }
      } else {
        // Original format: array where position matches question order
        const entries = parsed as JsonUpdateEntry[];

        if (entries.length !== questions.length) {
          setJsonError(
            `JSON array length (${entries.length}) doesn't match questions count (${questions.length})`
          );
          return;
        }

        entries.forEach((entry, index) => {
          const question = questions[index];
          if (!question) return;

          // Check if there are any actual updates
          const hasUpdates =
            entry.secondaryStandard !== undefined ||
            entry.responseType !== undefined ||
            entry.points !== undefined ||
            entry.answer !== undefined;

          if (hasUpdates) {
            newPendingUpdates.set(question.questionId, {
              questionId: question.questionId,
              ...(entry.secondaryStandard !== undefined && {
                secondaryStandard: entry.secondaryStandard,
              }),
              ...(entry.responseType !== undefined && {
                responseType: entry.responseType,
              }),
              ...(entry.points !== undefined && { points: entry.points }),
              ...(entry.answer !== undefined && { answer: entry.answer }),
            });
          }
        });
      }

      setPendingUpdates(newPendingUpdates);
    } catch (e) {
      setJsonError(
        `Invalid JSON: ${e instanceof Error ? e.message : "Parse error"}`
      );
    }
  };

  // Save all pending updates
  const handleSaveAll = async () => {
    if (pendingUpdates.size === 0) return;

    setSaving(true);
    setSaveResult(null);

    try {
      const updates = Array.from(pendingUpdates.values());
      const result = await bulkUpdateStateTestQuestions(updates);

      if (result.success) {
        setSaveResult({
          success: true,
          message: `Successfully updated ${result.updatedCount} questions`,
        });

        // Merge updates into questions state
        setQuestions((prev) =>
          prev.map((q) => {
            const update = pendingUpdates.get(q.questionId);
            if (update) {
              return {
                ...q,
                ...(update.secondaryStandard !== undefined && {
                  secondaryStandard: update.secondaryStandard,
                }),
                ...(update.responseType !== undefined && {
                  responseType: update.responseType,
                }),
                ...(update.points !== undefined && { points: update.points }),
                ...(update.answer !== undefined && { answer: update.answer }),
                ...(update.questionNumber !== undefined && {
                  questionNumber: update.questionNumber,
                }),
              };
            }
            return q;
          })
        );

        // Clear pending updates
        setPendingUpdates(new Map());
        setJsonInput("");
      } else {
        setSaveResult({
          success: false,
          message: `Updated ${result.updatedCount} questions. Errors: ${result.errors.join(", ")}`,
        });
      }
    } catch (err) {
      setSaveResult({
        success: false,
        message: err instanceof Error ? err.message : "Failed to save",
      });
    } finally {
      setSaving(false);
    }
  };

  // Clear pending updates
  const handleClearPending = () => {
    setPendingUpdates(new Map());
    setJsonInput("");
    setJsonError(null);
  };

  // Questions with pending updates merged for display
  const displayQuestions = useMemo(() => {
    return questions.map((q) => {
      const pending = pendingUpdates.get(q.questionId);
      if (pending) {
        return {
          ...q,
          ...(pending.secondaryStandard !== undefined && {
            secondaryStandard: pending.secondaryStandard,
          }),
          ...(pending.responseType !== undefined && {
            responseType: pending.responseType,
          }),
          ...(pending.points !== undefined && { points: pending.points }),
          ...(pending.answer !== undefined && { answer: pending.answer }),
          ...(pending.questionNumber !== undefined && {
            questionNumber: pending.questionNumber,
          }),
          _hasPendingUpdate: true,
        };
      }
      return { ...q, _hasPendingUpdate: false };
    });
  }, [questions, pendingUpdates]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6" style={{ maxWidth: "1800px" }}>
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-4">
            <h1 className="text-3xl font-bold mb-2">
              Edit State Exam Questions
            </h1>
            <p className="text-gray-600">
              {selectedGrade && selectedYear
                ? `Editing ${questions.length} questions for Grade ${selectedGrade}, Year ${selectedYear}`
                : "Select a grade and year to edit questions"}
            </p>
          </div>

          {/* Stats Summary */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-700">
                  {stats.total}
                </div>
                <div className="text-sm text-blue-600">Total Questions</div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-lg font-semibold text-purple-700">
                  {availableGrades.length} Grades
                </div>
                <div className="text-sm text-purple-600">
                  {availableGrades.map((g) => `G${g}`).join(", ")}
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-lg font-semibold text-orange-700">
                  {availableYears.length} Years
                </div>
                <div className="text-sm text-orange-600">
                  {availableYears.slice(0, 5).join(", ")}
                  {availableYears.length > 5 && "..."}
                </div>
              </div>
            </div>
          )}

          {/* Filters Row */}
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
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setSelectedYear("");
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                  !selectedGrade
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-300"
                }`}
              >
                <option value="">Select grade...</option>
                {availableGrades.map((grade) => (
                  <option key={grade} value={grade}>
                    Grade {grade} ({stats?.byGrade[grade] || 0} questions)
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="flex-1">
              <label
                htmlFor="year-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Year
              </label>
              <select
                id="year-filter"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                disabled={!selectedGrade}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  selectedGrade && !selectedYear
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-300"
                }`}
              >
                <option value="">Select year...</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
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
        {loading && selectedGrade && selectedYear && (
          <div className="flex justify-center items-center min-h-[400px]">
            <Spinner size="lg" variant="primary" />
          </div>
        )}

        {/* No Selection State */}
        {(!selectedGrade || !selectedYear) && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">
              {!selectedGrade ? "1" : "2"}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {!selectedGrade
                ? "Select a Grade"
                : "Select a Year"}
            </h3>
            <p className="text-gray-500">
              {!selectedGrade
                ? "Choose a grade level to see available years."
                : "Choose a year to load questions for editing."}
            </p>
          </div>
        )}

        {/* Main Content - Questions and JSON Editor */}
        {selectedGrade && selectedYear && !loading && questions.length > 0 && (
          <div className="flex gap-6">
            {/* Left Panel - JSON Input */}
            <div className="w-1/3 bg-white rounded-lg shadow-sm p-6 sticky top-6 self-start">
              <h2 className="text-lg font-semibold mb-4">
                Bulk Update via JSON
              </h2>
              <p className="text-sm text-gray-600 mb-2">
                <strong>NYSE Format</strong> (preferred): Paste JSON from docs/nyse/*.json files.
                Entries are matched by Q# to pageIndex.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                <strong>Simple Format</strong>: Array with {questions.length} entries matching question order.
              </p>

              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={`NYSE Format:\n[\n  { "Q#": 1, "Type": "MC", "Answer": "B", "Standards": {"primary": "NY-6.RP.3a", "secondary": ""} },\n  { "Q#": 2, "Type": "CR", "Answer": "", "Standards": {"primary": "NY-6.NS.7c", "secondary": "NY-6.NS.5"} },\n  ...\n]\n\nOr Simple Format:\n[\n  { "responseType": "multipleChoice", "answer": "A", "points": 2 },\n  ...\n]`}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm mb-4"
              />

              {jsonError && (
                <div className="text-red-600 text-sm mb-4 p-2 bg-red-50 rounded whitespace-pre-wrap font-mono">
                  {jsonError}
                </div>
              )}

              <div className="flex gap-2 mb-4">
                <Button
                  onClick={handleApplyJson}
                  intent="secondary"
                  fullWidth={false}
                >
                  Apply JSON
                </Button>
                {pendingUpdates.size > 0 && (
                  <Button
                    onClick={handleClearPending}
                    intent="secondary"
                    appearance="outline"
                    fullWidth={false}
                  >
                    Clear
                  </Button>
                )}
              </div>

              {pendingUpdates.size > 0 && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-amber-700">
                      {pendingUpdates.size} questions with pending changes
                    </span>
                  </div>

                  <Button
                    onClick={handleSaveAll}
                    intent="primary"
                    fullWidth
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : `Save All ${pendingUpdates.size} Changes`}
                  </Button>
                </div>
              )}

              {saveResult && (
                <div
                  className={`mt-4 p-3 rounded ${
                    saveResult.success
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {saveResult.message}
                </div>
              )}

              {/* JSON Template Helper */}
              <div className="mt-6 border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Template
                </h3>
                <button
                  onClick={() => {
                    const template = questions.map(() => ({}));
                    setJsonInput(JSON.stringify(template, null, 2));
                  }}
                  className="text-sm text-blue-600 hover:underline cursor-pointer"
                >
                  Generate empty template ({questions.length} entries)
                </button>
              </div>
            </div>

            {/* Right Panel - Questions Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {displayQuestions.map((question, index) => (
                  <QuestionEditCard
                    key={question.questionId}
                    question={question}
                    index={index}
                    hasPendingUpdate={question._hasPendingUpdate}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {selectedGrade && selectedYear && !loading && questions.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">0</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Questions Found
            </h3>
            <p className="text-gray-500">
              No questions found for Grade {selectedGrade}, Year {selectedYear}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionEditCard({
  question,
  index,
  hasPendingUpdate,
}: {
  question: StateTestQuestion & { _hasPendingUpdate: boolean };
  index: number;
  hasPendingUpdate: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-lg border shadow-sm overflow-hidden transition-all ${
        hasPendingUpdate
          ? "border-amber-400 ring-2 ring-amber-200"
          : "border-gray-200"
      }`}
    >
      {/* Header with index */}
      <div
        className={`px-4 py-2 flex items-center justify-between ${
          hasPendingUpdate ? "bg-amber-50" : "bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded ${
              hasPendingUpdate
                ? "bg-amber-200 text-amber-800"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            #{index + 1}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {question.standard}
          </span>
          {question.secondaryStandard && (
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                hasPendingUpdate
                  ? "bg-amber-100 text-amber-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              + {question.secondaryStandard}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">{question.questionId}</span>
      </div>

      {/* Image */}
      <a
        href={question.screenshotUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <img
          src={question.screenshotUrl}
          alt={`Question ${question.questionId}`}
          className="w-full h-40 object-contain bg-gray-50 hover:bg-gray-100 transition-colors"
          loading="lazy"
        />
      </a>

      {/* Details */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Type:</span>{" "}
            <span
              className={
                hasPendingUpdate && question.responseType
                  ? "text-amber-700 font-medium"
                  : ""
              }
            >
              {question.responseType || question.questionType || "-"}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Points:</span>{" "}
            <span
              className={
                hasPendingUpdate && question.points !== undefined
                  ? "text-amber-700 font-medium"
                  : ""
              }
            >
              {question.points !== undefined ? question.points : "-"}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Answer:</span>{" "}
            <span
              className={
                hasPendingUpdate && question.answer
                  ? "text-amber-700 font-medium"
                  : ""
              }
            >
              {question.answer || "-"}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Q#:</span>{" "}
            <span
              className={
                hasPendingUpdate && question.questionNumber !== undefined
                  ? "text-amber-700 font-medium"
                  : ""
              }
            >
              {question.questionNumber !== undefined ? question.questionNumber : "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
