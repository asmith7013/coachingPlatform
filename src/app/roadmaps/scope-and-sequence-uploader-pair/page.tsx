"use client";

import { useState } from "react";
import { fetchScopeAndSequence, updateLessonSkills } from "@actions/313/scope-and-sequence";
import { useRouter } from "next/navigation";

interface LessonSkillPair {
  grade: string;
  unit: string;
  unitLessonId: string;
  unitNumber: number;
  lessonNumber: number;
  lessonName: string;
  scopeSequenceTag: string;
  roadmapSkills: string[];
  targetSkills: string[];
}

interface DbEntry {
  _id: string;
  scopeSequenceTag?: string;
  unitNumber: number;
  lessonNumber: number;
  lessonName: string;
}

interface ValidationResult {
  jsonEntry: LessonSkillPair;
  dbEntry: DbEntry | null;
  matchType: "perfect" | "partial" | "not-found";
  matchDetails: {
    gradeMatch: boolean;
    unitNumberMatch: boolean;
    lessonNumberMatch: boolean;
    lessonNameMatch: boolean;
  };
  differences?: {
    grade?: { json: string; db: string };
    unitNumber?: { json: number; db: number };
    lessonNumber?: { json: number; db: number };
    lessonName?: { json: string; db: string };
  };
}

interface UpdateResult {
  unitLessonId: string;
  grade: string;
  status: "pending" | "processing" | "success" | "error" | "skipped";
  message?: string;
}

