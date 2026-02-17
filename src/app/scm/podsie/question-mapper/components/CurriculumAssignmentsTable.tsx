"use client";

import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Spinner } from "@/components/core/feedback/Spinner";
import type {
  CurriculumAssignmentSummary,
  ExportQuestionMapResult,
} from "./types";

interface CurriculumAssignmentsTableProps {
  assignments: CurriculumAssignmentSummary[];
  exportResults: ExportQuestionMapResult[];
  exportingPath: string | null;
  isInDatabase: (externalId: string) => boolean;
  onExportSingle: (assignment: CurriculumAssignmentSummary) => void;
}

export function CurriculumAssignmentsTable({
  assignments,
  exportResults,
  exportingPath,
  isInDatabase,
  onExportSingle,
}: CurriculumAssignmentsTableProps) {
  if (assignments.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">
          Curriculum Assignments ({assignments.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Course
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Unit
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Title
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Root Qs
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Variations
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.map((assignment) => {
              const exportResult = exportResults.find(
                (r) => r.externalId === assignment.externalId,
              );
              const inDb = isInDatabase(assignment.externalId);
              const isExporting = exportingPath === assignment.path;

              return (
                <tr key={assignment.externalId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {assignment.course}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {assignment.unit}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {assignment.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">
                    {assignment.totalRootQuestions}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">
                    {assignment.totalVariations}
                  </td>
                  <td className="px-4 py-3 text-sm text-center font-medium text-gray-900">
                    {assignment.totalQuestions}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <AssignmentActions
                      isExporting={isExporting}
                      exportResult={exportResult}
                      inDb={inDb}
                      onExport={() => onExportSingle(assignment)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface AssignmentActionsProps {
  isExporting: boolean;
  exportResult?: ExportQuestionMapResult;
  inDb: boolean;
  onExport: () => void;
}

function AssignmentActions({
  isExporting,
  exportResult,
  inDb,
  onExport,
}: AssignmentActionsProps) {
  if (isExporting) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
        <Spinner size="sm" />
        <span className="ml-1">Exporting...</span>
      </span>
    );
  }

  if (exportResult?.success || inDb) {
    return (
      <div className="flex items-center justify-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          In DB
        </span>
        <button
          onClick={onExport}
          className="px-2 py-0.5 text-xs text-gray-500 hover:text-indigo-600 cursor-pointer"
          title="Re-export (overwrite)"
        >
          Update
        </button>
      </div>
    );
  }

  if (exportResult && !exportResult.success) {
    return (
      <div className="flex items-center justify-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
          Failed
        </span>
        <button
          onClick={onExport}
          className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onExport}
      className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
    >
      Export
    </button>
  );
}
