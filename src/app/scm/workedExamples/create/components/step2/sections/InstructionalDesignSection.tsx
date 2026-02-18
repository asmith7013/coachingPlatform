"use client";

import { PencilIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/core/feedback/Badge";
import { SectionAccordion } from "@/components/composed/section-visualization";
import type { StrategyDefinition } from "../../../lib/types";

interface InstructionalDesignSectionProps {
  strategyDefinition: StrategyDefinition;
  editingStrategySteps: boolean;
  setEditingStrategySteps: (editing: boolean) => void;
  updateStrategyMoves: (
    moves: { verb: string; description: string; result: string }[],
  ) => void;
}

export function InstructionalDesignSection({
  strategyDefinition,
  editingStrategySteps,
  setEditingStrategySteps,
  updateStrategyMoves,
}: InstructionalDesignSectionProps) {
  return (
    <SectionAccordion
      title="Instructional Design"
      subtitle={strategyDefinition.name}
      color="#6366F1"
      className="mb-0"
      hideExpandAll
      defaultOpenItems={["id-design-rationale", "id-strategy-steps"]}
      items={[
        // Design Rationale (promoted from hidden <details>)
        ...(strategyDefinition.designRationale
          ? [
              {
                key: "id-design-rationale",
                title: "Design Rationale",
                icon: null,
                content: (
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {strategyDefinition.designRationale}
                  </p>
                ),
              },
            ]
          : []),
        // Strategy Steps (moved from Worked Example accordion)
        {
          key: "id-strategy-steps",
          title: (
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-medium text-gray-700">
                Strategy Steps
              </span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingStrategySteps(!editingStrategySteps);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    e.preventDefault();
                    setEditingStrategySteps(!editingStrategySteps);
                  }
                }}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                title={
                  editingStrategySteps ? "Done editing" : "Edit strategy steps"
                }
              >
                {editingStrategySteps ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <PencilIcon className="h-4 w-4" />
                )}
              </span>
            </div>
          ),
          icon: null,
          content: editingStrategySteps ? (
            <div className="space-y-4">
              {strategyDefinition.moves.map((move, i) => (
                <div key={i} className="bg-gray-50 rounded p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge intent="primary" size="xs" rounded="full">
                      {i + 1}
                    </Badge>
                    <input
                      type="text"
                      value={move.verb}
                      onChange={(e) => {
                        const updated = [...strategyDefinition.moves];
                        updated[i] = {
                          ...updated[i],
                          verb: e.target.value,
                        };
                        updateStrategyMoves(updated);
                      }}
                      className="font-semibold text-sm border border-gray-300 rounded px-2 py-1 w-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Verb"
                    />
                  </div>
                  <input
                    type="text"
                    value={move.description}
                    onChange={(e) => {
                      const updated = [...strategyDefinition.moves];
                      updated[i] = {
                        ...updated[i],
                        description: e.target.value,
                      };
                      updateStrategyMoves(updated);
                    }}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Description"
                  />
                  <input
                    type="text"
                    value={move.result}
                    onChange={(e) => {
                      const updated = [...strategyDefinition.moves];
                      updated[i] = {
                        ...updated[i],
                        result: e.target.value,
                      };
                      updateStrategyMoves(updated);
                    }}
                    className="w-full text-sm text-gray-500 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Result (optional)"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {strategyDefinition.moves.map((move, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Badge intent="primary" size="xs" rounded="full">
                    {i + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-gray-900 text-sm">
                      {move.verb}
                    </span>
                    <span className="text-gray-600 text-sm">
                      : {move.description}
                    </span>
                    {move.result && (
                      <span className="text-gray-500 text-xs block mt-0.5">
                        → {move.result}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {/* Discovery Questions */}
              {strategyDefinition.discoveryQuestions &&
                strategyDefinition.discoveryQuestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                      Discovery Questions
                    </span>
                    <ul className="mt-1 space-y-1">
                      {strategyDefinition.discoveryQuestions.map((q, i) => (
                        <li key={i} className="text-xs text-gray-600 italic">
                          &ldquo;{q}&rdquo;
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          ),
        },
      ]}
    />
  );
}
