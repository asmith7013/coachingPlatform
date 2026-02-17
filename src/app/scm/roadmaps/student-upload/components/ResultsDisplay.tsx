"use client";

import React from "react";
import { Button } from "@/components/core/Button";
import { Alert } from "@/components/core/feedback/Alert";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { ImportResponse } from "../lib/types";

interface ResultsDisplayProps {
  response: ImportResponse | null;
  isLoading: boolean;
  onClear: () => void;
}

export function ResultsDisplay({
  response,
  isLoading,
  onClear,
}: ResultsDisplayProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Processing Excel file...</span>
        </div>
      </div>
    );
  }

  if (!response) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Summary */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Import Results
          </h3>
          {response.metadata && (
            <div className="mt-2 text-sm text-gray-600 space-y-1">
              <p>
                <strong>Section:</strong> {response.metadata.section}
              </p>
              <p>
                <strong>Teacher:</strong> {response.metadata.teacher}
              </p>
              <p>
                <strong>Roadmap:</strong> {response.metadata.roadmap}
              </p>
              <p>
                <strong>Date:</strong> {response.metadata.date}
              </p>
            </div>
          )}
        </div>
        <Button onClick={onClear} intent="secondary" appearance="outline">
          Clear Results
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Students</p>
          <p className="text-2xl font-bold text-gray-900">
            {response.totalStudentsProcessed}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-700">Successful Updates</p>
          <p className="text-2xl font-bold text-green-900">
            {response.successfulUpdates}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-sm text-red-700">Failed Updates</p>
          <p className="text-2xl font-bold text-red-900">
            {response.failedUpdates}
          </p>
        </div>
      </div>

      {/* Errors */}
      {response.errors.length > 0 && (
        <Alert intent="warning">
          <Alert.Title>Errors Encountered</Alert.Title>
          <Alert.Description>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {response.errors.slice(0, 10).map((error, index) => (
                <li key={index} className="text-sm">
                  {error}
                </li>
              ))}
              {response.errors.length > 10 && (
                <li className="text-sm font-medium">
                  ... and {response.errors.length - 10} more errors
                </li>
              )}
            </ul>
          </Alert.Description>
        </Alert>
      )}

      {/* Student Results */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3">
          Student Update Details
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skills Added
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Mastered
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {response.studentResults.map((result, index) => (
                <tr key={index} className={result.success ? "" : "bg-red-50"}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {result.success ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-red-500" />
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {result.studentName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {result.skillsAdded}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {result.totalMasteredSkills}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {result.error || "Success"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export JSON */}
      <div className="pt-4 border-t">
        <Button
          onClick={() => {
            const blob = new Blob([JSON.stringify(response, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `import-results-${new Date().toISOString()}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          intent="secondary"
          appearance="outline"
        >
          Export Results as JSON
        </Button>
      </div>
    </div>
  );
}
