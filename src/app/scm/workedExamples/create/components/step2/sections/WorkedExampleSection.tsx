"use client";

import { PencilIcon, CheckIcon } from "@heroicons/react/24/outline";
import { SectionAccordion } from "@/components/composed/section-visualization";
import { GraphPlanDisplay } from "../GraphPlanDisplay";
import { SlidePlanDisplay } from "../SlidePlanDisplay";
import { DiagramPreviewDisplay } from "../DiagramPreviewDisplay";
import { ScenarioEditor } from "../ScenarioEditor";
import type { ProblemAnalysis, StrategyDefinition, Scenario } from "../../../lib/types";

interface WorkedExampleSectionProps {
  scenario: Scenario;
  problemAnalysis: ProblemAnalysis;
  strategyDefinition: StrategyDefinition;
  editingScenario: boolean;
  setEditingScenario: (editing: boolean) => void;
  updateScenario: (updated: Scenario) => void;
}

export function WorkedExampleSection({
  scenario,
  problemAnalysis,
  strategyDefinition,
  editingScenario,
  setEditingScenario,
  updateScenario,
}: WorkedExampleSectionProps) {
  return (
    <SectionAccordion
      title={`${scenario.themeIcon} Worked Example`}
      subtitle={scenario.name}
      color="#10B981"
      className="mb-0"
      hideExpandAll
      defaultOpenItems={[
        "we-question",
        "we-diagram-evolution",
        "we-graph-plan",
      ]}
      items={[
        // Question section
        {
          key: "we-question",
          title: (
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-medium text-gray-700">
                Question
              </span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingScenario(!editingScenario);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    e.preventDefault();
                    setEditingScenario(!editingScenario);
                  }
                }}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                title={
                  editingScenario
                    ? "Done editing"
                    : "Edit scenario"
                }
              >
                {editingScenario ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <PencilIcon className="h-4 w-4" />
                )}
              </span>
            </div>
          ),
          icon: null,
          content:
            editingScenario ? (
              <ScenarioEditor
                scenario={scenario}
                onChange={(updated) => updateScenario(updated)}
              />
            ) : (
              <div>
                <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Context
                    </h4>
                    <p className="text-sm text-gray-600">
                      {scenario.context}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Numbers
                    </h4>
                    <p className="text-sm text-gray-600">
                      {scenario.numbers}
                    </p>
                  </div>
                </div>
                <div className="pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Problem Description
                  </h4>
                  <p className="text-sm text-gray-600">
                    {scenario.description}
                  </p>
                </div>
              </div>
            ),
        },
        // Diagram Evolution section (shows step-by-step visual progression)
        ...(scenario?.diagramEvolution
          ? [
              {
                key: "we-diagram-evolution",
                title: "Diagram Evolution",
                icon: null,
                content: (
                  <SlidePlanDisplay
                    diagramEvolution={scenario.diagramEvolution!}
                    visualType={problemAnalysis.visualType}
                    svgSubtype={problemAnalysis.svgSubtype}
                    stepCount={strategyDefinition.moves.length}
                  />
                ),
              },
            ]
          : []),
        // Graph Plan section (if exists - for coordinate graphs)
        ...(scenario.graphPlan
          ? [
              {
                key: "we-graph-plan",
                title: "Graph Plan",
                icon: null,
                content: (
                  <GraphPlanDisplay
                    graphPlan={scenario.graphPlan!}
                    compact
                  />
                ),
              },
            ]
          : []),
        // Note: diagramPreview is now deprecated in favor of diagramEvolution (which includes keyElements)
        // For backward compatibility, show diagramPreview only if diagramEvolution is NOT present
        ...(!scenario?.diagramEvolution &&
        problemAnalysis.diagramPreview
          ? [
              {
                key: "we-diagram-preview",
                title: "Visual Structure Preview (Legacy)",
                icon: null,
                content: (
                  <div>
                    <p className="text-xs text-gray-500 mb-3">
                      This preview shows the planned visual structure
                      for the worked example.
                    </p>
                    <DiagramPreviewDisplay
                      diagramPreview={problemAnalysis.diagramPreview!}
                    />
                  </div>
                ),
              },
            ]
          : []),
      ]}
    />
  );
}
