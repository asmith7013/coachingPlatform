'use client';

import { WizardStickyFooter } from '../shared/WizardStickyFooter';
import { AiEditInput } from '../shared/AiEditInput';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { formatElapsedTimeShort } from '../../lib/utils';
import type { EditImage } from '../../lib/types';

interface ExportProgress {
  status: 'idle' | 'exporting' | 'success' | 'error';
  message: string;
}

interface SlidesFooterProps {
  isExporting: boolean;
  exportProgress: ExportProgress;
  exportElapsed: number;
  isAiLoading: boolean;
  aiEditElapsed: number;
  slidesToEdit: number[];
  selectedSlideIndex: number;
  hasCurrentSlide: boolean;
  aiEditPrompt: string;
  setAiEditPrompt: (value: string) => void;
  aiEditImages: EditImage[];
  setAiEditImages: (images: EditImage[]) => void;
  aiError: string | null;
  handleAiEdit: () => void;
  handleExportClick: () => void;
  canExport: boolean;
  prevStep: () => void;
}

export function SlidesFooter({
  isExporting,
  exportProgress,
  exportElapsed,
  isAiLoading,
  aiEditElapsed,
  slidesToEdit,
  selectedSlideIndex,
  hasCurrentSlide,
  aiEditPrompt,
  setAiEditPrompt,
  aiEditImages,
  setAiEditImages,
  aiError,
  handleAiEdit,
  handleExportClick,
  canExport,
  prevStep,
}: SlidesFooterProps) {
  // Check if we can submit (need prompt or images, and have slides to edit)
  const canSubmit = (aiEditPrompt.trim() || aiEditImages.length > 0) && (slidesToEdit.length > 0 || hasCurrentSlide);

  return (
    <WizardStickyFooter theme={isExporting ? 'yellow' : 'purple'} isActive={isAiLoading || isExporting}>
      {isExporting ? (
        <div className="flex items-center gap-3">
          <LoadingSpinner className="text-yellow-600" />
          <span className="text-sm text-yellow-800 font-medium flex-1">
            {exportProgress.message}
          </span>
          <span className="text-sm text-yellow-600 font-mono tabular-nums">
            {formatElapsedTimeShort(exportElapsed)}
          </span>
        </div>
      ) : isAiLoading ? (
        <div className="flex items-center gap-3">
          <LoadingSpinner className="text-purple-600" />
          <span className="text-sm text-purple-800 flex-1 truncate">
            {slidesToEdit.length > 0
              ? `Editing ${slidesToEdit.length} slide${slidesToEdit.length > 1 ? 's' : ''}...`
              : `Editing slide ${selectedSlideIndex + 1}...`}
          </span>
          <span className="text-sm text-purple-600 font-mono tabular-nums">
            {formatElapsedTimeShort(aiEditElapsed)}
          </span>
        </div>
      ) : (
        <div className="flex gap-3 items-end">
          <button
            onClick={prevStep}
            className="h-10 px-4 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer border border-gray-300 flex-shrink-0 flex items-center justify-center"
          >
            Back
          </button>

          <AiEditInput
            prompt={aiEditPrompt}
            setPrompt={setAiEditPrompt}
            images={aiEditImages}
            setImages={setAiEditImages}
            onSubmit={handleAiEdit}
            placeholder={
              slidesToEdit.length > 0
                ? `AI Edit: describe changes to ${slidesToEdit.length} slide${slidesToEdit.length > 1 ? 's' : ''}`
                : 'AI Edit: describe changes to this slide'
            }
            disabled={!canSubmit}
            submitLabel="Apply Edits"
          />

          {/* Export to Google Slides Button */}
          <button
            onClick={handleExportClick}
            disabled={!canExport}
            className="h-10 px-4 text-sm bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-9 15H6v-4.5h4.5V18zm0-6H6v-4.5h4.5V12zm6 6h-4.5v-4.5H16.5V18zm0-6h-4.5v-4.5H16.5V12z" />
            </svg>
            Export to Slides
          </button>
        </div>
      )}
      {aiError && (
        <p className="mt-2 text-sm text-red-600">{aiError}</p>
      )}
    </WizardStickyFooter>
  );
}
