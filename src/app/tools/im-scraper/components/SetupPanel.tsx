"use client";

import React from "react";
import { IMCredentials, SectionLessonSelection } from "../lib/types";
import { CredentialsForm } from "./CredentialsForm";
import { LessonSelectionForm } from "./LessonSelectionForm";
import { ClaudeExportToggle } from "./ClaudeExportToggle";
import { UrlPreview } from "./UrlPreview";
import { ActionButtons } from "./ActionButtons";
import { ErrorDisplay } from "./ErrorDisplay";

interface SetupPanelProps {
  credentials: IMCredentials;
  onCredentialsChange: (credentials: IMCredentials) => void;
  urlParams: {
    grade: number;
    startUnit: number;
    endUnit: number;
    selectedSections: string[];
    sectionLessons: SectionLessonSelection;
    delayBetweenRequests: number;
  };
  onUrlParamsChange: (
    updater: (
      prev: SetupPanelProps["urlParams"],
    ) => SetupPanelProps["urlParams"],
  ) => void;
  enableClaudeExport: boolean;
  onClaudeExportToggle: (enabled: boolean) => void;
  urls: string[];
  isLoading: boolean;
  isTesting: boolean;
  error: string | null;
  onGenerateUrls: () => void;
  onStartScraping: () => void;
  onDebugScrape: () => void;
  onTestUrl: (url: string) => void;
}

export function SetupPanel({
  credentials,
  onCredentialsChange,
  urlParams,
  onUrlParamsChange,
  enableClaudeExport,
  onClaudeExportToggle,
  urls,
  isLoading,
  isTesting,
  error,
  onGenerateUrls,
  onStartScraping,
  onDebugScrape,
  onTestUrl,
}: SetupPanelProps) {
  // Helper function to get available lessons (1-20)
  const getAvailableLessons = (): number[] => {
    return Array.from({ length: 20 }, (_, i) => i + 1);
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Step 1: Setup</h2>
        <p className="text-sm text-gray-600">
          Enter credentials and select specific lessons to scrape
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <CredentialsForm
          credentials={credentials}
          onCredentialsChange={onCredentialsChange}
        />

        <LessonSelectionForm
          urlParams={urlParams}
          onUrlParamsChange={onUrlParamsChange}
          getAvailableLessons={getAvailableLessons}
        />

        <ClaudeExportToggle
          enableClaudeExport={enableClaudeExport}
          onToggle={onClaudeExportToggle}
        />

        <UrlPreview urls={urls} />

        <ActionButtons
          urlParams={urlParams}
          credentials={credentials}
          urls={urls}
          isLoading={isLoading}
          isTesting={isTesting}
          onGenerateUrls={onGenerateUrls}
          onStartScraping={onStartScraping}
          onDebugScrape={onDebugScrape}
          onTestUrl={onTestUrl}
        />

        <ErrorDisplay error={error} />
      </div>
    </div>
  );
}
