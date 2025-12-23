'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WizardStateHook } from '../hooks/useWizardState';
import { SlidePreview } from './SlidePreview';
import { WizardStickyFooter } from './WizardStickyFooter';

interface Step3SlidesProps {
  wizard: WizardStateHook;
}

export function Step3Slides({ wizard }: Step3SlidesProps) {
  const {
    state,
    updateSlide,
    setSelectedSlide,
    prevStep,
    nextStep,
  } = wizard;

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const { slides, selectedSlideIndex } = state;
  const currentSlide = slides[selectedSlideIndex];

  // Handle starting edit
  const handleStartEdit = () => {
    if (currentSlide) {
      setEditContent(currentSlide.htmlContent);
      setIsEditing(true);
    }
  };

  // Handle saving edit
  const handleSaveEdit = () => {
    updateSlide(selectedSlideIndex, editContent);
    setIsEditing(false);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent('');
  };

  // Handle AI edit
  const handleAiEdit = async () => {
    if (!currentSlide || !aiEditPrompt.trim()) return;

    setIsAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch('/api/scm/worked-examples/edit-slide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentHtml: currentSlide.htmlContent,
          editInstructions: aiEditPrompt,
          slideNumber: selectedSlideIndex + 1,
          strategyName: state.strategyDefinition?.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAiError(data.error || 'Failed to edit slide');
        return;
      }

      if (data.success && data.editedHtml) {
        updateSlide(selectedSlideIndex, data.editedHtml);
        setAiEditPrompt('');
      }
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsAiLoading(false);
    }
  };


  // Navigate slides
  const goToPrevSlide = useCallback(() => {
    if (selectedSlideIndex > 0) {
      setSelectedSlide(selectedSlideIndex - 1);
      setIsEditing(false);
    }
  }, [selectedSlideIndex, setSelectedSlide]);

  const goToNextSlide = useCallback(() => {
    if (selectedSlideIndex < slides.length - 1) {
      setSelectedSlide(selectedSlideIndex + 1);
      setIsEditing(false);
    }
  }, [selectedSlideIndex, slides.length, setSelectedSlide]);

  // Keyboard navigation - arrow keys to change slides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't navigate if editing or if focus is in an input/textarea
      if (isEditing) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, goToPrevSlide, goToNextSlide]);

  if (slides.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center py-12">
        <p className="text-gray-600">No slides generated yet. Please go back and generate slides.</p>
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
    <div className="bg-white rounded-lg shadow-sm p-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Step 3: Preview & Edit Slides</h2>
          <p className="text-gray-600 text-sm mt-1">
            Review the generated slides. Click edit to make changes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PPTX Format
          </span>
          <span className="text-gray-600 text-sm">
            Slide {selectedSlideIndex + 1} of {slides.length}
          </span>
        </div>
      </div>

      <div className="flex gap-4" style={{ height: 'calc(100vh - 320px)', minHeight: '500px', maxHeight: '800px' }}>
        {/* Slide Thumbnails */}
        <div className="w-24 flex-shrink-0 overflow-y-auto space-y-2 pr-2">
          {slides.map((slide, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedSlide(index);
                setIsEditing(false);
              }}
              className={`w-full aspect-video rounded border-2 transition-colors cursor-pointer overflow-hidden ${
                index === selectedSlideIndex
                  ? 'border-blue-500'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-medium">
                {index + 1}
              </div>
            </button>
          ))}
        </div>

        {/* Preview / Edit Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {isEditing ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <span className="text-sm text-gray-600">Editing Slide {selectedSlideIndex + 1}</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-300 rounded-lg p-4 text-gray-900 font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-0"
                spellCheck={false}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <span className="text-sm text-gray-600">
                  Slide {selectedSlideIndex + 1} - {currentSlide?.htmlContent?.includes('print-page') ? 'Printable' : '960×540px'}
                </span>
                <button
                  onClick={handleStartEdit}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded cursor-pointer flex items-center gap-1 border border-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit HTML
                </button>
              </div>

              <div className="flex-1 bg-white rounded-lg overflow-hidden border border-gray-300 min-h-0">
                {currentSlide && (
                  <SlidePreview htmlContent={currentSlide.htmlContent} />
                )}
              </div>
            </div>
          )}

          {/* Slide Navigation */}
          <div className="flex items-center justify-center gap-4 mt-3 flex-shrink-0">
            <button
              onClick={goToPrevSlide}
              disabled={selectedSlideIndex === 0}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded cursor-pointer disabled:cursor-not-allowed border border-gray-300"
            >
              Previous
            </button>
            <span className="text-gray-600">
              {selectedSlideIndex + 1} / {slides.length}
            </span>
            <button
              onClick={goToNextSlide}
              disabled={selectedSlideIndex === slides.length - 1}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded cursor-pointer disabled:cursor-not-allowed border border-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mt-4">
          {state.error}
        </div>
      )}

      {/* Sticky Footer - AI Edit with Navigation */}
      <WizardStickyFooter theme="purple" isActive={isAiLoading}>
        {isAiLoading ? (
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-purple-600 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm text-purple-800 flex-1">Editing slide {selectedSlideIndex + 1}: {aiEditPrompt}</span>
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
            <span className="text-sm text-purple-700 font-medium whitespace-nowrap">
              Slide {selectedSlideIndex + 1}
            </span>
            <input
              type="text"
              value={aiEditPrompt}
              onChange={(e) => setAiEditPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && aiEditPrompt.trim() && handleAiEdit()}
              placeholder="AI Edit: describe changes to this slide"
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
            {/* Continue button on right */}
            <button
              onClick={nextStep}
              className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer"
            >
              Continue to Save
            </button>
          </div>
        )}
        {aiError && (
          <p className="mt-2 text-sm text-red-600">{aiError}</p>
        )}
      </WizardStickyFooter>
    </div>
  );
}
