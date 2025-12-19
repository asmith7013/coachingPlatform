'use client';

import { useState, useEffect } from 'react';
import type { LoadingProgress as LoadingProgressType } from '../lib/types';

interface LoadingProgressProps {
  progress: LoadingProgressType;
}

// Phase configurations with icons, colors, and descriptions
const phaseConfig = {
  idle: {
    icon: null,
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
  },
  uploading: {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  analyzing: {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
  generating: {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  saving: {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
      </svg>
    ),
    color: 'amber',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
  },
};

function formatElapsedTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export function LoadingProgress({ progress }: LoadingProgressProps) {
  const [elapsed, setElapsed] = useState(0);
  const config = phaseConfig[progress.phase];

  // Update elapsed time every second
  useEffect(() => {
    if (progress.phase === 'idle' || !progress.startTime) {
      setElapsed(0);
      return;
    }

    // Initial calculation
    setElapsed(Date.now() - progress.startTime);

    const interval = setInterval(() => {
      setElapsed(Date.now() - (progress.startTime || Date.now()));
    }, 1000);

    return () => clearInterval(interval);
  }, [progress.phase, progress.startTime]);

  if (progress.phase === 'idle') {
    return null;
  }

  return (
    <div className={`rounded-lg p-4 ${config.bgColor} border ${config.borderColor}`}>
      <div className="flex items-start gap-4">
        {/* Animated Icon */}
        <div className={`flex-shrink-0 ${config.textColor}`}>
          <div className="relative">
            {config.icon}
            {/* Pulse animation behind icon */}
            <div className={`absolute inset-0 ${config.textColor} opacity-30 animate-ping`}>
              {config.icon}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={`font-semibold ${config.textColor}`}>
              {progress.message}
            </h4>
            <span className="text-sm text-gray-500 tabular-nums">
              {formatElapsedTime(elapsed)}
            </span>
          </div>

          {/* Slide count below the title */}
          {progress.slideProgress && (
            <p className="text-sm text-gray-600">
              Slides {progress.slideProgress.currentSlide}/{progress.slideProgress.estimatedTotal}
            </p>
          )}

          {progress.detail && !progress.slideProgress && (
            <p className="mt-1 text-sm text-gray-600">
              {progress.detail}
            </p>
          )}

          {/* Full-width slide progress tiles */}
          {progress.slideProgress && (
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex gap-1">
                  {Array.from({ length: progress.slideProgress.estimatedTotal }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-3 rounded transition-all duration-300 ${
                        i < progress.slideProgress!.currentSlide
                          ? 'bg-green-500'
                          : i === progress.slideProgress!.currentSlide
                          ? 'bg-green-300 animate-pulse'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-sm font-medium ${config.textColor} tabular-nums min-w-[3rem] text-right`}>
                  {Math.round((progress.slideProgress.currentSlide / progress.slideProgress.estimatedTotal) * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* Pulsing bar when no slide progress */}
          {!progress.slideProgress && (
            <div className="mt-3">
              <div className="h-3 bg-white/50 rounded overflow-hidden">
                <div
                  className={`h-full w-full rounded animate-pulse ${
                    progress.phase === 'uploading' ? 'bg-blue-400' :
                    progress.phase === 'analyzing' ? 'bg-purple-400' :
                    progress.phase === 'generating' ? 'bg-green-400' :
                    'bg-amber-400'
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips based on phase */}
      {progress.phase === 'analyzing' && elapsed > 10000 && (
        <p className="mt-3 text-xs text-gray-500 italic">
          AI is examining the problem structure, identifying the strategy, and creating practice scenarios...
        </p>
      )}
      {progress.phase === 'generating' && !progress.slideProgress && elapsed > 15000 && (
        <p className="mt-3 text-xs text-gray-500 italic">
          Connecting to AI and starting slide generation...
        </p>
      )}
    </div>
  );
}
