"use client";

import { PencilIcon, CheckIcon } from "@heroicons/react/24/outline";
import type { StrategyDefinition } from "../../../lib/types";

interface BigIdeaSectionProps {
  strategyDefinition: StrategyDefinition;
  editingBigIdea: boolean;
  setEditingBigIdea: (editing: boolean) => void;
  updateBigIdea: (bigIdea: string) => void;
}

export function BigIdeaSection({
  strategyDefinition,
  editingBigIdea,
  setEditingBigIdea,
  updateBigIdea,
}: BigIdeaSectionProps) {
  if (!strategyDefinition.bigIdea) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="px-2 py-0.5 bg-blue-100 rounded text-xs font-bold text-blue-700 uppercase tracking-wide">
          Big Idea
        </span>
        <button
          onClick={() => setEditingBigIdea(!editingBigIdea)}
          className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded cursor-pointer"
          title={editingBigIdea ? "Done editing" : "Edit Big Idea"}
        >
          {editingBigIdea ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <PencilIcon className="h-4 w-4" />
          )}
        </button>
      </div>
      {editingBigIdea ? (
        <textarea
          value={strategyDefinition.bigIdea}
          onChange={(e) => updateBigIdea(e.target.value)}
          className="w-full bg-white text-blue-900 text-lg font-medium rounded p-2 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
          rows={2}
        />
      ) : (
        <p className="text-lg font-medium text-blue-900">
          {strategyDefinition.bigIdea}
        </p>
      )}
      {/* Detailed Big Idea (visible, not collapsed) */}
      {strategyDefinition.bigIdeaDetailed && (
        <div className="mt-3 pt-3 border-t border-blue-100">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Detailed</span>
          <p className="text-sm text-gray-700 whitespace-pre-line mt-1">{strategyDefinition.bigIdeaDetailed}</p>
        </div>
      )}
      {/* Supporting Patterns (visible) */}
      {strategyDefinition.bigIdeaSupportingPatterns && strategyDefinition.bigIdeaSupportingPatterns.length > 0 && (
        <div className="mt-2">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Supporting Patterns</span>
          <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
            {strategyDefinition.bigIdeaSupportingPatterns.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
