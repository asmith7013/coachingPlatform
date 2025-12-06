"use client";

import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Spinner } from "@/components/core/feedback/Spinner";
import type { PodsieQuestionMap } from "./types";

interface QuestionMapResultsProps {
  assignmentId: string;
  assignmentName: string;
  questionMap: PodsieQuestionMap[];
  saving: boolean;
  onSave: () => void;
  showApiNote?: boolean;
}

export function QuestionMapResults({
  assignmentId,
  assignmentName,
  questionMap,
  saving,
  onSave,
  showApiNote = false,
}: QuestionMapResultsProps) {
  const rootQuestions = questionMap.filter((q) => q.isRoot).length;
  const variantQuestions = questionMap.filter((q) => !q.isRoot).length;

  return (
    <div className="space-y-6">
      {/* Assignment Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">{assignmentName}</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Assignment ID:</span>
            <span className="ml-2 font-mono">{assignmentId}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Questions:</span>
            <span className="ml-2 font-semibold">{questionMap.length}</span>
          </div>
        </div>
      </div>

      {/* Question Map Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Question Mapping</h3>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <Spinner size="sm" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                <span>Save Question Map</span>
              </>
            )}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question ID
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Root Question
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variant #
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {questionMap.map((question, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {question.questionNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {question.questionId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {question.isRoot ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Root
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Variant
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-mono text-gray-600">
                    {question.rootQuestionId || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                    {question.variantNumber || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-2">Summary:</p>
          <ul className="space-y-1">
            <li>Total questions mapped: {questionMap.length}</li>
            <li>Root questions: {rootQuestions}</li>
            <li>Variant questions: {variantQuestions}</li>
          </ul>
          {showApiNote && (
            <p className="mt-3">
              <strong>Note:</strong> All questions are marked as root questions.
              This assumes the student completed the assignment without
              encountering any variant questions.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
