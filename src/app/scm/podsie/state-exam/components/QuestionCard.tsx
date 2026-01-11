"use client";

import { useState } from "react";
import { Badge } from "@/components/core/feedback/Badge";
import { Dialog } from "@/components/composed/dialogs/Dialog";
import type { StateTestQuestion } from "../types";

interface QuestionCardProps {
  question: StateTestQuestion;
  isSecondaryOnlyMatch?: boolean;
}

export function QuestionCard({
  question,
  isSecondaryOnlyMatch = false,
}: QuestionCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Primary matches get pink styling, secondary matches get gray styling
  const cardClasses = isSecondaryOnlyMatch
    ? "bg-gray-50 rounded-lg border border-gray-300 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    : "bg-pink-50 rounded-lg border border-pink-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer";

  const headerClasses = isSecondaryOnlyMatch
    ? "px-3 py-1.5 border-b bg-gray-100 border-gray-300"
    : "px-3 py-1.5 border-b bg-pink-100 border-pink-200";

  return (
    <>
      <div
        className={cardClasses}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Summary Header - Always visible */}
        <div className={headerClasses}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Badge intent="primary" appearance="outline" size="xs">
                {question.standard}
              </Badge>
              {question.secondaryStandard && (
                <Badge intent="secondary" appearance="outline" size="xs">
                  {question.secondaryStandard}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>{question.examYear}</span>
              {question.points !== undefined && (
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  {question.points}pt
                </span>
              )}
            </div>
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
        title={
          <div className="flex items-center gap-2">
            <Badge intent="primary" appearance="outline" size="xs">
              {question.standard}
            </Badge>
            {question.secondaryStandard && (
              <Badge intent="secondary" appearance="outline" size="xs">
                {question.secondaryStandard}
              </Badge>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          {/* Full-size Image */}
          <a
            href={question.screenshotUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={question.screenshotUrl}
              alt={`Question ${question.questionId}`}
              className="w-full object-contain bg-gray-50 rounded-lg hover:opacity-90 transition-opacity"
            />
          </a>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t pt-4">
            <div>
              <div className="text-gray-500 text-xs">Question #</div>
              <div className="font-medium">{question.questionNumber ?? "-"}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Grade</div>
              <div className="font-medium">{question.grade}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Year</div>
              <div className="font-medium">{question.examYear}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Points</div>
              <div className="font-medium">{question.points ?? "-"}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Type</div>
              <div className="font-medium">{question.responseType || question.questionType || "-"}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Answer</div>
              <div className="font-medium">{question.answer || "-"}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">ID</div>
              <div className="font-medium font-mono text-xs">{question.questionId}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Exam</div>
              <div className="font-medium">{question.examTitle}</div>
            </div>
          </div>

          {/* Source Link */}
          <div className="border-t pt-4">
            <a
              href={question.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              View on Problem Attic →
            </a>
          </div>
        </div>
      </Dialog>
    </>
  );
}
