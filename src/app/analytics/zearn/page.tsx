"use client";

import { useState } from "react";
import Link from "next/link";
import { Table } from "@components/composed/tables/Table";
import { TableColumnSchema } from "@ui/table-schema";
import { useZearnData } from "@hooks/domain/313/useAnalytics";
import { formatForGoogleSheets } from "@server/file-handling";
import { copyToClipboard } from "@ui/utils";
import { ZearnCompletion } from "@zod-schema/scm/core";

// Column definitions for Zearn completion data
const zearnColumns: TableColumnSchema<ZearnCompletion>[] = [
  {
    id: "studentName",
    label: "Student Name",
    accessor: (row) => row.studentName,
    sortable: true,
  },
  {
    id: "lessonCode",
    label: "Lesson Code",
    accessor: (row) => row.lessonCode,
    sortable: true,
  },
  {
    id: "dateOfCompletion",
    label: "Date",
    accessor: (row) => row.dateOfCompletion,
    sortable: true,
  },
  {
    id: "teacher",
    label: "Teacher",
    accessor: (row) => row.teacher,
    sortable: true,
  },
  {
    id: "section",
    label: "Section",
    accessor: (row) => row.section,
    sortable: true,
  },
  {
    id: "attempted",
    label: "Attempted",
    accessor: (row) => (row.attempted ? "Yes" : "No"),
    sortable: true,
  },
  {
    id: "completed",
    label: "Completed",
    accessor: (row) => (row.completed ? "Yes" : "No"),
    sortable: true,
  },
  {
    id: "timeForCompletion",
    label: "Time (min)",
    accessor: (row) => row.timeForCompletion || "-",
    sortable: true,
  },
];

// Column mapping for CSV export with human-readable headers
const columnMapping = {
  studentName: "Student Name",
  lessonCode: "Lesson Code",
  dateOfCompletion: "Date of Completion",
  teacher: "Teacher",
  section: "Section",
  attempted: "Attempted",
  completed: "Completed",
  timeForCompletion: "Time for Completion (minutes)",
  studentIDref: "Student ID",
};

export default function ZearnAnalyticsPage() {
  const { data, isLoading, error, refetch } = useZearnData();
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyToSheets = async () => {
    if (!data || data.length === 0) {
      alert("No data available to copy");
      return;
    }

    try {
      const csvData = formatForGoogleSheets(
        data as unknown as Record<string, unknown>[],
        columnMapping,
      );
      const success = await copyToClipboard(csvData);

      if (success) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } else {
        alert("Failed to copy to clipboard. Please try again.");
      }
    } catch (error) {
      console.error("Copy error:", error);
      alert("Failed to copy to clipboard. Please try again.");
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link
              href="/analytics"
              className="text-blue-600 hover:text-blue-700"
            >
              ← Back to Analytics
            </Link>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Error Loading Data
            </h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/analytics" className="text-blue-600 hover:text-blue-700">
            ← Back to Analytics
          </Link>
        </div>

        {/* Header with Export Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Zearn Completions
            </h1>
            <p className="text-gray-600 mt-1">
              {isLoading ? "Loading..." : `${data?.length || 0} records`}
            </p>
          </div>

          <button
            onClick={handleCopyToSheets}
            disabled={isLoading || !data || data.length === 0}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              copySuccess
                ? "bg-green-500 text-white"
                : "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            }`}
          >
            {copySuccess ? "✓ Copied!" : "Copy for Sheets"}
          </button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Zearn completion data...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Table
              data={data || []}
              columns={zearnColumns}
              compact={true}
              emptyMessage="No Zearn completion data available"
              textSize="sm"
            />
          </div>
        )}

        {/* Export Instructions */}
        {data && data.length > 0 && (
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">
              Export Instructions
            </h3>
            <p className="text-blue-800 text-sm">
              Click &quot;Copy for Sheets&quot; above, then paste (Ctrl+V) into
              Google Sheets cell A1. The data will automatically format into
              columns for analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
