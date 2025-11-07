"use client";

import React from 'react';
import { useAssessmentScraper } from './hooks/useAssessmentScraper';
import { AssessmentScraperForm } from './components/AssessmentScraperForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import type { AssessmentScraperConfig } from '@/lib/schema/zod-schema/313/assessment-scraper';

export default function AssessmentScraperPage() {
  const {
    isLoading,
    error,
    results,
    scrapeAndUpdate,
    reset
  } = useAssessmentScraper();

  const handleSubmit = async (config: AssessmentScraperConfig) => {
    await scrapeAndUpdate(config);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assessment History Scraper</h1>
            <p className="mt-2 text-gray-600">
              Automatically scrape assessment data from Roadmaps and update student records
            </p>
          </div>

          {(results || error) && (
            <button
              onClick={reset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Scraper Form */}
        <AssessmentScraperForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />

        {/* Results Display */}
        {(results || isLoading || error) && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Results</h2>
              <p className="text-sm text-gray-600">
                Scraping and update results
              </p>
            </div>

            <ResultsDisplay
              results={results}
              error={error}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">How It Works</h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Process Overview</h4>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>Authenticates with Teach to One Roadmaps</li>
                <li>Navigates to Assessment History page</li>
                <li>Applies your selected filters (class, roadmap, grades)</li>
                <li>Exports assessment data as CSV</li>
                <li>Parses CSV and processes student attempts</li>
                <li>Updates MongoDB with attempt history, mastery dates, and best scores</li>
              </ol>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">What Gets Tracked</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>All attempts</strong> for each skill (attempt #, date, score, pass/fail)</li>
                <li>• <strong>Best score</strong> achieved across all attempts</li>
                <li>• <strong>Mastery date</strong> - when student first passed (≥80%)</li>
                <li>• <strong>Attempt count</strong> and last attempt date</li>
                <li>• <strong>Current status</strong> - Demonstrated, Attempted But Not Passed, or Not Started</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> This scraper uses headless browser automation and may take several minutes depending on the amount of data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
