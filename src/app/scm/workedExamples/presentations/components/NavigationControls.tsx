'use client';

import type { NavigationControlsProps } from '../types';

export function NavigationControls({
  currentSlide,
  totalSlides,
  onPrevSlide,
  onNextSlide,
}: NavigationControlsProps) {
  return (
    <div className="relative group">
      <div className="print-hide h-10 flex items-center gap-2 bg-gray-700 px-3 rounded-full text-sm">
        {/* Previous Button */}
        <button
          onClick={onPrevSlide}
          disabled={currentSlide === 0}
          className="w-6 h-6 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-600 rounded-full transition-colors cursor-pointer"
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
        <div className="text-white text-sm font-medium px-1">
          {currentSlide + 1}/{totalSlides}
        </div>

        {/* Next Button */}
        <button
          onClick={onNextSlide}
          disabled={currentSlide === totalSlides - 1}
          className="w-6 h-6 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-600 rounded-full transition-colors cursor-pointer"
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
      {/* Tooltip - appears above for footer placement */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Previous (←) / Next (→)
      </div>
    </div>
  );
}
