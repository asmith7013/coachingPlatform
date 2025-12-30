'use client';

import { useEffect } from 'react';
import type { PresentationModalProps } from './types';
import { usePresentationState } from './usePresentationState';
import {
  SlideContent,
  NavigationControls,
  CloseButton,
  PrintButton,
  HtmlViewer,
} from './components';
import { PRINT_STYLES } from './utils';

export function PresentationModal({
  slug,
  isOpen,
  onClose,
  initialSlide = 0,
  onSlideChange,
}: PresentationModalProps) {
  const {
    deck,
    currentSlide,
    loading,
    error,
    showHtmlViewer,
    exportStatus,
    exportError,
    googleSlidesUrl,
    currentRevealed,
    totalSlides,
    slide,
    setShowHtmlViewer,
    nextSlide,
    prevSlide,
    handleExportToGoogleSlides,
  } = usePresentationState({
    slug,
    isOpen,
    initialSlide,
    onSlideChange,
  });

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextSlide, prevSlide, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-200">
      {loading && (
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-gray-700 text-2xl">Loading presentation...</div>
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="text-gray-700 text-2xl mb-4">{error}</div>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      )}

      {!loading && !error && deck && slide && (
        <>
          <SlideContent slide={slide} currentRevealed={currentRevealed} />

          <CloseButton onClose={onClose} />

          <NavigationControls
            currentSlide={currentSlide}
            totalSlides={totalSlides}
            onPrevSlide={prevSlide}
            onNextSlide={nextSlide}
          />

          {/* Print Button - only show on last slide */}
          {deck?.htmlSlides && currentSlide === deck.htmlSlides.length - 1 && (
            <PrintButton slide={slide} />
          )}

          {/* Bottom Right - Google Slides Button + View HTML Button */}
          <div className="print-hide fixed bottom-4 right-4 flex items-center gap-2 z-[10000]">
            {/* Open Google Slides - Only show if URL exists */}
            {googleSlidesUrl && (
              <button
                onClick={() => window.open(googleSlidesUrl, '_blank')}
                className="w-12 h-12 flex items-center justify-center bg-gray-700/80 hover:bg-gray-600/90 text-white rounded-full transition-colors cursor-pointer"
                aria-label="Open Google Slides"
                title="Open Google Slides"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                >
                  <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-9 15H6v-4.5h4.5V18zm0-6H6v-4.5h4.5V12zm6 6h-4.5v-4.5H16.5V18zm0-6h-4.5v-4.5H16.5V12z" />
                </svg>
              </button>
            )}

            {/* View HTML Button */}
            <button
              onClick={() => setShowHtmlViewer(true)}
              className="w-12 h-12 flex items-center justify-center bg-gray-700/80 hover:bg-gray-600/90 text-white rounded-full transition-colors cursor-pointer"
              aria-label="View HTML"
              title="View HTML"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                />
              </svg>
            </button>
          </div>

          {/* HTML Viewer Modal */}
          {showHtmlViewer && (
            <HtmlViewer
              slideNumber={currentSlide + 1}
              htmlContent={slide.htmlContent}
              googleSlidesUrl={googleSlidesUrl}
              exportStatus={exportStatus}
              exportError={exportError}
              onClose={() => setShowHtmlViewer(false)}
              onExport={handleExportToGoogleSlides}
            />
          )}
        </>
      )}

      {/* Print styles */}
      <style>{PRINT_STYLES}</style>
    </div>
  );
}
