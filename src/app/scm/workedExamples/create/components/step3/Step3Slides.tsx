'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WizardStateHook } from '../../hooks/useWizardState';
import { SlidePreview } from '../shared/SlidePreview';
import { saveWorkedExampleDeck } from '@/app/actions/worked-examples/save-deck';
import type { CreateWorkedExampleDeckInput } from '@zod-schema/scm/worked-example';
import { useGoogleOAuthStatus } from '@/hooks/auth/useGoogleOAuthStatus';
import { useClerk } from '@clerk/nextjs';
import { SlideThumbnails } from './SlideThumbnails';
import { SlidesFooter } from './SlidesFooter';
import { ExportSuccessView } from './ExportSuccessView';
import { ReauthModal } from './ReauthModal';
import { ExportProgressOverlay } from './ExportProgressOverlay';
import { buildExportTitle } from '@/app/scm/workedExamples/presentations/utils';
// import { downloadPptxLocally } from '@/lib/utils/download-pptx';

interface Step3SlidesProps {
  wizard: WizardStateHook;
}

type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';
type ExportPhase = 'idle' | 'analyzing' | 'optimizing' | 'uploading' | 'saving' | 'complete' | 'error';

interface ExportProgress {
  status: ExportStatus;
  message: string;
  currentSlide?: number;
  totalSlides?: number;
}

interface SlideExportStatus {
  status: 'pending' | 'analyzing' | 'optimizing' | 'done' | 'skipped' | 'error';
  wasOptimized?: boolean;
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
  const [aiEditStartTime, setAiEditStartTime] = useState<number | null>(null);
  const [aiEditElapsed, setAiEditElapsed] = useState(0);

  // Export states
  const [exportProgress, setExportProgress] = useState<ExportProgress>({ status: 'idle', message: '' });
  const [exportPhase, setExportPhase] = useState<ExportPhase>('idle');
  const [slideExportStatuses, setSlideExportStatuses] = useState<SlideExportStatus[]>([]);
  const [exportStartTime, setExportStartTime] = useState<number | null>(null);
  const [exportElapsed, setExportElapsed] = useState(0);
  const [optimizedCount, setOptimizedCount] = useState(0);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [googleSlidesUrl, setGoogleSlidesUrl] = useState<string | null>(null);

  const { slides, selectedSlideIndex, slidesToEdit, contextSlides } = state;
  const currentSlide = slides[selectedSlideIndex];

  const isAnyExporting = exportProgress.status === 'exporting';

