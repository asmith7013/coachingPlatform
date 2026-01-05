'use client';

import { createContext, useContext, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useWizardState, type WizardStateHook } from '../hooks/useWizardState';
import { WizardProgress } from './WizardProgress';
import { WizardFooter } from './WizardFooter';
import { Step1Inputs } from './Step1Inputs';
import { Step2Analysis } from './Step2Analysis';
import { Step3Slides } from './Step3Slides';
import type { WizardStep } from '../lib/types';

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

  // Read URL params on mount and load draft if specified
  useEffect(() => {
    if (!isHydrated || initializedRef.current) return;

    const draftId = searchParams.get('draft');
    const stepParam = searchParams.get('step');

    if (draftId) {
      // Load the draft from localStorage
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
  }, [isHydrated, searchParams, loadSession, setStep]);

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
