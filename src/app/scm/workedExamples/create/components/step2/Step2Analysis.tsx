'use client';

import { useState, useRef, useEffect } from 'react';
import { PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/core/feedback/Badge';
import { SectionAccordion } from '@/components/composed/section-visualization';
import type { WizardStateHook } from '../../hooks/useWizardState';
import type { HtmlSlide } from '@zod-schema/scm/worked-example';
import { GraphPlanDisplay } from './GraphPlanDisplay';
import { VisualPlanDisplay } from './VisualPlanDisplay';
import { ScenarioEditor } from './ScenarioEditor';
import { AnalysisFooter } from './AnalysisFooter';
import type { SSEStartEvent, SSESlideEvent, SSECompleteEvent, SSEErrorEvent } from './types';

interface Step2AnalysisProps {
  wizard: WizardStateHook;
}

export function Step2Analysis({ wizard }: Step2AnalysisProps) {
  const {
    state,
    updateStrategyName,
    updateScenario,
    setSlides,
    setLoadingProgress,
    setError,
    nextStep,
    prevStep,
  } = wizard;

  const [editingScenario, setEditingScenario] = useState<number | null>(null);
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  const [isAiEditing, setIsAiEditing] = useState(false);
  const [aiEditError, setAiEditError] = useState<string | null>(null);
  const [aiEditStartTime, setAiEditStartTime] = useState<number | null>(null);
  const [aiEditElapsed, setAiEditElapsed] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const accumulatedSlidesRef = useRef<HtmlSlide[]>([]);
  const retryCountRef = useRef(0);
  const MAX_AUTO_RETRIES = 3;

  const { problemAnalysis, strategyDefinition, scenarios } = state;

  // Track elapsed time during AI editing
  useEffect(() => {
    if (!isAiEditing || !aiEditStartTime) {
      setAiEditElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      setAiEditElapsed(Math.floor((Date.now() - aiEditStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isAiEditing, aiEditStartTime]);

  // Handle AI edit of analysis
  const handleAiEdit = async () => {
    if (!aiEditPrompt.trim() || !problemAnalysis || !strategyDefinition || !scenarios) return;

    setIsAiEditing(true);
    setAiEditStartTime(Date.now());
    setAiEditError(null);

    try {
      const response = await fetch('/api/scm/worked-examples/edit-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          editInstructions: aiEditPrompt,
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
        setAiEditPrompt('');
      }
    } catch (error) {
      setAiEditError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsAiEditing(false);
      setAiEditStartTime(null);
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
    // PPTX format: 8 worked example slides (Learning Goal, Setup, 6 step slides with animated CFU/Answer)
    // Printable slide (9) is generated separately after main slides complete
    const fullSlideCount = testMode ? 1 : 8;

    // For continue mode, use accumulated slides from ref (not state, which may be stale during retries)
    // accumulatedSlidesRef always has the most up-to-date slides
    const existingSlides = mode === 'continue' ? accumulatedSlidesRef.current : [];
    const estimatedSlideCount = mode === 'continue'
      ? Math.max(1, fullSlideCount - existingSlides.length)
      : fullSlideCount;

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
                handleSSEEvent(currentEvent, data, startTime, estimatedSlideCount, mode, existingSlides);
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
      const expectedSlideCount = testMode ? 1 : fullSlideCount;

      if (currentSlideCount > 0) {
        setSlides([...accumulatedSlidesRef.current]);

        // Check if incomplete and should auto-retry
        if (currentSlideCount < expectedSlideCount && retryCountRef.current < MAX_AUTO_RETRIES) {
          retryCountRef.current += 1;
          console.log(`[generate-slides] Incomplete: ${currentSlideCount}/${expectedSlideCount}, auto-continuing (attempt ${retryCountRef.current}/${MAX_AUTO_RETRIES})...`);

          setLoadingProgress({
            phase: 'generating',
            message: `Resuming generation (attempt ${retryCountRef.current}/${MAX_AUTO_RETRIES})...`,
            detail: `Generated ${currentSlideCount}/${expectedSlideCount} slides, continuing...`,
            startTime,
            slideProgress: {
              currentSlide: currentSlideCount,
              estimatedTotal: expectedSlideCount,
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

        // All 8 main slides complete - now generate printable (slide 9)
        if (!testMode && scenarios) {
          console.log('[generate-slides] Main slides complete, generating printable...');
          setLoadingProgress({
            phase: 'generating',
            message: 'Creating Slide 9 (printable worksheet)...',
            detail: 'Generating practice problems sheet (slide 9)',
            startTime,
            slideProgress: {
              currentSlide: 9,
              estimatedTotal: 9,
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
    estimatedSlideCount: number,
    mode: GenerationMode,
    existingSlides: HtmlSlide[]
  ) => {
    // For continue mode, we need to track the total (existing + new) slides
    const existingCount = mode === 'continue' ? existingSlides.length : 0;
    const fullSlideCount = existingCount + estimatedSlideCount;

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
            ? `Generating slides ${existingCount + 1}-${fullSlideCount}`
            : `Creating ~${estimatedSlideCount} interactive slides`,
          startTime,
          slideProgress: {
            currentSlide: existingCount,
            estimatedTotal: fullSlideCount,
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
          message: `Creating slide ${displaySlideNumber} of ${fullSlideCount}...`,
          detail: slideData.message,
          startTime,
          slideProgress: {
            currentSlide: displaySlideNumber,
            estimatedTotal: fullSlideCount,
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
                    <li key={i}>{goal}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Accordions (70%) */}
        <div className="w-[70%] space-y-4">
          {/* Worked Example Accordion - Green header */}
          {scenarios[0] && (
            <SectionAccordion
              title={`${scenarios[0].themeIcon} Worked Example`}
              subtitle={scenarios[0].name}
              color="#10B981"
              className="mb-0"
              hideExpandAll
              defaultOpenItems={['we-question', 'we-graph-plan']}
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
                // Visual Plan section (if exists - for non-graph visuals)
                ...(scenarios[0].visualPlan ? [{
                  key: 'we-visual-plan',
                  title: 'Visual Plan',
                  icon: null,
                  content: <VisualPlanDisplay visualPlan={scenarios[0].visualPlan!} compact />,
                }] : []),
                // Graph Plan section (if exists - for coordinate graphs)
                ...(scenarios[0].graphPlan ? [{
                  key: 'we-graph-plan',
                  title: 'Graph Plan',
                  icon: null,
                  content: <GraphPlanDisplay graphPlan={scenarios[0].graphPlan!} compact />,
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

      {/* Strategy - Blue header */}
      <SectionAccordion
        title="Strategy"
        subtitle={`${strategyDefinition.moves.length} steps`}
        color="#3B82F6"
        className="mb-0"
        hideExpandAll
        items={[
          {
            key: 'strategy-details',
            title: strategyDefinition.name,
            icon: null,
            content: (
              <div>
                {/* Strategy Name */}
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Strategy Name</h4>
                  <input
                    type="text"
                    value={strategyDefinition.name}
                    onChange={(e) => updateStrategyName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* One-Sentence Summary */}
                <div className="border-b border-gray-200 py-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">One-Sentence Summary</h4>
                  <p className="text-sm text-gray-600">
                    {strategyDefinition.oneSentenceSummary}
                  </p>
                </div>

                {/* Strategy Steps */}
                <div className="pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Strategy Steps</h4>
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
                </div>
              </div>
            ),
          },
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
