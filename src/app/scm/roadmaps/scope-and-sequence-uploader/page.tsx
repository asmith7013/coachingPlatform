"use client";

import { useState } from "react";
import { bulkUpsertScopeAndSequence } from "@actions/scm/scope-and-sequence/scope-and-sequence";
import { useRouter } from "next/navigation";
import { BookOpenIcon } from "@heroicons/react/24/outline";

interface ScopeAndSequenceEntry {
  grade: string;
  unit: string;
  unitLessonId: string;
  unitNumber: number;
  lessonNumber: number;
  lessonName: string;
  section?: string;
  scopeSequenceTag?: string;
  roadmapSkills?: string[];
  targetSkills?: string[];
}

interface UpdateResult {
  unitLessonId: string;
  lessonName: string;
  grade: string;
  status: "pending" | "processing" | "success" | "error";
  message?: string;
}

export default function ScopeAndSequenceUploaderPage() {
  const router = useRouter();
  const [jsonInput, setJsonInput] = useState("");
  const [parsedData, setParsedData] = useState<ScopeAndSequenceEntry[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [results, setResults] = useState<UpdateResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleParse = () => {
    try {
      const parsed = JSON.parse(jsonInput);

      // Validate structure
      if (!Array.isArray(parsed)) {
        throw new Error("Input must be an array");
      }

      // Validate each item has required fields
      const validated = parsed.map((item, index) => {
        if (
          !item.grade ||
          !item.unit ||
          !item.unitLessonId ||
          !item.unitNumber ||
          !item.lessonNumber ||
          !item.lessonName
        ) {
          throw new Error(`Item at index ${index} is missing required fields`);
        }

        // Parse numbers and validate they're valid
        const unitNumber = Number(item.unitNumber);
        const lessonNumber = Number(item.lessonNumber);

        if (isNaN(unitNumber)) {
          throw new Error(
            `Item at index ${index}: unitNumber "${item.unitNumber}" is not a valid number`,
          );
        }

        if (isNaN(lessonNumber)) {
          throw new Error(
            `Item at index ${index}: lessonNumber "${item.lessonNumber}" is not a valid number`,
          );
        }

        return {
          grade: String(item.grade),
          unit: String(item.unit),
          unitLessonId: String(item.unitLessonId),
          unitNumber,
          lessonNumber,
          lessonName: String(item.lessonName),
          section: item.section ? String(item.section) : undefined,
          scopeSequenceTag: item.scopeSequenceTag
            ? String(item.scopeSequenceTag)
            : undefined,
          roadmapSkills: Array.isArray(item.roadmapSkills)
            ? item.roadmapSkills.map(String)
            : undefined,
          targetSkills: Array.isArray(item.targetSkills)
            ? item.targetSkills.map(String)
            : undefined,
        } as ScopeAndSequenceEntry;
      });

      // Check for duplicates based on compound key: grade + unitLessonId + scopeSequenceTag
      const seen = new Map<string, number>();
      const duplicates: Array<{ index: number; key: string }> = [];

      validated.forEach((item, index) => {
        const compoundKey = `${item.grade}|${item.unitLessonId}|${item.scopeSequenceTag || "null"}`;
        if (seen.has(compoundKey)) {
          duplicates.push({
            index: index,
            key: `Grade ${item.grade}, Lesson ${item.unitLessonId}${item.scopeSequenceTag ? `, Tag: ${item.scopeSequenceTag}` : ""}`,
          });
        } else {
          seen.set(compoundKey, index);
        }
      });

      if (duplicates.length > 0) {
        const duplicateList = duplicates
          .map((d) => `  - Item ${d.index}: ${d.key}`)
          .join("\n");
        throw new Error(
          `Found ${duplicates.length} duplicate entries in JSON:\n${duplicateList}\n\nEach combination of (grade + unitLessonId + tag) must be unique.`,
        );
      }

      setParsedData(validated);
      setParseError(null);

      // Initialize results
      setResults(
        validated.map((item) => ({
          unitLessonId: item.unitLessonId,
          lessonName: item.lessonName,
          grade: item.grade,
          status: "pending",
        })),
      );
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Invalid JSON");
      setParsedData([]);
      setResults([]);
    }
  };

  const handleProcessAll = async () => {
    if (parsedData.length === 0) return;

    setIsProcessing(true);

    // Update all to processing
    setResults((prev) => prev.map((r) => ({ ...r, status: "processing" })));

    try {
      const result = await bulkUpsertScopeAndSequence(parsedData);

      if (result.success && result.data) {
        // Update results based on bulk operation results
        setResults((prev) =>
          prev.map((r, idx) => {
            const item = parsedData[idx];
            if (result.data.created.includes(item.unitLessonId)) {
              return { ...r, status: "success", message: "Created" };
            } else if (result.data.updated.includes(item.unitLessonId)) {
              return { ...r, status: "success", message: "Updated" };
            } else {
              const failed = result.data.failed.find(
                (f) => f.unitLessonId === item.unitLessonId,
              );
              return {
                ...r,
                status: "error",
                message: failed?.error || "Unknown error",
              };
            }
          }),
        );
      } else {
        // Mark all as error if bulk operation failed
        setResults((prev) =>
          prev.map((r) => ({
            ...r,
            status: "error",
            message: result.error || "Bulk operation failed",
          })),
        );
      }
    } catch (err) {
      setResults((prev) =>
        prev.map((r) => ({
          ...r,
          status: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        })),
      );
    }

    setIsProcessing(false);
  };

  const handleClear = () => {
    setJsonInput("");
    setParsedData([]);
    setParseError(null);
    setResults([]);
  };

  const getStatusColor = (status: UpdateResult["status"]) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "success":
        return "bg-green-100 text-green-700";
      case "error":
        return "bg-red-100 text-red-700";
    }
  };

  const getStatusIcon = (status: UpdateResult["status"]) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "processing":
        return "⚙️";
      case "success":
        return "✅";
      case "error":
        return "❌";
    }
  };

  const summary = {
    total: results.length,
    success: results.filter((r) => r.status === "success").length,
    error: results.filter((r) => r.status === "error").length,
    pending: results.filter((r) => r.status === "pending").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6" style={{ maxWidth: "1600px" }}>
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Scope and Sequence Uploader
            </h1>
            <p className="text-gray-600">
              Bulk upload curriculum scope and sequence by pasting JSON data
            </p>
          </div>
          <button
            onClick={() => router.push("/scm/roadmaps/scope-and-sequence")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            ← View All Lessons
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column: Input */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">JSON Input</h2>

              <div className="mb-4">
                <label
                  htmlFor="json-input"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Paste your JSON array here
                </label>
                <textarea
                  id="json-input"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full h-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder={`[
  {
    "grade": "8",
    "unit": "Unit 3 - Linear Relationships",
    "unitLessonId": "3.15",
    "unitNumber": 3,
    "lessonNumber": 15,
    "lessonName": "Using Linear Relations to Solve Problems",
    "section": "B",
    "scopeSequenceTag": "Algebra 1",
    "roadmapSkills": ["3.12", "5.1", "6.2"],
    "targetSkills": ["5.1", "6.2"]
  }
]`}
                  disabled={isProcessing}
                />
              </div>

              {parseError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    <strong>Parse Error:</strong> {parseError}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleParse}
                  disabled={!jsonInput || isProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  Parse JSON
                </button>

                <button
                  onClick={handleProcessAll}
                  disabled={parsedData.length === 0 || isProcessing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  {isProcessing ? "Processing..." : "Upload All"}
                </button>

                <button
                  onClick={handleClear}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  Clear
                </button>
              </div>
            </div>

            {parsedData.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-3">Parsed Data</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    Total lessons: <strong>{parsedData.length}</strong>
                  </p>
                  <p>
                    Unique grades:{" "}
                    <strong>
                      {new Set(parsedData.map((d) => d.grade)).size}
                    </strong>
                  </p>
                  <p>
                    Unique units:{" "}
                    <strong>
                      {
                        new Set(
                          parsedData.map((d) => d.unitLessonId.split(".")[0]),
                        ).size
                      }
                    </strong>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Results</h2>

            {results.length > 0 && (
              <>
                <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {summary.total}
                    </div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {summary.success}
                    </div>
                    <div className="text-xs text-gray-600">Success</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {summary.error}
                    </div>
                    <div className="text-xs text-gray-600">Error</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">
                      {summary.pending}
                    </div>
                    <div className="text-xs text-gray-600">Pending</div>
                  </div>
                </div>

                {isProcessing && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Processing {results.length} entries...
                    </p>
                    <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300 animate-pulse"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                )}

                {!isProcessing && summary.error > 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-semibold">
                      ⚠️ {summary.error}{" "}
                      {summary.error === 1 ? "entry" : "entries"} failed to
                      upload. Check console logs for details.
                    </p>
                  </div>
                )}

                <div className="max-h-[600px] overflow-y-auto space-y-2">
                  {results.map((result, index) => {
                    const entry = parsedData[index];
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          result.status === "processing"
                            ? "border-blue-300 bg-blue-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">
                                {getStatusIcon(result.status)}
                              </span>
                              <span className="font-semibold text-sm">
                                {result.unitLessonId}
                              </span>
                              <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
                                Grade {result.grade}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 ml-7">
                              {entry.unit}
                            </div>
                            <div className="text-xs text-gray-500 ml-7">
                              {result.lessonName}
                            </div>
                            {result.message && (
                              <div
                                className={`text-xs ml-7 mt-1 ${
                                  result.status === "error"
                                    ? "text-red-600 font-semibold"
                                    : "text-gray-500 italic"
                                }`}
                              >
                                {result.message}
                              </div>
                            )}
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              result.status,
                            )}`}
                          >
                            {result.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {results.length === 0 && (
              <div className="text-center text-gray-400 py-12">
                <BookOpenIcon className="w-12 h-12 mx-auto mb-2" />
                <p>
                  No data parsed yet. Paste JSON and click &quot;Parse
                  JSON&quot;.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
