"use client";

import { useState } from "react";
import { addImLessonToSkill } from "@actions/313/roadmaps-skills";

interface ImLessonMapping {
  unitNumber: number;
  unitName: string;
  lessonNumber: number;
  lessonName: string;
  skillNumber: string;
  skillTitle: string;
  grade?: string; // Optional: e.g., "Grade 7" or extracted from unitName
}

interface UpdateResult {
  skillNumber: string;
  lessonNumber: number;
  grade?: string;
  status: "pending" | "processing" | "success" | "error" | "skipped";
  message?: string;
}

export default function ImLessonUpdaterPage() {
  const [jsonInput, setJsonInput] = useState("");
  const [parsedData, setParsedData] = useState<ImLessonMapping[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [results, setResults] = useState<UpdateResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Helper function to extract grade from unitName
  // Example: "Illustrative Math New York - 8th Grade" -> "8th Grade"
  const extractGrade = (unitName: string): string | undefined => {
    if (!unitName) return undefined;

    // Try to extract grade from patterns like "- 8th Grade", "- Grade 7", etc.
    const dashMatch = unitName.match(/\s-\s(.+grade.*)$/i);
    if (dashMatch) {
      return dashMatch[1].trim();
    }

    // Try to find "Grade X" or "Xth Grade" pattern anywhere
    const gradeMatch = unitName.match(/(\d+(?:st|nd|rd|th)?\s+grade|grade\s+\d+)/i);
    if (gradeMatch) {
      return gradeMatch[1].trim();
    }

    return undefined;
  };

  const handleParse = () => {
    try {
      const parsed = JSON.parse(jsonInput);

      // Validate structure
      if (!Array.isArray(parsed)) {
        throw new Error("Input must be an array");
      }

      // Validate each item has required fields and extract grade
      const validated = parsed.map((item, index) => {
        if (!item.unitNumber || !item.lessonNumber || !item.skillNumber) {
          throw new Error(`Item at index ${index} is missing required fields`);
        }

        // Extract grade from unitName if not already provided
        const grade = item.grade || extractGrade(item.unitName);

        return {
          ...item,
          grade
        } as ImLessonMapping;
      });

      setParsedData(validated);
      setParseError(null);

      // Initialize results
      setResults(
        validated.map((item) => ({
          skillNumber: item.skillNumber,
          lessonNumber: item.lessonNumber,
          grade: item.grade,
          status: "pending",
        }))
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
    setCurrentIndex(0);

    for (let i = 0; i < parsedData.length; i++) {
      const item = parsedData[i];
      setCurrentIndex(i);

      // Update status to processing
      setResults((prev) =>
        prev.map((r, idx) =>
          idx === i ? { ...r, status: "processing" } : r
        )
      );

      try {
        const result = await addImLessonToSkill({
          skillNumber: item.skillNumber,
          grade: item.grade,
          unitNumber: item.unitNumber,
          lessonNumber: item.lessonNumber,
          lessonName: item.lessonName,
        });

        // Update status based on result
        setResults((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  status: result.success
                    ? result.action === "skipped"
                      ? "skipped"
                      : "success"
                    : "error",
                  message: result.message || result.error,
                }
              : r
          )
        );

        // Small delay to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (err) {
        setResults((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  status: "error",
                  message: err instanceof Error ? err.message : "Unknown error",
                }
              : r
          )
        );
      }
    }

    setIsProcessing(false);
  };

  const handleClear = () => {
    setJsonInput("");
    setParsedData([]);
    setParseError(null);
    setResults([]);
    setCurrentIndex(0);
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
      case "skipped":
        return "bg-yellow-100 text-yellow-700";
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
      case "skipped":
        return "⏭️";
    }
  };

  const summary = {
    total: results.length,
    success: results.filter((r) => r.status === "success").length,
    error: results.filter((r) => r.status === "error").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    pending: results.filter((r) => r.status === "pending").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">IM Lesson Bulk Updater</h1>
          <p className="text-gray-600">
            Add IM lesson mappings to skills by pasting JSON data below
          </p>
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
    "unitNumber": 1,
    "unitName": "Rigid Transformations and Congruence",
    "lessonNumber": 1,
    "lessonName": "Moving in the Plane",
    "skillNumber": "262",
    "skillTitle": "Understand Types of Transformations"
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
                  {isProcessing ? "Processing..." : "Process All"}
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
                  <p>Total mappings: <strong>{parsedData.length}</strong></p>
                  <p>Unique skills: <strong>{new Set(parsedData.map(d => d.skillNumber)).size}</strong></p>
                  <p>Unique lessons: <strong>{new Set(parsedData.map(d => `${d.unitNumber}-${d.lessonNumber}`)).size}</strong></p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Processing Results</h2>

            {results.length > 0 && (
              <>
                <div className="grid grid-cols-5 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
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
                    <div className="text-2xl font-bold text-yellow-600">
                      {summary.skipped}
                    </div>
                    <div className="text-xs text-gray-600">Skipped</div>
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
                      Processing {currentIndex + 1} of {results.length}...
                    </p>
                    <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${((currentIndex + 1) / results.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="max-h-[600px] overflow-y-auto space-y-2">
                  {results.map((result, index) => {
                    const mapping = parsedData[index];
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
                                Skill #{result.skillNumber}
                              </span>
                              {result.grade && (
                                <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
                                  {result.grade}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                → Unit {mapping.unitNumber}, Lesson{" "}
                                {result.lessonNumber}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 ml-7">
                              {mapping.skillTitle}
                            </div>
                            {mapping.lessonName && (
                              <div className="text-xs text-gray-500 ml-7">
                                {mapping.lessonName}
                              </div>
                            )}
                            {result.message && (
                              <div className="text-xs text-gray-500 ml-7 mt-1 italic">
                                {result.message}
                              </div>
                            )}
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              result.status
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
                <div className="text-4xl mb-2">📋</div>
                <p>No data parsed yet. Paste JSON and click &quot;Parse JSON&quot;.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
