'use client';

import { useState, useRef } from 'react';
import { PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/core/feedback/Badge';
import { SectionAccordion } from '@/components/composed/section-visualization';
import type { WizardStateHook } from '../hooks/useWizardState';
import type { Scenario } from '../lib/types';
import type { HtmlSlide } from '@zod-schema/worked-example-deck';
import { WizardStickyFooter } from './WizardStickyFooter';

interface Step2AnalysisProps {
  wizard: WizardStateHook;
}

// SSE event types from the API
interface SSEStartEvent {
  estimatedSlideCount: number;
  message: string;
}

interface SSESlideEvent {
  slideNumber: number;
  estimatedTotal: number;
  message: string;
  slide?: HtmlSlide; // Included for incremental saving
}

interface SSECompleteEvent {
  success: boolean;
  slideCount: number;
  slides: HtmlSlide[];
}

interface SSEErrorEvent {
  message: string;
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const accumulatedSlidesRef = useRef<HtmlSlide[]>([]);

  const { problemAnalysis, strategyDefinition, scenarios } = state;

  // Handle AI edit of analysis
  const handleAiEdit = async () => {
    if (!aiEditPrompt.trim() || !problemAnalysis || !strategyDefinition || !scenarios) return;

    setIsAiEditing(true);
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
    // PPTX format: 14-16 slides (Learning Goal, Setup, 6 step slides, 2 practice, 1 printable + extras)
    const fullSlideCount = testMode ? 1 : 15 + Math.max(0, scenarios.length - 3);

    // For continue mode, only count remaining slides
    const existingSlides = mode === 'continue' ? state.slides : [];
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

      // Stream ended - if we have slides, proceed to next step
      // (The 'complete' event has a huge payload that may not parse correctly across chunks)
      if (accumulatedSlidesRef.current.length > 0) {
        setSlides([...accumulatedSlidesRef.current]);
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
          setLoadingProgress({ phase: 'idle', message: '' });
          nextStep();
        } else if (accumulatedSlidesRef.current.length > 0) {
          // Fallback: use accumulated slides if complete didn't include them
          setLoadingProgress({ phase: 'idle', message: '' });
          nextStep();
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
        <div className="w-[30%]">
          <div className="sticky top-20 space-y-4">
            {/* Task Image */}
            {(state.masteryCheckImage.preview || state.masteryCheckImage.uploadedUrl) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
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
              <div className="bg-white rounded-lg shadow-sm p-6">
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

      {/* Problem Analysis - Gray header */}
      <SectionAccordion
        title="Problem Analysis"
        subtitle={problemAnalysis.visualType}
        color="#6B7280"
        className="mb-0"
        hideExpandAll
        items={[
          {
            key: 'analysis-details',
            title: problemAnalysis.problemType,
            icon: null,
            content: (
              <div>
                {/* Problem Transcription - verify accuracy */}
                {problemAnalysis.problemTranscription && (
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Problem Transcription
                      <span className="font-normal text-gray-400 ml-2">(verify this matches the image)</span>
                    </h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded p-3 border border-gray-200">
                      {problemAnalysis.problemTranscription}
                    </p>
                  </div>
                )}

                {/* Problem Type */}
                <div className={problemAnalysis.problemTranscription ? "border-b border-gray-200 py-4" : "border-b border-gray-200 pb-4"}>
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
                  <div className={problemAnalysis.graphPlan ? "border-b border-gray-200 py-4" : "pt-4"}>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Common Mistakes</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      {problemAnalysis.commonMistakes.map((mistake, i) => (
                        <li key={i}>{mistake}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Graph Plan (only shown for SVG graphs) */}
                {problemAnalysis.visualType === 'SVG graphs' && problemAnalysis.graphPlan && (
                  <div className="pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Graph Plan
                    </h4>

                    {/* Equations with Line Endpoints */}
                    <div className="border-b border-gray-200 pb-4">
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">Lines (with endpoints)</h5>
                      <div className="space-y-3">
                        {problemAnalysis.graphPlan.equations.map((eq, i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: eq.color }}
                              />
                              <code className="text-gray-700 bg-white px-1.5 py-0.5 rounded text-xs border border-gray-200">
                                {eq.equation}
                              </code>
                              <span className="text-gray-400 text-xs">slope={eq.slope}, b={eq.yIntercept}</span>
                            </div>
                            {/* Line Endpoints - Critical for accurate drawing */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-1.5">
                                <span className="text-gray-500">Start:</span>
                                {eq.startPoint ? (
                                  <code className="text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                                    ({eq.startPoint.x}, {eq.startPoint.y})
                                  </code>
                                ) : (
                                  <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                    missing
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-gray-500">End:</span>
                                {eq.endPoint ? (
                                  <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                    ({eq.endPoint.x}, {eq.endPoint.y})
                                  </code>
                                ) : (
                                  <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                    missing
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Scale */}
                    <div className={problemAnalysis.graphPlan.annotations && problemAnalysis.graphPlan.annotations.length > 0 ? "border-b border-gray-200 py-4" : "pt-4"}>
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">Scale</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {/* X-Axis */}
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-700">X-Axis</div>
                          <div>
                            <span className="text-gray-500">Max:</span>
                            <span className="ml-1 text-gray-600">
                              {problemAnalysis.graphPlan.scale.xMax}
                            </span>
                          </div>
                          {problemAnalysis.graphPlan.scale.xAxisLabels && (
                            <div>
                              <span className="text-gray-500">Labels:</span>
                              <span className="ml-1 text-gray-600">
                                {problemAnalysis.graphPlan.scale.xAxisLabels.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                        {/* Y-Axis */}
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-700">Y-Axis</div>
                          <div>
                            <span className="text-gray-500">Max:</span>
                            <span className="ml-1 text-gray-600">
                              {problemAnalysis.graphPlan.scale.yMax}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Labels:</span>
                            <span className="ml-1 text-gray-600">
                              {problemAnalysis.graphPlan.scale.yAxisLabels.join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Annotations */}
                    {problemAnalysis.graphPlan.annotations && problemAnalysis.graphPlan.annotations.length > 0 && (
                    <div className="pt-4">
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">Annotations</h5>
                      <div className="space-y-2">
                        {problemAnalysis.graphPlan.annotations.map((ann, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <Badge intent="info" size="xs">{ann.type}</Badge>
                            <span className="text-gray-600">{ann.label}</span>
                            {ann.from !== undefined && ann.to !== undefined && (
                              <span className="text-gray-500 text-xs">(y: {ann.from} → {ann.to})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    )}
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />

      {/* Scenarios - Green header with nested accordions */}
      <SectionAccordion
        title="Scenarios"
        subtitle={`${scenarios.length} scenarios`}
        color="#10B981"
        className="mb-0"
        hideExpandAll
        defaultOpenItems={scenarios.map((_, i) => `scenario-${i}`)}
        items={scenarios.map((scenario, index) => ({
          key: `scenario-${index}`,
          title: (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-base">{scenario.themeIcon}</span>
                <span className="text-sm font-medium text-gray-700">{scenario.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  intent={index === 0 ? 'primary' : 'secondary'}
                  appearance="outline"
                  size="xs"
                >
                  {index === 0 ? 'Worked Example' : `Practice ${index}`}
                </Badge>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingScenario(editingScenario === index ? null : index);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      e.preventDefault();
                      setEditingScenario(editingScenario === index ? null : index);
                    }
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                  title={editingScenario === index ? 'Done editing' : 'Edit scenario'}
                >
                  {editingScenario === index ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <PencilIcon className="h-4 w-4" />
                  )}
                </span>
              </div>
            </div>
          ),
          icon: null,
          content: (
            <div>
              {editingScenario === index ? (
                <ScenarioEditor scenario={scenario} onChange={(updated) => updateScenario(index, updated)} />
              ) : (
                <div>
                  {/* Context and Numbers - Same Row */}
                  <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Context</h4>
                      <p className="text-sm text-gray-600">{scenario.context}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Numbers</h4>
                      <p className="text-sm text-gray-600">{scenario.numbers}</p>
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div className="pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Problem Description</h4>
                    <p className="text-sm text-gray-600">{scenario.description}</p>
                  </div>
                </div>
              )}
            </div>
          ),
        }))}
      />
        </div>
      </div>

      {/* Sticky Footer - AI Edit (only when not loading) */}
      {!state.isLoading && (
        <WizardStickyFooter theme="purple" isActive={isAiEditing}>
          {isAiEditing ? (
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-purple-600 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm text-purple-800 flex-1">Editing: {aiEditPrompt}</span>
            </div>
          ) : (
            <div className="flex gap-3 items-center">
              {/* Back button on left */}
              <button
                onClick={prevStep}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer border border-gray-300"
              >
                Back
              </button>
              <input
                type="text"
                value={aiEditPrompt}
                onChange={(e) => setAiEditPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && aiEditPrompt.trim() && handleAiEdit()}
                placeholder="AI Edit: describe corrections (e.g., 'The answer should be 42')"
                className="flex-1 px-3 py-2 text-sm border border-purple-200 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
              />
              <button
                onClick={handleAiEdit}
                disabled={!aiEditPrompt.trim()}
                className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Apply
              </button>
              {/* Show different buttons based on slide count */}
              {state.slides.length >= 15 ? (
                // All slides exist - just show Review + Regenerate
                <>
                  <button
                    onClick={nextStep}
                    className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Review Slides ({state.slides.length})
                  </button>
                  <button
                    onClick={() => handleGenerateSlides(false, 'full')}
                    disabled={state.isLoading}
                    className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg cursor-pointer flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate All
                  </button>
                </>
              ) : state.slides.length > 0 ? (
                // Partial slides - show Continue + Regenerate
                <>
                  <button
                    onClick={() => handleGenerateSlides(false, 'continue')}
                    disabled={state.isLoading}
                    className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg cursor-pointer flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Continue ({state.slides.length}/15)
                  </button>
                  <button
                    onClick={() => handleGenerateSlides(false, 'full')}
                    disabled={state.isLoading}
                    className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg cursor-pointer flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate All
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleGenerateSlides(false, 'full')}
                  disabled={state.isLoading}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg cursor-pointer flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Slides
                </button>
              )}
            </div>
          )}
          {aiEditError && (
            <p className="mt-2 text-sm text-red-600">{aiEditError}</p>
          )}
        </WizardStickyFooter>
      )}
    </div>
  );
}

// Scenario Editor Component
function ScenarioEditor({
  scenario,
  onChange,
}: {
  scenario: Scenario;
  onChange: (scenario: Scenario) => void;
}) {
  return (
    <div className="space-y-2 mt-2">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={scenario.name}
          onChange={(e) => onChange({ ...scenario, name: e.target.value })}
          placeholder="Scenario name"
          className="bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="text"
          value={scenario.themeIcon}
          onChange={(e) => onChange({ ...scenario, themeIcon: e.target.value })}
          placeholder="Icon"
          className="bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <input
        type="text"
        value={scenario.context}
        onChange={(e) => onChange({ ...scenario, context: e.target.value })}
        placeholder="Context"
        className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <input
        type="text"
        value={scenario.numbers}
        onChange={(e) => onChange({ ...scenario, numbers: e.target.value })}
        placeholder="Numbers used"
        className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <textarea
        value={scenario.description}
        onChange={(e) => onChange({ ...scenario, description: e.target.value })}
        placeholder="Full problem description"
        rows={3}
        className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}
