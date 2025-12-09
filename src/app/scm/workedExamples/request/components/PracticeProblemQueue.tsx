"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";

export interface QueuedPracticeProblem {
  skillNumber: string;
  skillTitle: string;
  problemNumber: number | string;
  screenshotUrl: string;
  skillColor: 'green' | 'orange' | 'purple';
}

interface PracticeProblemQueueProps {
  items: QueuedPracticeProblem[];
  selectedItem: QueuedPracticeProblem | null;
  onSelect: (item: QueuedPracticeProblem) => void;
  onRemove: (item: QueuedPracticeProblem) => void;
}

const colorClasses = {
  green: {
    badge: 'bg-green-600',
    selectedBorder: 'ring-2 ring-green-500 ring-offset-2',
  },
  orange: {
    badge: 'bg-orange-500',
    selectedBorder: 'ring-2 ring-orange-500 ring-offset-2',
  },
  purple: {
    badge: 'bg-purple-600',
    selectedBorder: 'ring-2 ring-purple-500 ring-offset-2',
  },
};

export function PracticeProblemQueue({
  items,
  selectedItem,
  onSelect,
  onRemove,
}: PracticeProblemQueueProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Consideration Queue</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-sm">
            Browse skills and click &quot;Add to Consideration&quot; on practice problems to add them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Consideration Queue ({items.length})</h3>
        {selectedItem && (
          <span className="text-sm text-green-600 font-medium">
            ✓ Selected for request
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Click a problem to select it for your request. Only one can be selected.
      </p>

      {/* Horizontal scrollable container */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4" style={{ minWidth: 'min-content' }}>
          {items.map((item, index) => {
            const isSelected = selectedItem?.skillNumber === item.skillNumber &&
                               selectedItem?.problemNumber === item.problemNumber;
            const colors = colorClasses[item.skillColor];

            return (
              <div
                key={`${item.skillNumber}-${item.problemNumber}-${index}`}
                className={`relative flex-shrink-0 w-48 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? colors.selectedBorder : ''
                }`}
                onClick={() => onSelect(item)}
              >
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(item);
                  }}
                  className="absolute top-1 right-1 z-10 bg-gray-800/70 hover:bg-gray-900 text-white rounded-full p-1 shadow transition-all cursor-pointer"
                  aria-label="Remove from queue"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>

                {/* Skill badge */}
                <div className={`absolute top-1 left-1 z-10 ${colors.badge} text-white text-xs font-bold px-2 py-0.5 rounded`}>
                  {item.skillNumber}
                </div>

                {/* Thumbnail image */}
                <div className="h-28 bg-white flex items-center justify-center p-2">
                  <img
                    src={item.screenshotUrl}
                    alt={`Problem ${item.problemNumber}`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                {/* Info section */}
                <div className="p-2 border-t border-gray-200 bg-white">
                  <div className="text-xs text-gray-600 truncate" title={item.skillTitle}>
                    {item.skillTitle}
                  </div>
                  <div className="text-xs font-medium text-gray-900 mt-0.5">
                    Problem {item.problemNumber}
                  </div>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute inset-0 bg-green-500/10 pointer-events-none flex items-center justify-center">
                    <div className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
                      SELECTED
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
