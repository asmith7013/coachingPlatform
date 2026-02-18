"use client";

import { useState } from "react";
import {
  runSkillAppearsInMigration,
  testSingleSkillMigration,
} from "./actions";

interface MigrationResult {
  skillNumber: string;
  title: string;
  success: boolean;
  error?: string;
  appearsIn?: {
    asTarget: number;
    asEssential: number;
    asHelpful: number;
    asSupport: number;
  };
}

export default function SkillMigrationPage() {
  const [running, setRunning] = useState(false);
  const [testSkillNumber, setTestSkillNumber] = useState("660");
  const [testResult, setTestResult] = useState<Record<string, unknown> | null>(
    null,
  );
  const [results, setResults] = useState<{
    total: number;
    processed: number;
    updated: number;
    failed: number;
    results: MigrationResult[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestSingleSkill = async () => {
    setRunning(true);
    setError(null);
    setTestResult(null);

    try {
      const result = await testSingleSkillMigration(testSkillNumber);
      setTestResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setRunning(false);
    }
  };

  const handleRunMigration = async () => {
    setRunning(true);
    setError(null);
    setResults(null);

    try {
      const result = await runSkillAppearsInMigration();

      if (result.success && result.data) {
        setResults(result.data);
      } else {
        const err = "error" in result ? result.error : undefined;
        const errorMsg =
          typeof err === "string"
            ? err
            : err && typeof err === "object" && "message" in err
              ? String((err as Record<string, unknown>).message)
              : "Migration failed";
        setError(errorMsg);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Skill &quot;Appears In&quot; Migration
          </h1>
          <p className="text-gray-600 mb-4">
            This tool populates the{" "}
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
              appearsIn
            </code>{" "}
            field for all skills, showing where each skill appears in the
            curriculum.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-2">What This Does</h3>
            <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
              <li>
                Finds all units where each skill appears (as target or support)
              </li>
              <li>
                Finds all skills that need this skill (as essential or helpful)
              </li>
              <li>Stores this data in the skill document for fast lookups</li>
              <li>
                Safe operation - only adds new data, doesn&apos;t modify
                existing fields
              </li>
            </ul>
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Single Skill (Check Console for Logs)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testSkillNumber}
                  onChange={(e) => setTestSkillNumber(e.target.value)}
                  placeholder="Skill number (e.g., 660)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleTestSingleSkill}
                  disabled={running}
                  className={`px-6 py-2 rounded-lg font-semibold text-white transition-colors ${
                    running
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  Test One
                </button>
              </div>
            </div>

            <button
              onClick={handleRunMigration}
              disabled={running}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                running
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {running ? "Running..." : "Run Full Migration"}
            </button>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Test Result</h3>
            <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Progress/Results */}
        {running && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-lg text-gray-700">
                Processing skills...
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="font-semibold text-red-900 mb-2">Error</h3>
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Migration Complete!
              </h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {results.total}
                  </div>
                  <div className="text-sm text-gray-600">Total Skills</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {results.updated}
                  </div>
                  <div className="text-sm text-gray-600">Updated</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {results.failed}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {Math.round((results.updated / results.total) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detailed Results
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                        Skill #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                        Title
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                        Target
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                        Essential
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                        Helpful
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                        Support
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {results.results.map((result, idx) => (
                      <tr
                        key={idx}
                        className={result.success ? "" : "bg-red-50"}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {result.skillNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {result.title}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          {result.appearsIn?.asTarget ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          {result.appearsIn?.asEssential ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          {result.appearsIn?.asHelpful ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          {result.appearsIn?.asSupport ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {result.success ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              ✓ Success
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800"
                              title={result.error}
                            >
                              ✗ Failed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
