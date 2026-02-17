"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import type { EditImage } from "../shared/AiEditInput";

interface EditConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  slidesToEdit: number[];
  contextSlides: number[];
  instructions: string;
  images: EditImage[];
  /** If no slides are selected, this is the currently viewed slide */
  currentSlideIndex: number;
}

/**
 * Confirmation modal shown before applying AI edits.
 * Displays what slides will be edited, context slides, instructions, and images.
 */
export function EditConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  slidesToEdit,
  contextSlides,
  instructions,
  images,
  currentSlideIndex,
}: EditConfirmModalProps) {
  if (!isOpen) return null;

  // Determine which slides will actually be edited
  const actualSlidesToEdit =
    slidesToEdit.length > 0 ? slidesToEdit : [currentSlideIndex];
  const hasMultipleSlides = actualSlidesToEdit.length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Confirm AI Edit
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4">
          {/* Slides to edit */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              {hasMultipleSlides ? "Slides to Edit" : "Slide to Edit"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {actualSlidesToEdit.map((slideIndex) => (
                <span
                  key={slideIndex}
                  className="inline-flex items-center px-2.5 py-1 text-sm bg-purple-100 text-purple-700 rounded-md font-medium"
                >
                  Slide {slideIndex + 1}
                </span>
              ))}
            </div>
          </div>

          {/* Context slides */}
          {contextSlides.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Context Slides (read-only)
              </h3>
              <div className="flex flex-wrap gap-2">
                {contextSlides.map((slideIndex) => (
                  <span
                    key={slideIndex}
                    className="inline-flex items-center px-2.5 py-1 text-sm bg-gray-100 text-gray-600 rounded-md"
                  >
                    Slide {slideIndex + 1}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {instructions.trim() && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Instructions
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-800 whitespace-pre-wrap">
                {instructions}
              </div>
            </div>
          )}

          {/* Images */}
          {images.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                {images.length === 1
                  ? "Attached Image"
                  : `Attached Images (${images.length})`}
              </h3>
              <div className="flex gap-3 flex-wrap">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img.preview}
                    alt={`Attachment ${index + 1}`}
                    className="h-20 w-auto rounded-lg border border-gray-200 object-cover"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 cursor-pointer flex items-center gap-1.5"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Apply Edits
          </button>
        </div>
      </div>
    </div>
  );
}
