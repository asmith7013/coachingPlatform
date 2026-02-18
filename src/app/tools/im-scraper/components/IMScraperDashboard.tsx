"use client";

import React from "react";
import { useIMScraper } from "../hooks/useIMScraper";
import { useDashboardState } from "../hooks/useDashboardState";
import { DashboardHeader } from "./DashboardHeader";
import { SetupPanel } from "./SetupPanel";
import { ResultsSection } from "./ResultsSection";
import { InstructionsPanel } from "./InstructionsPanel";

export function IMScraperDashboard() {
  const {
    results,
    isLoading,
    error,
    lastResponse,
    isTesting,
    scrapeCustomUrls,
    scrapeCustomUrlsDebug,
    testUrl,
    clearResults,
    clearError,
    reset,
  } = useIMScraper();

  const {
    credentials,
    handleCredentialsChange,
    enableClaudeExport,
    setEnableClaudeExport,
    urlParams,
    setUrlParams,
    urls,
    handleGenerateUrls,
    handleReset,
  } = useDashboardState({ clearError, reset });

  const handleStartScraping = async () => {
    await scrapeCustomUrls(
      credentials,
      urls,
      urlParams.delayBetweenRequests,
      enableClaudeExport,
    );
  };

  const handleDebugScrape = async () => {
    console.log("🚀 Starting debug scraping session...");
    await scrapeCustomUrlsDebug(
      credentials,
      urls.slice(0, 2),
      urlParams.delayBetweenRequests,
      enableClaudeExport,
    );
  };

  const handleTestUrl = async (url: string) => {
    await testUrl(credentials, url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader onReset={handleReset} />

      <div className="space-y-8">
        <SetupPanel
          credentials={credentials}
          onCredentialsChange={handleCredentialsChange}
          urlParams={urlParams}
          onUrlParamsChange={setUrlParams}
          enableClaudeExport={enableClaudeExport}
          onClaudeExportToggle={setEnableClaudeExport}
          urls={urls}
          isLoading={isLoading}
          isTesting={isTesting}
          error={error}
          onGenerateUrls={handleGenerateUrls}
          onStartScraping={handleStartScraping}
          onDebugScrape={handleDebugScrape}
          onTestUrl={handleTestUrl}
        />

        <ResultsSection
          results={results}
          lastResponse={lastResponse}
          error={error}
          isLoading={isLoading}
          onClearResults={clearResults}
        />

        <InstructionsPanel />
      </div>
    </div>
  );
}
