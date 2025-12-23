'use client';

import { useState, useEffect } from 'react';
import type { LoadingProgress } from '../lib/types';

interface WizardFooterProps {
  isLoading: boolean;
  loadingProgress: LoadingProgress;
  children?: React.ReactNode;
}

/**
 * Format elapsed time as "Xs" or "Xm Ys"
 */
function formatElapsedTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Shared wizard footer that displays progress across all wizard steps.
 * Shows the slide generation progress bar when generating slides.
 * When not loading, shows action buttons passed as children.
 */
export function WizardFooter({ isLoading, loadingProgress, children }: WizardFooterProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update elapsed time every second
  useEffect(() => {
    if (!isLoading || !loadingProgress.startTime) {
      setElapsedTime(0);
      return;
    }

    // Set initial elapsed time
    setElapsedTime(Date.now() - loadingProgress.startTime);

    // Update every second
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - loadingProgress.startTime!);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, loadingProgress.startTime]);

  // Phase-specific colors
  const phaseColors: Record<string, { bg: string; text: string; icon: string; iconBg: string }> = {
    uploading: { bg: 'bg-blue-50', text: 'text-blue-800', icon: 'text-blue-600', iconBg: 'bg-blue-100' },
    analyzing: { bg: 'bg-purple-50', text: 'text-purple-800', icon: 'text-purple-600', iconBg: 'bg-purple-100' },
    generating: { bg: 'bg-green-50', text: 'text-green-800', icon: 'text-green-600', iconBg: 'bg-green-100' },
    saving: { bg: 'bg-amber-50', text: 'text-amber-800', icon: 'text-amber-600', iconBg: 'bg-amber-100' },
  };

  // Show loading progress when loading
  if (isLoading && loadingProgress.phase !== 'idle') {
    const colors = phaseColors[loadingProgress.phase] || { bg: 'bg-gray-50', text: 'text-gray-800', icon: 'text-gray-600', iconBg: 'bg-gray-100' };

    // Slide generation progress (with tile visualization)
    if (loadingProgress.phase === 'generating' && loadingProgress.slideProgress) {
      const { currentSlide, estimatedTotal } = loadingProgress.slideProgress;
      // Display shows current slide being worked on (not completed count)
      const displaySlide = Math.max(0, currentSlide);
      const percentage = estimatedTotal > 0 ? Math.round((displaySlide / estimatedTotal) * 100) : 0;

      return (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t shadow-lg bg-white">
          <div className="px-6 py-4 bg-green-50">
            <div className="flex items-center gap-4">
              {/* Large pulsating file icon */}
              <div className={`flex-shrink-0 p-3 rounded-xl ${colors.iconBg} animate-pulse`}>
                <svg className={`w-8 h-8 ${colors.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              {/* Progress content */}
              <div className="flex-1 space-y-1.5">
                {/* Row 1: Current slide message with elapsed time */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-green-800 flex-1">
                    {loadingProgress.message}
                  </span>
                  {elapsedTime > 0 && (
                    <span className="text-sm text-green-600 tabular-nums">
                      {formatElapsedTime(elapsedTime)}
                    </span>
                  )}
                </div>
                {/* Row 2: Progress tiles with count */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex gap-0.5">
                    {Array.from({ length: estimatedTotal }).map((_, i) => {
                      const slideNum = i + 1;
                      const isComplete = slideNum < currentSlide;
                      const isInProgress = slideNum === currentSlide && currentSlide > 0;
                      return (
                        <div
                          key={i}
                          className={`flex-1 h-2 rounded-sm transition-all duration-300 ${
                            isComplete
                              ? 'bg-green-500'
                              : isInProgress
                              ? 'bg-green-300 animate-pulse'
                              : 'bg-gray-200'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-sm font-medium text-green-700 tabular-nums whitespace-nowrap">
                    {displaySlide}/{estimatedTotal}
                  </span>
                  <span className="text-sm text-green-600 tabular-nums w-10 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // General loading progress (uploading, analyzing, generating without progress, saving)
    return (
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t shadow-lg bg-white">
        <div className={`px-6 py-4 ${colors.bg}`}>
          <div className="flex items-center gap-4">
            {/* Large pulsating file icon */}
            <div className={`flex-shrink-0 p-3 rounded-xl ${colors.iconBg} animate-pulse`}>
              <svg className={`w-8 h-8 ${colors.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            {/* Progress content */}
            <div className="flex-1">
              <span className={`text-sm font-medium ${colors.text}`}>
                {loadingProgress.message}
              </span>
              {loadingProgress.detail && (
                <span className={`text-sm ${colors.text} opacity-75 block mt-0.5`}>
                  {loadingProgress.detail}
                </span>
              )}
            </div>

            {/* Elapsed time */}
            {elapsedTime > 0 && (
              <span className={`text-sm ${colors.text} opacity-75 tabular-nums`}>
                {formatElapsedTime(elapsedTime)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show action buttons when not loading (if provided)
  if (!children) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t shadow-lg bg-white">
      <div className="px-6 py-3 bg-gray-50">
        <div className="flex items-center justify-end gap-3">
          {children}
        </div>
      </div>
    </div>
  );
}
