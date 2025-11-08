"use client";

import { useState } from 'react';
import { scrapeAndUpdateAssessmentData, scrapeAndUpdateAllSections } from '../actions/scrape-and-update';
import type { AssessmentScraperConfig } from '@/lib/schema/zod-schema/313/assessment-scraper';

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

interface BatchScraperResults {
  scrapeResults: {
    totalConfigs: number;
    successfulConfigs: number;
    failedConfigs: number;
    duration: string;
  };
  updateResults: {
    totalStudentsUpdated: number;
    configsProcessed: number;
    errors: string[];
  };
  totalDuration: string;
}

export function useAssessmentScraper() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ScraperResults | null>(null);
  const [batchResults, setBatchResults] = useState<BatchScraperResults | null>(null);

  const scrapeAndUpdate = async (config: AssessmentScraperConfig) => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    setBatchResults(null);

    try {
      const result = await scrapeAndUpdateAssessmentData(config);

      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }

      setResults(result.data || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Scraping error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const scrapeAndUpdateBatch = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    setBatchResults(null);

    try {
      const result = await scrapeAndUpdateAllSections(credentials);

      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }

      setBatchResults(result.data || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Batch scraping error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResults(null);
    setBatchResults(null);
    setError(null);
  };

  return {
    isLoading,
    error,
    results,
    batchResults,
    scrapeAndUpdate,
    scrapeAndUpdateBatch,
    reset
  };
}
