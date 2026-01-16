"use client";

import { useState } from "react";
import { Dialog } from "@/components/composed/dialogs/Dialog";
import { DOMAIN_COLORS } from "../constants";
import { extractDomain, normalizeStandard } from "../hooks";
import type { StateTestQuestion } from "../types";

// Domain-colored badge component
function StandardBadge({ standard, isPrimary = true }: { standard: string; isPrimary?: boolean }) {
  const normalizedStd = normalizeStandard(standard);
  const domain = extractDomain(normalizedStd);
  const colors = DOMAIN_COLORS[domain] || DOMAIN_COLORS.Other;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        isPrimary ? `${colors.badge} text-white` : `${colors.bg} ${colors.text} border ${colors.border}`
      }`}
    >
      {standard}
    </span>
  );
}

interface QuestionCardProps {
  question: StateTestQuestion;
  isSecondaryOnlyMatch?: boolean;
  hideStandardBadge?: boolean;
}

export function QuestionCard({
  question,
  isSecondaryOnlyMatch = false,
  hideStandardBadge = false,
}: QuestionCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get domain from the primary standard to determine card color
  const normalizedStd = normalizeStandard(question.standard);
  const domain = extractDomain(normalizedStd);
  const colors = DOMAIN_COLORS[domain] || DOMAIN_COLORS.Other;


  // Use domain colors for card styling, with lighter styling for secondary-only matches
  const cardClasses = isSecondaryOnlyMatch
    ? "bg-gray-50 rounded-lg border border-gray-300 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    : `${colors.bg} rounded-lg border ${colors.border} shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer`;

  const headerClasses = isSecondaryOnlyMatch
    ? "px-3 py-1.5 border-b bg-gray-100 border-gray-300"
    : `px-3 py-1.5 border-b ${colors.border}`;

  return (
    <>
      <div
        className={cardClasses}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Summary Header - Always visible */}
        <div className={headerClasses}>
          <div className="flex items-center justify-between">
            {hideStandardBadge ? (
              <>
                {/* Left side: response type and points */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600">
                    {question.responseType === "multipleChoice" ? "Multiple Choice" : question.responseType === "constructedResponse" ? "Constructed Response" : question.questionType || "-"}
                  </span>
                  {question.points !== undefined && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                      {question.points}pt
                    </span>
                  )}
                </div>
                {/* Right side: question number and year */}
                <span className="text-xs text-gray-600">
                  {question.questionNumber && `#${question.questionNumber} `}{question.examYear}
                </span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1">
                  <StandardBadge standard={question.standard} isPrimary={true} />
                  {question.secondaryStandard && (
                    <StandardBadge standard={question.secondaryStandard} isPrimary={false} />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>{question.questionNumber && `#${question.questionNumber} `}{question.examYear}</span>
                  {question.points !== undefined && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {question.points}pt
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Image */}
        <div className="block">
          <img
            src={question.screenshotUrl}
            alt={`Question ${question.questionId}`}
            className="w-full h-80 object-contain bg-gray-50"
            loading="lazy"
          />
        </div>
      </div>

      {/* Question Detail Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
        padding="none"
      >
        <div className="flex flex-col">
          {/* Question Image - Prominent, with padding and min-height */}
          <a
            href={question.screenshotUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-6 min-h-[300px] flex items-center justify-center"
          >
            <img
              src={question.screenshotUrl}
              alt={`Question ${question.questionId}`}
              className="w-full object-contain hover:opacity-90 transition-opacity"
            />
          </a>

          {/* Metadata - Secondary, collapsed section */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
            {/* Standard badges and key info in a compact row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <StandardBadge standard={question.standard} isPrimary={true} />
                {question.secondaryStandard && (
                  <StandardBadge standard={question.secondaryStandard} isPrimary={false} />
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                {/* <span>{question.examYear}</span> */}
                {/* <span>•</span> */}
                <span>{question.responseType === "multipleChoice" ? "Multiple Choice" : question.responseType === "constructedResponse" ? "Constructed Response" : question.questionType || "-"}</span>
                {question.points !== undefined && (
                  <>
                    <span>•</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                      {question.points}pt
                    </span>
                  </>
                )}
                {question.answer && (
                  <>
                    <span>•</span>
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">
                      Answer: {question.answer}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Additional details in smaller text */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span>Grade {question.grade}</span>
                {question.questionNumber && <span>Q#{question.questionNumber}</span>}
                <span>{question.examTitle}</span>
              </div>
              <div className="flex items-center gap-3">
                {/* <span className="font-mono">{question.questionId}</span> */}
                <a
                  href={question.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View on Problem Attic →
                </a>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
