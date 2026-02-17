"use client";

import React, { useState } from "react";
import { Button } from "@/components/core/Button";
import { Alert } from "@/components/core/feedback/Alert";
import {
  scrapeStateTestPage,
  getStateTestStats,
} from "@/app/tools/state-test-scraper/actions/scrape";
import type { StateTestQuestion } from "@/app/tools/state-test-scraper/lib/types";

interface ScrapeStats {
  total: number;
  byGrade: Record<string, number>;
  byYear: Record<string, number>;
}

interface UrlStatus {
  url: string;
  grade: string;
  status: "pending" | "scraping" | "completed" | "error";
  count?: number;
  error?: string;
}

const EXAM_MONTHS = ["", "January", "June", "August"] as const;

interface GradeUrls {
  grade: string;
  entries: { url: string; examYear: string; examTitle: string }[];
}

interface UrlEntry {
  url: string;
  year: string;
  month: string;
}

export default function ProblemAtticScraperPage() {
  const emptyEntry = (): UrlEntry => ({ url: "", year: "", month: "" });
  const [grade6, setGrade6] = useState<UrlEntry[]>([emptyEntry()]);
  const [grade7, setGrade7] = useState<UrlEntry[]>([emptyEntry()]);
  const [grade8, setGrade8] = useState<UrlEntry[]>([emptyEntry()]);
  const [alg1, setAlg1] = useState<UrlEntry[]>([emptyEntry()]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<StateTestQuestion[]>([]);
  const [stats, setStats] = useState<ScrapeStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [urlStatuses, setUrlStatuses] = useState<UrlStatus[]>([]);
  const [_currentUrlIndex, setCurrentUrlIndex] = useState<number | null>(null);

  const buildExamTitle = (entry: UrlEntry): string => {
    return entry.month ? `${entry.month} ${entry.year}` : entry.year;
  };

  const updateEntry = (
    entries: UrlEntry[],
    setEntries: React.Dispatch<React.SetStateAction<UrlEntry[]>>,
    index: number,
    field: keyof UrlEntry,
    value: string,
  ) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)),
    );
  };

  const addEntry = (
    setEntries: React.Dispatch<React.SetStateAction<UrlEntry[]>>,
  ) => {
    setEntries((prev) => [...prev, emptyEntry()]);
  };

  const removeEntry = (
    setEntries: React.Dispatch<React.SetStateAction<UrlEntry[]>>,
    index: number,
  ) => {
    setEntries((prev) =>
      prev.length <= 1 ? [emptyEntry()] : prev.filter((_, i) => i !== index),
    );
  };

  const getValidEntries = (entries: UrlEntry[]) =>
    entries.filter(
      (e) => e.url.trim().startsWith("http") && e.year.trim().length > 0,
    );

  const getAllGradeUrls = (): GradeUrls[] => {
    return [
      {
        grade: "6",
        entries: getValidEntries(grade6).map((e) => ({
          url: e.url.trim(),
          examYear: e.year.trim(),
          examTitle: buildExamTitle(e),
        })),
      },
      {
        grade: "7",
        entries: getValidEntries(grade7).map((e) => ({
          url: e.url.trim(),
          examYear: e.year.trim(),
          examTitle: buildExamTitle(e),
        })),
      },
      {
        grade: "8",
        entries: getValidEntries(grade8).map((e) => ({
          url: e.url.trim(),
          examYear: e.year.trim(),
          examTitle: buildExamTitle(e),
        })),
      },
      {
        grade: "alg1",
        entries: getValidEntries(alg1).map((e) => ({
          url: e.url.trim(),
          examYear: e.year.trim(),
          examTitle: buildExamTitle(e),
        })),
      },
    ].filter((g) => g.entries.length > 0);
  };

  const totalUrls =
    getValidEntries(grade6).length +
    getValidEntries(grade7).length +
    getValidEntries(grade8).length +
    getValidEntries(alg1).length;

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    const gradeUrls = getAllGradeUrls();
    if (gradeUrls.length === 0) return;

    setIsLoading(true);
    setError(null);
    setResults([]);

    // Flatten all URLs with their grades for status tracking
    const allUrlsWithGrades: {
      url: string;
      grade: string;
      examYear: string;
      examTitle: string;
    }[] = [];
    for (const { grade, entries } of gradeUrls) {
      for (const { url, examYear, examTitle } of entries) {
        allUrlsWithGrades.push({ url, grade, examYear, examTitle });
      }
    }

    // Initialize URL statuses
    const initialStatuses: UrlStatus[] = allUrlsWithGrades.map(
      ({ url, grade }) => ({
        url,
        grade,
        status: "pending",
      }),
    );
    setUrlStatuses(initialStatuses);

    const allResults: StateTestQuestion[] = [];

    // Process URLs sequentially
    for (let i = 0; i < allUrlsWithGrades.length; i++) {
      const { url, grade, examYear, examTitle } = allUrlsWithGrades[i];
      setCurrentUrlIndex(i);

      // Update status to scraping
      setUrlStatuses((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: "scraping" } : s)),
      );

      try {
        const result = await scrapeStateTestPage(
          url,
          grade,
          examYear,
          examTitle,
        );

        if (result.success && result.questions) {
          allResults.push(...result.questions);
          setResults([...allResults]);

          // Update status to completed
          setUrlStatuses((prev) =>
            prev.map((s, idx) =>
              idx === i
                ? { ...s, status: "completed", count: result.count }
                : s,
            ),
          );
        } else {
          // Update status to error
          setUrlStatuses((prev) =>
            prev.map((s, idx) =>
              idx === i ? { ...s, status: "error", error: result.error } : s,
            ),
          );
        }
      } catch (err) {
        // Update status to error
        setUrlStatuses((prev) =>
          prev.map((s, idx) =>
            idx === i
              ? {
                  ...s,
                  status: "error",
                  error: err instanceof Error ? err.message : "Unknown error",
                }
              : s,
          ),
        );
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
        setError(result.error || "Failed to load stats");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleReset = () => {
    setGrade6([emptyEntry()]);
    setGrade7([emptyEntry()]);
    setGrade8([emptyEntry()]);
    setAlg1([emptyEntry()]);
    setResults([]);
    setError(null);
    setUrlStatuses([]);
    setCurrentUrlIndex(null);
  };

  const completedCount = urlStatuses.filter(
    (s) => s.status === "completed",
  ).length;
  const errorCount = urlStatuses.filter((s) => s.status === "error").length;

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
              Problem Attic Scraper
            </h1>
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
            <div className="space-y-6">
              {[
                {
                  label: "Grade 6",
                  entries: grade6,
                  setEntries: setGrade6,
                  colorClass: "blue",
                },
                {
                  label: "Grade 7",
                  entries: grade7,
                  setEntries: setGrade7,
                  colorClass: "purple",
                },
                {
                  label: "Grade 8",
                  entries: grade8,
                  setEntries: setGrade8,
                  colorClass: "orange",
                },
                {
                  label: "Algebra 1",
                  entries: alg1,
                  setEntries: setAlg1,
                  colorClass: "green",
                },
              ].map(({ label, entries, setEntries, colorClass }) => (
                <div key={label} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`bg-${colorClass}-100 text-${colorClass}-800 px-2 py-0.5 rounded text-xs font-semibold`}
                    >
                      {label}
                    </span>
                    <span className="text-sm text-gray-500">
                      {getValidEntries(entries).length} valid{" "}
                      {getValidEntries(entries).length === 1 ? "URL" : "URLs"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {entries.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={entry.url}
                          onChange={(e) =>
                            updateEntry(
                              entries,
                              setEntries,
                              idx,
                              "url",
                              e.target.value,
                            )
                          }
                          placeholder="https://www.problem-attic.com/..."
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                          disabled={isLoading}
                        />
                        <input
                          type="text"
                          value={entry.year}
                          onChange={(e) =>
                            updateEntry(
                              entries,
                              setEntries,
                              idx,
                              "year",
                              e.target.value,
                            )
                          }
                          placeholder="Year"
                          className="w-20 px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          disabled={isLoading}
                        />
                        <select
                          value={entry.month}
                          onChange={(e) =>
                            updateEntry(
                              entries,
                              setEntries,
                              idx,
                              "month",
                              e.target.value,
                            )
                          }
                          className="w-32 px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          disabled={isLoading}
                        >
                          {EXAM_MONTHS.map((m) => (
                            <option key={m} value={m}>
                              {m || "(no month)"}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeEntry(setEntries, idx)}
                          className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 cursor-pointer"
                          disabled={isLoading}
                          title="Remove row"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addEntry(setEntries)}
                    className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                    disabled={isLoading}
                  >
                    + Add URL
                  </button>
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
                {isLoading
                  ? `Scraping (${completedCount + 1}/${totalUrls})...`
                  : `Scrape ${totalUrls} Page${totalUrls !== 1 ? "s" : ""}`}
              </Button>

              <Button
                type="button"
                onClick={handleLoadStats}
                disabled={isLoadingStats}
                intent="secondary"
                appearance="outline"
                fullWidth={false}
              >
                {isLoadingStats ? "Loading..." : "View Database Stats"}
              </Button>
            </div>
          </form>
        </div>

        {/* URL Progress */}
        {urlStatuses.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Scraping Progress ({completedCount}/{urlStatuses.length} completed
              {errorCount > 0 ? `, ${errorCount} errors` : ""})
            </h2>

            <div className="space-y-2">
              {urlStatuses.map((status, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    status.status === "scraping"
                      ? "bg-blue-50 border border-blue-200"
                      : status.status === "completed"
                        ? "bg-green-50 border border-green-200"
                        : status.status === "error"
                          ? "bg-red-50 border border-red-200"
                          : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {status.status === "pending" && (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    {status.status === "scraping" && (
                      <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    )}
                    {status.status === "completed" && (
                      <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                        <svg
                          className="h-3 w-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                    {status.status === "error" && (
                      <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                        <svg
                          className="h-3 w-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Grade Badge */}
                  <span
                    className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-semibold ${
                      status.grade === "6"
                        ? "bg-blue-100 text-blue-800"
                        : status.grade === "7"
                          ? "bg-purple-100 text-purple-800"
                          : status.grade === "alg1"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {status.grade === "alg1" ? "Alg1" : `G${status.grade}`}
                  </span>

                  {/* URL and Status */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-mono truncate text-gray-700">
                      {status.url}
                    </div>
                    {status.status === "completed" &&
                      status.count !== undefined && (
                        <div className="text-xs text-green-600">
                          {status.count} questions scraped
                        </div>
                      )}
                    {status.status === "error" && status.error && (
                      <div className="text-xs text-red-600">{status.error}</div>
                    )}
                  </div>

                  {/* Index */}
                  <div className="text-sm text-gray-500">#{idx + 1}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Display */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Database Statistics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-700">
                  {stats.total}
                </div>
                <div className="text-sm text-blue-600">Total Questions</div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-lg font-semibold text-purple-700">
                  By Grade
                </div>
                <div className="text-sm text-purple-600 mt-1">
                  {Object.entries(stats.byGrade)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([grade, count]) => (
                      <div key={grade}>
                        Grade {grade}: {count}
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-lg font-semibold text-orange-700">
                  By Year
                </div>
                <div className="text-sm text-orange-600 mt-1">
                  {Object.entries(stats.byYear)
                    .sort(([a], [b]) => parseInt(b) - parseInt(a))
                    .map(([year, count]) => (
                      <div key={year}>
                        {year}: {count}
                      </div>
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
                <h2 className="text-xl font-semibold text-gray-800">
                  Scraped Questions
                </h2>
                <p className="text-sm text-gray-600">
                  {results.length} questions extracted
                </p>
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
                    <div>
                      <strong>Standard:</strong> {question.standard}
                    </div>
                    <div>
                      <strong>Type:</strong> {question.questionType}
                    </div>
                    <div>
                      <strong>Year:</strong> {question.examYear}
                    </div>
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
              <h4 className="font-medium text-gray-800 mb-2">
                Getting Started
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ensure env vars are set (see below)</li>
                <li>• Paste Problem Attic page URLs (one per line)</li>
                <li>• Click &quot;Scrape Pages&quot; to extract questions</li>
                <li>
                  • Each URL runs sequentially with a fresh browser session
                </li>
                <li>• Questions are saved to the database automatically</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">
                What Gets Extracted
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Question ID and standard</li>
                <li>• Grade level and exam year</li>
                <li>• Question type (multiple choice, etc.)</li>
                <li>• Screenshot uploaded to Vercel Blob</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-800 mb-2">
              Required Environment Variables
            </h4>
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
