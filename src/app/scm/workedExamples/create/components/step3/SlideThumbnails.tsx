'use client';

interface SlideThumbnailsProps {
  slideCount: number;
  selectedSlideIndex: number;
  slidesToEdit: number[];
  contextSlides: number[];
  onSelectSlide: (index: number) => void;
  onToggleSlideToEdit: (index: number) => void;
  onDeselectSlide: (index: number) => void;
  onSetSlideSelectionMode: (index: number, mode: 'edit' | 'context') => void;
  onClearSelections: () => void;
}

export function SlideThumbnails({
  slideCount,
  selectedSlideIndex,
  slidesToEdit,
  contextSlides,
  onSelectSlide,
  onToggleSlideToEdit,
  onDeselectSlide,
  onSetSlideSelectionMode,
  onClearSelections,
}: SlideThumbnailsProps) {
  const totalSelected = slidesToEdit.length + contextSlides.length;
  const hasMultiSelection = totalSelected > 0;

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
                className="absolute top-1 left-1 z-10 w-3.5 h-3.5 cursor-pointer accent-purple-600"
              />
              {/* Thumbnail button */}
              <button
                onClick={() => onSelectSlide(index)}
                className={`w-full aspect-video rounded border-2 transition-colors cursor-pointer overflow-hidden ${
                  index === selectedSlideIndex
                    ? 'border-blue-500'
                    : isInEdit
                    ? 'border-purple-400 bg-purple-50'
                    : isInContext
                    ? 'border-gray-400 border-dashed bg-gray-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className={`w-full h-full flex items-center justify-center text-xs font-medium ${
                  isInEdit ? 'bg-purple-50 text-purple-700' : isInContext ? 'bg-gray-50 text-gray-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {index + 1}
                </div>
              </button>
              {/* Edit/Context Toggle - only show when selected */}
              {isSelected && (
                <div className="flex mt-1 text-[10px] rounded overflow-hidden border border-gray-300">
                  <button
                    onClick={() => onSetSlideSelectionMode(index, 'edit')}
                    className={`flex-1 px-1.5 py-0.5 cursor-pointer transition-colors ${
                      isInEdit
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onSetSlideSelectionMode(index, 'context')}
                    className={`flex-1 px-1.5 py-0.5 cursor-pointer transition-colors ${
                      isInContext
                        ? 'bg-gray-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
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
    </div>
  );
}
