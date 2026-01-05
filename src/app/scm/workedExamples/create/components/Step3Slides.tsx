'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WizardStateHook } from '../hooks/useWizardState';
import { SlidePreview } from './SlidePreview';
import { WizardStickyFooter } from './WizardStickyFooter';
import { saveWorkedExampleDeck } from '@/app/actions/worked-examples/save-deck';
import type { CreateWorkedExampleDeckInput } from '@zod-schema/scm/worked-example';
import { useGoogleOAuthStatus } from '@/hooks/auth/useGoogleOAuthStatus';
import { useClerk } from '@clerk/nextjs';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
// import { downloadPptxLocally } from '@/lib/utils/download-pptx';

interface Step3SlidesProps {
  wizard: WizardStateHook;
}

type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

interface ExportProgress {
  status: ExportStatus;
  message: string;
  currentSlide?: number;
  totalSlides?: number;
}

export function Step3Slides({ wizard }: Step3SlidesProps) {
  const {
    state,
    updateSlide,
    updateSlidesBatch,
    setSelectedSlide,
    toggleSlideToEdit,
    setSlideSelectionMode,
    deselectSlide,
    clearSlideSelections,
    prevStep,
    setError,
    clearPersistedState,
  } = wizard;

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Export states
  const [exportProgress, setExportProgress] = useState<ExportProgress>({ status: 'idle', message: '' });
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [googleSlidesUrl, setGoogleSlidesUrl] = useState<string | null>(null);

  const { slides, selectedSlideIndex, slidesToEdit, contextSlides } = state;
  const currentSlide = slides[selectedSlideIndex];
  const totalSelected = slidesToEdit.length + contextSlides.length;
  const hasMultiSelection = totalSelected > 0;

  const isAnyExporting = exportProgress.status === 'exporting';

  // OAuth status for Google Slides export
  const { isValid: oauthValid, needsReauth, isLoading: oauthLoading } = useGoogleOAuthStatus();
  const clerk = useClerk();

  const handleReauth = async () => {
    const currentPath = window.location.pathname + window.location.search;
    await clerk.signOut();
    window.location.href = `/sign-in?redirect_url=${encodeURIComponent(currentPath)}`;
  };

  const oauthReady = !oauthLoading && oauthValid && !needsReauth;

  // Handle starting edit
  const handleStartEdit = () => {
    if (currentSlide) {
      setEditContent(currentSlide.htmlContent);
      setIsEditing(true);
    }
  };

  // Handle saving edit
  const handleSaveEdit = () => {
    updateSlide(selectedSlideIndex, editContent);
    setIsEditing(false);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent('');
  };

  // Handle AI edit (single or batch)
  const handleAiEdit = async () => {
    if (!aiEditPrompt.trim()) return;

    // Determine which slides to edit
    const useMultiEdit = slidesToEdit.length > 0;

    if (!useMultiEdit && !currentSlide) return;

    setIsAiLoading(true);
    setAiError(null);

    try {
      if (useMultiEdit) {
        // Batch edit mode
        const response = await fetch('/api/scm/worked-examples/edit-slides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slidesToEdit: slidesToEdit.map(i => ({
              slideNumber: i + 1,
              htmlContent: slides[i].htmlContent,
            })),
            contextSlides: contextSlides.map(i => ({
              slideNumber: i + 1,
              htmlContent: slides[i].htmlContent,
            })),
            editInstructions: aiEditPrompt,
            strategyName: state.strategyDefinition?.name,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setAiError(data.error || 'Failed to edit slides');
          return;
        }

        if (data.success && data.editedSlides) {
          // Batch update all edited slides
          updateSlidesBatch(
            data.editedSlides.map((s: { slideNumber: number; htmlContent: string }) => ({
              index: s.slideNumber - 1,
              htmlContent: s.htmlContent,
            }))
          );
          setAiEditPrompt('');
          clearSlideSelections();
        }
      } else {
        // Single slide edit mode
        const response = await fetch('/api/scm/worked-examples/edit-slide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentHtml: currentSlide!.htmlContent,
            editInstructions: aiEditPrompt,
            slideNumber: selectedSlideIndex + 1,
            strategyName: state.strategyDefinition?.name,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setAiError(data.error || 'Failed to edit slide');
          return;
        }

        if (data.success && data.editedHtml) {
          updateSlide(selectedSlideIndex, data.editedHtml);
          setAiEditPrompt('');
        }
      }
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Combined: Export to Google Slides + Save to database
  const handleExportToSlides = async () => {
    // Validate inputs
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
    if (slides.length === 0) {
      setError('No slides to export');
      return;
    }

    setExportProgress({ status: 'exporting', message: 'Generating PPTX...' });
    setError(null);
    setGoogleSlidesUrl(null);

    // Download PPTX locally FIRST when on localhost (before Google Slides)
    // Disabled - uncomment to debug PPTX output locally:
    // await downloadPptxLocally(slides, state.title || 'worked-example', state.mathConcept);

    try {
      // Step 1: Export to Google Slides to get the URL
      setExportProgress({ status: 'exporting', message: 'Uploading to Google Slides...' });
      const response = await fetch('/api/scm/worked-examples/export-google-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: slides,
          title: state.title || 'worked-example',
          mathConcept: state.mathConcept,
          slug: state.slug,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export to Google Slides');
      }

      const googleData = await response.json();
      const url = googleData.url;
      setGoogleSlidesUrl(url);

      // Step 2: Save to database with Google Slides URL included
      setExportProgress({ status: 'exporting', message: 'Saving to database...' });

      const deckData: CreateWorkedExampleDeckInput = {
        title: state.title,
        slug: state.slug,
        mathConcept: state.mathConcept || state.problemAnalysis?.problemType || 'Math',
        mathStandard: state.mathStandard || '',
        gradeLevel: state.gradeLevel,
        unitNumber: state.unitNumber ?? undefined,
        lessonNumber: state.lessonNumber ?? undefined,
        scopeAndSequenceId: state.scopeAndSequenceId ?? undefined,
        htmlSlides: slides.map((slide) => ({
          slideNumber: slide.slideNumber,
          htmlContent: slide.htmlContent,
          visualType: slide.visualType,
          scripts: slide.scripts,
        })),
        learningGoals: state.learningGoals.length > 0 ? state.learningGoals : undefined,
        generatedBy: 'ai',
        sourceImage: state.masteryCheckImage.uploadedUrl ?? undefined,
        createdBy: 'browser-creator',
        isPublic: state.isPublic,
        googleSlidesUrl: url, // Include the Google Slides URL
        files: {
          pageComponent: `src/app/scm/workedExamples/create/${state.slug}`,
          dataFile: `browser-generated/${state.slug}`,
        },
      };

      const saveResult = await saveWorkedExampleDeck(deckData);

      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save deck');
      }

      // Success!
      setSavedSlug(saveResult.slug || state.slug);
      clearPersistedState();
      setExportProgress({ status: 'success', message: 'Exported!' });
      window.open(url, '_blank');
    } catch (error) {
      console.error('Export error:', error);
      setExportProgress({
        status: 'error',
        message: error instanceof Error ? error.message : 'Export failed'
      });
      setTimeout(() => setExportProgress({ status: 'idle', message: '' }), 5000);
    }
  };

  // Navigate slides
  const goToPrevSlide = useCallback(() => {
    if (selectedSlideIndex > 0) {
      setSelectedSlide(selectedSlideIndex - 1);
      setIsEditing(false);
    }
  }, [selectedSlideIndex, setSelectedSlide]);

  const goToNextSlide = useCallback(() => {
    if (selectedSlideIndex < slides.length - 1) {
      setSelectedSlide(selectedSlideIndex + 1);
      setIsEditing(false);
    }
  }, [selectedSlideIndex, slides.length, setSelectedSlide]);

  // Keyboard navigation - arrow keys to change slides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't navigate if editing or if focus is in an input/textarea
      if (isEditing) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, goToPrevSlide, goToNextSlide]);

  if (slides.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center py-12">
        <p className="text-gray-600">No slides generated yet. Please go back and generate slides.</p>
        <button
          onClick={prevStep}
          className="mt-4 text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Success state after saving
  if (savedSlug) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center py-12 space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Exported to Google Slides!</h2>
          <p className="text-gray-600 mt-2">
            {state.unitNumber && state.lessonNumber
              ? `Unit ${state.unitNumber} Lesson ${state.lessonNumber} has been saved and exported.`
              : 'Your worked example has been saved and exported.'}
          </p>
        </div>

        <div className="flex flex-col gap-3 max-w-sm mx-auto">
          {googleSlidesUrl && (
            <a
              href={googleSlidesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-9 15H6v-4.5h4.5V18zm0-6H6v-4.5h4.5V12zm6 6h-4.5v-4.5H16.5V18zm0-6h-4.5v-4.5H16.5V12z" />
              </svg>
              Open in Google Slides
            </a>
          )}
          <a
            href={`/scm/workedExamples?view=${savedSlug}`}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
          >
            View Deck
          </a>
          <button
            onClick={() => {
              setSavedSlug(null);
              wizard.reset();
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer border border-gray-300"
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 pb-20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Step 3: Preview, Edit & Export</h2>
          <p className="text-gray-600 text-sm mt-1">
            Review the slides, make edits, then export or save.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-600 text-sm">
            Slide {selectedSlideIndex + 1} of {slides.length}
          </span>
        </div>
      </div>

      <div className="flex gap-4" style={{ height: 'calc(100vh - 230px)', minHeight: '600px', maxHeight: '850px' }}>
        {/* Slide Thumbnails */}
        <div className="w-28 flex-shrink-0 overflow-y-auto pr-2">
          {/* Selection controls */}
          {hasMultiSelection && (
            <div className="mb-2 px-1">
              <button
                onClick={clearSlideSelections}
                className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                Clear ({totalSelected})
              </button>
            </div>
          )}
          <div className="space-y-2">
            {slides.map((_, index) => {
              const isInEdit = slidesToEdit.includes(index);
              const isInContext = contextSlides.includes(index);
              const isSelected = isInEdit || isInContext;

              return (
                <div key={index} className="relative">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {
                      if (isSelected) {
                        // Deselect from both arrays
                        deselectSlide(index);
                      } else {
                        // Select as edit (default)
                        toggleSlideToEdit(index);
                      }
                    }}
                    className="absolute top-1 left-1 z-10 w-3.5 h-3.5 cursor-pointer accent-purple-600"
                  />
                  {/* Thumbnail button */}
                  <button
                    onClick={() => {
                      setSelectedSlide(index);
                      setIsEditing(false);
                    }}
                    className={`w-full aspect-video rounded border-2 transition-colors cursor-pointer overflow-hidden ${
                      index === selectedSlideIndex
                        ? 'border-blue-500'
                        : isInEdit
                        ? 'border-purple-400 bg-purple-50'
                        : isInContext
                        ? 'border-gray-400 border-dashed bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className={`w-full h-full flex items-center justify-center text-xs font-medium ${
                      isInEdit ? 'bg-purple-50 text-purple-700' : isInContext ? 'bg-gray-50 text-gray-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                  </button>
                  {/* Edit/Context Toggle - only show when selected */}
                  {isSelected && (
                    <div className="flex mt-1 text-[10px] rounded overflow-hidden border border-gray-300">
                      <button
                        onClick={() => setSlideSelectionMode(index, 'edit')}
                        className={`flex-1 px-1.5 py-0.5 cursor-pointer transition-colors ${
                          isInEdit
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setSlideSelectionMode(index, 'context')}
                        className={`flex-1 px-1.5 py-0.5 cursor-pointer transition-colors ${
                          isInContext
                            ? 'bg-gray-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Ctx
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Preview / Edit Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {isEditing ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <span className="text-sm text-gray-600">Editing Slide {selectedSlideIndex + 1}</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-300 rounded-lg p-4 text-gray-900 font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-0"
                spellCheck={false}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 bg-white rounded-lg overflow-hidden border border-gray-300 min-h-0 relative">
                {currentSlide && (
                  <SlidePreview htmlContent={currentSlide.htmlContent} />
                )}
                {/* Overlay Controls - Top Right */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-2">
                  {/* Navigation Row */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={goToPrevSlide}
                      disabled={selectedSlideIndex === 0}
                      className="p-1.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 text-gray-700 rounded cursor-pointer disabled:cursor-not-allowed"
                      title="Previous slide"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-xs text-gray-600 min-w-[2.5rem] text-center font-medium">
                      {selectedSlideIndex + 1} / {slides.length}
                    </span>
                    <button
                      onClick={goToNextSlide}
                      disabled={selectedSlideIndex === slides.length - 1}
                      className="p-1.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 text-gray-700 rounded cursor-pointer disabled:cursor-not-allowed"
                      title="Next slide"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="w-px h-5 bg-gray-300 mx-0.5" />
                    <button
                      onClick={handleStartEdit}
                      className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded cursor-pointer"
                      title="Edit HTML"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>

                  {/* Export Button or Re-auth Prompt */}
                  <div className="pt-1 border-t border-gray-200">
                    {!oauthLoading && (needsReauth || !oauthValid) ? (
                      <button
                        onClick={handleReauth}
                        className="w-full px-3 py-2 text-xs bg-amber-500 hover:bg-amber-600 text-white font-medium rounded cursor-pointer flex items-center justify-center gap-1.5"
                        title="Google authorization expired"
                      >
                        <ArrowPathIcon className="w-4 h-4" />
                        Reconnect Google
                      </button>
                    ) : (
                      <button
                        onClick={handleExportToSlides}
                        disabled={isAnyExporting || slides.length === 0 || !oauthReady}
                        className="w-full px-3 py-2 text-xs bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-9 15H6v-4.5h4.5V18zm0-6H6v-4.5h4.5V12zm6 6h-4.5v-4.5H16.5V18zm0-6h-4.5v-4.5H16.5V12z" />
                        </svg>
                        {exportProgress.status === 'success' ? 'Exported!' : 'Export to Slides'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error/Warning Message */}
      {state.error && (
        state.error.includes('of') && state.error.includes('slides') && state.error.includes('continue') ? (
          // Partial generation warning - show as amber with continue button
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{state.error}</span>
            </div>
            <button
              onClick={() => {
                setError(null);
                prevStep();
              }}
              className="text-amber-700 hover:text-amber-900 underline font-medium cursor-pointer"
            >
              Go Back to Continue
            </button>
          </div>
        ) : (
          // Regular error - show as red
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mt-4">
            {state.error}
          </div>
        )
      )}

      {/* Google Slides Success Message */}
      {googleSlidesUrl && exportProgress.status !== 'exporting' && (
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

      {/* Sticky Footer - AI Edit or Export Progress */}
      <WizardStickyFooter theme={isAnyExporting ? 'yellow' : 'purple'} isActive={isAiLoading || isAnyExporting}>
        {isAnyExporting ? (
          <div className="flex items-center gap-4">
            <svg className="w-5 h-5 text-yellow-600 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm text-yellow-800 font-medium">
              {exportProgress.message}
            </span>
          </div>
        ) : isAiLoading ? (
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-purple-600 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm text-purple-800 flex-1">
              {slidesToEdit.length > 0
                ? `Editing ${slidesToEdit.length} slide${slidesToEdit.length > 1 ? 's' : ''}: ${aiEditPrompt}`
                : `Editing slide ${selectedSlideIndex + 1}: ${aiEditPrompt}`}
            </span>
          </div>
        ) : (
          <div className="flex gap-3 items-center">
            <button
              onClick={prevStep}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer border border-gray-300"
            >
              Back
            </button>
            {/* Dynamic label based on selection */}
            <span className="text-sm text-purple-700 font-medium whitespace-nowrap">
              {slidesToEdit.length > 0 ? (
                <>
                  <span className="text-purple-600">{slidesToEdit.length} to edit</span>
                  {contextSlides.length > 0 && (
                    <span className="text-gray-500 ml-1">+ {contextSlides.length} ctx</span>
                  )}
                </>
              ) : (
                `Slide ${selectedSlideIndex + 1}`
              )}
            </span>
            <input
              type="text"
              value={aiEditPrompt}
              onChange={(e) => setAiEditPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && aiEditPrompt.trim() && handleAiEdit()}
              placeholder={
                slidesToEdit.length > 0
                  ? `AI Edit: describe changes to ${slidesToEdit.length} slide${slidesToEdit.length > 1 ? 's' : ''}`
                  : 'AI Edit: describe changes to this slide'
              }
              className="flex-1 px-3 py-2 text-sm border border-purple-200 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
            />
            <button
              onClick={handleAiEdit}
              disabled={!aiEditPrompt.trim() || (slidesToEdit.length === 0 && !currentSlide)}
              className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {slidesToEdit.length > 1 ? 'Apply to All' : 'Apply'}
            </button>
          </div>
        )}
        {aiError && (
          <p className="mt-2 text-sm text-red-600">{aiError}</p>
        )}
      </WizardStickyFooter>
    </div>
  );
}
