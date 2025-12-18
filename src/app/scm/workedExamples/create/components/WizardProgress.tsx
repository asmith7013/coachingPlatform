'use client';

import type { WizardStep } from '../lib/types';

interface WizardProgressProps {
  currentStep: WizardStep;
}

const STEPS = [
  { number: 1, label: 'Input', subtitle: 'Upload task and set learning goals' },
  { number: 2, label: 'Analysis', subtitle: 'Review AI analysis, then generate slides' },
  { number: 3, label: 'Slides', subtitle: 'Preview and edit slides' },
  { number: 4, label: 'Save', subtitle: 'Review and save' },
] as const;

export function WizardProgress({ currentStep }: WizardProgressProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between">
        {STEPS.map((step) => (
          <div key={step.number} className="flex items-center gap-2">
            {/* Step Circle */}
            <div
              className={`
                flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors
                ${
                  step.number < currentStep
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : step.number === currentStep
                    ? 'bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }
              `}
            >
              {step.number < currentStep ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.number
              )}
            </div>

            {/* Step Label and Subtitle */}
            <div className="hidden sm:block">
              <div
                className={`
                  text-sm font-medium
                  ${
                    step.number <= currentStep ? 'text-gray-900' : 'text-gray-400'
                  }
                `}
              >
                {step.label}
              </div>
              <div className={`text-xs ${step.number <= currentStep ? 'text-gray-500' : 'text-gray-400'}`}>
                {step.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
