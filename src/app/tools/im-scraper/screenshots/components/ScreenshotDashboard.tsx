"use client";

import { useState } from "react";
import {
  screenshotStudentTasks,
  type ScreenshotResult,
} from "../../actions/screenshot-scraper";
import { AuthenticationForm } from "../../components/AuthenticationForm";
import type { IMCredentials } from "../../lib/types";

export function ScreenshotDashboard() {
  const [credentials, setCredentials] = useState<IMCredentials | null>(null);
  const [urls, setUrls] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ScreenshotResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalRequested: number;
    totalSuccessful: number;
    totalFailed: number;
    duration: string;
  } | null>(null);

  const handleCredentialsSubmit = async (creds: IMCredentials) => {
    setCredentials(creds);
    setError(null);
  };

  const handleScreenshot = async () => {
    if (!credentials) {
      setError("Please authenticate first");
      return;
    }

    const urlList = urls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urlList.length === 0) {
      setError("Please enter at least one URL");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResults(null);
    setStats(null);

    try {
      const response = await screenshotStudentTasks({
        credentials,
        lessonUrls: urlList,
        delayBetweenRequests: 2000,
      });

      if (!response.success || !response.data) {
        const errorMsg =
          typeof response.error === "string"
            ? response.error
            : "message" in (response.error || {})
              ? ((response.error || {}) as { message: string }).message
              : "Failed to screenshot pages";
        setError(errorMsg);
        return;
      }

      setResults(response.data.results);
      setStats({
        totalRequested: response.data.totalRequested,
        totalSuccessful: response.data.totalSuccessful,
        totalFailed: response.data.totalFailed,
        duration: response.data.duration,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            IM Student Task Statement Screenshot Tool
          </h1>
          <p className="text-gray-600 mb-8">
            Enter a list of lesson URLs to screenshot the Student Task Statement
            section from each page
          </p>

          {/* Authentication Section */}
          {!credentials ? (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Step 1: Authenticate
              </h2>
              <AuthenticationForm
                onCredentialsSubmit={handleCredentialsSubmit}
                isValidating={false}
                credentialsValid={false}
              />
            </div>
          ) : (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                ✅ Authenticated as: {credentials.email}
                <button
                  onClick={() => setCredentials(null)}
                  className="ml-4 text-sm text-green-600 hover:text-green-800 underline"
                >
                  Change credentials
                </button>
              </p>
            </div>
          )}

          {/* URL Input Section */}
          {credentials && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Step 2: Enter Lesson URLs
              </h2>
              <textarea
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                placeholder="Enter one URL per line, e.g.:
https://accessim.org/6-8/grade-6/unit-1/section-a/lesson-1?a=teacher
https://accessim.org/6-8/grade-6/unit-1/section-a/lesson-2?a=teacher"
                className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isProcessing}
              />
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {urls.split("\n").filter((u) => u.trim()).length} URLs entered
                </p>
                <button
                  onClick={handleScreenshot}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? "Processing..." : "Start Screenshot Capture"}
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">❌ {error}</p>
            </div>
          )}

          {/* Stats Display */}
          {stats && (
            <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Screenshot Summary</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Requested</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalRequested}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Successful</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.totalSuccessful}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.totalFailed}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.duration}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Results Display */}
          {results && results.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Screenshots</h3>
              <div className="space-y-6">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-6 border rounded-lg ${
                      result.success
                        ? "bg-white border-gray-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">URL:</p>
                      <p className="text-sm font-mono text-gray-800 break-all">
                        {result.url}
                      </p>
                    </div>

                    {result.success && result.screenshotPath ? (
                      <div>
                        <p className="text-sm text-green-600 font-semibold mb-2">
                          ✅ Screenshot captured successfully
                        </p>
                        <img
                          src={`/screenshots/${result.screenshotPath}`}
                          alt={`Screenshot for ${result.url}`}
                          className="border border-gray-300 rounded-lg shadow-sm max-w-full"
                        />
                        <a
                          href={`/screenshots/${result.screenshotPath}`}
                          download
                          className="mt-2 inline-block text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          Download screenshot
                        </a>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-red-600 font-semibold">
                          ❌ Failed: {result.error || "Unknown error"}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
