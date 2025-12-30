'use client';

import type { CloseButtonProps } from '../types';

export function CloseButton({ onClose }: CloseButtonProps) {
  return (
    <button
      onClick={onClose}
      className="print-hide fixed top-4 right-4 w-12 h-12 flex items-center justify-center bg-gray-700/80 hover:bg-gray-600/90 text-white rounded-full transition-colors z-[10000] cursor-pointer"
      aria-label="Close presentation"
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
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
}
