"use client";

import React from 'react';
import { SectionLessonSelection } from '../lib/types';

interface ActionButtonsProps {
  urlParams: {
    selectedSections: string[];
    sectionLessons: SectionLessonSelection;
  };
  credentials: {
    email: string;
    password: string;
  };
  urls: string[];
  isLoading: boolean;
  isTesting: boolean;
  onGenerateUrls: () => void;
  onStartScraping: () => void;
  onDebugScrape: () => void;
  onTestUrl: (url: string) => void;
}

export function ActionButtons({
  urlParams,
  credentials,
  urls,
  isLoading,
  isTesting,
  onGenerateUrls,
  onStartScraping,
  onDebugScrape,
  onTestUrl
}: ActionButtonsProps) {
  const hasSelectedLessons = Object.values(urlParams.sectionLessons).some(lessons => lessons.length > 0);
  const totalSelectedLessons = Object.values(urlParams.sectionLessons).flat().length;
  const hasCredentials = credentials.email && credentials.password;

  return (
    <div className="flex gap-4">
      <button
        onClick={onGenerateUrls}
        disabled={urlParams.selectedSections.length === 0 || !hasSelectedLessons}
        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
      >
        Preview URLs ({totalSelectedLessons})
      </button>
      
      <button
        onClick={onStartScraping}
        disabled={isLoading || !hasCredentials || urls.length === 0}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Scraping...' : 'Start Scraping'}
      </button>
      
      <button
        onClick={onDebugScrape}
        disabled={isLoading || !hasCredentials || urls.length === 0}
        className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
      >
        🔍 Debug Scrape
      </button>
      
      {urls.length > 0 && (
        <button
          onClick={() => onTestUrl(urls[0])}
          disabled={isTesting}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isTesting ? 'Testing...' : 'Test First URL'}
        </button>
      )}
    </div>
  );
}
