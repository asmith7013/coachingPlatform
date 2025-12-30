'use client';

import type { NavigationControlsProps } from '../types';

export function NavigationControls({
  currentSlide,
  totalSlides,
  onPrevSlide,
  onNextSlide,
}: NavigationControlsProps) {
  return (
    <div className="print-hide fixed top-4 right-20 h-12 flex items-center gap-2 bg-gray-700/80 px-3 rounded-full z-[10000] text-sm">
      {/* Previous Button */}
      <button
        onClick={onPrevSlide}
        disabled={currentSlide === 0}
        className="w-7 h-7 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 rounded-full transition-colors cursor-pointer"
        aria-label="Previous slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </button>

      {/* Slide Counter */}
      <div className="text-white text-xs font-medium px-2">
        {currentSlide + 1}/{totalSlides}
      </div>

      {/* Next Button */}
      <button
        onClick={onNextSlide}
        disabled={currentSlide === totalSlides - 1}
        className="w-7 h-7 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 rounded-full transition-colors cursor-pointer"
        aria-label="Next slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>
    </div>
  );
}
