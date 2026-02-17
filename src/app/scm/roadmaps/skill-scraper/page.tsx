"use client";

import React from "react";
import { useRoadmapsScraper } from "./hooks/useRoadmapsScraper";
import { RoadmapsScraperForm } from "./components/RoadmapsScraperForm";
import { ResultsDisplay } from "./components/ResultsDisplay";
import { Alert } from "@/components/core/feedback/Alert";
import { RoadmapsCredentials } from "./lib/types";

export default function RoadmapsScraperPage() {
  const {
    results,
    isLoading,
    error,
    lastResponse,
    isValidating,
    validationResult,
    currentSkillNumber,
    currentSkillIndex,
    totalSkills,
    scrapeSkills,
    scrapeSkillsDebug,
    validateCredentials,
    clearResults,
    // clearError,
    reset,
  } = useRoadmapsScraper();

  const handleSubmit = async (
    credentials: RoadmapsCredentials,
    urls: string[],
    delay: number,
  ) => {
    await scrapeSkills(credentials, urls, delay);
  };

  const handleDebugSubmit = async (
    credentials: RoadmapsCredentials,
    urls: string[],
    delay: number,
  ) => {
    await scrapeSkillsDebug(credentials, urls, delay);
  };

  const handleValidateCredentials = async (
    credentials: RoadmapsCredentials,
  ) => {
    await validateCredentials(credentials);
  };

  return (
    <div
      className="mx-auto px-4 sm:px-6 lg:px-8 py-8"
      style={{ maxWidth: "1600px" }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Roadmaps Skill Scraper
            </h1>
            <p className="mt-2 text-gray-600">
              Extract educational skill content from Teach to One Roadmaps
              platform
            </p>
          </div>

          {(results.length > 0 || error) && (
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
        {/* Validation Success Message */}
        {validationResult?.authenticated && (
          <Alert intent="success">
            <Alert.Title>Credentials Valid</Alert.Title>
            <Alert.Description>{validationResult.message}</Alert.Description>
          </Alert>
        )}

        {/* Scraper Form */}
        <RoadmapsScraperForm
          onSubmit={handleSubmit}
          onDebugSubmit={handleDebugSubmit}
          onValidateCredentials={handleValidateCredentials}
          isLoading={isLoading}
          isValidating={isValidating}
          error={error}
        />

        {/* Progress Indicator */}
        {isLoading && currentSkillNumber && totalSkills && (
          <Alert intent="info">
            <Alert.Title>Scraping in Progress</Alert.Title>
            <Alert.Description>
              Currently scraping skill <strong>{currentSkillNumber}</strong>
              {currentSkillIndex !== undefined && (
                <span className="ml-1">
                  ({currentSkillIndex + 1} of {totalSkills})
                </span>
              )}
            </Alert.Description>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${currentSkillIndex !== undefined ? ((currentSkillIndex + 1) / totalSkills) * 100 : 0}%`,
                }}
              />
            </div>
          </Alert>
        )}

        {/* Results Display */}
        {(results.length > 0 || isLoading || error) && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Results</h2>
              <p className="text-sm text-gray-600">
                Scraped skill content and extraction results
              </p>
            </div>

            <ResultsDisplay
              results={results}
              lastResponse={lastResponse}
              error={error}
              isLoading={isLoading}
              onClearResults={clearResults}
            />
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">How to Use</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">
                Getting Started
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Enter your Roadmaps login credentials</li>
                <li>• Paste skill URLs (one per line)</li>
                <li>• Test credentials before scraping</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">
                What Gets Extracted
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Skill title and description</li>
                <li>• Essential questions and criteria</li>
                <li>• Teaching strategies and resources</li>
                <li>• Standards and vocabulary</li>
                <li>• Images and additional materials</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Example URL format:</strong>{" "}
              https://roadmaps.teachtoone.org/skill/660
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
