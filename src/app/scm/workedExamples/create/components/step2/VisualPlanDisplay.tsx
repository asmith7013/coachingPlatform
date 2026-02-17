"use client";

import { Badge } from "@/components/core/feedback/Badge";
import type { VisualPlan } from "../../lib/types";

interface VisualPlanDisplayProps {
  visualPlan: VisualPlan;
  compact?: boolean;
}

// Visual type labels for display
const visualTypeLabels: Record<string, string> = {
  "tape-diagram": "Tape Diagram",
  "double-number-line": "Double Number Line",
  "area-model": "Area Model",
  "number-line": "Number Line",
  "ratio-table": "Ratio Table",
  "hanger-diagram": "Hanger Diagram",
  "input-output-table": "Input/Output Table",
  "grid-diagram": "Grid Diagram",
  "net-diagram": "Net Diagram",
  "measurement-diagram": "Measurement Diagram",
  "discrete-diagram": "Discrete Diagram",
  "base-ten-diagram": "Base-Ten Diagram",
  "dot-plot": "Dot Plot",
  "box-plot": "Box Plot",
  "bar-graph": "Bar Graph",
  "tree-diagram": "Tree Diagram",
  "circle-diagram": "Circle Diagram",
  "scale-drawing": "Scale Drawing",
  "scaled-figures": "Scaled Figures",
  other: "Custom Diagram",
};

