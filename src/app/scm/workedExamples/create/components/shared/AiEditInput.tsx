'use client';

import { useRef, useEffect, useCallback } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import type { EditImage } from '../../lib/types';

export type { EditImage };

interface AiEditInputProps {
  prompt: string;
  setPrompt: (value: string) => void;
  images: EditImage[];
  setImages: (images: EditImage[]) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  submitLabel?: string;
}

export function AiEditInput({
  prompt,
  setPrompt,
  images,
  setImages,
  onSubmit,
  placeholder = "AI Edit: describe corrections or paste an image",
  disabled = false,
  submitLabel = "Apply",
}: AiEditInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea based on content
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Calculate new height (min 40px for single line, max 120px for ~4 lines)
    const newHeight = Math.min(Math.max(40, textarea.scrollHeight), 120);
    textarea.style.height = `${newHeight}px`;
  }, []);

  // Adjust height when prompt changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [prompt, adjustTextareaHeight]);

  // Handle image file selection
  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: EditImage[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newImages.push({ file, preview });
      }
    });

    setImages([...images, ...newImages]);
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [images, setImages]);

  // Handle paste events for images
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const newImages: EditImage[] = [];

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          const preview = URL.createObjectURL(file);
          newImages.push({ file, preview });
        }
      }
    }

    if (newImages.length > 0) {
      setImages([...images, ...newImages]);
    }
  }, [images, setImages]);

  // Check if we can submit (need prompt or images)
  const canSubmit = (prompt.trim() || images.length > 0) && !disabled;

  return (
    <div className="flex gap-2 items-center flex-1">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageSelect}
        className="hidden"
      />

      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onPaste={handlePaste}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 text-sm border border-purple-200 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white resize-none overflow-y-auto"
        rows={1}
        style={{ minHeight: '40px', maxHeight: '120px' }}
      />

      {/* Image attach button - badge style next to Apply */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="h-10 px-2.5 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg cursor-pointer border border-purple-300 flex items-center justify-center gap-1 flex-shrink-0"
        title="Attach image (or paste)"
      >
        <PhotoIcon className="w-4 h-4" />
        {images.length > 0 && (
          <span className="text-xs font-semibold">{images.length}</span>
        )}
      </button>

      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        className="h-10 px-4 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1.5 flex-shrink-0"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {submitLabel}
      </button>
    </div>
  );
}
