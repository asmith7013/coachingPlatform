'use client';

import { createContext, useContext, useCallback } from 'react';
import { useWizardState, type WizardStateHook } from '../hooks/useWizardState';
import { WizardProgress } from './WizardProgress';
import { Step1Inputs } from './Step1Inputs';
import { Step2Analysis } from './Step2Analysis';
import { Step3Slides } from './Step3Slides';
import { Step4Save } from './Step4Save';
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
  const { state, setStep } = wizard;

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
      case 4:
        return <Step4Save wizard={wizard} />;
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
    </WizardContext.Provider>
  );
}