export default function ScopeAndSequenceUploaderPairPage() {
  const router = useRouter();
  const [jsonInput, setJsonInput] = useState("");
  const [jsonData, setJsonData] = useState<LessonSkillPair[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [updateResults, setUpdateResults] = useState<UpdateResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const handleParse = () => {
    try {
      const parsed = JSON.parse(jsonInput);

      // Validate structure
      if (!Array.isArray(parsed)) {
        throw new Error("Input must be an array");
      }

      // Validate each item has required fields
      const validated = parsed.map((item, index) => {
        if (!item.scopeSequenceTag || !item.unitLessonId || !item.unitNumber || !item.lessonNumber || !item.lessonName) {
          throw new Error(`Item at index ${index} is missing required fields (must have scopeSequenceTag, unitLessonId, unitNumber, lessonNumber, lessonName)`);
        }

        return {
          grade: String(item.grade || ""),
          unit: String(item.unit || ""),
          unitLessonId: String(item.unitLessonId),
          unitNumber: Number(item.unitNumber),
          lessonNumber: Number(item.lessonNumber),
          lessonName: String(item.lessonName),
          scopeSequenceTag: String(item.scopeSequenceTag),
          roadmapSkills: Array.isArray(item.roadmapSkills) ? item.roadmapSkills : [],
          targetSkills: Array.isArray(item.targetSkills) ? item.targetSkills : [],
        } as LessonSkillPair;
      });

      setJsonData(validated);
      setError(null);
      setValidationResults([]);
      setUpdateResults([]);
      setSelectedItems(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
      setJsonData([]);
      setValidationResults([]);
      setUpdateResults([]);
    }
  };

  const handleValidateMatches = async () => {
    if (jsonData.length === 0) return;

    setIsValidating(true);
    setError(null);
    setValidationResults([]);

    const results: ValidationResult[] = [];

    for (const item of jsonData) {
      try {
        // Fetch the lesson by scopeSequenceTag and unitLessonId
        const fetchResult = await fetchScopeAndSequence({
          page: 1,
          limit: 1,
          sortBy: "unitNumber",
          sortOrder: "asc",
          filters: {
            scopeSequenceTag: item.scopeSequenceTag,
            unitLessonId: item.unitLessonId,
          },
          search: "",
          searchFields: [],
        });

        if (!fetchResult.success || !fetchResult.items || fetchResult.items.length === 0) {
          results.push({
            jsonEntry: item,
            dbEntry: null,
            matchType: "not-found",
            matchDetails: {
              gradeMatch: false,
              unitNumberMatch: false,
              lessonNumberMatch: false,
              lessonNameMatch: false,
            },
          });
          continue;
        }

        const dbEntry = fetchResult.items[0];

        // Check each field for match
        // JSON "scopeSequenceTag" field should match DB "scopeSequenceTag" field
        const scopeSequenceTagMatch = item.scopeSequenceTag === dbEntry.scopeSequenceTag;
        const unitNumberMatch = item.unitNumber === dbEntry.unitNumber;
        const lessonNumberMatch = item.lessonNumber === dbEntry.lessonNumber;
        const lessonNameMatch = item.lessonName.trim().toLowerCase() === dbEntry.lessonName.trim().toLowerCase();

        const allMatch = scopeSequenceTagMatch && unitNumberMatch && lessonNumberMatch && lessonNameMatch;

        const differences: ValidationResult["differences"] = {};
        if (!scopeSequenceTagMatch) differences.grade = { json: item.scopeSequenceTag || '', db: dbEntry.scopeSequenceTag || '' };
        if (!unitNumberMatch) differences.unitNumber = { json: item.unitNumber, db: dbEntry.unitNumber };
        if (!lessonNumberMatch) differences.lessonNumber = { json: item.lessonNumber, db: dbEntry.lessonNumber };
        if (!lessonNameMatch) differences.lessonName = { json: item.lessonName, db: dbEntry.lessonName };

        results.push({
          jsonEntry: item,
          dbEntry,
          matchType: allMatch ? "perfect" : "partial",
          matchDetails: {
            gradeMatch: scopeSequenceTagMatch,
            unitNumberMatch,
            lessonNumberMatch,
            lessonNameMatch,
          },
          differences: Object.keys(differences).length > 0 ? differences : undefined,
        });
      } catch {
        results.push({
          jsonEntry: item,
          dbEntry: null,
          matchType: "not-found",
          matchDetails: {
            gradeMatch: false,
            unitNumberMatch: false,
            lessonNumberMatch: false,
            lessonNameMatch: false,
          },
        });
      }
    }

    setValidationResults(results);

    // Auto-select all perfect matches
    const perfectMatchIndices = new Set(
      results
        .map((r, idx) => (r.matchType === "perfect" ? idx : -1))
        .filter((idx) => idx !== -1)
    );
    setSelectedItems(perfectMatchIndices);

    setIsValidating(false);
  };

  const handleProcessSelected = async () => {
    if (validationResults.length === 0 || selectedItems.size === 0) return;

    setIsProcessing(true);

    // Initialize update results
    const initialResults: UpdateResult[] = validationResults.map((_, idx) => ({
      unitLessonId: validationResults[idx].jsonEntry.unitLessonId,
      grade: validationResults[idx].jsonEntry.grade,
      status: selectedItems.has(idx) ? "pending" : "skipped",
    }));
    setUpdateResults(initialResults);

    const updatedResults: UpdateResult[] = [...initialResults];

    for (let i = 0; i < validationResults.length; i++) {
      if (!selectedItems.has(i)) continue;

      const validation = validationResults[i];
      const item = validation.jsonEntry;

      // Mark as processing
      updatedResults[i] = { ...updatedResults[i], status: "processing" };
      setUpdateResults([...updatedResults]);

      try {
        if (!validation.dbEntry) {
          updatedResults[i] = {
            ...updatedResults[i],
            status: "error",
            message: "No database entry found",
          };
          continue;
        }

        // Update the lesson with roadmap skills and target skills
        const updateResult = await updateLessonSkills(
          validation.dbEntry._id,
          {
            roadmapSkills: item.roadmapSkills || [],
            targetSkills: item.targetSkills || [],
          }
        );

        if (updateResult.success) {
          updatedResults[i] = {
            ...updatedResults[i],
            status: "success",
            message: `Added ${item.roadmapSkills?.length || 0} roadmap skills, ${item.targetSkills?.length || 0} target skills`,
          };
        } else {
          updatedResults[i] = {
            ...updatedResults[i],
            status: "error",
            message: updateResult.error || "Update failed",
          };
        }
      } catch (err) {
        updatedResults[i] = {
          ...updatedResults[i],
          status: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        };
      }

      setUpdateResults([...updatedResults]);
    }

    setIsProcessing(false);
  };

  const toggleSelection = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const selectAllPerfect = () => {
    const perfectIndices = new Set(
      validationResults
        .map((r, idx) => (r.matchType === "perfect" ? idx : -1))
        .filter((idx) => idx !== -1)
    );
    setSelectedItems(perfectIndices);
  };

  const selectAll = () => {
    setSelectedItems(new Set(validationResults.map((_, idx) => idx)));
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  const handleClear = () => {
    setJsonInput("");
    setJsonData([]);
    setValidationResults([]);
    setUpdateResults([]);
    setSelectedItems(new Set());
    setError(null);
  };

  const getMatchTypeColor = (matchType: ValidationResult["matchType"]) => {
    switch (matchType) {
      case "perfect":
        return "bg-green-100 text-green-800 border-green-300";
      case "partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "not-found":
        return "bg-red-100 text-red-800 border-red-300";
    }
  };

  const getMatchTypeIcon = (matchType: ValidationResult["matchType"]) => {
    switch (matchType) {
      case "perfect":
        return "✅";
      case "partial":
        return "⚠️";
      case "not-found":
        return "❌";
    }
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
        return "bg-gray-50 text-gray-500";
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
        return "⊝";
    }
  };

  const validationSummary = {
    total: validationResults.length,
    perfect: validationResults.filter((r) => r.matchType === "perfect").length,
    partial: validationResults.filter((r) => r.matchType === "partial").length,
    notFound: validationResults.filter((r) => r.matchType === "not-found").length,
  };

  const updateSummary = {
    total: updateResults.length,
    success: updateResults.filter((r) => r.status === "success").length,
    error: updateResults.filter((r) => r.status === "error").length,
    skipped: updateResults.filter((r) => r.status === "skipped").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-[1800px]">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Scope and Sequence Skills Uploader
            </h1>
            <p className="text-gray-600">
              Validate and pair roadmap skills with existing lessons
            </p>
          </div>
          <button
            onClick={() => router.push("/roadmaps/scope-and-sequence")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            ← View All Lessons
          </button>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Left Column: JSON Input */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">JSON Input</h2>

            <div className="mb-4">
              <label htmlFor="json-input" className="block text-sm font-medium text-gray-700 mb-2">
                Paste your JSON array here
              </label>
              <textarea
                id="json-input"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full h-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder={`[
  {
    "grade": "7",
    "scopeSequenceTag": "Grade 7",
    "unit": "Unit 2 - Introducing Proportional Relationships",
    "unitLessonId": "2.11",
    "unitNumber": 2,
    "lessonNumber": 11,
    "lessonName": "Equations for Proportional Relationships",
    "roadmapSkills": ["243", "244", "245"],
    "targetSkills": []
  }
]`}
                disabled={isValidating || isProcessing}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700"><strong>Error:</strong> {error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleParse}
                disabled={!jsonInput || isValidating || isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                Parse JSON
              </button>
              <button
                onClick={handleClear}
                disabled={isValidating || isProcessing}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                Clear
              </button>
            </div>

            {jsonData.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-semibold mb-1">Parsed Successfully!</p>
                <p className="text-sm text-green-700">Total lessons: <strong>{jsonData.length}</strong></p>
                <p className="text-sm text-green-700">With skills: <strong>{jsonData.filter(d => d.roadmapSkills?.length > 0).length}</strong></p>
              </div>
            )}
          </div>

          {/* Right Column: Validation Controls */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Validation & Upload</h2>

            <div className="space-y-3">
              <button
                onClick={handleValidateMatches}
                disabled={jsonData.length === 0 || isValidating || isProcessing}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                {isValidating ? "Validating..." : "1. Validate Matches Against Database"}
              </button>

              <button
                onClick={handleProcessSelected}
                disabled={selectedItems.size === 0 || isProcessing}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                {isProcessing ? "Updating..." : `2. Update All Perfect Matches (${selectedItems.size})`}
              </button>

              {validationResults.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 border border-gray-300 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Quick Actions:</p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={selectAllPerfect}
                      className="px-3 py-2 text-sm bg-green-50 text-green-700 border border-green-300 rounded hover:bg-green-100"
                    >
                      Select Perfect Matches Only
                    </button>
                    <button
                      onClick={selectAll}
                      className="px-3 py-2 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200"
                    >
                      Select All
                    </button>
                    <button
                      onClick={deselectAll}
                      className="px-3 py-2 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 font-semibold mb-2">How to use:</p>
              <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                <li>Paste JSON array with lesson skill data</li>
                <li>Click &quot;Parse JSON&quot; to validate the format</li>
                <li>Click &quot;Validate Matches&quot; to check against database</li>
                <li>Review matches (perfect/partial/not-found)</li>
                <li>Select which lessons to update (perfect matches auto-selected)</li>
                <li>Click &quot;Update Selected&quot; to save skills to database</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Validation Results */}
        {validationResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Validation Results</h2>

            <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{validationSummary.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{validationSummary.perfect}</div>
                <div className="text-xs text-gray-600">Perfect</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{validationSummary.partial}</div>
                <div className="text-xs text-gray-600">Partial</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{validationSummary.notFound}</div>
                <div className="text-xs text-gray-600">Not Found</div>
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto space-y-2">
              {validationResults.map((result, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border-2 ${getMatchTypeColor(result.matchType)} ${
                    selectedItems.has(idx) ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(idx)}
                      onChange={() => toggleSelection(idx)}
                      className="mt-1 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getMatchTypeIcon(result.matchType)}</span>
                        <span className="font-semibold">{result.jsonEntry.unitLessonId}</span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                          {result.jsonEntry.scopeSequenceTag}
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                          Grade: {result.jsonEntry.grade}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${getMatchTypeColor(result.matchType)}`}>
                          {result.matchType}
                        </span>
                      </div>

                      <div className="text-sm space-y-1">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium text-gray-700">JSON Data:</p>
                            <p className="text-xs text-gray-600">Unit: {result.jsonEntry.unitNumber}, Lesson: {result.jsonEntry.lessonNumber}</p>
                            <p className="text-xs text-gray-600">{result.jsonEntry.lessonName}</p>
                            {result.jsonEntry.roadmapSkills?.length > 0 && (
                              <p className="text-xs text-blue-600 mt-1">Skills: {result.jsonEntry.roadmapSkills.join(", ")}</p>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Database:</p>
                            {result.dbEntry ? (
                              <>
                                <p className="text-xs text-gray-600">Unit: {result.dbEntry.unitNumber}, Lesson: {result.dbEntry.lessonNumber}</p>
                                <p className="text-xs text-gray-600">{result.dbEntry.lessonName}</p>
                              </>
                            ) : (
                              <p className="text-xs text-red-600">Not found in database</p>
                            )}
                          </div>
                        </div>

                        {result.differences && Object.keys(result.differences).length > 0 && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-xs font-semibold text-yellow-800 mb-1">Differences:</p>
                            {result.differences.grade && (
                              <p className="text-xs text-yellow-700">Curriculum: JSON=&quot;{result.differences.grade.json}&quot; vs DB=&quot;{result.differences.grade.db}&quot;</p>
                            )}
                            {result.differences.unitNumber && (
                              <p className="text-xs text-yellow-700">Unit #: JSON={result.differences.unitNumber.json} vs DB={result.differences.unitNumber.db}</p>
                            )}
                            {result.differences.lessonNumber && (
                              <p className="text-xs text-yellow-700">Lesson #: JSON={result.differences.lessonNumber.json} vs DB={result.differences.lessonNumber.db}</p>
                            )}
                            {result.differences.lessonName && (
                              <p className="text-xs text-yellow-700">Name: JSON=&quot;{result.differences.lessonName.json}&quot; vs DB=&quot;{result.differences.lessonName.db}&quot;</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Update Results */}
        {updateResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Update Results</h2>

            <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{updateSummary.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{updateSummary.success}</div>
                <div className="text-xs text-gray-600">Success</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{updateSummary.error}</div>
                <div className="text-xs text-gray-600">Error</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">{updateSummary.skipped}</div>
                <div className="text-xs text-gray-600">Skipped</div>
              </div>
            </div>

            {isProcessing && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">Processing updates...</p>
                <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${selectedItems.size > 0 ? ((updateSummary.success + updateSummary.error) / selectedItems.size) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="max-h-[400px] overflow-y-auto space-y-1">
              {updateResults.map((result, idx) => (
                <div key={idx} className={`p-2 rounded border ${result.status === "processing" ? "border-blue-300 bg-blue-50" : "border-gray-200"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{getStatusIcon(result.status)}</span>
                      <span className="text-sm font-medium">{result.unitLessonId}</span>
                      {result.message && (
                        <span className={`text-xs ${result.status === "error" ? "text-red-600" : "text-gray-500"}`}>
                          {result.message}
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(result.status)}`}>
                      {result.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