export function VisualPlanDisplay({
  visualPlan,
  compact = false,
}: VisualPlanDisplayProps) {
  const headerClass = compact
    ? "text-xs font-medium text-gray-500 mb-1"
    : "text-sm font-semibold text-gray-700 mb-2";

  const renderContent = () => {
    switch (visualPlan.type) {
      case "tape-diagram":
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Boxes:</span>{" "}
                <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-xs">
                  {visualPlan.boxes}
                </code>
              </div>
              <div>
                <span className="text-gray-500">Value per box:</span>{" "}
                <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-xs">
                  {visualPlan.valuePerBox}
                </code>
              </div>
              <div>
                <span className="text-gray-500">Total:</span>{" "}
                <code className="text-green-700 bg-green-50 px-1.5 py-0.5 rounded text-xs">
                  {visualPlan.total}
                </code>
              </div>
              <div>
                <span className="text-gray-500">Unknown:</span>{" "}
                <Badge intent="warning" size="xs">
                  {visualPlan.unknownPosition}
                </Badge>
              </div>
            </div>
          </div>
        );

      case "double-number-line":
        return (
          <div className="space-y-2">
            <div className="bg-gray-50 rounded p-2 text-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-600 font-medium">
                  {visualPlan.quantityA.label}:
                </span>
                <code className="text-xs">
                  {visualPlan.quantityA.values.join(" → ")}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">
                  {visualPlan.quantityB.label}:
                </span>
                <code className="text-xs">
                  {visualPlan.quantityB.values.join(" → ")}
                </code>
              </div>
            </div>
            {visualPlan.highlightPair && (
              <div className="text-sm">
                <span className="text-gray-500">Highlight:</span>{" "}
                <code className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded text-xs">
                  ({visualPlan.highlightPair[0]}, {visualPlan.highlightPair[1]})
                </code>
              </div>
            )}
          </div>
        );

      case "area-model":
        return (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-500">Dimensions:</span>{" "}
              <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-xs">
                {visualPlan.dimensions[0]} × {visualPlan.dimensions[1]}
              </code>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Partial Products:</span>
              <div className="mt-1 bg-gray-50 rounded p-2 border border-gray-200">
                {visualPlan.partialProducts.map((row, i) => (
                  <div key={i} className="flex gap-2">
                    {row.map((val, j) => (
                      <code
                        key={j}
                        className="text-xs bg-white px-2 py-1 rounded border border-gray-200"
                      >
                        {val}
                      </code>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "number-line":
        return (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-500">Range:</span>{" "}
              <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-xs">
                {visualPlan.range[0]} to {visualPlan.range[1]}
              </code>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Marked Points:</span>
              <div className="flex gap-2 mt-1 flex-wrap">
                {visualPlan.markedPoints.map((pt, i) => (
                  <code
                    key={i}
                    className={`text-xs px-2 py-1 rounded border ${
                      pt.style === "closed"
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-amber-50 border-amber-200 text-amber-700"
                    }`}
                  >
                    {pt.value}
                    {pt.label ? ` (${pt.label})` : ""} [{pt.style}]
                  </code>
                ))}
              </div>
            </div>
            {visualPlan.arrows && visualPlan.arrows.length > 0 && (
              <div className="text-sm">
                <span className="text-gray-500">Arrows:</span>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {visualPlan.arrows.map((arr, i) => (
                    <code
                      key={i}
                      className="text-xs bg-purple-50 border-purple-200 text-purple-700 px-2 py-1 rounded border"
                    >
                      {arr.from} → {arr.to}
                      {arr.label ? `: ${arr.label}` : ""}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "ratio-table":
        return (
          <div className="space-y-2">
            <div className="bg-gray-50 rounded p-2 border border-gray-200">
              {visualPlan.rows.map((row, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 font-medium w-20">
                    {row.label}:
                  </span>
                  <div className="flex gap-1">
                    {row.values.map((val, j) => (
                      <code
                        key={j}
                        className="text-xs bg-white px-2 py-1 rounded border border-gray-200"
                      >
                        {val}
                      </code>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {visualPlan.scaleFactors && visualPlan.scaleFactors.length > 0 && (
              <div className="text-sm">
                <span className="text-gray-500">Scale Factors:</span>{" "}
                {visualPlan.scaleFactors.map((sf, i) => (
                  <Badge key={i} intent="info" size="xs" className="ml-1">
                    {sf}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );

      case "hanger-diagram":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-4 text-sm">
              <div className="bg-blue-50 rounded p-2 border border-blue-200 flex-1 text-center">
                <span className="text-gray-500 text-xs block">Left Side</span>
                <code className="text-blue-700">{visualPlan.leftSide}</code>
              </div>
              <span className="text-gray-400">=</span>
              <div className="bg-green-50 rounded p-2 border border-green-200 flex-1 text-center">
                <span className="text-gray-500 text-xs block">Right Side</span>
                <code className="text-green-700">{visualPlan.rightSide}</code>
              </div>
            </div>
            {visualPlan.shapes && (
              <div className="text-sm">
                <span className="text-gray-500">Shapes:</span>{" "}
                {visualPlan.shapes.triangle && (
                  <Badge intent="warning" size="xs">
                    △ = {visualPlan.shapes.triangle}
                  </Badge>
                )}{" "}
                {visualPlan.shapes.square && (
                  <Badge intent="info" size="xs">
                    □ = {visualPlan.shapes.square}
                  </Badge>
                )}
              </div>
            )}
          </div>
        );

      case "input-output-table":
        return (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-500">Rule:</span>{" "}
              <code className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded text-xs">
                {visualPlan.rule}
              </code>
            </div>
            <div className="bg-gray-50 rounded p-2 border border-gray-200">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 font-medium w-16">Input:</span>
                <div className="flex gap-1">
                  {visualPlan.inputs.map((val, j) => (
                    <code
                      key={j}
                      className="text-xs bg-white px-2 py-1 rounded border border-gray-200"
                    >
                      {val}
                    </code>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm mt-1">
                <span className="text-gray-600 font-medium w-16">Output:</span>
                <div className="flex gap-1">
                  {visualPlan.outputs.map((val, j) => (
                    <code
                      key={j}
                      className="text-xs bg-white px-2 py-1 rounded border border-gray-200"
                    >
                      {val}
                    </code>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Unknown:</span>{" "}
              <Badge intent="warning" size="xs">
                {visualPlan.unknownPosition}
              </Badge>
            </div>
          </div>
        );

      case "grid-diagram":
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Rows:</span>{" "}
                <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-xs">
                  {visualPlan.rows}
                </code>
              </div>
              <div>
                <span className="text-gray-500">Cols:</span>{" "}
                <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-xs">
                  {visualPlan.cols}
                </code>
              </div>
              <div>
                <span className="text-gray-500">Unit:</span>{" "}
                <code className="text-green-700 bg-green-50 px-1.5 py-0.5 rounded text-xs">
                  {visualPlan.unitLabel}
                </code>
              </div>
            </div>
            {visualPlan.shadedRegions &&
              visualPlan.shadedRegions.length > 0 && (
                <div className="text-sm">
                  <span className="text-gray-500">Shaded Regions:</span>{" "}
                  <Badge intent="info" size="xs">
                    {visualPlan.shadedRegions.length} region(s)
                  </Badge>
                </div>
              )}
          </div>
        );

      case "net-diagram":
        return (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-500">Shape:</span>{" "}
              <Badge intent="info" size="xs">
                {visualPlan.shapeType}
              </Badge>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Dimensions:</span>{" "}
              <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-xs">
                {visualPlan.dimensions.length} × {visualPlan.dimensions.width} ×{" "}
                {visualPlan.dimensions.height}
              </code>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Faces:</span>{" "}
              <Badge intent="neutral" size="xs">
                {visualPlan.faces.length} faces
              </Badge>
              {visualPlan.foldLines && (
                <Badge intent="warning" size="xs" className="ml-1">
                  fold lines
                </Badge>
              )}
            </div>
          </div>
        );

      case "measurement-diagram":
        return (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-500">Shape:</span>{" "}
              <Badge intent="info" size="xs">
                {visualPlan.shapeType}
              </Badge>
              {visualPlan.showRightAngle && (
                <Badge intent="neutral" size="xs" className="ml-1">
                  right angle
                </Badge>
              )}
              {visualPlan.showDashedHeight && (
                <Badge intent="neutral" size="xs" className="ml-1">
                  dashed height
                </Badge>
              )}
            </div>
            <div className="bg-gray-50 rounded p-2 border border-gray-200">
              {visualPlan.measurements.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 font-medium capitalize">
                    {m.label}:
                  </span>
                  <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
                    {m.value}
                  </code>
                  {m.position && (
                    <span className="text-gray-400 text-xs">
                      ({m.position})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "discrete-diagram":
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Groups:</span>{" "}
                <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-xs">
                  {visualPlan.groups}
                </code>
              </div>
              <div>
                <span className="text-gray-500">Items/Group:</span>{" "}
                <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-xs">
                  {visualPlan.itemsPerGroup}
                </code>
              </div>
              <div>
                <span className="text-gray-500">Total:</span>{" "}
                <code className="text-green-700 bg-green-50 px-1.5 py-0.5 rounded text-xs">
                  {visualPlan.totalItems}
                </code>
              </div>
              <div>
                <span className="text-gray-500">Style:</span>{" "}
                <Badge intent="neutral" size="xs">
                  {visualPlan.visualType}
                </Badge>
              </div>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Arrangement:</span>{" "}
              <Badge intent="info" size="xs">
                {visualPlan.arrangement}
              </Badge>
            </div>
          </div>
        );

      case "base-ten-diagram":
        return (
          <div className="space-y-2">
            <div className="bg-gray-50 rounded p-2 border border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <span className="text-gray-500 text-xs block">Hundreds</span>
                  <code className="text-purple-700 bg-purple-50 px-2 py-1 rounded text-lg font-bold">
                    {visualPlan.hundreds}
                  </code>
                </div>
                <div className="text-center">
                  <span className="text-gray-500 text-xs block">Tens</span>
                  <code className="text-blue-700 bg-blue-50 px-2 py-1 rounded text-lg font-bold">
                    {visualPlan.tens}
                  </code>
                </div>
                <div className="text-center">
                  <span className="text-gray-500 text-xs block">Ones</span>
                  <code className="text-green-700 bg-green-50 px-2 py-1 rounded text-lg font-bold">
                    {visualPlan.ones}
                  </code>
                </div>
              </div>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Operation:</span>{" "}
              <Badge
                intent={visualPlan.operation === "none" ? "neutral" : "warning"}
                size="xs"
              >
                {visualPlan.operation}
              </Badge>
              {visualPlan.showValues && (
                <Badge intent="info" size="xs" className="ml-1">
                  show values
                </Badge>
              )}
            </div>
          </div>
        );

      case "dot-plot":
        return (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-500">Data Points:</span>{" "}
              <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-xs">
                {visualPlan.dataPoints.join(", ")}
              </code>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Axis:</span>{" "}
                <Badge intent="neutral" size="xs">
                  {visualPlan.axisLabel}
                </Badge>
              </div>
              <div>
                <span className="text-gray-500">Range:</span>{" "}
                <code className="text-green-700 bg-green-50 px-1.5 py-0.5 rounded text-xs">
                  {visualPlan.axisRange[0]} to {visualPlan.axisRange[1]}
                </code>
              </div>
            </div>
            {visualPlan.title && (
              <div className="text-sm">
                <span className="text-gray-500">Title:</span>{" "}
                <span className="text-gray-700">{visualPlan.title}</span>
              </div>
            )}
          </div>
        );

      case "box-plot":
        return (
          <div className="space-y-2">
            <div className="bg-gray-50 rounded p-2 border border-gray-200">
              <div className="grid grid-cols-5 gap-2 text-sm text-center">
                <div>
                  <span className="text-gray-500 text-xs block">Min</span>
                  <code className="text-blue-700 font-bold">
                    {visualPlan.min}
                  </code>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Q1</span>
                  <code className="text-blue-700 font-bold">
                    {visualPlan.q1}
                  </code>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Median</span>
                  <code className="text-purple-700 font-bold">
                    {visualPlan.median}
                  </code>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Q3</span>
                  <code className="text-blue-700 font-bold">
                    {visualPlan.q3}
                  </code>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Max</span>
                  <code className="text-blue-700 font-bold">
                    {visualPlan.max}
                  </code>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Axis:</span>{" "}
                <Badge intent="neutral" size="xs">
                  {visualPlan.axisLabel}
                </Badge>
              </div>
              {visualPlan.outliers && visualPlan.outliers.length > 0 && (
                <div>
                  <span className="text-gray-500">Outliers:</span>{" "}
                  <Badge intent="warning" size="xs">
                    {visualPlan.outliers.join(", ")}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        );

      case "bar-graph":
        return (
          <div className="space-y-2">
            <div className="bg-gray-50 rounded p-2 border border-gray-200">
              {visualPlan.categories.map((cat, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 font-medium w-20 truncate">
                    {cat}:
                  </span>
                  <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
                    {visualPlan.values[i]}
                  </code>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Orientation:</span>{" "}
                <Badge intent="info" size="xs">
                  {visualPlan.orientation}
                </Badge>
              </div>
              <div>
                <span className="text-gray-500">Axis:</span>{" "}
                <Badge intent="neutral" size="xs">
                  {visualPlan.axisLabel}
                </Badge>
              </div>
            </div>
            {visualPlan.title && (
              <div className="text-sm">
                <span className="text-gray-500">Title:</span>{" "}
                <span className="text-gray-700">{visualPlan.title}</span>
              </div>
            )}
          </div>
        );

      case "tree-diagram":
        return (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-500">Levels:</span>{" "}
              <Badge intent="info" size="xs">
                {visualPlan.levels.length}
              </Badge>
            </div>
            <div className="bg-gray-50 rounded p-2 border border-gray-200">
              {visualPlan.levels.map((level, i) => (
                <div key={i} className="text-sm mb-1">
                  <span className="text-gray-600 font-medium">
                    Level {i + 1}:
                  </span>{" "}
                  {level.outcomes.map((outcome, j) => (
                    <span key={j}>
                      <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-gray-200">
                        {outcome} ({(level.probabilities[j] * 100).toFixed(0)}%)
                      </code>
                      {j < level.outcomes.length - 1 && (
                        <span className="text-gray-400 mx-1">|</span>
                      )}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Final Outcomes:</span>{" "}
              <code className="text-green-700 bg-green-50 px-1.5 py-0.5 rounded text-xs">
                {visualPlan.finalOutcomes.join(", ")}
              </code>
            </div>
            {visualPlan.highlightPath && (
              <div className="text-sm">
                <span className="text-gray-500">Highlight:</span>{" "}
                <Badge intent="warning" size="xs">
                  {visualPlan.highlightPath.join(" → ")}
                </Badge>
              </div>
            )}
          </div>
        );

      case "circle-diagram":
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Radius:</span>{" "}
                <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-xs">
                  {visualPlan.radius} {visualPlan.unit}
                </code>
              </div>
              <div>
                <span className="text-gray-500">Diameter:</span>{" "}
                <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-xs">
                  {visualPlan.diameter} {visualPlan.unit}
                </code>
              </div>
              <div>
                <span className="text-gray-500">Circumference:</span>{" "}
                <code className="text-green-700 bg-green-50 px-1.5 py-0.5 rounded text-xs">
                  {visualPlan.circumference}
                </code>
              </div>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Labeled Parts:</span>{" "}
              {visualPlan.labeledParts.map((part, i) => (
                <Badge key={i} intent="info" size="xs" className="ml-1">
                  {part}
                </Badge>
              ))}
            </div>
          </div>
        );

      case "scale-drawing":
        return (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-500">Scale:</span>{" "}
              <code className="text-purple-700 bg-purple-50 px-2 py-1 rounded font-bold">
                {visualPlan.scaleFactor}
              </code>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded p-2 border border-blue-200">
                <span className="text-xs text-blue-600 font-medium block mb-1">
                  Drawing
                </span>
                {visualPlan.drawingMeasurements.map((m, i) => (
                  <div key={i} className="text-sm">
                    {m.label}:{" "}
                    <code className="text-blue-700">
                      {m.value} {m.unit}
                    </code>
                  </div>
                ))}
              </div>
              <div className="bg-green-50 rounded p-2 border border-green-200">
                <span className="text-xs text-green-600 font-medium block mb-1">
                  Actual
                </span>
                {visualPlan.actualMeasurements.map((m, i) => (
                  <div key={i} className="text-sm">
                    {m.label}:{" "}
                    <code className="text-green-700">
                      {m.value} {m.unit}
                    </code>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Type:</span>{" "}
              <Badge intent="neutral" size="xs">
                {visualPlan.drawingType}
              </Badge>
            </div>
          </div>
        );

      case "scaled-figures":
        return (
          <div className="space-y-2">
            <div className="text-sm text-center">
              <span className="text-gray-500">Scale Factor:</span>{" "}
              <code className="text-purple-700 bg-purple-50 px-2 py-1 rounded font-bold text-lg">
                ×{visualPlan.scaleFactor}
              </code>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded p-2 border border-blue-200">
                <span className="text-xs text-blue-600 font-medium block mb-1">
                  Original
                </span>
                {visualPlan.originalDimensions.map((d, i) => (
                  <div key={i} className="text-sm">
                    {d.label}: <code className="text-blue-700">{d.value}</code>
                  </div>
                ))}
              </div>
              <div className="bg-green-50 rounded p-2 border border-green-200">
                <span className="text-xs text-green-600 font-medium block mb-1">
                  Copy
                </span>
                {visualPlan.copyDimensions.map((d, i) => (
                  <div key={i} className="text-sm">
                    {d.label}: <code className="text-green-700">{d.value}</code>
                  </div>
                ))}
              </div>
            </div>
            {visualPlan.shapeType && (
              <div className="text-sm">
                <span className="text-gray-500">Shape:</span>{" "}
                <Badge intent="neutral" size="xs">
                  {visualPlan.shapeType}
                </Badge>
              </div>
            )}
          </div>
        );

      case "other":
        return (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-500">Description:</span>
              <p className="text-gray-600 mt-1">{visualPlan.description}</p>
            </div>
            {visualPlan.elements && visualPlan.elements.length > 0 && (
              <div className="text-sm">
                <span className="text-gray-500">Elements:</span>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {visualPlan.elements.map((el, i) => (
                    <Badge key={i} intent="neutral" size="xs">
                      {el}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {visualPlan.annotations && visualPlan.annotations.length > 0 && (
              <div className="text-sm">
                <span className="text-gray-500">Annotations:</span>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {visualPlan.annotations.map((ann, i) => (
                    <Badge key={i} intent="info" size="xs">
                      {ann}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <p className="text-sm text-gray-500">Unknown visual type</p>;
    }
  };

  return (
    <div className={compact ? "space-y-2" : ""}>
      <h5 className={headerClass}>
        {visualTypeLabels[visualPlan.type] || "Visual Plan"}
      </h5>
      {renderContent()}
    </div>
  );
}
