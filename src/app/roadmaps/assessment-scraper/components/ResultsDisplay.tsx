"use client";

import React from 'react';
import { Alert } from '@/components/core/feedback/Alert';

interface ScraperResults {
  scrapeResults: {
    totalRows: number;
    studentsProcessed: number;
    skillsProcessed: number;
    duration: string;
  };
  updateResults: {
    studentsUpdated: number;
    totalStudents: number;
    errors: string[];
  };
}

interface ResultsDisplayProps {
  results: ScraperResults | null;
  error: string | null;
  isLoading: boolean;
}

export function ResultsDisplay({ results, error, isLoading }: ResultsDisplayProps) {
  if (isLoading) {
    return (
      <Alert intent="info">
        <Alert.Title>Scraping in Progress</Alert.Title>
        <Alert.Description>
          Please wait while we scrape assessment data and update student records...
        </Alert.Description>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert intent="error">
        <Alert.Title>Error</Alert.Title>
        <Alert.Description>{error}</Alert.Description>
      </Alert>
    );
  }

  if (!results) {
    return null;
  }

  const hasErrors = results.updateResults.errors.length > 0;

  return (
    <div className="space-y-4">
      {/* Success Message */}
      <Alert intent={hasErrors ? "warning" : "success"}>
        <Alert.Title>
          {hasErrors ? 'Completed with Warnings' : 'Success!'}
        </Alert.Title>
        <Alert.Description>
          Assessment data scraped and student records updated
        </Alert.Description>
      </Alert>

      {/* Scraping Results */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Scraping Results</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-500">Total Rows</div>
            <div className="text-2xl font-semibold text-gray-900">
              {results.scrapeResults.totalRows}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Students</div>
            <div className="text-2xl font-semibold text-gray-900">
              {results.scrapeResults.studentsProcessed}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Skills</div>
            <div className="text-2xl font-semibold text-gray-900">
              {results.scrapeResults.skillsProcessed}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Duration</div>
            <div className="text-2xl font-semibold text-gray-900">
              {results.scrapeResults.duration}
            </div>
          </div>
        </div>
      </div>

      {/* Update Results */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Database Update Results</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Students Updated</div>
            <div className="text-2xl font-semibold text-green-600">
              {results.updateResults.studentsUpdated}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Students</div>
            <div className="text-2xl font-semibold text-gray-900">
              {results.updateResults.totalStudents}
            </div>
          </div>
        </div>

        {/* Errors */}
        {hasErrors && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-red-600 mb-2">
              Errors ({results.updateResults.errors.length})
            </h4>
            <ul className="space-y-1">
              {results.updateResults.errors.map((error, index) => (
                <li key={index} className="text-sm text-gray-600">
                  • {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
