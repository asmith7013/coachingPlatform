"use client";

import { useState } from 'react';
import { UnitScraperForm } from './components/UnitScraperForm';
import { BatchUnitResultDisplay } from './components/BatchUnitResultDisplay';
import { scrapeRoadmapUnits, scrapeRoadmapUnitsDebug } from './actions/scrape-units-batch';
import { UnitScraperCredentials, RoadmapOption, UnitScrapingResponse } from './lib/types';

export default function UnitScraperPage() {
  const [response, setResponse] = useState<UnitScrapingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScrape = async (
    credentials: UnitScraperCredentials,
    roadmap: RoadmapOption,
    delay: number,
    delayBetweenUnits: number
  ) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await scrapeRoadmapUnits({
        credentials,
        roadmap,
        delayBetweenRequests: delay,
        delayBetweenUnits
      });

      if (result.success && result.data) {
        setResponse(result.data);
      } else {
        setError(result.error || 'Scraping failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebugScrape = async (
    credentials: UnitScraperCredentials,
    roadmap: RoadmapOption,
    delay: number
  ) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await scrapeRoadmapUnitsDebug({
        credentials,
        roadmap,
        delayBetweenRequests: delay,
        delayBetweenUnits: 3000 // Longer delay for debug
      });

      if (result.success && result.data) {
        setResponse(result.data);
      } else {
        setError(result.error || 'Scraping failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setResponse(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: "1600px" }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Roadmaps Batch Unit Scraper</h1>
          <p className="mt-2 text-gray-600">
            Select a roadmap to automatically scrape all units and their skill relationships
          </p>
        </div>

        <div className="space-y-8">
          {/* Scraper Form */}
          <UnitScraperForm
            onSubmit={handleScrape}
            onDebugSubmit={handleDebugScrape}
            isLoading={isLoading}
            error={error}
          />

          {/* Results Display */}
          {(response || isLoading || error) && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Results</h2>
                <p className="text-sm text-gray-600">
                  Batch scraped unit data with all target skills and prerequisites
                </p>
              </div>

              <BatchUnitResultDisplay
                response={response}
                isLoading={isLoading}
                error={error}
                onClear={handleClear}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
