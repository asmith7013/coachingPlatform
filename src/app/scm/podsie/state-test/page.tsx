'use client';

import React, { useState, useTransition } from 'react';
import {
  scrapeStateTestPage,
  getStateTestQuestions,
  getStateTestStats,
  type ScrapeResult,
} from '@/app/tools/state-test-scraper/actions/scrape';
import type { StateTestQuestion } from '@/app/tools/state-test-scraper/lib/types';

export default function StateTestPage() {
  const [url, setUrl] = useState('');
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [questions, setQuestions] = useState<StateTestQuestion[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    byGrade: Record<string, number>;
    byYear: Record<string, number>;
  } | null>(null);
  const [grade, setGrade] = useState('6');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleScrape = () => {
    if (!url.trim()) {
      addLog('ERROR: Please enter a URL');
      return;
    }

    addLog(`Starting scrape of: ${url} (Grade ${grade})`);
    setResult(null);

    startTransition(async () => {
      const res = await scrapeStateTestPage(url, grade);
      setResult(res);

      if (res.success) {
        addLog(`SUCCESS: Scraped ${res.count} questions`);
        if (res.questions) {
          setQuestions(res.questions);
        }
        // Refresh stats
        loadStats();
      } else {
        addLog(`ERROR: ${res.error}`);
      }
    });
  };

  const loadStats = async () => {
    addLog('Loading stats...');
    const res = await getStateTestStats();
    if (res.success && res.stats) {
      setStats(res.stats);
      addLog(`Stats loaded: ${res.stats.total} total questions`);
    }
  };

  const loadQuestions = async () => {
    addLog('Loading all questions...');
    const res = await getStateTestQuestions();
    if (res.success && res.questions) {
      setQuestions(res.questions);
      addLog(`Loaded ${res.questions.length} questions`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">State Test Question Scraper</h1>

      {/* Scrape Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Scrape New Questions</h2>
        <div className="flex gap-3">
          <input
            type="url"
            placeholder="Enter Problem-Attic URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="6">Grade 6</option>
            <option value="7">Grade 7</option>
            <option value="8">Grade 8</option>
          </select>
          <button
            onClick={handleScrape}
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? 'Scraping...' : 'Scrape'}
          </button>
        </div>
        {result && (
          <div
            className={`mt-3 p-3 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
          >
            {result.success ? `Successfully scraped ${result.count} questions` : result.error}
          </div>
        )}
      </div>

      {/* Stats & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Database Stats</h2>
            <button
              onClick={loadStats}
              className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
            >
              Refresh
            </button>
          </div>
          {stats ? (
            <div className="space-y-2 text-sm">
              <p>
                <strong>Total Questions:</strong> {stats.total}
              </p>
              <p>
                <strong>By Grade:</strong>{' '}
                {Object.entries(stats.byGrade)
                  .sort((a, b) => Number(a[0]) - Number(b[0]))
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(', ')}
              </p>
              <p>
                <strong>By Year:</strong>{' '}
                {Object.entries(stats.byYear)
                  .sort((a, b) => Number(b[0]) - Number(a[0]))
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(', ')}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Click Refresh to load stats</p>
          )}
        </div>

        {/* Logs Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Activity Log</h2>
            <button
              onClick={() => setLogs([])}
              className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
            >
              Clear
            </button>
          </div>
          <div className="h-32 overflow-y-auto bg-gray-50 rounded p-2 text-xs font-mono">
            {logs.length === 0 ? (
              <p className="text-gray-400">No activity yet</p>
            ) : (
              logs.map((log, i) => (
                <p key={i} className={log.includes('ERROR') ? 'text-red-600' : log.includes('SUCCESS') ? 'text-green-600' : ''}>
                  {log}
                </p>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Questions ({questions.length})</h2>
          <button
            onClick={loadQuestions}
            className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
          >
            Load All
          </button>
        </div>
        {questions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left">Image</th>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Standard</th>
                  <th className="px-3 py-2 text-left">Grade</th>
                  <th className="px-3 py-2 text-left">Year</th>
                  <th className="px-3 py-2 text-left">Type</th>
                </tr>
              </thead>
              <tbody>
                {questions.slice(0, 50).map((q) => (
                  <tr key={q.questionId} className="border-t">
                    <td className="px-3 py-2">
                      <a href={q.screenshotUrl} target="_blank" rel="noopener noreferrer">
                        <img src={q.screenshotUrl} alt={q.standard} className="h-16 w-auto rounded" />
                      </a>
                    </td>
                    <td className="px-3 py-2 font-mono">{q.questionId}</td>
                    <td className="px-3 py-2">{q.standard}</td>
                    <td className="px-3 py-2">{q.grade}</td>
                    <td className="px-3 py-2">{q.examYear}</td>
                    <td className="px-3 py-2 text-xs">{q.questionType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {questions.length > 50 && (
              <p className="text-sm text-gray-500 mt-2">Showing first 50 of {questions.length} questions</p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No questions loaded. Click &quot;Load All&quot; or scrape a new page.</p>
        )}
      </div>
    </div>
  );
}
