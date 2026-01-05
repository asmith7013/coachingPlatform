'use client';

import { Badge } from '@/components/core/feedback/Badge';
import type { GraphPlan } from '../../lib/types';

interface GraphPlanDisplayProps {
  graphPlan: GraphPlan;
  compact?: boolean;
}

export function GraphPlanDisplay({ graphPlan, compact = false }: GraphPlanDisplayProps) {
  return (
    <div className={compact ? "space-y-3" : ""}>
      {/* Equations with Line Endpoints */}
      <div className={compact ? "mb-3" : "border-b border-gray-200 pb-4"}>
        <h5 className={compact ? "text-xs font-medium text-gray-500 mb-2" : "text-sm font-semibold text-gray-700 mb-2"}>
          {compact ? "Equations" : "Lines (with endpoints)"}
        </h5>
        <div className="space-y-2">
          {graphPlan.equations.map((eq, i) => (
            <div key={i} className="bg-gray-50 rounded p-2 text-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: eq.color }}
                />
                <code className="text-gray-700 bg-white px-1.5 py-0.5 rounded text-xs border border-gray-200">
                  {eq.equation}
                </code>
                <span className="text-gray-400 text-xs">m={eq.slope}, b={eq.yIntercept}</span>
              </div>
              {/* Line Endpoints */}
              <div className="grid grid-cols-2 gap-2 text-xs ml-5">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Start:</span>
                  {eq.startPoint ? (
                    <code className="text-green-700 bg-green-50 px-1 py-0.5 rounded text-xs">
                      ({eq.startPoint.x}, {eq.startPoint.y})
                    </code>
                  ) : (
                    <span className="text-amber-600 text-xs">missing</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">End:</span>
                  {eq.endPoint ? (
                    <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded text-xs">
                      ({eq.endPoint.x}, {eq.endPoint.y})
                    </code>
                  ) : (
                    <span className="text-amber-600 text-xs">missing</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scale */}
      <div className={compact ? "mb-3" : (graphPlan.keyPoints && graphPlan.keyPoints.length > 0 ? "border-b border-gray-200 py-4" : "py-4")}>
        <h5 className={compact ? "text-xs font-medium text-gray-500 mb-1" : "text-sm font-semibold text-gray-700 mb-2"}>Scale</h5>
        <div className="text-sm text-gray-600">
          X: 0 to {graphPlan.scale.xMax} ({graphPlan.scale.xAxisLabels?.join(', ')}) | Y: 0 to {graphPlan.scale.yMax} ({graphPlan.scale.yAxisLabels?.join(', ')})
        </div>
      </div>

      {/* Key Points */}
      {graphPlan.keyPoints && graphPlan.keyPoints.length > 0 && (
        <div className={compact ? "mb-3" : (graphPlan.annotations && graphPlan.annotations.length > 0 ? "border-b border-gray-200 py-4" : "py-4")}>
          <h5 className={compact ? "text-xs font-medium text-gray-500 mb-1" : "text-sm font-semibold text-gray-700 mb-2"}>Key Points</h5>
          <div className="space-y-1">
            {graphPlan.keyPoints.map((pt, ptIdx) => (
              <div key={ptIdx} className="text-sm text-gray-600 flex items-center gap-2">
                <span className="font-medium">{pt.label}:</span>
                <code className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded text-xs border border-purple-200">
                  ({pt.x}, {pt.y})
                </code>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Annotations */}
      {graphPlan.annotations && graphPlan.annotations.length > 0 && (
        <div className={compact ? "" : "pt-4"}>
          <h5 className={compact ? "text-xs font-medium text-gray-500 mb-1" : "text-sm font-semibold text-gray-700 mb-2"}>Annotations</h5>
          <div className="space-y-1">
            {graphPlan.annotations.map((ann, annIdx) => (
              <div key={annIdx} className="text-sm text-gray-600 flex items-center gap-2">
                <Badge intent="info" size="xs">{ann.type}</Badge>
                <span>{ann.label}</span>
                {ann.from !== undefined && ann.to !== undefined && (
                  <span className="text-gray-500 text-xs">(y: {ann.from} → {ann.to})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
