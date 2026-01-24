'use client';

import { useState, useRef } from 'react';
import { PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/core/feedback/Badge';
import { SectionAccordion } from '@/components/composed/section-visualization';
import type { WizardStateHook } from '../../hooks/useWizardState';
import type { HtmlSlide } from '@zod-schema/scm/worked-example';
import { GraphPlanDisplay } from './GraphPlanDisplay';
import { VisualPlanDisplay } from './VisualPlanDisplay';
import { DiagramPreviewDisplay } from './DiagramPreviewDisplay';
import { SlidePlanDisplay } from './SlidePlanDisplay';
import { ScenarioEditor } from './ScenarioEditor';
import { AnalysisFooter } from './AnalysisFooter';
import type { SSEStartEvent, SSESlideEvent, SSECompleteEvent, SSEErrorEvent } from './types';
import { useElapsedTime } from '../../hooks/useElapsedTime';
import { fileToBase64, revokeImagePreviews } from '../../lib/utils';
import type { EditImage } from '../../lib/types';

/**
 * Get a descriptive name for each slide based on its position.
 * Slide structure:
 * 1. Teacher Instructions
 * 2. Big Idea
 * 3. Problem Setup
 * 4-6. Step slides (with CFU + Answer)
 * 7. Printable worksheet
 */
function getSlideTypeName(slideNum: number): string {
  switch (slideNum) {
    case 1:
      return 'Teacher Instructions';
    case 2:
      return 'Big Idea';
    case 3:
      return 'Problem Setup';
    case 4:
      return 'Step 1';
    case 5:
      return 'Step 2';
    case 6:
      return 'Step 3';
    case 7:
      return 'Print Page';
    default:
      return `Slide ${slideNum}`;
  }
}

interface Step2AnalysisProps {
  wizard: WizardStateHook;
}

export function Step2Analysis({ wizard }: Step2AnalysisProps) {
  const {
    state,
    updateBigIdea,
    updateStrategyMoves,
    updateScenario,
    setSlides,
    setLoadingProgress,
    setError,
    nextStep,
    prevStep,
  } = wizard;

  const [editingScenario, setEditingScenario] = useState<number | null>(null);
  const [editingBigIdea, setEditingBigIdea] = useState(false);
  const [editingStrategySteps, setEditingStrategySteps] = useState(false);
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  const [aiEditImages, setAiEditImages] = useState<EditImage[]>([]);
  const [isAiEditing, setIsAiEditing] = useState(false);
  const [aiEditError, setAiEditError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const accumulatedSlidesRef = useRef<HtmlSlide[]>([]);
  const retryCountRef = useRef(0);
  const MAX_AUTO_RETRIES = 3;

  const { problemAnalysis, strategyDefinition, scenarios } = state;

  // Track elapsed time during AI editing
  const { elapsed: aiEditElapsed, start: startAiEditTimer } = useElapsedTime(isAiEditing);

  // Handle AI edit of analysis
  const handleAiEdit = async () => {
    // Need either prompt text or images
    const hasPrompt = aiEditPrompt.trim();
    const hasImages = aiEditImages.length > 0;
    if ((!hasPrompt && !hasImages) || !problemAnalysis || !strategyDefinition || !scenarios) return;

    setIsAiEditing(true);
    startAiEditTimer();
    setAiEditError(null);

    try {
      // Convert images to base64
      const imageDataUrls = await Promise.all(
        aiEditImages.map(img => fileToBase64(img.file))
      );

      const response = await fetch('/api/scm/worked-examples/edit-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          editInstructions: aiEditPrompt,
          images: imageDataUrls,
          problemAnalysis,
          strategyDefinition,
          scenarios,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAiEditError(data.error || 'Failed to edit analysis');
        return;
      }

      if (data.success) {
        // Update state with edited analysis using setAnalysis
        wizard.setAnalysis({
          problemAnalysis: data.problemAnalysis || problemAnalysis,
          strategyDefinition: data.strategyDefinition || strategyDefinition,
          scenarios: data.scenarios || scenarios,
        });
        // Clear prompt and images on success
        setAiEditPrompt('');
        revokeImagePreviews(aiEditImages);
        setAiEditImages([]);
      }
    } catch (error) {
      setAiEditError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsAiEditing(false);
    }
  };

  // Generation mode type
  type GenerationMode = 'full' | 'continue';

  // Handle generating slides with SSE streaming
  const handleGenerateSlides = async (testMode = false, mode: GenerationMode = 'full') => {
    if (!problemAnalysis || !strategyDefinition || !scenarios) {
      setError('Missing analysis data');
      return;
    }

    setError(null);
    const startTime = Date.now();
    // PPTX format: 6 worked example slides (Teacher Instructions, Big Idea, Setup, 3 step slides with stacked CFU/Answer)
    // + Printable slide (7) generated separately after main slides complete
    const mainSlideCount = testMode ? 1 : 6;  // Slides generated by main SSE API
    const totalSlideCount = testMode ? 1 : 7; // Total including printable (for progress display)

    // For continue mode, use accumulated slides from ref (not state, which may be stale during retries)
    // accumulatedSlidesRef always has the most up-to-date slides
    const existingSlides = mode === 'continue' ? accumulatedSlidesRef.current : [];
    const estimatedSlideCount = mode === 'continue'
      ? Math.max(1, mainSlideCount - existingSlides.length)
      : mainSlideCount;

    const modeMessage = mode === 'continue'
      ? `Continuing from slide ${existingSlides.length + 1}...`
      : 'Starting slide generation...';

    setLoadingProgress({
      phase: 'generating',
      message: testMode ? 'Testing with 1 slide...' : modeMessage,
      detail: testMode
        ? 'Quick test to verify streaming'
        : mode === 'continue'
          ? `Generating ~${estimatedSlideCount} remaining slides`
          : `Creating ~${estimatedSlideCount} PPTX-compatible slides`,
      startTime,
    });

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/scm/worked-examples/generate-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel: state.gradeLevel || '8',
          unitNumber: state.unitNumber,
          lessonNumber: state.lessonNumber,
          learningGoals: state.learningGoals,
          problemAnalysis,
          strategyDefinition,
          scenarios,
          testMode,
          // Context-aware generation
          mode,
          existingSlides: mode === 'continue' ? existingSlides : undefined,
          // For email notification
          slug: state.slug,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to start slide generation');
        return;
      }

      // Read the SSE stream
      const reader = response.body?.getReader();
      if (!reader) {
        setError('Failed to read response stream');
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        let currentEvent = '';
        let currentData = '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7);
          } else if (line.startsWith('data: ')) {
            currentData = line.slice(6);

            // Process the event
            if (currentEvent && currentData) {
              try {
                const data = JSON.parse(currentData);
                handleSSEEvent(currentEvent, data, startTime, totalSlideCount, mode, existingSlides);
              } catch (e) {
                console.warn('Failed to parse SSE data:', e);
              }
            }

            currentEvent = '';
            currentData = '';
          }
        }
      }

      // Stream ended - check if generation is complete
      const currentSlideCount = accumulatedSlidesRef.current.length;
      const expectedSlideCount = testMode ? 1 : mainSlideCount;

      if (currentSlideCount > 0) {
        setSlides([...accumulatedSlidesRef.current]);

        // Check if incomplete and should auto-retry
        if (currentSlideCount < expectedSlideCount && retryCountRef.current < MAX_AUTO_RETRIES) {
          retryCountRef.current += 1;
          console.log(`[generate-slides] Incomplete: ${currentSlideCount}/${expectedSlideCount}, auto-continuing (attempt ${retryCountRef.current}/${MAX_AUTO_RETRIES})...`);

          setLoadingProgress({
            phase: 'generating',
            message: `Resuming generation (attempt ${retryCountRef.current}/${MAX_AUTO_RETRIES})...`,
            detail: `Generated ${currentSlideCount}/${totalSlideCount} slides, continuing...`,
            startTime,
            slideProgress: {
              currentSlide: currentSlideCount,
              estimatedTotal: totalSlideCount,
            },
          });

          // Small delay before retrying to avoid hammering the API
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Recursively continue generation
          await handleGenerateSlides(testMode, 'continue');
          return;
        }

        // Complete or max retries reached
        if (currentSlideCount < expectedSlideCount) {
          console.log(`[generate-slides] Max retries reached. Generated ${currentSlideCount}/${expectedSlideCount} slides.`);
          // Show a warning to the user - they can manually continue in step 3
          setError(`Generated ${currentSlideCount} of ${expectedSlideCount} slides. You can continue generation from step 3 if needed.`);
          retryCountRef.current = 0;
          setLoadingProgress({ phase: 'idle', message: '' });
          nextStep();
          return;
        }

        // All 6 main slides complete - now generate printable (slide 7)
        if (!testMode && scenarios) {
          console.log('[generate-slides] Main slides complete, generating printable...');
          setLoadingProgress({
            phase: 'generating',
            message: 'Creating Print Page...',
            detail: 'Generating printable practice worksheet',
            startTime,
            slideProgress: {
              currentSlide: 7,
              estimatedTotal: 7,
            },
          });

          try {
            // Create AbortController for timeout (5 minutes)
            const printableAbortController = new AbortController();
            const printableTimeout = setTimeout(() => {
              printableAbortController.abort();
              console.warn('[generate-slides] Printable generation timed out after 5 minutes');
            }, 5 * 60 * 1000);

            console.log('[generate-slides] Calling printable API...');
            const printableResponse = await fetch('/api/scm/worked-examples/generate-printable', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                practiceScenarios: scenarios.slice(1), // Practice scenarios only (indices 1 and 2)
                strategyName: strategyDefinition?.name || 'Strategy',
                strategyMoves: strategyDefinition?.moves || [],
                problemType: problemAnalysis?.problemType || 'Math Problem',
                gradeLevel: state.gradeLevel || '8',
                unitNumber: state.unitNumber,
                lessonNumber: state.lessonNumber,
                learningGoals: state.learningGoals,
              }),
              signal: printableAbortController.signal,
            });

            clearTimeout(printableTimeout);
            console.log('[generate-slides] Printable API responded, status:', printableResponse.status);

            if (!printableResponse.ok) {
              const errorText = await printableResponse.text();
              console.error('[generate-slides] Printable API error response:', errorText);
              setError(`Printable generation failed (${printableResponse.status}). You can regenerate from step 3.`);
            } else {
              const printableData = await printableResponse.json();
              console.log('[generate-slides] Printable data received, success:', printableData.success);

              if (printableData.success && printableData.htmlContent) {
                const printableSlide: HtmlSlide = {
                  slideNumber: 9,
                  htmlContent: printableData.htmlContent,
                  visualType: 'html',
                };
                accumulatedSlidesRef.current.push(printableSlide);
                setSlides([...accumulatedSlidesRef.current]);
                console.log('[generate-slides] Printable slide added successfully, total slides:', accumulatedSlidesRef.current.length);
              } else {
                console.warn('[generate-slides] Printable generation failed:', printableData.error);
                setError(`Printable generation failed: ${printableData.error || 'Unknown error'}. You can regenerate from step 3.`);
              }
            }
          } catch (printableError) {
            if (printableError instanceof Error && printableError.name === 'AbortError') {
              console.error('[generate-slides] Printable generation timed out');
              setError('Printable generation timed out. You can regenerate from step 3.');
            } else {
              console.error('[generate-slides] Printable generation error:', printableError);
              setError(`Printable generation error: ${printableError instanceof Error ? printableError.message : 'Unknown error'}. You can regenerate from step 3.`);
            }
          }
        }

        retryCountRef.current = 0; // Reset for next generation
        setLoadingProgress({ phase: 'idle', message: '' });
        nextStep();
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Slide generation cancelled');
        setLoadingProgress({ phase: 'idle', message: '' });
        return;
      }
      console.error('Error generating slides:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      abortControllerRef.current = null;
    }
  };

  // Handle SSE events
  const handleSSEEvent = (
    event: string,
    data: SSEStartEvent | SSESlideEvent | SSECompleteEvent | SSEErrorEvent,
    startTime: number,
    totalSlideCount: number, // Total slides including printable (for progress display)
    mode: GenerationMode,
    existingSlides: HtmlSlide[]
  ) => {
    // For continue mode, we need to track existing slides for proper numbering
    const existingCount = mode === 'continue' ? existingSlides.length : 0;

    switch (event) {
      case 'start':
        // For continue mode, start with existing slides; for full mode, start fresh
        if (mode === 'continue') {
          accumulatedSlidesRef.current = [...existingSlides];
        } else {
          accumulatedSlidesRef.current = [];
        }
        setLoadingProgress({
          phase: 'generating',
          message: mode === 'continue' ? 'Resuming generation...' : 'Connected to AI...',
          detail: mode === 'continue'
            ? `Generating slides ${existingCount + 1}-${totalSlideCount}`
            : `Creating ${totalSlideCount} interactive slides`,
          startTime,
          slideProgress: {
            currentSlide: existingCount,
            estimatedTotal: totalSlideCount,
          },
        });
        break;

      case 'slide': {
        const slideData = data as SSESlideEvent;

        // Incrementally save slide if provided (preserves progress on interruption)
        if (slideData.slide) {
          // Renumber the slide for continue mode (API returns 1-indexed new slides)
          const adjustedSlide = mode === 'continue'
            ? { ...slideData.slide, slideNumber: existingCount + slideData.slideNumber }
            : slideData.slide;
          accumulatedSlidesRef.current.push(adjustedSlide);
          setSlides([...accumulatedSlidesRef.current]);
        }

        // Adjust slide number display for continue mode
        const displaySlideNumber = mode === 'continue'
          ? existingCount + slideData.slideNumber
          : slideData.slideNumber;

        setLoadingProgress({
          phase: 'generating',
          message: `Creating ${getSlideTypeName(displaySlideNumber)}...`,
          detail: slideData.message,
          startTime,
          slideProgress: {
            currentSlide: displaySlideNumber,
            estimatedTotal: totalSlideCount,
          },
        });
        break;
      }

      case 'complete': {
        const completeData = data as SSECompleteEvent;
        if (completeData.success && completeData.slides) {
          // For continue mode, merge existing with new slides
          if (mode === 'continue') {
            const newSlidesRenumbered = completeData.slides.map((slide, i) => ({
              ...slide,
              slideNumber: existingCount + i + 1,
            }));
            const mergedSlides = [...existingSlides, ...newSlidesRenumbered];
            setSlides(mergedSlides);
            accumulatedSlidesRef.current = mergedSlides;
          } else {
            // Full mode: use complete slides as final source of truth
            setSlides(completeData.slides);
            accumulatedSlidesRef.current = completeData.slides;
          }
          // NOTE: Don't call nextStep() here - the code after the SSE loop
          // handles generating the printable slide (9) and then calls nextStep()
        } else if (accumulatedSlidesRef.current.length > 0) {
          // Fallback: use accumulated slides if complete didn't include them
          // (printable generation will happen after SSE loop ends)
        } else {
          setError('Generation completed but no slides received');
        }
        break;
      }

      case 'error': {
        const errorData = data as SSEErrorEvent;
        setError(errorData.message || 'An error occurred during generation');
        break;
      }
    }
  };

  if (!problemAnalysis || !strategyDefinition || !scenarios) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center py-12">
        <p className="text-gray-600">No analysis data available. Please go back and analyze a problem.</p>
        <button
          onClick={prevStep}
          className="mt-4 text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Error Message */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {state.error}
        </div>
      )}

      {/* Two Column Layout */}
      <div className="flex gap-6">
        {/* Left Column - Task Image and Learning Targets (30%) */}
        <div className="w-[30%] bg-[#6B7280] rounded-lg p-4">
          <div className="sticky top-8 space-y-4">
            {/* Unit and Lesson Badges */}
            {(state.unitNumber || state.lessonNumber) && (
              <div className="flex flex-wrap gap-2">
                {state.gradeLevel && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">Grade {state.gradeLevel}</span>
                )}
                {state.unitNumber && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">Unit {state.unitNumber}</span>
                )}
                {state.lessonNumber !== null && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">Lesson {state.lessonNumber}</span>
                )}
              </div>
            )}

            {/* Task Image */}
            {(state.masteryCheckImage.preview || state.masteryCheckImage.uploadedUrl) && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Task</h4>
                <img
                  src={state.masteryCheckImage.preview || state.masteryCheckImage.uploadedUrl || ''}
                  alt="Task"
                  className="w-full rounded border border-gray-200"
                />
              </div>
            )}

            {/* Learning Targets */}
            {state.learningGoals && state.learningGoals.length > 0 && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Learning Targets</h4>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  {state.learningGoals.map((goal, i) => (
                    <li key={i}>{typeof goal === 'string' ? goal : JSON.stringify(goal)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Accordions (70%) */}
        <div className="w-[70%] space-y-4">
          {/* Big Idea Card - FIRST element in right column, EDITABLE */}
          {strategyDefinition.bigIdea && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 bg-blue-100 rounded text-xs font-bold text-blue-700 uppercase tracking-wide">
                  Big Idea
                </span>
                <button
                  onClick={() => setEditingBigIdea(!editingBigIdea)}
                  className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded cursor-pointer"
                  title={editingBigIdea ? 'Done editing' : 'Edit Big Idea'}
                >
                  {editingBigIdea ? <CheckIcon className="h-4 w-4" /> : <PencilIcon className="h-4 w-4" />}
                </button>
              </div>
              {editingBigIdea ? (
                <textarea
                  value={strategyDefinition.bigIdea}
                  onChange={(e) => updateBigIdea(e.target.value)}
                  className="w-full bg-white text-blue-900 text-lg font-medium rounded p-2 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  rows={2}
                />
              ) : (
                <p className="text-lg font-medium text-blue-900">
                  {strategyDefinition.bigIdea}
                </p>
              )}
            </div>
          )}

          {/* Worked Example Accordion - Green header */}
          {scenarios[0] && (
            <SectionAccordion
              title={`${scenarios[0].themeIcon} Worked Example`}
              subtitle={scenarios[0].name}
              color="#10B981"
              className="mb-0"
              hideExpandAll
              defaultOpenItems={['we-question', 'we-diagram-evolution', 'we-graph-plan']}
              items={[
                // Question section
                {
                  key: 'we-question',
                  title: (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium text-gray-700">Question</span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingScenario(editingScenario === 0 ? null : 0);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            e.preventDefault();
                            setEditingScenario(editingScenario === 0 ? null : 0);
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        title={editingScenario === 0 ? 'Done editing' : 'Edit scenario'}
                      >
                        {editingScenario === 0 ? (
                          <CheckIcon className="h-4 w-4" />
                        ) : (
                          <PencilIcon className="h-4 w-4" />
                        )}
                      </span>
                    </div>
                  ),
                  icon: null,
                  content: editingScenario === 0 ? (
                    <ScenarioEditor scenario={scenarios[0]} onChange={(updated) => updateScenario(0, updated)} />
                  ) : (
                    <div>
                      <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Context</h4>
                          <p className="text-sm text-gray-600">{scenarios[0].context}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Numbers</h4>
                          <p className="text-sm text-gray-600">{scenarios[0].numbers}</p>
                        </div>
                      </div>
                      <div className="pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Problem Description</h4>
                        <p className="text-sm text-gray-600">{scenarios[0].description}</p>
                      </div>
                    </div>
                  ),
                },
                // Diagram Evolution section (shows step-by-step visual progression)
                ...(problemAnalysis.diagramEvolution ? [{
                  key: 'we-diagram-evolution',
                  title: 'Diagram Evolution',
                  icon: null,
                  content: (
                    <SlidePlanDisplay
                      diagramEvolution={problemAnalysis.diagramEvolution!}
                      visualType={problemAnalysis.visualType}
                      svgSubtype={problemAnalysis.svgSubtype}
                      stepCount={strategyDefinition.moves.length}
                    />
                  ),
                }] : []),
                // Strategy Steps section (editable)
                {
                  key: 'we-strategy-steps',
                  title: (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium text-gray-700">Strategy Steps</span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingStrategySteps(!editingStrategySteps);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            e.preventDefault();
                            setEditingStrategySteps(!editingStrategySteps);
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        title={editingStrategySteps ? 'Done editing' : 'Edit strategy steps'}
                      >
                        {editingStrategySteps ? (
                          <CheckIcon className="h-4 w-4" />
                        ) : (
                          <PencilIcon className="h-4 w-4" />
                        )}
                      </span>
                    </div>
                  ),
                  icon: null,
                  content: editingStrategySteps ? (
                    <div className="space-y-4">
                      {strategyDefinition.moves.map((move, i) => (
                        <div key={i} className="bg-gray-50 rounded p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge intent="primary" size="xs" rounded="full">{i + 1}</Badge>
                            <input
                              type="text"
                              value={move.verb}
                              onChange={(e) => {
                                const updated = [...strategyDefinition.moves];
                                updated[i] = { ...updated[i], verb: e.target.value };
                                updateStrategyMoves(updated);
                              }}
                              className="font-semibold text-sm border border-gray-300 rounded px-2 py-1 w-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Verb"
                            />
                          </div>
                          <input
                            type="text"
                            value={move.description}
                            onChange={(e) => {
                              const updated = [...strategyDefinition.moves];
                              updated[i] = { ...updated[i], description: e.target.value };
                              updateStrategyMoves(updated);
                            }}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Description"
                          />
                          <input
                            type="text"
                            value={move.result}
                            onChange={(e) => {
                              const updated = [...strategyDefinition.moves];
                              updated[i] = { ...updated[i], result: e.target.value };
                              updateStrategyMoves(updated);
                            }}
                            className="w-full text-sm text-gray-500 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Result (optional)"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {strategyDefinition.moves.map((move, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Badge intent="primary" size="xs" rounded="full">
                            {i + 1}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-gray-900 text-sm">{move.verb}</span>
                            <span className="text-gray-600 text-sm">: {move.description}</span>
                            {move.result && (
                              <span className="text-gray-500 text-xs block mt-0.5">→ {move.result}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ),
                },
                // Graph Plan section (if exists - for coordinate graphs)
                ...(scenarios[0].graphPlan ? [{
                  key: 'we-graph-plan',
                  title: 'Graph Plan',
                  icon: null,
                  content: <GraphPlanDisplay graphPlan={scenarios[0].graphPlan!} compact />,
                }] : []),
                // Note: diagramPreview is now deprecated in favor of diagramEvolution (which includes keyElements)
                // For backward compatibility, show diagramPreview only if diagramEvolution is NOT present
                ...(!problemAnalysis.diagramEvolution && problemAnalysis.diagramPreview ? [{
                  key: 'we-diagram-preview',
                  title: 'Visual Structure Preview (Legacy)',
                  icon: null,
                  content: (
                    <div>
                      <p className="text-xs text-gray-500 mb-3">
                        This preview shows the planned visual structure for the worked example.
                      </p>
                      <DiagramPreviewDisplay diagramPreview={problemAnalysis.diagramPreview!} />
                    </div>
                  ),
                }] : []),
              ]}
            />
          )}

          {/* Practice Problems Accordion - Orange header */}
          {scenarios.length > 1 && (
            <SectionAccordion
              title="Practice Problems"
              subtitle={`${scenarios.length - 1} problems`}
              color="#F59E0B"
              className="mb-0"
              hideExpandAll
              defaultOpenItems={['practice-1-question']}
              items={[
                // Practice 1 (includes Graph Plan if exists)
                ...(scenarios[1] ? [{
                  key: 'practice-1-question',
                  title: (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{scenarios[1].themeIcon}</span>
                        <span className="text-sm font-medium text-gray-700">Practice 1: {scenarios[1].name}</span>
                        {scenarios[1].visualPlan && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">Visual</span>
                        )}
                        {scenarios[1].graphPlan && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">Graph</span>
                        )}
                      </div>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          setEditingScenario(editingScenario === 1 ? null : 1);
                        }}
                        onKeyDown={(e: React.KeyboardEvent) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            e.preventDefault();
                            setEditingScenario(editingScenario === 1 ? null : 1);
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        title={editingScenario === 1 ? 'Done editing' : 'Edit scenario'}
                      >
                        {editingScenario === 1 ? (
                          <CheckIcon className="h-4 w-4" />
                        ) : (
                          <PencilIcon className="h-4 w-4" />
                        )}
                      </span>
                    </div>
                  ),
                  icon: null,
                  content: editingScenario === 1 ? (
                    <ScenarioEditor scenario={scenarios[1]} onChange={(updated) => updateScenario(1, updated)} />
                  ) : (
                    <div>
                      <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Context</h4>
                          <p className="text-sm text-gray-600">{scenarios[1].context}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Numbers</h4>
                          <p className="text-sm text-gray-600">{scenarios[1].numbers}</p>
                        </div>
                      </div>
                      <div className={(scenarios[1].visualPlan || scenarios[1].graphPlan) ? "border-b border-gray-200 py-4" : "pt-4"}>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Problem Description</h4>
                        <p className="text-sm text-gray-600">{scenarios[1].description}</p>
                      </div>
                      {/* Visual Plan (if exists - for non-graph visuals) */}
                      {scenarios[1].visualPlan && (
                        <div className={scenarios[1].graphPlan ? "border-b border-gray-200 py-4" : "pt-4"}>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            Visual Plan
                          </h4>
                          <VisualPlanDisplay visualPlan={scenarios[1].visualPlan} compact />
                        </div>
                      )}
                      {/* Graph Plan (if exists) */}
                      {scenarios[1].graphPlan && (
                        <div className="pt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            Graph Plan
                          </h4>
                          <GraphPlanDisplay graphPlan={scenarios[1].graphPlan} compact />
                        </div>
                      )}
                    </div>
                  ),
                }] : []),
                // Practice 2 (includes Visual/Graph Plan if exists)
                ...(scenarios[2] ? [{
                  key: 'practice-2-question',
                  title: (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{scenarios[2].themeIcon}</span>
                        <span className="text-sm font-medium text-gray-700">Practice 2: {scenarios[2].name}</span>
                        {scenarios[2].visualPlan && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">Visual</span>
                        )}
                        {scenarios[2].graphPlan && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">Graph</span>
                        )}
                      </div>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          setEditingScenario(editingScenario === 2 ? null : 2);
                        }}
                        onKeyDown={(e: React.KeyboardEvent) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            e.preventDefault();
                            setEditingScenario(editingScenario === 2 ? null : 2);
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        title={editingScenario === 2 ? 'Done editing' : 'Edit scenario'}
                      >
                        {editingScenario === 2 ? (
                          <CheckIcon className="h-4 w-4" />
                        ) : (
                          <PencilIcon className="h-4 w-4" />
                        )}
                      </span>
                    </div>
                  ),
                  icon: null,
                  content: editingScenario === 2 ? (
                    <ScenarioEditor scenario={scenarios[2]} onChange={(updated) => updateScenario(2, updated)} />
                  ) : (
                    <div>
                      <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Context</h4>
                          <p className="text-sm text-gray-600">{scenarios[2].context}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Numbers</h4>
                          <p className="text-sm text-gray-600">{scenarios[2].numbers}</p>
                        </div>
                      </div>
                      <div className={(scenarios[2].visualPlan || scenarios[2].graphPlan) ? "border-b border-gray-200 py-4" : "pt-4"}>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Problem Description</h4>
                        <p className="text-sm text-gray-600">{scenarios[2].description}</p>
                      </div>
                      {/* Visual Plan (if exists - for non-graph visuals) */}
                      {scenarios[2].visualPlan && (
                        <div className={scenarios[2].graphPlan ? "border-b border-gray-200 py-4" : "pt-4"}>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            Visual Plan
                          </h4>
                          <VisualPlanDisplay visualPlan={scenarios[2].visualPlan} compact />
                        </div>
                      )}
                      {/* Graph Plan (if exists) */}
                      {scenarios[2].graphPlan && (
                        <div className="pt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            Graph Plan
                          </h4>
                          <GraphPlanDisplay graphPlan={scenarios[2].graphPlan} compact />
                        </div>
                      )}
                    </div>
                  ),
                }] : []),
              ]}
            />
          )}

      {/* Problem Analysis - Gray header */}
      <SectionAccordion
        title="Initial Problem Analysis"
        subtitle={problemAnalysis.visualType === 'svg-visual' && problemAnalysis.svgSubtype
          ? `${problemAnalysis.visualType}: ${problemAnalysis.svgSubtype}`
          : problemAnalysis.visualType}
        color="#6B7280"
        className="mb-0"
        hideExpandAll
        defaultOpenItems={['analysis-details']}
        items={[
          // Analysis - open by default
          {
            key: 'analysis-details',
            title: 'Analysis',
            icon: null,
            content: (
              <div>
                {/* Problem Type */}
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Problem Type</h4>
                  <p className="text-sm text-gray-600">{problemAnalysis.problemType}</p>
                </div>

                {/* Answer */}
                <div className="border-b border-gray-200 py-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Answer</h4>
                  <p className="text-sm text-gray-600">
                    {problemAnalysis.answer}
                  </p>
                </div>

                {/* Key Challenge */}
                <div className={problemAnalysis.commonMistakes.length > 0 ? "border-b border-gray-200 py-4" : "pt-4"}>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Challenge</h4>
                  <p className="text-sm text-gray-600">{problemAnalysis.keyChallenge}</p>
                </div>

                {/* Common Mistakes */}
                {problemAnalysis.commonMistakes.length > 0 && (
                  <div className="pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Common Mistakes</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      {problemAnalysis.commonMistakes.map((mistake, i) => (
                        <li key={i}>{mistake}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ),
          },
          // Graph Plan - closed by default (only shown for svg-visual with coordinate-graph subtype)
          ...(problemAnalysis.visualType === 'svg-visual' && problemAnalysis.svgSubtype === 'coordinate-graph' && problemAnalysis.graphPlan ? [{
            key: 'graph-plan',
            title: 'Graph Plan',
            icon: null,
            content: (
              <GraphPlanDisplay graphPlan={problemAnalysis.graphPlan!} />
            ),
          }] : []),
          // Problem Transcription - closed by default (at bottom)
          ...(problemAnalysis.problemTranscription ? [{
            key: 'problem-transcription',
            title: 'Problem Transcription',
            icon: null,
            content: (
              <div>
                <p className="text-xs text-gray-400 mb-2">(verify this matches the image)</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded p-3 border border-gray-200">
                  {problemAnalysis.problemTranscription}
                </p>
              </div>
            ),
          }] : []),
        ]}
      />
        </div>
      </div>

      {/* Sticky Footer - AI Edit */}
      <AnalysisFooter
        isLoading={state.isLoading}
        isAiEditing={isAiEditing}
        aiEditPrompt={aiEditPrompt}
        setAiEditPrompt={setAiEditPrompt}
        aiEditImages={aiEditImages}
        setAiEditImages={setAiEditImages}
        aiEditElapsed={aiEditElapsed}
        aiEditError={aiEditError}
        handleAiEdit={handleAiEdit}
        prevStep={prevStep}
        nextStep={nextStep}
        handleGenerateSlides={handleGenerateSlides}
        slideCount={state.slides.length}
      />
    </div>
  );
}
