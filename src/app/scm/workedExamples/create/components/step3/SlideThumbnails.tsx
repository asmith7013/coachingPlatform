"use client";

import { useState } from "react";
import type { SlideType } from "@zod-schema/scm/worked-example";

const SLIDE_TYPE_VALUES: SlideType[] = [
  "teacher-instructions",
  "big-idea",
  "problem-setup",
  "step",
  "practice-preview",
  "printable-worksheet",
  "lesson-summary",
];

const SLIDE_TYPE_LABELS: Record<SlideType, string> = {
  "teacher-instructions": "Teacher",
  "big-idea": "Big Idea",
  "problem-setup": "Setup",
  step: "Step",
  "practice-preview": "Practice",
  "printable-worksheet": "Printable",
  "lesson-summary": "Summary",
};

const SLIDE_TYPE_COLORS: Record<SlideType, string> = {
  "teacher-instructions": "bg-amber-100 text-amber-700",
  "big-idea": "bg-blue-100 text-blue-700",
  "problem-setup": "bg-green-100 text-green-700",
  step: "bg-purple-100 text-purple-700",
  "practice-preview": "bg-teal-100 text-teal-700",
  "printable-worksheet": "bg-orange-100 text-orange-700",
  "lesson-summary": "bg-rose-100 text-rose-700",
};

interface SlideThumbnailsProps {
  slideCount: number;
  selectedSlideIndex: number;
  slidesToEdit: number[];
  contextSlides: number[];
  slideTypes: (SlideType | undefined)[];
  onSelectSlide: (index: number) => void;
  onToggleSlideToEdit: (index: number) => void;
  onDeselectSlide: (index: number) => void;
  onSetSlideSelectionMode: (index: number, mode: "edit" | "context") => void;
  onClearSelections: () => void;
  onUpdateSlideType: (index: number, slideType: SlideType) => void;
}

export function SlideThumbnails({
  slideCount,
  selectedSlideIndex,
  slidesToEdit,
  contextSlides,
  slideTypes,
  onSelectSlide,
  onToggleSlideToEdit,
  onDeselectSlide,
  onSetSlideSelectionMode,
  onClearSelections,
  onUpdateSlideType,
}: SlideThumbnailsProps) {
  const totalSelected = slidesToEdit.length + contextSlides.length;
  const hasMultiSelection = totalSelected > 0;
  const [editingTypeIndex, setEditingTypeIndex] = useState<number | null>(null);

  return (
    <div className="w-28 flex-shrink-0 overflow-y-auto pr-2">
      {/* Selection controls */}
      {hasMultiSelection && (
        <div className="mb-2 px-1">
          <button
            onClick={onClearSelections}
            className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            Clear ({totalSelected})
          </button>
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: slideCount }).map((_, index) => {
          const isInEdit = slidesToEdit.includes(index);
          const isInContext = contextSlides.includes(index);
          const isSelected = isInEdit || isInContext;
          const slideType = slideTypes[index];

          return (
            <div key={index} className="relative">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {
                  if (isSelected) {
                    onDeselectSlide(index);
                  } else {
                    onToggleSlideToEdit(index);
                  }
                }}
                className={`absolute top-1 left-1 z-10 w-3.5 h-3.5 cursor-pointer ${
                  isInContext ? "accent-gray-800" : "accent-purple-600"
                }`}
              />
              {/* Thumbnail button */}
              <button
                onClick={() => onSelectSlide(index)}
                className={`w-full aspect-video rounded border-2 transition-colors cursor-pointer overflow-hidden ${
                  index === selectedSlideIndex
                    ? "border-blue-500"
                    : isInEdit
                      ? "border-purple-400 bg-purple-50"
                      : isInContext
                        ? "border-gray-400 border-dashed bg-gray-50"
                        : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div
                  className={`w-full h-full flex items-center justify-center text-xs font-medium ${
                    isInEdit
                      ? "bg-purple-50 text-purple-700"
                      : isInContext
                        ? "bg-gray-50 text-gray-600"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
              </button>
              {/* Slide type label */}
              {slideType ? (
                editingTypeIndex === index ? (
                  <select
                    value={slideType}
                    onChange={(e) => {
                      onUpdateSlideType(index, e.target.value as SlideType);
                      setEditingTypeIndex(null);
                    }}
                    onBlur={() => setEditingTypeIndex(null)}
                    autoFocus
                    className="w-full mt-0.5 text-[9px] px-1 py-0.5 border border-gray-300 rounded bg-white"
                  >
                    {SLIDE_TYPE_VALUES.map((type) => (
                      <option key={type} value={type}>
                        {SLIDE_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                ) : (
                  <button
                    onClick={() => setEditingTypeIndex(index)}
                    className={`w-full mt-0.5 text-[9px] px-1 py-0.5 rounded text-center cursor-pointer ${SLIDE_TYPE_COLORS[slideType]}`}
                    title={`Click to change slide type (${slideType})`}
                  >
                    {SLIDE_TYPE_LABELS[slideType]}
                  </button>
                )
              ) : (
                <button
                  onClick={() => setEditingTypeIndex(index)}
                  className="w-full mt-0.5 text-[9px] px-1 py-0.5 rounded text-center cursor-pointer bg-gray-50 text-gray-400 border border-dashed border-gray-300"
                  title="Click to set slide type"
                >
                  No type
                </button>
              )}
              {/* Edit/Context Toggle - only show when selected */}
              {isSelected && (
                <div className="flex mt-1 text-[10px] rounded overflow-hidden border border-gray-300">
                  <button
                    onClick={() => onSetSlideSelectionMode(index, "edit")}
                    className={`flex-1 px-1.5 py-0.5 cursor-pointer transition-colors ${
                      isInEdit
                        ? "bg-purple-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onSetSlideSelectionMode(index, "context")}
                    className={`flex-1 px-1.5 py-0.5 cursor-pointer transition-colors ${
                      isInContext
                        ? "bg-gray-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Ctx
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Slide type legend */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-[9px] font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
          Slide Types
        </div>
        <div className="space-y-0.5">
          {SLIDE_TYPE_VALUES.map((type) => (
            <div key={type} className="flex items-center gap-1">
              <span
                className={`inline-block w-2 h-2 rounded-sm ${SLIDE_TYPE_COLORS[type].split(" ")[0]}`}
              />
              <span className="text-[9px] text-gray-500">
                {SLIDE_TYPE_LABELS[type]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
