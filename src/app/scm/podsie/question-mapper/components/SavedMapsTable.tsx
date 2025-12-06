"use client";

import {
  ArrowPathIcon,
  DocumentTextIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { Spinner } from "@/components/core/feedback/Spinner";
import { parsePathInfo } from "./utils";
import type { SavedQuestionMap } from "./types";

interface SavedMapsTableProps {
  savedMaps: SavedQuestionMap[];
  loading: boolean;
  deletingMapId: string | null;
  onRefresh: () => void;
  onDelete: (assignmentId: string, assignmentName: string) => void;
}

export function SavedMapsTable({
  savedMaps,
  loading,
  deletingMapId,
  onRefresh,
  onDelete,
}: SavedMapsTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DocumentTextIcon className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold">
            Saved Question Maps in Database
          </h3>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 cursor-pointer flex items-center gap-1"
        >
          <ArrowPathIcon
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-8 flex justify-center">
          <Spinner size="lg" variant="primary" />
        </div>
      ) : savedMaps.length > 0 ? (
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
                  Assignment Name
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Questions
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {savedMaps.map((map) => {
                const pathInfo = parsePathInfo(map.notes);
                const isDeleting = deletingMapId === map.assignmentId;

                return (
                  <tr
                    key={map.id || map.assignmentId}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {pathInfo.course}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {pathInfo.unit}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {map.assignmentName}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">
                      {map.totalQuestions}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">
                      {map.assignmentId
                        .replace("curriculum:", "")
                        .substring(0, 8)}
                      ...
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() =>
                          onDelete(map.assignmentId, map.assignmentName)
                        }
                        disabled={isDeleting}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete question map"
                      >
                        {isDeleting ? (
                          <Spinner size="sm" />
                        ) : (
                          <TrashIcon className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
          No question maps saved yet. Scan curriculum and export to populate.
        </div>
      )}
    </div>
  );
}
