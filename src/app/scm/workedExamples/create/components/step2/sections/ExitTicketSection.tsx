"use client";

import { SectionAccordion } from "@/components/composed/section-visualization";
import { GraphPlanDisplay } from "../GraphPlanDisplay";
import type { ProblemAnalysis } from "../../../lib/types";

interface ExitTicketSectionProps {
  problemAnalysis: ProblemAnalysis;
}

export function ExitTicketSection({ problemAnalysis }: ExitTicketSectionProps) {
  return (
    <SectionAccordion
      title="Exit Ticket Analysis"
      subtitle={
        problemAnalysis.visualType === "svg-visual" &&
        problemAnalysis.svgSubtype
          ? `${problemAnalysis.visualType}: ${problemAnalysis.svgSubtype}`
          : problemAnalysis.visualType
      }
      color="#475569"
      className="mb-0"
      hideExpandAll
      defaultOpenItems={["et-analysis"]}
      items={[
        {
          key: "et-analysis",
          title: "Problem & Solution",
          icon: null,
          content: (
            <div>
              <div className="border-b border-gray-200 pb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Problem Type
                </h4>
                <p className="text-sm text-gray-600">
                  {problemAnalysis.problemType}
                </p>
              </div>
              <div className="border-b border-gray-200 py-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Answer
                </h4>
                <p className="text-sm text-gray-600">
                  {problemAnalysis.answer}
                </p>
              </div>
              <div className="pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Key Challenge
                </h4>
                <p className="text-sm text-gray-600">
                  {problemAnalysis.keyChallenge}
                </p>
              </div>
            </div>
          ),
        },
        ...(problemAnalysis.visualType === "svg-visual" &&
        problemAnalysis.svgSubtype === "coordinate-graph" &&
        problemAnalysis.graphPlan
          ? [
              {
                key: "et-graph-plan",
                title: "Graph Plan",
                icon: null,
                content: (
                  <GraphPlanDisplay graphPlan={problemAnalysis.graphPlan!} />
                ),
              },
            ]
          : []),
        ...(problemAnalysis.problemTranscription
          ? [
              {
                key: "et-transcription",
                title: "Problem Transcription",
                icon: null,
                content: (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">
                      (verify this matches the image)
                    </p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded p-3 border border-gray-200">
                      {problemAnalysis.problemTranscription}
                    </p>
                  </div>
                ),
              },
            ]
          : []),
      ]}
    />
  );
}
