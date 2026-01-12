'use client';

import { useState } from 'react';

interface HtmlViewerProps {
  slideNumber: number;
  htmlContent: string;
  googleSlidesUrl: string | null;
  onClose: () => void;
}

export function HtmlViewer({
  slideNumber,
  htmlContent,
  googleSlidesUrl,
  onClose,
}: HtmlViewerProps) {
  const [copied, setCopied] = useState(false);

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

        {/* Footer with Google Slides URL */}
        <div className="flex items-center px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
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
      </div>
    </div>
  );
}
