"use client";

import { useState } from "react";
import { QuestionCard } from "./QuestionCard";
import { DOMAIN_COLORS, STANDARD_DESCRIPTIONS } from "../constants";
import { extractDomain, normalizeStandard, stripLetterSuffix } from "../hooks";
import type { StateTestQuestion } from "../types";

interface StandardAccordionProps {
  standard: string;
  questions: StateTestQuestion[];
  isSecondaryMatch: Map<string, boolean>;
  /** When true, removes individual card styling (for use inside a container card) */
  contained?: boolean;
  /** Dynamic standard descriptions from lesson data (supplements hardcoded STANDARD_DESCRIPTIONS) */
  standardDescriptions?: Record<string, string>;
  /** Set of selected question IDs for print selection */
  selectedQuestions?: Set<string>;
  /** Callback when a question's selection state changes */
  onQuestionSelectionChange?: (questionId: string, selected: boolean) => void;
  /** Whether to show checkboxes for print selection */
  showCheckboxes?: boolean;
  /** Controlled open state (when provided, component is controlled) */
  open?: boolean;
  /** Callback when open state changes (for controlled mode) */
  onToggle?: (standard: string) => void;
}

export function StandardAccordion({
  standard,
  questions,
  isSecondaryMatch,
  contained = false,
  standardDescriptions = {},
  selectedQuestions,
  onQuestionSelectionChange,
  showCheckboxes = false,
  open,
  onToggle,
}: StandardAccordionProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;

  const sortedQuestions = [...questions].sort((a, b) => {
    // Sort secondary matches last
    const aIsSecondary = isSecondaryMatch.get(a.questionId) || false;
    const bIsSecondary = isSecondaryMatch.get(b.questionId) || false;
    if (aIsSecondary !== bIsSecondary) {
      return aIsSecondary ? 1 : -1;
    }
    return 0;
  });

  // Get domain colors for this standard
  const domain = extractDomain(normalizeStandard(standard));
  const colors = DOMAIN_COLORS[domain] || DOMAIN_COLORS.Other;

  // Get standard description - dynamic from lessons first, then fall back to hardcoded
  const normalizedStd = normalizeStandard(standard);
  const parentStd = stripLetterSuffix(normalizedStd);
  const description = standardDescriptions[normalizedStd] || standardDescriptions[parentStd] || STANDARD_DESCRIPTIONS[normalizedStd] || STANDARD_DESCRIPTIONS[standard] || STANDARD_DESCRIPTIONS[parentStd];

  const containerClasses = contained
    ? "bg-white" // No border, shadow, or rounded corners when contained
    : `bg-white rounded-lg shadow-sm overflow-hidden border ${colors.border}`;

  return (
    <div id={`standard-${standard}`} className={containerClasses}>
      {/* Accordion Header - Domain colored background */}
      <button
        type="button"
        onClick={() => onToggle ? onToggle(standard) : setInternalOpen(!internalOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left bg-white hover:bg-gray-50 cursor-pointer transition-colors`}
      >
        <div className="flex items-center gap-3 flex-1 mr-10">
          <span className={`inline-flex items-center justify-center w-20 py-1.5 rounded text-base font-semibold ${colors.badge} text-white flex-shrink-0`}>
            {standard}
          </span>
          {description && (
            <span className={`text-sm ${colors.text}`}>
              {description}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`text-sm font-medium ${colors.text} whitespace-nowrap`}>
            {questions.length} {questions.length === 1 ? "question" : "questions"}
          </span>
          <svg
            className={`w-5 h-5 ${colors.text} transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
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
                hideStandardBadge={true}
                isSelected={selectedQuestions?.has(question.questionId) || false}
                onSelectionChange={onQuestionSelectionChange}
                showCheckbox={showCheckboxes}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