  // Track elapsed time during AI editing
  useEffect(() => {
    if (!isAiLoading || !aiEditStartTime) {
      setAiEditElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      setAiEditElapsed(Math.floor((Date.now() - aiEditStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isAiLoading, aiEditStartTime]);

  // Track elapsed time during export
  useEffect(() => {
    if (!isAnyExporting || !exportStartTime) {
      setExportElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      setExportElapsed(Math.floor((Date.now() - exportStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isAnyExporting, exportStartTime]);

  // OAuth status for Google Slides export
  const { isValid: oauthValid, needsReauth, isLoading: oauthLoading } = useGoogleOAuthStatus();
  const clerk = useClerk();
  const [showReauthModal, setShowReauthModal] = useState(false);

  const handleReauth = async () => {
    const currentPath = window.location.pathname + window.location.search;
    await clerk.signOut();
    window.location.href = `/sign-in?redirect_url=${encodeURIComponent(currentPath)}`;
  };

  const handleExportClick = () => {
    // If OAuth is not ready, show the reauth modal instead of exporting
    if (!oauthLoading && (needsReauth || !oauthValid)) {
      setShowReauthModal(true);
      return;
    }
    handleExportToSlides();
  };

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
    setAiEditStartTime(Date.now());
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
      setAiEditStartTime(null);
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

    // Initialize export state
    setExportProgress({ status: 'exporting', message: 'Starting export...' });
    setExportPhase('analyzing');
    setSlideExportStatuses(slides.map(() => ({ status: 'pending' })));
    setExportStartTime(Date.now());
    setOptimizedCount(0);
    setError(null);
    setGoogleSlidesUrl(null);

    // Download PPTX locally FIRST when on localhost (before Google Slides)
    // Disabled - uncomment to debug PPTX output locally:
    // await downloadPptxLocally(slides, state.title || 'worked-example', state.mathConcept);

    try {
      // Step 0: Optimize slides via SSE streaming
      let slidesToExport = slides;
      let finalOptimizedCount = 0;

      try {
        const optimizeResponse = await fetch('/api/scm/worked-examples/optimize-slides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slides }),
        });

        if (!optimizeResponse.ok) {
          throw new Error('Optimization request failed');
        }

        // Handle SSE stream
        const reader = optimizeResponse.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          let buffer = '';
          let currentEvent = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('event: ')) {
                currentEvent = line.slice(7);
              } else if (line.startsWith('data: ') && currentEvent) {
                try {
                  const data = JSON.parse(line.slice(6));

                  switch (currentEvent) {
                    case 'start':
                      if (data.phase === 'analyzing') {
                        setExportPhase('analyzing');
                        setExportProgress({ status: 'exporting', message: data.message });
                      } else if (data.phase === 'optimizing') {
                        setExportPhase('optimizing');
                        setExportProgress({ status: 'exporting', message: data.message });
                      }
                      break;

                    case 'analyzing':
                      setSlideExportStatuses(prev => {
                        const updated = [...prev];
                        const idx = data.slideNumber - 1;
                        if (idx >= 0 && idx < updated.length) {
                          updated[idx] = { status: 'analyzing' };
                        }
                        return updated;
                      });
                      break;

                    case 'optimizing':
                      setSlideExportStatuses(prev => {
                        const updated = [...prev];
                        const idx = data.slideNumber - 1;
                        if (idx >= 0 && idx < updated.length) {
                          updated[idx] = { status: 'optimizing' };
                        }
                        return updated;
                      });
                      break;

                    case 'slide':
                      setSlideExportStatuses(prev => {
                        const updated = [...prev];
                        const idx = data.slideNumber - 1;
                        if (idx >= 0 && idx < updated.length) {
                          updated[idx] = {
                            status: data.wasOptimized ? 'done' : 'skipped',
                            wasOptimized: data.wasOptimized,
                          };
                        }
                        return updated;
                      });
                      break;

                    case 'complete':
                      if (data.success && data.slides) {
                        finalOptimizedCount = data.optimizedCount || 0;
                        setOptimizedCount(finalOptimizedCount);
                        slidesToExport = data.slides.map((s: { slideNumber: number; htmlContent: string }) => ({
                          slideNumber: s.slideNumber,
                          htmlContent: s.htmlContent,
                          visualType: slides[s.slideNumber - 1]?.visualType,
                          scripts: slides[s.slideNumber - 1]?.scripts,
                        }));
                        // Mark all slides as done
                        setSlideExportStatuses(prev =>
                          prev.map((s, idx) => {
                            const optimized = data.slides.find((os: { slideNumber: number; wasOptimized: boolean }) => os.slideNumber === idx + 1);
                            return {
                              status: 'done',
                              wasOptimized: optimized?.wasOptimized || false,
                            };
                          })
                        );
                      }
                      break;

                    case 'error':
                      console.warn('[Export] Optimization error:', data.message);
                      break;
                  }
                  currentEvent = ''; // Reset after processing
                } catch {
                  // Skip malformed JSON
                }
              }
            }
          }
        }
      } catch (optimizeError) {
        // Non-fatal: continue with original slides if optimization fails
        console.warn('[Export] Slide optimization failed, continuing with original slides:', optimizeError);
        setSlideExportStatuses(slides.map(() => ({ status: 'skipped' })));
      }

      // Step 1: Export to Google Slides to get the URL
      setExportPhase('uploading');
      setExportProgress({ status: 'exporting', message: 'Uploading to Google Slides...' });

      // Build concise title for Google Slides: "SGI 6.4.2: Strategy Name"
      const exportTitle = buildExportTitle({
        gradeLevel: state.gradeLevel,
        unitNumber: state.unitNumber,
        lessonNumber: state.lessonNumber,
        title: state.strategyDefinition?.name || state.title,
      });

      const response = await fetch('/api/scm/worked-examples/export-google-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: slidesToExport,
          title: exportTitle,
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
      setExportPhase('saving');
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
        // Analysis data for deck editing
        // Cast to schema types (wizard types have more specific visualPlan union, schema stores as flexible JSON)
        problemAnalysis: state.problemAnalysis as CreateWorkedExampleDeckInput['problemAnalysis'],
        strategyDefinition: state.strategyDefinition as CreateWorkedExampleDeckInput['strategyDefinition'],
        scenarios: state.scenarios as CreateWorkedExampleDeckInput['scenarios'],
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
      setExportPhase('complete');
      setSavedSlug(saveResult.slug || state.slug);
      clearPersistedState();
      setExportProgress({ status: 'success', message: 'Exported!' });
      setExportStartTime(null);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Export error:', error);
      setExportPhase('error');
      setExportProgress({
        status: 'error',
        message: error instanceof Error ? error.message : 'Export failed'
      });
      setExportStartTime(null);
      setTimeout(() => {
        setExportProgress({ status: 'idle', message: '' });
        setExportPhase('idle');
      }, 5000);
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
      <ExportSuccessView
        savedSlug={savedSlug}
        googleSlidesUrl={googleSlidesUrl}
        unitNumber={state.unitNumber}
        lessonNumber={state.lessonNumber}
        onCreateAnother={() => {
          setSavedSlug(null);
          wizard.reset();
        }}
      />
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
        <SlideThumbnails
          slideCount={slides.length}
          selectedSlideIndex={selectedSlideIndex}
          slidesToEdit={slidesToEdit}
          contextSlides={contextSlides}
          onSelectSlide={(index) => {
            setSelectedSlide(index);
            setIsEditing(false);
          }}
          onToggleSlideToEdit={toggleSlideToEdit}
          onDeselectSlide={deselectSlide}
          onSetSlideSelectionMode={setSlideSelectionMode}
          onClearSelections={clearSlideSelections}
        />

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
                {/* Export Progress Overlay */}
                <ExportProgressOverlay
                  isVisible={isAnyExporting}
                  phase={exportPhase}
                  slideStatuses={slideExportStatuses}
                  elapsedTime={exportElapsed}
                  message={exportProgress.message}
                  optimizedCount={optimizedCount}
                />
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

                  {/* Export Button */}
                  <div className="pt-1 border-t border-gray-200">
                    <button
                      onClick={handleExportClick}
                      disabled={isAnyExporting || slides.length === 0}
                      className="w-full px-3 py-2 text-xs bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-9 15H6v-4.5h4.5V18zm0-6H6v-4.5h4.5V12zm6 6h-4.5v-4.5H16.5V18zm0-6h-4.5v-4.5H16.5V12z" />
                      </svg>
                      {exportProgress.status === 'success' ? 'Exported!' : 'Export to Slides'}
                    </button>
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
      <SlidesFooter
        isExporting={isAnyExporting}
        exportProgress={exportProgress}
        exportElapsed={exportElapsed}
        isAiLoading={isAiLoading}
        aiEditElapsed={aiEditElapsed}
        slidesToEdit={slidesToEdit}
        contextSlides={contextSlides}
        selectedSlideIndex={selectedSlideIndex}
        hasCurrentSlide={!!currentSlide}
        aiEditPrompt={aiEditPrompt}
        setAiEditPrompt={setAiEditPrompt}
        aiError={aiError}
        handleAiEdit={handleAiEdit}
        prevStep={prevStep}
      />

      {/* Re-auth Modal */}
      <ReauthModal
        isOpen={showReauthModal}
        onClose={() => setShowReauthModal(false)}
        onReauth={handleReauth}
      />
    </div>
  );
}
