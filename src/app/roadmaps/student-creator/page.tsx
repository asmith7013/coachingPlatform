"use client";

import { useState } from "react";
import { bulkCreateStudents } from "@actions/313/students";
import { StudentInput } from "@zod-schema/313/student";

interface StudentEntry extends StudentInput {
  // All fields from StudentInput
}

interface CreateResult {
  studentID: number;
  name: string;
  section: string;
  status: "pending" | "processing" | "success" | "error";
  message?: string;
}

export default function StudentCreatorPage() {
  const [jsonInput, setJsonInput] = useState("");
  const [parsedData, setParsedData] = useState<StudentEntry[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [results, setResults] = useState<CreateResult[]>([]);
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
        // Required fields
        if (!item.studentID || !item.firstName || !item.lastName || !item.section) {
          throw new Error(
            `Item at index ${index} is missing required fields (studentID, firstName, lastName, section)`
          );
        }

        // Validate studentID is a number
        const studentID = Number(item.studentID);
        if (isNaN(studentID) || studentID <= 0) {
          throw new Error(`Item at index ${index}: studentID "${item.studentID}" must be a positive number`);
        }

        return {
          studentID,
          firstName: String(item.firstName),
          lastName: String(item.lastName),
          section: String(item.section),
          teacher: item.teacher ? String(item.teacher) : undefined,
          gradeLevel: item.gradeLevel ? String(item.gradeLevel) : undefined,
          email: item.email ? String(item.email) : undefined,
          active: item.active !== undefined ? Boolean(item.active) : true,
          masteredSkills: Array.isArray(item.masteredSkills) ? item.masteredSkills.map(String) : [],
          ownerIds: Array.isArray(item.ownerIds) ? item.ownerIds.map(String) : [],
        } as StudentEntry;
      });

      // Check for duplicate studentIDs
      const seen = new Map<number, number>();
      const duplicates: Array<{ index: number; studentID: number }> = [];

      validated.forEach((item, index) => {
        if (seen.has(item.studentID)) {
          duplicates.push({
            index: index,
            studentID: item.studentID,
          });
        } else {
          seen.set(item.studentID, index);
        }
      });

      if (duplicates.length > 0) {
        const duplicateList = duplicates.map((d) => `  - Item ${d.index}: studentID ${d.studentID}`).join("\n");
        throw new Error(
          `Found ${duplicates.length} duplicate studentID entries in JSON:\n${duplicateList}\n\nEach studentID must be unique.`
        );
      }

      setParsedData(validated);
      setParseError(null);

      // Initialize results
      setResults(
        validated.map((item) => ({
          studentID: item.studentID,
          name: `${item.firstName} ${item.lastName}`,
          section: item.section,
          status: "pending",
        }))
      );
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Invalid JSON");
      setParsedData([]);
      setResults([]);
    }
  };

  const handleCreateAll = async () => {
    if (parsedData.length === 0) return;

    setIsProcessing(true);

    // Update all to processing
    setResults((prev) => prev.map((r) => ({ ...r, status: "processing" })));

    try {
      const result = await bulkCreateStudents(parsedData);

      console.log('Bulk create result:', result); // Debug logging

      if (result.success && result.data) {
        // Get created student IDs from result
        const createdStudentIDs = new Set(
          Array.isArray(result.data)
            ? result.data.map((s: any) => s.studentID)
            : []
        );

        // Update results based on which students were actually created
        setResults((prev) =>
          prev.map((r) => {
            if (createdStudentIDs.has(r.studentID)) {
              return { ...r, status: "success", message: "Created" };
            } else {
              return {
                ...r,
                status: "error",
                message: "Failed to create (possibly duplicate studentID)",
              };
            }
          })
        );
      } else {
        // Mark all as error if bulk operation failed
        console.error('Bulk creation failed:', result.error);
        setResults((prev) =>
          prev.map((r) => ({
            ...r,
            status: "error",
            message: result.error || "Bulk creation failed",
          }))
        );
      }
    } catch (err) {
      console.error('Exception during bulk create:', err);
      setResults((prev) =>
        prev.map((r) => ({
          ...r,
          status: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        }))
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

  const getStatusColor = (status: CreateResult["status"]) => {
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

  const getStatusIcon = (status: CreateResult["status"]) => {
    switch (status) {
      case "pending":
        return "�";
      case "processing":
        return "�";
      case "success":
        return "";
      case "error":
        return "L";
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
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Student Creator</h1>
          <p className="text-gray-600">Bulk create students by pasting JSON data</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column: Input */}
          <div className="space-y-4">
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
                  className="w-full h-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder={`[
  {
    "studentID": 12345,
    "firstName": "John",
    "lastName": "Doe",
    "section": "803",
    "teacher": "Alex Smith (optional)",
    "gradeLevel": "8",
    "email": "john.doe@example.com",
    "active": true,
    "masteredSkills": [],
    "ownerIds": []
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
                  onClick={handleCreateAll}
                  disabled={parsedData.length === 0 || isProcessing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  {isProcessing ? "Creating..." : "Create All Students"}
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
                    Total students: <strong>{parsedData.length}</strong>
                  </p>
                  <p>
                    Unique sections: <strong>{new Set(parsedData.map((d) => d.section)).size}</strong>
                  </p>
                  <p>
                    Unique teachers: <strong>{new Set(parsedData.map((d) => d.teacher)).size}</strong>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Creation Results</h2>

            {results.length > 0 && (
              <>
                <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{summary.success}</div>
                    <div className="text-xs text-gray-600">Success</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{summary.error}</div>
                    <div className="text-xs text-gray-600">Error</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">{summary.pending}</div>
                    <div className="text-xs text-gray-600">Pending</div>
                  </div>
                </div>

                {isProcessing && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">Creating {results.length} students...</p>
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
                      � {summary.error} {summary.error === 1 ? "student" : "students"} failed to create.
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
                          result.status === "processing" ? "border-blue-300 bg-blue-50" : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{getStatusIcon(result.status)}</span>
                              <span className="font-semibold text-sm">ID: {result.studentID}</span>
                              <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
                                {result.section}
                              </span>
                            </div>
                            <div className="text-xs text-gray-700 ml-7 font-medium">{result.name}</div>
                            {entry.teacher && (
                              <div className="text-xs text-gray-500 ml-7">Teacher: {entry.teacher}</div>
                            )}
                            {entry.gradeLevel && (
                              <div className="text-xs text-gray-500 ml-7">Grade: {entry.gradeLevel}</div>
                            )}
                            {result.message && (
                              <div
                                className={`text-xs ml-7 mt-1 ${
                                  result.status === "error" ? "text-red-600 font-semibold" : "text-gray-500 italic"
                                }`}
                              >
                                {result.message}
                              </div>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(result.status)}`}>
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
                <div className="text-4xl mb-2">=e</div>
                <p>No data parsed yet. Paste JSON and click &quot;Parse JSON&quot;.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
