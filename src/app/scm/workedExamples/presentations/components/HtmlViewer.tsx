'use client';

import { useState } from 'react';
import type { HtmlViewerProps } from '../types';
import { useGoogleOAuthStatus } from '@/hooks/auth/useGoogleOAuthStatus';
import { useClerk } from '@clerk/nextjs';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export function HtmlViewer({
  slideNumber,
  htmlContent,
  googleSlidesUrl,
  exportStatus,
  exportError,
  onClose,
  onExport,
}: HtmlViewerProps) {
  const [copied, setCopied] = useState(false);
  const { isValid, needsReauth, isLoading: oauthLoading } = useGoogleOAuthStatus();
  const clerk = useClerk();

  const handleReauth = async () => {
    const currentPath = window.location.pathname + window.location.search;
    await clerk.signOut();
    window.location.href = `/sign-in?redirect_url=${encodeURIComponent(currentPath)}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="print-hide fixed inset-0 z-[10001] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-2xl w-[90vw] h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <h3 className="text-sm font-semibold text-gray-700">
            Slide {slideNumber} HTML
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                copied
                  ? 'bg-green-500 text-white scale-110'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
              }`}
              aria-label="Copy HTML"
              title={copied ? 'Copied!' : 'Copy HTML'}
            >
              {copied ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                  />
                </svg>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full transition-colors cursor-pointer"
              aria-label="Close HTML viewer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* HTML Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-900">
          <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-words">
            {htmlContent || 'No HTML content'}
          </pre>
        </div>

        {/* Footer with Export Button and URL */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          {/* Google Slides URL */}
          <div className="flex-1 min-w-0">
            {googleSlidesUrl ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 shrink-0">Google Slides:</span>
                <a
                  href={googleSlidesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline truncate"
                  title={googleSlidesUrl}
                >
                  {googleSlidesUrl}
                </a>
              </div>
            ) : (
              <span className="text-sm text-gray-400">No Google Slides URL</span>
            )}
          </div>

          {/* Export Slides Button or Re-auth Prompt */}
          {!oauthLoading && (needsReauth || !isValid) ? (
            <div className="ml-4 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-700">Google auth expired</span>
              <button
                onClick={handleReauth}
                className="h-9 flex items-center gap-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer text-sm font-medium"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Reconnect
              </button>
            </div>
          ) : (
            <button
              onClick={onExport}
              disabled={exportStatus === 'exporting' || oauthLoading}
              className={`ml-4 h-9 flex items-center gap-2 px-4 rounded-lg transition-colors cursor-pointer text-sm font-medium shrink-0 ${
                exportStatus === 'exporting'
                  ? 'bg-yellow-500 text-white'
                  : exportStatus === 'success'
                  ? 'bg-green-500 text-white'
                  : exportStatus === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
              aria-label="Export Slides"
              title={exportError || 'Export to Google Slides'}
            >
              {exportStatus === 'exporting' ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Exporting...</span>
                </>
              ) : exportStatus === 'success' ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Exported!</span>
                </>
              ) : exportStatus === 'error' ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Failed</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-9 15H6v-4.5h4.5V18zm0-6H6v-4.5h4.5V12zm6 6h-4.5v-4.5H16.5V18zm0-6h-4.5v-4.5H16.5V12z" />
                  </svg>
                  <span>Export Slides</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
