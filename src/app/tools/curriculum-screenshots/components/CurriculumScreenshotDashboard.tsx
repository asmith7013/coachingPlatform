'use client';

import { useState } from 'react';
import { screenshotCurriculumQuestions, type QuestionScreenshotResult } from '../actions/screenshot-questions';

export function CurriculumScreenshotDashboard() {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<QuestionScreenshotResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    assessmentTitle: string;
    totalRequested: number;
    totalSuccessful: number;
    totalFailed: number;
    duration: string;
  } | null>(null);

  const handleScreenshot = async () => {
    if (!jsonInput.trim()) {
      setError('Please paste curriculum JSON data');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResults(null);
    setStats(null);

    try {
      // Parse the JSON input
      const curriculumData = JSON.parse(jsonInput);

      // Validate it has the expected structure
      if (!curriculumData.data || !curriculumData.data.assessment_problems) {
        setError('Invalid curriculum data format. Expected data.assessment_problems array.');
        setIsProcessing(false);
        return;
      }

      console.log(`Processing ${curriculumData.data.assessment_problems.length} problems...`);

      const response = await screenshotCurriculumQuestions({
        curriculumData,
        prefix: 'problem'
      });

      if (!response.success || !response.data) {
        const errorMsg = typeof response.error === 'string' ? response.error : 'message' in (response.error || {}) ? ((response.error || {}) as {message: string}).message : 'Failed to screenshot questions';
        setError(errorMsg);
        return;
      }

      setResults(response.data.results);
      setStats({
        assessmentTitle: response.data.assessmentTitle,
        totalRequested: response.data.totalRequested,
        totalSuccessful: response.data.totalSuccessful,
        totalFailed: response.data.totalFailed,
        duration: response.data.duration
      });

    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format. Please check your input.');
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!results) return;

    const successfulResults = results.filter(r => r.success && r.screenshotPath);

    for (const result of successfulResults) {
      try {
        // Fetch the image
        const response = await fetch(`/screenshots/${result.screenshotPath}`);
        const blob = await response.blob();

        // Create a download link with problem number as filename
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Extract problem number from questionTitle (e.g., "Problem 1" -> "Problem-1")
        const filename = `${result.questionTitle.replace(/\s+/g, '-')}.png`;
        link.download = filename;

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Small delay between downloads to avoid browser blocking
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`Failed to download ${result.questionTitle}:`, error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Curriculum Question Screenshot Tool
          </h1>
          <p className="text-gray-600 mb-8">
            Paste curriculum API output (JSON) to screenshot each problem statement
          </p>

          {/* JSON Input Section */}
          <div className="mb-8">
            <label htmlFor="json-input" className="block text-lg font-semibold mb-4">
              Paste Curriculum JSON Data
            </label>
            <textarea
              id="json-input"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`Paste your curriculum JSON here, e.g.:
{
  "data": {
    "id": 471896,
    "title": "Mid-Unit Assessment",
    "assessment_problems": [
      {
        "ordinal_title": "Problem 1",
        "slug": "problem-1",
        "statement": "<p>Your HTML content here...</p>",
        ...
      }
    ]
  }
}`}
              className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isProcessing}
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {jsonInput.trim() ? '✓ JSON data entered' : 'Waiting for JSON input'}
              </p>
              <button
                onClick={handleScreenshot}
                disabled={isProcessing || !jsonInput.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Generate Screenshots'}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">❌ {error}</p>
            </div>
          )}

          {/* Stats Display */}
          {stats && (
            <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{stats.assessmentTitle}</h3>
                {stats.totalSuccessful > 0 && (
                  <button
                    onClick={handleDownloadAll}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download All ({stats.totalSuccessful})
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Problems</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRequested}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Successful</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalSuccessful}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.totalFailed}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.duration}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results Display */}
          {results && results.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Screenshots</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-6 border rounded-lg ${
                      result.success
                        ? 'bg-white border-gray-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="mb-4">
                      <p className="text-lg font-semibold text-gray-900">{result.questionTitle}</p>
                      <p className="text-sm text-gray-600">{result.questionId}</p>
                    </div>

                    {result.success && result.screenshotPath ? (
                      <div>
                        <p className="text-sm text-green-600 font-semibold mb-2">
                          ✅ Screenshot generated successfully
                        </p>
                        <img
                          src={`/screenshots/${result.screenshotPath}`}
                          alt={`Screenshot for ${result.questionTitle}`}
                          className="border border-gray-300 rounded-lg shadow-sm w-full"
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
                          ❌ Failed: {result.error || 'Unknown error'}
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
