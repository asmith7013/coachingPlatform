"use client";

import { PencilIcon, CheckIcon } from "@heroicons/react/24/outline";
import { SectionAccordion } from "@/components/composed/section-visualization";
import { GraphPlanDisplay } from "../GraphPlanDisplay";
import { VisualPlanDisplay } from "../VisualPlanDisplay";
import { ScenarioEditor } from "../ScenarioEditor";
import type { Scenario } from "../../../lib/types";

interface PracticeProblemsSectionProps {
  scenarios: Scenario[];
  editingScenario: number | null;
  setEditingScenario: (index: number | null) => void;
  updateScenario: (index: number, updated: Scenario) => void;
}

export function PracticeProblemsSection({
  scenarios,
  editingScenario,
  setEditingScenario,
  updateScenario,
}: PracticeProblemsSectionProps) {
  if (scenarios.length <= 1) {
    return null;
  }

  return (
    <SectionAccordion
      title="Practice Problems"
      subtitle={`${scenarios.length - 1} problems`}
      color="#F59E0B"
      className="mb-0"
      hideExpandAll
      defaultOpenItems={["practice-1-question"]}
      items={[
        // Practice 1 (includes Graph Plan if exists)
        ...(scenarios[1]
          ? [
              {
                key: "practice-1-question",
                title: (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {scenarios[1].themeIcon}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        Practice 1: {scenarios[1].name}
                      </span>
                      {scenarios[1].visualPlan && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                          Visual
                        </span>
                      )}
                      {scenarios[1].graphPlan && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                          Graph
                        </span>
                      )}
                    </div>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setEditingScenario(editingScenario === 1 ? null : 1);
                      }}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          e.preventDefault();
                          setEditingScenario(editingScenario === 1 ? null : 1);
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                      title={
                        editingScenario === 1 ? "Done editing" : "Edit scenario"
                      }
                    >
                      {editingScenario === 1 ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : (
                        <PencilIcon className="h-4 w-4" />
                      )}
                    </span>
                  </div>
                ),
                icon: null,
                content:
                  editingScenario === 1 ? (
                    <ScenarioEditor
                      scenario={scenarios[1]}
                      onChange={(updated) => updateScenario(1, updated)}
                    />
                  ) : (
                    <div>
                      <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Context
                          </h4>
                          <p className="text-sm text-gray-600">
                            {scenarios[1].context}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Numbers
                          </h4>
                          <p className="text-sm text-gray-600">
                            {scenarios[1].numbers}
                          </p>
                        </div>
                      </div>
                      <div
                        className={
                          scenarios[1].visualPlan || scenarios[1].graphPlan
                            ? "border-b border-gray-200 py-4"
                            : "pt-4"
                        }
                      >
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Problem Description
                        </h4>
                        <p className="text-sm text-gray-600">
                          {scenarios[1].description}
                        </p>
                      </div>
                      {/* Visual Plan (if exists - for non-graph visuals) */}
                      {scenarios[1].visualPlan && (
                        <div
                          className={
                            scenarios[1].graphPlan
                              ? "border-b border-gray-200 py-4"
                              : "pt-4"
                          }
                        >
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            Visual Plan
                          </h4>
                          <VisualPlanDisplay
                            visualPlan={scenarios[1].visualPlan}
                            compact
                          />
                        </div>
                      )}
                      {/* Graph Plan (if exists) */}
                      {scenarios[1].graphPlan && (
                        <div className="pt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            Graph Plan
                          </h4>
                          <GraphPlanDisplay
                            graphPlan={scenarios[1].graphPlan}
                            compact
                          />
                        </div>
                      )}
                    </div>
                  ),
              },
            ]
          : []),
        // Practice 2 (includes Visual/Graph Plan if exists)
        ...(scenarios[2]
          ? [
              {
                key: "practice-2-question",
                title: (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {scenarios[2].themeIcon}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        Practice 2: {scenarios[2].name}
                      </span>
                      {scenarios[2].visualPlan && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                          Visual
                        </span>
                      )}
                      {scenarios[2].graphPlan && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                          Graph
                        </span>
                      )}
                    </div>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setEditingScenario(editingScenario === 2 ? null : 2);
                      }}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          e.preventDefault();
                          setEditingScenario(editingScenario === 2 ? null : 2);
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                      title={
                        editingScenario === 2 ? "Done editing" : "Edit scenario"
                      }
                    >
                      {editingScenario === 2 ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : (
                        <PencilIcon className="h-4 w-4" />
                      )}
                    </span>
                  </div>
                ),
                icon: null,
                content:
                  editingScenario === 2 ? (
                    <ScenarioEditor
                      scenario={scenarios[2]}
                      onChange={(updated) => updateScenario(2, updated)}
                    />
                  ) : (
                    <div>
                      <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Context
                          </h4>
                          <p className="text-sm text-gray-600">
                            {scenarios[2].context}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Numbers
                          </h4>
                          <p className="text-sm text-gray-600">
                            {scenarios[2].numbers}
                          </p>
                        </div>
                      </div>
                      <div
                        className={
                          scenarios[2].visualPlan || scenarios[2].graphPlan
                            ? "border-b border-gray-200 py-4"
                            : "pt-4"
                        }
                      >
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Problem Description
                        </h4>
                        <p className="text-sm text-gray-600">
                          {scenarios[2].description}
                        </p>
                      </div>
                      {/* Visual Plan (if exists - for non-graph visuals) */}
                      {scenarios[2].visualPlan && (
                        <div
                          className={
                            scenarios[2].graphPlan
                              ? "border-b border-gray-200 py-4"
                              : "pt-4"
                          }
                        >
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            Visual Plan
                          </h4>
                          <VisualPlanDisplay
                            visualPlan={scenarios[2].visualPlan}
                            compact
                          />
                        </div>
                      )}
                      {/* Graph Plan (if exists) */}
                      {scenarios[2].graphPlan && (
                        <div className="pt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            Graph Plan
                          </h4>
                          <GraphPlanDisplay
                            graphPlan={scenarios[2].graphPlan}
                            compact
                          />
                        </div>
                      )}
                    </div>
                  ),
              },
            ]
          : []),
      ]}
    />
  );
}
