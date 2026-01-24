'use client';

import { WizardStickyFooter } from '../shared/WizardStickyFooter';
import { AiEditInput } from '../shared/AiEditInput';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { formatElapsedTimeShort } from '../../lib/utils';
import type { EditImage } from '../../lib/types';

export type { EditImage };

interface AnalysisFooterProps {
  isLoading: boolean;
  isAiEditing: boolean;
  aiEditPrompt: string;
  setAiEditPrompt: (value: string) => void;
  aiEditImages: EditImage[];
  setAiEditImages: (images: EditImage[]) => void;
  aiEditElapsed: number;
  aiEditError: string | null;
  handleAiEdit: () => void;
  prevStep: () => void;
  nextStep: () => void;
  handleGenerateSlides: (testMode: boolean, mode: 'full' | 'continue') => void;
  slideCount: number;
}

export function AnalysisFooter({
  isLoading,
  isAiEditing,
  aiEditPrompt,
  setAiEditPrompt,
  aiEditImages,
  setAiEditImages,
  aiEditElapsed,
  aiEditError,
  handleAiEdit,
  prevStep,
  nextStep,
  handleGenerateSlides,
  slideCount,
}: AnalysisFooterProps) {
  if (isLoading) return null;

  return (
    <WizardStickyFooter theme="purple" isActive={isAiEditing}>
      {isAiEditing ? (
        <div className="flex items-center gap-3">
          <LoadingSpinner className="text-purple-600" />
          <span className="text-sm text-purple-800 flex-1">Editing: {aiEditPrompt}</span>
          <span className="text-sm text-purple-600 font-mono tabular-nums">
            {formatElapsedTimeShort(aiEditElapsed)}
          </span>
        </div>
      ) : (
        <div className="flex gap-3 items-center">
          <button
            onClick={prevStep}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer border border-gray-300 flex-shrink-0"
          >
            Back
          </button>

          <AiEditInput
            prompt={aiEditPrompt}
            setPrompt={setAiEditPrompt}
            images={aiEditImages}
            setImages={setAiEditImages}
            onSubmit={handleAiEdit}
            placeholder="AI Edit: describe corrections or paste an image (e.g., 'The answer should be 42')"
            submitLabel="Apply"
          />

          <SlideActionButtons
            slideCount={slideCount}
            isLoading={isLoading}
            nextStep={nextStep}
            handleGenerateSlides={handleGenerateSlides}
          />
        </div>
      )}
      {aiEditError && (
        <p className="mt-2 text-sm text-red-600">{aiEditError}</p>
      )}
    </WizardStickyFooter>
  );
}

// Sub-component for slide action buttons based on slide count
function SlideActionButtons({
  slideCount,
  isLoading,
  nextStep,
  handleGenerateSlides,
}: {
  slideCount: number;
  isLoading: boolean;
  nextStep: () => void;
  handleGenerateSlides: (testMode: boolean, mode: 'full' | 'continue') => void;
}) {
  if (slideCount >= 7) {
    // All slides exist - show Review + Regenerate
    return (
      <>
        <button
          onClick={nextStep}
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Review Slides ({slideCount})
        </button>
        <RegenerateButton isLoading={isLoading} onClick={() => handleGenerateSlides(false, 'full')} />
      </>
    );
  }

  if (slideCount > 0) {
    // Partial slides - show Continue + Regenerate
    return (
      <>
        <button
          onClick={() => handleGenerateSlides(false, 'continue')}
          disabled={isLoading}
          className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg cursor-pointer flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Continue ({slideCount}/7)
        </button>
        <RegenerateButton isLoading={isLoading} onClick={() => handleGenerateSlides(false, 'full')} />
      </>
    );
  }

  // No slides - show Generate
  return (
    <button
      onClick={() => handleGenerateSlides(false, 'full')}
      disabled={isLoading}
      className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg cursor-pointer flex items-center gap-2 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Generate Slides
    </button>
  );
}

// Reusable regenerate button
function RegenerateButton({ isLoading, onClick }: { isLoading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg cursor-pointer flex items-center gap-2 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Regenerate All
    </button>
  );
}
