"use client";

import React from "react";
import { ResultsDisplay } from "./ResultsDisplay";
import { IMLesson, IMScrapingResponse } from "../lib/types";

interface ResultsSectionProps {
  results: IMLesson[];
  lastResponse: unknown;
  error: string | null;
  isLoading: boolean;
  onClearResults: () => void;
}

export function ResultsSection({
  results,
  lastResponse,
  error,
  isLoading,
  onClearResults,
}: ResultsSectionProps) {
  if (results.length === 0 && !isLoading) return null;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Step 2: Results</h2>
        <p className="text-sm text-gray-600">View and export scraped content</p>
      </div>

      <ResultsDisplay
        results={results}
        lastResponse={lastResponse as IMScrapingResponse}
        error={error}
        isLoading={isLoading}
        onClearResults={onClearResults}
      />
    </div>
  );
}
