"use client";

import React, { useState } from 'react';
import { Button } from '@/components/core/Button';
import { Alert } from '@/components/core/feedback/Alert';
import { scrapeStateTestPage, getStateTestStats } from '@/app/tools/state-test-scraper/actions/scrape';
import type { StateTestQuestion } from '@/app/tools/state-test-scraper/lib/types';

interface ScrapeStats {
  total: number;
  byGrade: Record<string, number>;
  byYear: Record<string, number>;
}

interface UrlStatus {
  url: string;
  grade: string;
  status: 'pending' | 'scraping' | 'completed' | 'error';
  count?: number;
  error?: string;
}

const EXAM_MONTHS = ['', 'January', 'June', 'August'] as const;

interface GradeUrls {
  grade: string;
  urls: string[];
  examYear: string;
  examTitle: string;
}

interface GradeConfig {
  urls: string;
  year: string;
  month: string;
}

export default function ProblemAtticScraperPage() {
  const defaultConfig: GradeConfig = { urls: '', year: '', month: '' };
  const [grade6, setGrade6] = useState<GradeConfig>(defaultConfig);
  const [grade7, setGrade7] = useState<GradeConfig>(defaultConfig);
  const [grade8, setGrade8] = useState<GradeConfig>(defaultConfig);
  const [alg1, setAlg1] = useState<GradeConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<StateTestQuestion[]>([]);
  const [stats, setStats] = useState<ScrapeStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [urlStatuses, setUrlStatuses] = useState<UrlStatus[]>([]);
  const [_currentUrlIndex, setCurrentUrlIndex] = useState<number | null>(null);

  const parseUrls = (input: string): string[] => {
    return input
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.startsWith('http'));
  };

  const buildExamTitle = (config: GradeConfig): string => {
    return config.month ? `${config.month} ${config.year}` : config.year;
  };

  const getAllGradeUrls = (): GradeUrls[] => {
    return [
      { grade: '6', urls: parseUrls(grade6.urls), examYear: grade6.year, examTitle: buildExamTitle(grade6) },
      { grade: '7', urls: parseUrls(grade7.urls), examYear: grade7.year, examTitle: buildExamTitle(grade7) },
      { grade: '8', urls: parseUrls(grade8.urls), examYear: grade8.year, examTitle: buildExamTitle(grade8) },
      { grade: 'alg1', urls: parseUrls(alg1.urls), examYear: alg1.year, examTitle: buildExamTitle(alg1) },
    ].filter(g => g.urls.length > 0 && g.examYear.length > 0);
  };

  const totalUrls = parseUrls(grade6.urls).length + parseUrls(grade7.urls).length + parseUrls(grade8.urls).length + parseUrls(alg1.urls).length;

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    const gradeUrls = getAllGradeUrls();
    if (gradeUrls.length === 0) return;

    setIsLoading(true);
    setError(null);
    setResults([]);

    // Flatten all URLs with their grades for status tracking
    const allUrlsWithGrades: { url: string; grade: string; examYear: string; examTitle: string }[] = [];
    for (const { grade, urls, examYear, examTitle } of gradeUrls) {
      for (const url of urls) {
        allUrlsWithGrades.push({ url, grade, examYear, examTitle });
      }
    }

    // Initialize URL statuses
    const initialStatuses: UrlStatus[] = allUrlsWithGrades.map(({ url, grade }) => ({
      url,
      grade,
      status: 'pending',
    }));
    setUrlStatuses(initialStatuses);

    const allResults: StateTestQuestion[] = [];

    // Process URLs sequentially
    for (let i = 0; i < allUrlsWithGrades.length; i++) {
      const { url, grade, examYear, examTitle } = allUrlsWithGrades[i];
      setCurrentUrlIndex(i);

      // Update status to scraping
      setUrlStatuses(prev => prev.map((s, idx) =>
        idx === i ? { ...s, status: 'scraping' } : s
      ));

      try {
        const result = await scrapeStateTestPage(url, grade, examYear, examTitle);

        if (result.success && result.questions) {
          allResults.push(...result.questions);
          setResults([...allResults]);

          // Update status to completed
          setUrlStatuses(prev => prev.map((s, idx) =>
            idx === i ? { ...s, status: 'completed', count: result.count } : s
          ));
        } else {
          // Update status to error
          setUrlStatuses(prev => prev.map((s, idx) =>
            idx === i ? { ...s, status: 'error', error: result.error } : s
          ));
        }
      } catch (err) {
        // Update status to error
        setUrlStatuses(prev => prev.map((s, idx) =>
          idx === i ? { ...s, status: 'error', error: err instanceof Error ? err.message : 'Unknown error' } : s
        ));
      }
    }

    setCurrentUrlIndex(null);
    setIsLoading(false);
  };

  const handleLoadStats = async () => {
    setIsLoadingStats(true);
    try {
      const result = await getStateTestStats();
      if (result.success && result.stats) {
        setStats(result.stats);
      } else {
        setError(result.error || 'Failed to load stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleReset = () => {
    setGrade6(defaultConfig);
    setGrade7(defaultConfig);
    setGrade8(defaultConfig);
    setAlg1(defaultConfig);
    setResults([]);
    setError(null);
    setUrlStatuses([]);
    setCurrentUrlIndex(null);
  };

  const completedCount = urlStatuses.filter(s => s.status === 'completed').length;
  const errorCount = urlStatuses.filter(s => s.status === 'error').length;

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: "1600px" }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Problem Attic Scraper</h1>
            <p className="mt-2 text-gray-600">
              Extract state test questions from Problem Attic
            </p>
          </div>

          {(results.length > 0 || error || urlStatuses.length > 0) && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Scraper Form */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Scrape Questions by Grade
            </h2>
            <p className="text-sm text-gray-600">
              Enter Problem Attic page URLs (one per line) for each grade level
            </p>
          </div>

          <form onSubmit={handleScrape} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {([
                { label: 'Grade 6', config: grade6, setConfig: setGrade6, colorClass: 'blue' },
                { label: 'Grade 7', config: grade7, setConfig: setGrade7, colorClass: 'purple' },
                { label: 'Grade 8', config: grade8, setConfig: setGrade8, colorClass: 'orange' },
                { label: 'Algebra 1', config: alg1, setConfig: setAlg1, colorClass: 'green' },
              ] as const).map(({ label, config, setConfig, colorClass }) => (
                <div key={label} className="space-y-2">
                  <span className="inline-flex items-center gap-2">
                    <span className={`bg-${colorClass}-100 text-${colorClass}-800 px-2 py-0.5 rounded text-xs font-semibold`}>{label}</span>
                    URLs ({parseUrls(config.urls).length})
                  </span>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={config.year}
                      onChange={(e) => setConfig({ ...config, year: e.target.value })}
                      placeholder="Year"
                      className="w-20 px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      disabled={isLoading}
                    />
                    <select
                      value={config.month}
                      onChange={(e) => setConfig({ ...config, month: e.target.value })}
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      disabled={isLoading}
                    >
                      {EXAM_MONTHS.map((m) => (
                        <option key={m} value={m}>{m || '(no month)'}</option>
                      ))}
                    </select>
                  </div>

                  <textarea
                    value={config.urls}
                    onChange={(e) => setConfig({ ...config, urls: e.target.value })}
                    placeholder="https://www.problem-attic.com/..."
                    rows={4}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-${colorClass}-500 focus:border-${colorClass}-500 font-mono text-sm`}
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>

            {error && (
              <Alert intent="error">
                <Alert.Title>Error</Alert.Title>
                <Alert.Description>{error}</Alert.Description>
              </Alert>
            )}

            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={totalUrls === 0 || isLoading}
                intent="primary"
                fullWidth={false}
              >
                {isLoading ? `Scraping (${completedCount + 1}/${totalUrls})...` : `Scrape ${totalUrls} Page${totalUrls !== 1 ? 's' : ''}`}
              </Button>

              <Button
                type="button"
                onClick={handleLoadStats}
                disabled={isLoadingStats}
                intent="secondary"
                appearance="outline"
                fullWidth={false}
              >
                {isLoadingStats ? 'Loading...' : 'View Database Stats'}
              </Button>
            </div>
          </form>
        </div>

        {/* URL Progress */}
        {urlStatuses.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Scraping Progress ({completedCount}/{urlStatuses.length} completed{errorCount > 0 ? `, ${errorCount} errors` : ''})
            </h2>

            <div className="space-y-2">
              {urlStatuses.map((status, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    status.status === 'scraping' ? 'bg-blue-50 border border-blue-200' :
                    status.status === 'completed' ? 'bg-green-50 border border-green-200' :
                    status.status === 'error' ? 'bg-red-50 border border-red-200' :
                    'bg-gray-50 border border-gray-200'
                  }`}
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {status.status === 'pending' && (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    {status.status === 'scraping' && (
                      <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    )}
                    {status.status === 'completed' && (
                      <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {status.status === 'error' && (
                      <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Grade Badge */}
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-semibold ${
                    status.grade === '6' ? 'bg-blue-100 text-blue-800' :
                    status.grade === '7' ? 'bg-purple-100 text-purple-800' :
                    status.grade === 'alg1' ? 'bg-green-100 text-green-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {status.grade === 'alg1' ? 'Alg1' : `G${status.grade}`}
                  </span>

                  {/* URL and Status */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-mono truncate text-gray-700">
                      {status.url}
                    </div>
                    {status.status === 'completed' && status.count !== undefined && (
                      <div className="text-xs text-green-600">
                        {status.count} questions scraped
                      </div>
                    )}
                    {status.status === 'error' && status.error && (
                      <div className="text-xs text-red-600">
                        {status.error}
                      </div>
                    )}
                  </div>

                  {/* Index */}
                  <div className="text-sm text-gray-500">
                    #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Display */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Database Statistics</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-700">{stats.total}</div>
                <div className="text-sm text-blue-600">Total Questions</div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-lg font-semibold text-purple-700">By Grade</div>
                <div className="text-sm text-purple-600 mt-1">
                  {Object.entries(stats.byGrade).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([grade, count]) => (
                    <div key={grade}>Grade {grade}: {count}</div>
                  ))}
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-lg font-semibold text-orange-700">By Year</div>
                <div className="text-sm text-orange-600 mt-1">
                  {Object.entries(stats.byYear).sort(([a], [b]) => parseInt(b) - parseInt(a)).map(([year, count]) => (
                    <div key={year}>{year}: {count}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Scraped Questions</h2>
                <p className="text-sm text-gray-600">{results.length} questions extracted</p>
              </div>

              <Button
                type="button"
                onClick={() => {
                  const json = JSON.stringify(results, null, 2);
                  navigator.clipboard.writeText(json);
                }}
                intent="secondary"
                appearance="outline"
                padding="sm"
              >
                Copy JSON
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((question) => (
                <div
                  key={question.questionId}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {question.questionId}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Grade {question.grade}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    <div><strong>Standard:</strong> {question.standard}</div>
                    <div><strong>Type:</strong> {question.questionType}</div>
                    <div><strong>Year:</strong> {question.examYear}</div>
                  </div>

                  {question.screenshotUrl && (
                    <a
                      href={question.screenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Screenshot →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">How to Use</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Getting Started</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ensure env vars are set (see below)</li>
                <li>• Paste Problem Attic page URLs (one per line)</li>
                <li>• Click &quot;Scrape Pages&quot; to extract questions</li>
                <li>• Each URL runs sequentially with a fresh browser session</li>
                <li>• Questions are saved to the database automatically</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">What Gets Extracted</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Question ID and standard</li>
                <li>• Grade level and exam year</li>
                <li>• Question type (multiple choice, etc.)</li>
                <li>• Screenshot uploaded to Vercel Blob</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-800 mb-2">Required Environment Variables</h4>
            <div className="bg-gray-100 rounded p-3 font-mono text-sm text-gray-700">
              <div>PROBLEM_ATTIC_EMAIL=your-email@example.com</div>
              <div>PROBLEM_ATTIC_PASSWORD=your-password</div>
              <div>BLOB_READ_WRITE_TOKEN=your-vercel-blob-token</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
