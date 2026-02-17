"use client";

import { Badge } from "@/components/core/feedback/Badge";
import type { ProblemAnalysis } from "../../../lib/types";

interface MisconceptionsSectionProps {
  problemAnalysis: ProblemAnalysis;
  numMoves: number;
}

export function MisconceptionsSection({
  problemAnalysis,
  numMoves,
}: MisconceptionsSectionProps) {
  return (
    <>
      {/* Anticipated Misconceptions - Key section for backward planning */}
      {(problemAnalysis.anticipatedMisconceptions?.length ?? 0) > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 bg-amber-100 rounded text-xs font-bold text-amber-700 uppercase tracking-wide">
              Anticipated Misconceptions
            </span>
            <span className="text-xs text-amber-600">
              {problemAnalysis.anticipatedMisconceptions!.length} misconceptions
              → {numMoves} steps
            </span>
          </div>
          <div className="space-y-3">
            {problemAnalysis.anticipatedMisconceptions!.map((m, i) => (
              <div
                key={i}
                className="bg-white rounded-md p-3 border border-amber-100"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900">
                    {m.misconception}
                  </p>
                  <Badge intent="blue" size="xs">
                    Step {m.addressedInStep}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-semibold">Student work:</span>{" "}
                  {m.studentWorkExample}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  <span className="font-semibold">Root cause:</span>{" "}
                  {m.rootCause}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback: Old-format Common Mistakes (no structured misconceptions) */}
      {!problemAnalysis.anticipatedMisconceptions?.length &&
        problemAnalysis.commonMistakes.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-sm">
            <span className="px-2 py-0.5 bg-amber-100 rounded text-xs font-bold text-amber-700 uppercase tracking-wide mb-2 inline-block">
              Common Mistakes
            </span>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {problemAnalysis.commonMistakes.map((mistake, i) => (
                <li key={i}>{mistake}</li>
              ))}
            </ul>
          </div>
        )}
    </>
  );
}
