'use client';

import { WizardStickyFooter } from '../shared/WizardStickyFooter';

interface ExportProgress {
  status: 'idle' | 'exporting' | 'success' | 'error';
  message: string;
}

interface SlidesFooterProps {
  isExporting: boolean;
  exportProgress: ExportProgress;
  isAiLoading: boolean;
  slidesToEdit: number[];
  contextSlides: number[];
  selectedSlideIndex: number;
  hasCurrentSlide: boolean;
  aiEditPrompt: string;
  setAiEditPrompt: (value: string) => void;
  aiError: string | null;
  handleAiEdit: () => void;
  prevStep: () => void;
}

export function SlidesFooter({
  isExporting,
  exportProgress,
  isAiLoading,
  slidesToEdit,
  contextSlides,
  selectedSlideIndex,
  hasCurrentSlide,
  aiEditPrompt,
  setAiEditPrompt,
  aiError,
  handleAiEdit,
  prevStep,
}: SlidesFooterProps) {
  return (
    <WizardStickyFooter theme={isExporting ? 'yellow' : 'purple'} isActive={isAiLoading || isExporting}>
      {isExporting ? (
        <div className="flex items-center gap-4">
          <svg className="w-5 h-5 text-yellow-600 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm text-yellow-800 font-medium">
            {exportProgress.message}
          </span>
        </div>
      ) : isAiLoading ? (
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-purple-600 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm text-purple-800 flex-1">
            {slidesToEdit.length > 0
              ? `Editing ${slidesToEdit.length} slide${slidesToEdit.length > 1 ? 's' : ''}: ${aiEditPrompt}`
              : `Editing slide ${selectedSlideIndex + 1}: ${aiEditPrompt}`}
          </span>
        </div>
      ) : (
        <div className="flex gap-3 items-center">
          <button
            onClick={prevStep}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer border border-gray-300"
          >
            Back
          </button>
          {/* Dynamic label based on selection */}
          <span className="text-sm text-purple-700 font-medium whitespace-nowrap">
            {slidesToEdit.length > 0 ? (
              <>
                <span className="text-purple-600">{slidesToEdit.length} to edit</span>
                {contextSlides.length > 0 && (
                  <span className="text-gray-500 ml-1">+ {contextSlides.length} ctx</span>
                )}
              </>
            ) : (
              `Slide ${selectedSlideIndex + 1}`
            )}
          </span>
          <input
            type="text"
            value={aiEditPrompt}
            onChange={(e) => setAiEditPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && aiEditPrompt.trim() && handleAiEdit()}
            placeholder={
              slidesToEdit.length > 0
                ? `AI Edit: describe changes to ${slidesToEdit.length} slide${slidesToEdit.length > 1 ? 's' : ''}`
                : 'AI Edit: describe changes to this slide'
            }
            className="flex-1 px-3 py-2 text-sm border border-purple-200 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
          />
          <button
            onClick={handleAiEdit}
            disabled={!aiEditPrompt.trim() || (slidesToEdit.length === 0 && !hasCurrentSlide)}
            className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {slidesToEdit.length > 1 ? 'Apply to All' : 'Apply'}
          </button>
        </div>
      )}
      {aiError && (
        <p className="mt-2 text-sm text-red-600">{aiError}</p>
      )}
    </WizardStickyFooter>
  );
}
