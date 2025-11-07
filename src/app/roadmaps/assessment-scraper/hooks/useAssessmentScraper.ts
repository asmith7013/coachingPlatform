"use client";

import { useState } from 'react';
import { scrapeAndUpdateAssessmentData } from '../actions/scrape-and-update';
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

export function useAssessmentScraper() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ScraperResults | null>(null);

  const scrapeAndUpdate = async (config: AssessmentScraperConfig) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const result = await scrapeAndUpdateAssessmentData(config);

      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }

      setResults(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Scraping error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResults(null);
    setError(null);
  };

  return {
    isLoading,
    error,
    results,
    scrapeAndUpdate,
    reset
  };
}
