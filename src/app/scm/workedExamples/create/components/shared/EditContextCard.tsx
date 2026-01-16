'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { EditImage } from './AiEditInput';

interface EditContextCardProps {
  images: EditImage[];
  onRemoveImage: (index: number) => void;
  slidesToEdit: number[];
  contextSlides: number[];
}

/**
 * Floating card that shows uploaded images and selected slides for AI editing.
 * Positioned above the footer in the bottom-right corner.
 * Uses a portal to escape stacking contexts.
 */
export function EditContextCard({
  images,
  onRemoveImage,
  slidesToEdit,
  contextSlides,
}: EditContextCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasContent = images.length > 0 || slidesToEdit.length > 0 || contextSlides.length > 0;

  if (!hasContent || !mounted) return null;

  const content = (
    <div className="fixed bottom-[72px] right-6 z-[100] bg-white rounded-lg shadow-xl border-2 border-purple-300 p-3 w-48">
      {/* Header */}
      <div className="mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Edit Context
        </span>
      </div>

      {/* Slides to edit */}
      {slidesToEdit.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-purple-600 font-medium">Edit:</span>
            {slidesToEdit.map((slideIndex) => (
              <span
                key={`edit-${slideIndex}`}
                className="inline-flex items-center px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded"
              >
                Slide {slideIndex + 1}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Context slides */}
      {contextSlides.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">Context:</span>
            {contextSlides.map((slideIndex) => (
              <span
                key={`ctx-${slideIndex}`}
                className="inline-flex items-center px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
              >
                Slide {slideIndex + 1}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Images */}
      {images.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 font-medium mb-1.5">Images:</div>
          <div className="flex gap-2 flex-wrap">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img.preview}
                  alt={`Attachment ${index + 1}`}
                  className="h-12 w-auto rounded border border-gray-200 object-cover"
                />
                <button
                  onClick={() => onRemoveImage(index)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Remove image"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(content, document.body);
}
