'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSignIn } from '@clerk/nextjs';
import type { WizardStateHook } from '../hooks/useWizardState';
import { saveWorkedExampleDeck } from '@/app/actions/worked-examples/save-deck';
import type { CreateWorkedExampleDeckInput } from '@zod-schema/scm/worked-example';

// Session storage key for pending Google Slides export
const PENDING_GOOGLE_EXPORT_KEY = 'pendingGoogleSlidesExport';

// Error messages that indicate auth issues requiring re-authorization
const AUTH_ERROR_PATTERNS = [
  'expired',
  'invalid',
  'authorization',
  'permissions',
  'No Google OAuth token',
  'sign in',
  'sign out',
  '401',
  '403',
];

interface Step4SaveProps {
  wizard: WizardStateHook;
}

export function Step4Save({ wizard }: Step4SaveProps) {
  const {
    state,
    setTitle,
    setSlug,
    setMathConcept,
    setMathStandard,
    setIsPublic,
    setLoading,
    setError,
    prevStep,
    reset,
    clearPersistedState,
  } = wizard;

  const { signIn, isLoaded: isSignInLoaded } = useSignIn();

  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingGoogleSlides, setIsExportingGoogleSlides] = useState(false);
  const [googleSlidesUrl, setGoogleSlidesUrl] = useState<string | null>(null);
  const [showReauthPrompt, setShowReauthPrompt] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  // Check if an error message indicates an auth issue
  const isAuthError = (errorMessage: string): boolean => {
    const lowerError = errorMessage.toLowerCase();
    return AUTH_ERROR_PATTERNS.some((pattern) => lowerError.includes(pattern.toLowerCase()));
  };

  // Handle re-authorization with forced consent
  const handleReauthorize = useCallback(() => {
    if (!isSignInLoaded || !signIn) {
      setError('Sign-in not loaded. Please refresh the page.');
      return;
    }

    // Store that we want to retry export after re-auth
    sessionStorage.setItem(PENDING_GOOGLE_EXPORT_KEY, 'true');

    // Redirect to Google OAuth with forced consent to get fresh refresh token
    signIn.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: '/sso-callback',
      redirectUrlComplete: window.location.pathname + window.location.search,
      oidcPrompt: 'consent',
    });
  }, [isSignInLoaded, signIn, setError]);

  // Handle export to PPTX
  const handleExportPptx = async () => {
    if (state.slides.length === 0) {
      setError('No slides to export');
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const response = await fetch('/api/scm/worked-examples/export-pptx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: state.slides,
          title: state.title || 'worked-example',
          mathConcept: state.mathConcept,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PPTX');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(state.title || 'worked-example').replace(/[^a-zA-Z0-9-]/g, '-')}.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      setError(error instanceof Error ? error.message : 'Failed to export PPTX');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle export to Google Slides
  const handleExportGoogleSlides = useCallback(async () => {
    if (state.slides.length === 0) {
      setError('No slides to export');
      return;
    }

    setIsExportingGoogleSlides(true);
    setError(null);
    setGoogleSlidesUrl(null);
    setShowReauthPrompt(false);
    setAuthErrorMessage(null);

    try {
      const response = await fetch('/api/scm/worked-examples/export-google-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: state.slides,
          title: state.title || 'worked-example',
          mathConcept: state.mathConcept,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to export to Google Slides';

        // Check if this is an auth error that can be fixed by re-authorizing
        if (isAuthError(errorMessage)) {
          setAuthErrorMessage(errorMessage);
          setShowReauthPrompt(true);
          setIsExportingGoogleSlides(false);
          return;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      setGoogleSlidesUrl(data.url);

      // Clear any pending export flag since we succeeded
      sessionStorage.removeItem(PENDING_GOOGLE_EXPORT_KEY);

      // Open in new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Google Slides export error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to export to Google Slides';

      // Check if this is an auth error
      if (isAuthError(errorMessage)) {
        setAuthErrorMessage(errorMessage);
        setShowReauthPrompt(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsExportingGoogleSlides(false);
    }
  }, [state.slides, state.title, state.mathConcept, setError]);

  // Check for pending Google Slides export after re-auth
  useEffect(() => {
    const pendingExport = sessionStorage.getItem(PENDING_GOOGLE_EXPORT_KEY);
    if (pendingExport === 'true' && state.slides.length > 0) {
      // Clear the flag first to prevent loops
      sessionStorage.removeItem(PENDING_GOOGLE_EXPORT_KEY);
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        handleExportGoogleSlides();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.slides.length, handleExportGoogleSlides]);

  // Handle save
  const handleSave = async () => {
    if (!state.gradeLevel) {
      setError('Grade level is required');
      return;
    }
    if (!state.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!state.slug.trim()) {
      setError('Slug is required');
      return;
    }
    if (state.slides.length === 0) {
      setError('No slides to save');
      return;
    }

    setLoading(true, 'Saving to database...');
    setError(null);

    try {
      const deckData: CreateWorkedExampleDeckInput = {
        title: state.title,
        slug: state.slug,
        mathConcept: state.mathConcept || state.problemAnalysis?.problemType || 'Math',
        mathStandard: state.mathStandard || '',
        gradeLevel: state.gradeLevel,
        unitNumber: state.unitNumber ?? undefined,
        lessonNumber: state.lessonNumber ?? undefined,
        scopeAndSequenceId: state.scopeAndSequenceId ?? undefined,
        htmlSlides: state.slides.map((slide) => ({
          slideNumber: slide.slideNumber,
          htmlContent: slide.htmlContent,
          visualType: slide.visualType,
          scripts: slide.scripts,
        })),
        learningGoals: state.learningGoals.length > 0 ? state.learningGoals : undefined,
        generatedBy: 'ai',
        sourceImage: state.masteryCheckImage.uploadedUrl ?? undefined,
        createdBy: 'browser-creator', // Will be overwritten by server action with actual userId
        isPublic: state.isPublic,
        files: {
          pageComponent: `src/app/scm/workedExamples/create/${state.slug}`,
          dataFile: `browser-generated/${state.slug}`,
        },
      };

      const result = await saveWorkedExampleDeck(deckData);

      if (!result.success) {
        setError(result.error || 'Failed to save deck');
        setLoading(false);
        return;
      }

      setSavedSlug(result.slug || state.slug);
      clearPersistedState();
      setLoading(false);
    } catch (error) {
      console.error('Error saving deck:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      setLoading(false);
    }
  };

  // Handle creating new deck
  const handleCreateNew = () => {
    reset();
    setSavedSlug(null);
  };

  // Success state
  if (savedSlug) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center py-12 space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Deck Saved Successfully!</h2>
          <p className="text-gray-600 mt-2">Your worked example has been saved to the database.</p>
        </div>

        <div className="flex flex-col gap-3 max-w-sm mx-auto">
          <a
            href={`/scm/workedExamples?view=${savedSlug}`}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
          >
            View Deck
          </a>
          <button
            onClick={handleCreateNew}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer border border-gray-300"
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Step 4: Save Deck</h2>
        <p className="text-gray-600 text-sm mt-1">
          Review the metadata and save your worked example to the database.
        </p>
      </div>

      {/* Metadata Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={state.title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Balance and Isolate - Solving Equations"
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={state.slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            placeholder="e.g., balance-isolate-grade8"
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">URL-safe identifier (lowercase, hyphens only)</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Math Concept</label>
            <input
              type="text"
              value={state.mathConcept}
              onChange={(e) => setMathConcept(e.target.value)}
              placeholder="e.g., Linear Equations"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Math Standard</label>
            <input
              type="text"
              value={state.mathStandard}
              onChange={(e) => setMathStandard(e.target.value)}
              placeholder="e.g., 8.EE.C.7"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isPublic"
            checked={state.isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="isPublic" className="text-sm text-gray-700 cursor-pointer">
            Make this deck public (visible to all users)
          </label>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Summary</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="text-gray-500">Grade</div>
          <div className="text-gray-900">{state.gradeLevel || '-'}</div>
          <div className="text-gray-500">Unit/Lesson</div>
          <div className="text-gray-900">
            {state.unitNumber && state.lessonNumber
              ? `Unit ${state.unitNumber}, Lesson ${state.lessonNumber}`
              : '-'}
          </div>
          <div className="text-gray-500">Slides</div>
          <div className="text-gray-900">{state.slides.length}</div>
          <div className="text-gray-500">Strategy</div>
          <div className="text-gray-900">{state.strategyDefinition?.name || '-'}</div>
        </div>
      </div>

      {/* Google Slides Success Message */}
      {googleSlidesUrl && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Exported to Google Slides!</span>
          </div>
          <a
            href={googleSlidesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-700 hover:text-green-900 underline font-medium"
          >
            Open in Google Slides
          </a>
        </div>
      )}

      {/* Google Re-authorization Prompt */}
      {showReauthPrompt && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg mt-4 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-800">Google Authorization Required</h3>
              <p className="text-sm text-amber-700 mt-1">
                {authErrorMessage || 'Your Google Drive access has expired.'}
              </p>
              <p className="text-sm text-amber-600 mt-2">
                Click the button below to re-authorize with Google. After signing in, you&apos;ll be
                returned here and the export will automatically retry.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleReauthorize}
                  disabled={!isSignInLoaded}
                  className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Re-authorize with Google
                </button>
                <button
                  onClick={() => {
                    setShowReauthPrompt(false);
                    setAuthErrorMessage(null);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer border border-gray-300"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mt-4">
          {state.error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 pt-6 flex-wrap">
        <button
          onClick={prevStep}
          disabled={state.isLoading || isExporting || isExportingGoogleSlides}
          className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer border border-gray-300"
        >
          Back
        </button>
        <button
          onClick={handleExportPptx}
          disabled={state.isLoading || isExporting || isExportingGoogleSlides || state.slides.length === 0}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export PPTX</span>
            </>
          )}
        </button>
        <button
          onClick={handleExportGoogleSlides}
          disabled={state.isLoading || isExporting || isExportingGoogleSlides || state.slides.length === 0}
          className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          {isExportingGoogleSlides ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-9 15H6v-4.5h4.5V18zm0-6H6v-4.5h4.5V12zm6 6h-4.5v-4.5H16.5V18zm0-6h-4.5v-4.5H16.5V12z" />
              </svg>
              <span>Google Slides</span>
            </>
          )}
        </button>
        <button
          onClick={handleSave}
          disabled={state.isLoading || isExporting || isExportingGoogleSlides}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          {state.isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>{state.loadingMessage || 'Saving...'}</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>Save Deck</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
