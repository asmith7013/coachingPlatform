'use client';

import { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useWizardState, type WizardStateHook } from '../../hooks/useWizardState';
import { WizardProgress } from './WizardProgress';
import { WizardFooter } from './WizardFooter';
import { Step1Inputs } from '../step1/Step1Inputs';
import { Step2Analysis } from '../step2/Step2Analysis';
import { Step3Slides } from '../step3/Step3Slides';
import { getDeckBySlug } from '@/app/actions/worked-examples';
import type { WizardStep, GradeLevel } from '../../lib/types';

// Context for sharing wizard state
const WizardContext = createContext<WizardStateHook | null>(null);

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within WizardContainer');
  }
  return context;
}

export function WizardContainer() {
  const wizard = useWizardState();
  const { state, setStep, loadSession, isHydrated } = wizard;
  const router = useRouter();
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);
  const [isLoadingDeck, setIsLoadingDeck] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Read URL params on mount and load draft or existing deck for editing
  useEffect(() => {
    if (!isHydrated || initializedRef.current) return;

    const editSlug = searchParams.get('editSlug');
    const draftId = searchParams.get('draft');
    const stepParam = searchParams.get('step');

    // Priority 1: Load existing deck for editing
    if (editSlug) {
      initializedRef.current = true;
      setIsLoadingDeck(true);
      setLoadError(null);

      getDeckBySlug(editSlug).then((result) => {
        setIsLoadingDeck(false);

        if (!result.success || !result.data) {
          setLoadError(result.error || 'Failed to load deck');
          return;
        }

        const deck = result.data;

        // Load basic deck info
        if (deck.gradeLevel) wizard.setGradeLevel(deck.gradeLevel as GradeLevel);
        if (deck.unitNumber != null) wizard.setUnitNumber(deck.unitNumber);
        if (deck.lessonNumber != null) wizard.setLessonNumber(deck.lessonNumber);
        if (deck.scopeAndSequenceId) wizard.setScopeAndSequenceId(deck.scopeAndSequenceId);
        if (deck.learningGoals?.length) wizard.setLearningGoals(deck.learningGoals);

        // Load title/slug/metadata
        if (deck.title) wizard.setTitle(deck.title);
        // Use a new slug to create a new version
        if (deck.slug) wizard.setSlug(`${deck.slug}-edit`);
        if (deck.mathConcept) wizard.setMathConcept(deck.mathConcept);
        if (deck.mathStandard) wizard.setMathStandard(deck.mathStandard);

        // Load analysis data (the key part for editing!)
        if (deck.problemAnalysis && deck.strategyDefinition && deck.scenarios) {
          wizard.setAnalysis({
            problemAnalysis: deck.problemAnalysis,
            strategyDefinition: deck.strategyDefinition,
            scenarios: deck.scenarios,
          });
        }

        // Load slides
        if (deck.htmlSlides?.length) {
          wizard.setSlides(deck.htmlSlides);
        }

        // Jump to Step 3 (slides editing)
        setStep(3);
      });

      return;
    }

    // Priority 2: Load draft from localStorage
    if (draftId) {
      const loaded = loadSession(draftId);
      if (loaded) {
        initializedRef.current = true;
        return;
      }
    }

    // If step param is set without a draft, just go to that step
    if (stepParam) {
      const stepNum = parseInt(stepParam, 10) as WizardStep;
      if (stepNum >= 1 && stepNum <= 3) {
        setStep(stepNum);
      }
    }

    initializedRef.current = true;
  }, [isHydrated, searchParams, loadSession, setStep, wizard]);

  // Update URL when step or draft changes
  useEffect(() => {
    if (!isHydrated || !initializedRef.current) return;

    const params = new URLSearchParams(searchParams.toString());

    // Update step param
    params.set('step', String(state.currentStep));

    // Update draft param if we have a scopeAndSequenceId (active draft)
    if (state.scopeAndSequenceId) {
      params.set('draft', state.scopeAndSequenceId);
    } else {
      params.delete('draft');
    }

    // Update URL without adding to history (use replace)
    router.replace(`/scm/workedExamples/create?${params.toString()}`, { scroll: false });
  }, [state.currentStep, state.scopeAndSequenceId, isHydrated, router, searchParams]);

  // Handle step navigation from progress bar
  const handleStepClick = useCallback((step: WizardStep) => {
    // Only allow navigation to completed steps (go back) or next step (advance)
    if (step < state.currentStep) {
      // Going back - always allowed
      setStep(step);
    } else if (step === state.currentStep + 1) {
      // Advancing - only if current step requirements are met
      // For now, just advance (individual steps handle validation)
      setStep(step);
    }
  }, [state.currentStep, setStep]);

  // Render current step
  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <Step1Inputs wizard={wizard} />;
      case 2:
        return <Step2Analysis wizard={wizard} />;
      case 3:
        return <Step3Slides wizard={wizard} />;
      default:
        return <Step1Inputs wizard={wizard} />;
    }
  };

  // Loading state while fetching deck for editing
  if (isLoadingDeck) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading deck for editing...</p>
        </div>
      </div>
    );
  }

  // Error state if deck load failed
  if (loadError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Deck</h3>
        <p className="text-red-700 mb-4">{loadError}</p>
        <button
          onClick={() => router.push('/scm/workedExamples/create')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
        >
          Start Fresh
        </button>
      </div>
    );
  }

  return (
    <WizardContext.Provider value={wizard}>
      <WizardProgress
        currentStep={state.currentStep}
        onStepClick={handleStepClick}
        isLoading={state.isLoading}
      />
      {renderStep()}
      <WizardFooter
        isLoading={state.isLoading}
        loadingProgress={state.loadingProgress}
      />
    </WizardContext.Provider>
  );
}
