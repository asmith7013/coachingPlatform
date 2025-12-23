'use client';

import { useState } from 'react';
import type { WizardStateHook } from '../hooks/useWizardState';
import { saveWorkedExampleDeck } from '@/app/actions/worked-examples/save-deck';
import type { CreateWorkedExampleDeckInput } from '@zod-schema/worked-example-deck';

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

  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

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

      {/* Error Message */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mt-4">
          {state.error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 pt-6">
        <button
          onClick={prevStep}
          disabled={state.isLoading || isExporting}
          className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer border border-gray-300"
        >
          Back
        </button>
        <button
          onClick={handleExportPptx}
          disabled={state.isLoading || isExporting || state.slides.length === 0}
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
          onClick={handleSave}
          disabled={state.isLoading || isExporting}
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
