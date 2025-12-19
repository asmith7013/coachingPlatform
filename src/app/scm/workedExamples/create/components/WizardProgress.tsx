'use client';

import type { WizardStep } from '../lib/types';

interface WizardProgressProps {
  currentStep: WizardStep;
  onStepClick?: (step: WizardStep) => void;
  isLoading?: boolean;
}

const STEPS = [
  { number: 1, label: 'Input', subtitle: 'Upload task' },
  { number: 2, label: 'Analysis', subtitle: 'Review AI analysis' },
  { number: 3, label: 'Slides', subtitle: 'Preview and edit slides' },
  { number: 4, label: 'Save', subtitle: 'Review and save' },
] as const;

export function WizardProgress({ currentStep, onStepClick, isLoading = false }: WizardProgressProps) {
  const isClickable = (stepNumber: number) => {
    if (isLoading) return false;
    // Completed steps or next step show hover behavior
    return stepNumber < currentStep || stepNumber === currentStep + 1;
  };

  const isActuallyClickable = (stepNumber: number) => {
    if (!onStepClick || isLoading) return false;
    return stepNumber < currentStep || stepNumber === currentStep + 1;
  };

  const getHoverHint = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'Go back';
    if (stepNumber === currentStep + 1) return 'Next step';
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden sticky top-0 z-10">
      <nav aria-label="Progress">
        <ol role="list" className="flex relative items-stretch">
          {STEPS.map((step, index) => {
            const clickable = isClickable(step.number);
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;
            const isNext = step.number === currentStep + 1;
            const hoverHint = getHoverHint(step.number);

            // Determine hover colors based on direction
            const hoverBgClass = isCompleted ? 'group-hover:bg-blue-50' : isNext ? 'group-hover:bg-green-50' : '';
            const hoverTextClass = isCompleted ? 'group-hover:text-blue-700' : isNext ? 'group-hover:text-green-700' : '';
            const hoverSubtextClass = isCompleted ? 'group-hover:text-blue-600' : isNext ? 'group-hover:text-green-600' : '';
            const hoverCircleClass = isNext ? 'group-hover:border-green-500 group-hover:bg-green-50' : '';
            const hoverNumberClass = isNext ? 'group-hover:text-green-600' : '';
            const hoverSeparatorClass = isCompleted ? 'group-hover/step:text-blue-300' : isNext ? 'group-hover/step:text-green-300' : '';

            const StepContent = (
              <div className={`${clickable ? hoverBgClass : ''}`}>
                <span className="flex items-center px-6 py-4 text-sm font-medium transition-colors duration-150">
                  {/* Step Circle */}
                  <span className="flex-shrink-0">
                    <span
                      className={`
                        flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium transition-colors duration-150
                        ${
                          isCompleted
                            ? 'bg-blue-600 border-blue-600 text-white group-hover:bg-blue-700'
                            : isCurrent
                            ? 'bg-blue-50 border-blue-600 text-blue-600'
                            : `bg-gray-100 border-gray-300 text-gray-400 ${hoverCircleClass}`
                        }
                      `}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className={`transition-colors duration-150 ${hoverNumberClass}`}>{step.number}</span>
                      )}
                    </span>
                  </span>

                  {/* Step Label and Subtitle */}
                  <span className="ml-4 hidden sm:flex min-w-0 flex-col text-left">
                    <span
                      className={`
                        text-sm font-medium transition-colors duration-150
                        ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'}
                        ${clickable ? hoverTextClass : ''}
                      `}
                    >
                      {step.label}
                    </span>
                    {/* Subtitle with hover swap */}
                    <span className="relative">
                      {/* Default subtitle - hidden on hover when clickable */}
                      <span
                        className={`
                          text-sm transition-all duration-150
                          ${step.number <= currentStep ? 'text-gray-500' : 'text-gray-400'}
                          ${clickable ? 'group-hover:opacity-0 group-hover:invisible' : ''}
                        `}
                      >
                        {step.subtitle}
                      </span>
                      {/* Hover hint - shown on hover when clickable */}
                      {clickable && hoverHint && (
                        <span
                          className={`
                            absolute left-0 top-0 text-sm transition-all duration-150
                            opacity-0 invisible group-hover:opacity-100 group-hover:visible
                            ${hoverSubtextClass}
                          `}
                        >
                          {hoverHint}
                        </span>
                      )}
                    </span>
                  </span>
                </span>
              </div>
            );

            const actuallyClickable = isActuallyClickable(step.number);

            return (
              <li key={step.number} className={`relative flex-1 ${clickable ? 'group/step' : ''}`}>
                {actuallyClickable ? (
                  <button
                    onClick={() => onStepClick?.(step.number as WizardStep)}
                    disabled={isLoading}
                    className="group w-full disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors duration-150"
                  >
                    {StepContent}
                  </button>
                ) : (
                  <div className={`${clickable ? 'group cursor-pointer' : ''} ${isCurrent ? '' : !clickable ? 'opacity-60' : ''}`}>
                    {StepContent}
                  </div>
                )}

                {/* Vertical Separator */}
                {index < STEPS.length - 1 && (
                  <div
                    className={`absolute top-0 bottom-0 right-0 w-px bg-gray-200 transition-colors duration-150 ${clickable ? hoverSeparatorClass : ''}`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
