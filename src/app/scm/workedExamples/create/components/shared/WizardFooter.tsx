'use client';

import { useState, useEffect } from 'react';
import type { LoadingProgress } from '../../lib/types';
import { WizardStickyFooter, type FooterTheme } from './WizardStickyFooter';

/**
 * Get a short label for each slide based on its position in the deck.
 * Slide structure:
 * 1. Teacher Instructions
 * 2. Big Idea
 * 3. Problem Setup
 * 4-6. Step slides (with CFU + Answer)
 * 7. Printable worksheet
 */
function getSlideLabel(slideNum: number, total: number): string {
  // If this is the last slide and total suggests it's the printable
  if (slideNum === total && total >= 7) {
    return 'Print';
  }

  switch (slideNum) {
    case 1:
      return 'Teacher';
    case 2:
      return 'Big Idea';
    case 3:
      return 'Setup';
    case 4:
      return 'Step 1';
    case 5:
      return 'Step 2';
    case 6:
      return 'Step 3';
    default:
      return `Slide ${slideNum}`;
  }
}

// Custom scale-pulse animation for the icon
const scalePulseStyle = {
  animation: 'scalePulse 1.5s ease-in-out infinite',
};

interface WizardFooterProps {
  isLoading: boolean;
  loadingProgress: LoadingProgress;
  autoSaveStatus?: 'idle' | 'saving' | 'saved' | 'error';
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
export function WizardFooter({ isLoading, loadingProgress, autoSaveStatus, children }: WizardFooterProps) {
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

      return (
        <WizardStickyFooter theme="green" isActive>
          {/* Keyframes for scale pulse animation */}
          <style>{`
            @keyframes scalePulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.15); }
            }
          `}</style>
          <div className="flex items-center gap-3">
            {/* Pulsating file icon with scale animation */}
            <div className={`flex-shrink-0 p-1.5 rounded-lg ${colors.iconBg}`} style={scalePulseStyle}>
              <svg className={`w-8 h-8 ${colors.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            {/* Progress content */}
            <div className="flex-1 space-y-1">
              {/* Row 1: Message on left, count + time on right */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">
                  {loadingProgress.message}
                </span>
                {elapsedTime > 0 && (
                  <span className="text-sm text-green-600 tabular-nums">
                    {formatElapsedTime(elapsedTime)}
                  </span>
                )}
              </div>
              {/* Row 2: Progress tiles with labels */}
              <div className="flex gap-1">
                {Array.from({ length: estimatedTotal }).map((_, i) => {
                  const slideNum = i + 1;
                  const isComplete = slideNum < currentSlide;
                  const isInProgress = slideNum === currentSlide && currentSlide > 0;
                  const label = getSlideLabel(slideNum, estimatedTotal);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <div
                        className={`w-full h-2 rounded-sm transition-all duration-300 ${
                          isComplete
                            ? 'bg-green-500'
                            : isInProgress
                            ? 'bg-green-300 animate-pulse'
                            : 'bg-gray-200'
                        }`}
                      />
                      <span className="text-[9px] text-green-700 truncate max-w-full">
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </WizardStickyFooter>
      );
    }

    // General loading progress (uploading, analyzing, generating without progress, saving)
    // Map phase to theme
    const phaseThemes: Record<string, FooterTheme> = {
      uploading: 'blue',
      analyzing: 'purple',
      generating: 'green',
      saving: 'amber',
    };
    const theme = phaseThemes[loadingProgress.phase] || 'gray';

    return (
      <WizardStickyFooter theme={theme} isActive>
        {/* Keyframes for scale pulse animation */}
        <style>{`
          @keyframes scalePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }
        `}</style>
        <div className="flex items-center gap-3">
          {/* Pulsating file icon with scale animation */}
          <div className={`flex-shrink-0 p-1.5 rounded-lg ${colors.iconBg}`} style={scalePulseStyle}>
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
      </WizardStickyFooter>
    );
  }

  // Show action buttons when not loading (if provided)
  if (!children && !autoSaveStatus) {
    return null;
  }

  // Auto-save status indicator
  const renderAutoSaveStatus = () => {
    if (!autoSaveStatus || autoSaveStatus === 'idle') return null;

    const statusConfig = {
      saving: {
        icon: (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ),
        text: 'Saving...',
        className: 'text-blue-600',
      },
      saved: {
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
        text: 'Saved',
        className: 'text-green-600',
      },
      error: {
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
        text: 'Save failed',
        className: 'text-red-600',
      },
    };

    const config = statusConfig[autoSaveStatus];
    return (
      <div className={`flex items-center gap-1.5 text-sm ${config.className}`}>
        {config.icon}
        <span>{config.text}</span>
      </div>
    );
  };

  return (
    <WizardStickyFooter theme="gray">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-shrink-0">
          {renderAutoSaveStatus()}
        </div>
        <div className="flex items-center gap-3">
          {children}
        </div>
      </div>
    </WizardStickyFooter>
  );
}
