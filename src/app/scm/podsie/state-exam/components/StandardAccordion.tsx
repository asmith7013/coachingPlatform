"use client";

import { useState } from "react";
import { Badge } from "@/components/core/feedback/Badge";
import { QuestionCard } from "./QuestionCard";
import type { StateTestQuestion } from "../types";

interface StandardAccordionProps {
  standard: string;
  questions: StateTestQuestion[];
  isSecondaryMatch: Map<string, boolean>;
}

export function StandardAccordion({
  standard,
  questions,
  isSecondaryMatch,
}: StandardAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);

  const sortedQuestions = [...questions].sort((a, b) => {
    // Sort secondary matches last
    const aIsSecondary = isSecondaryMatch.get(a.questionId) || false;
    const bIsSecondary = isSecondaryMatch.get(b.questionId) || false;
    if (aIsSecondary !== bIsSecondary) {
      return aIsSecondary ? 1 : -1;
    }
    return 0;
  });

  return (
    <div id={`standard-${standard}`} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      {/* Accordion Header - Grayscale background */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3">
          <Badge intent="primary" appearance="outline" size="sm">
            {standard}
          </Badge>
          <span className="text-sm text-gray-600">
            {questions.length} {questions.length === 1 ? "question" : "questions"} matched
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sortedQuestions.map((question) => (
              <QuestionCard
                key={`${standard}-${question.questionId}`}
                question={question}
                isSecondaryOnlyMatch={isSecondaryMatch.get(question.questionId) || false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
