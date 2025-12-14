"use client";

import React from 'react';
import { useAssessmentScraper } from './hooks/useAssessmentScraper';
import { AssessmentScraperForm } from './components/AssessmentScraperForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import type { AssessmentScraperConfig } from '@/lib/schema/zod-schema/scm/assessment-scraper';

export default function AssessmentScraperPage() {
  const {
    isLoading,
    error,
    results,
    batchResults,
    scrapeAndUpdate,
    scrapeAndUpdateBatch,
    reset
  } = useAssessmentScraper();

  const handleSubmit = async (config: AssessmentScraperConfig) => {
    await scrapeAndUpdate(config);
  };

  const handleBatchSubmit = async () => {
    await scrapeAndUpdateBatch({
      email: 'alex.smith@teachinglab.org',
      password: 'rbx1KQD3fpv7qhd!erc'
    });
  };

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: "1600px" }}>
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
        {/* Batch Scrape All Sections Button */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Scrape All Sections
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Automatically scrape all 8 sections (9 total configurations including 802&apos;s dual roadmaps) with a single login.
                This will process: 603/605, 604, 704, 703/705, 802 (Algebra 1 + 8th Grade), 803, 804, 805.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ One login, multiple scrapes</li>
                <li>✅ Section 802 automatically scrapes both Algebra 1 and 8th Grade</li>
                <li>✅ Automatically updates MongoDB with all assessment data</li>
                <li>⏱️ Estimated time: 10-15 minutes</li>
              </ul>
            </div>
            <button
              onClick={handleBatchSubmit}
              disabled={isLoading}
              className={`
                ml-6 px-6 py-3 rounded-lg font-medium text-white shadow-md
                transition-all duration-200
                ${isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg'
                }
              `}
            >
              {isLoading ? 'Scraping...' : 'Scrape All Sections'}
            </button>
          </div>
        </div>

        {/* Single Section Scraper Form */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Or Scrape a Single Section
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Use the form below to scrape individual sections one at a time.
          </p>
        </div>

        <AssessmentScraperForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />

        {/* Results Display */}
        {(results || batchResults || isLoading || error) && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Results</h2>
              <p className="text-sm text-gray-600">
                Scraping and update results
              </p>
            </div>

            <ResultsDisplay
              results={results}
              batchResults={batchResults}
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
                <li>• <strong>Current status</strong> - Mastered, Attempted But Not Mastered, or Not Started</li>
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
