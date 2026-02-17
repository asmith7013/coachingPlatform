"use client";

import React from "react";
import { IMCredentials, SectionLessonSelection } from "../lib/types";
import { generateIMUrls as generateUrlsAction } from "../actions/scraper";

interface UseDashboardStateProps {
  clearError: () => void;
  reset: () => void;
}

export function useDashboardState({
  clearError,
  reset,
}: UseDashboardStateProps) {
  const [credentials, setCredentials] = React.useState<IMCredentials>({
    email: "alex.smith@teachinglab.org",
    password: "rFw&Yn3%7w2Dc502",
  });

  const [enableClaudeExport, setEnableClaudeExport] = React.useState(false);
  const [showClaudeProcessing, setShowClaudeProcessing] = React.useState(false);

  const [urlParams, setUrlParams] = React.useState({
    grade: 6,
    startUnit: 1,
    endUnit: 1,
    selectedSections: [] as string[],
    sectionLessons: {} as SectionLessonSelection,
    delayBetweenRequests: 2000,
  });

  const [urls, setUrls] = React.useState<string[]>([]);

  const handleCredentialsChange = (newCredentials: IMCredentials) => {
    setCredentials(newCredentials);
    clearError();
  };

  const handleGenerateUrls = async () => {
    try {
      const response = await generateUrlsAction({
        grade: urlParams.grade,
        startUnit: urlParams.startUnit,
        endUnit: urlParams.endUnit,
        sectionLessons: urlParams.sectionLessons,
        delayBetweenRequests: urlParams.delayBetweenRequests,
      });

      if (response.success && response.data) {
        setUrls(response.data.urls);
      } else {
        clearError();
        console.error("URL generation failed:", response.error);
      }
    } catch (err) {
      console.error("URL generation error:", err);
      clearError();
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        "This will clear all results and reset the scraper. Are you sure?",
      )
    ) {
      reset();
      setCredentials({
        email: "alex.smith@teachinglab.org",
        password: "rFw&Yn3%7w2Dc502",
      });
      setUrlParams({
        grade: 6,
        startUnit: 1,
        endUnit: 1,
        selectedSections: [],
        sectionLessons: {},
        delayBetweenRequests: 2000,
      });
      setUrls([]);
      setEnableClaudeExport(false);
      setShowClaudeProcessing(false);
    }
  };

  return {
    credentials,
    setCredentials,
    handleCredentialsChange,
    enableClaudeExport,
    setEnableClaudeExport,
    showClaudeProcessing,
    setShowClaudeProcessing,
    urlParams,
    setUrlParams,
    urls,
    setUrls,
    handleGenerateUrls,
    handleReset,
  };
}
