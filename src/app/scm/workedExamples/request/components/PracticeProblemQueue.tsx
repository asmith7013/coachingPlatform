"use client";

import {
  XMarkIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

export type SkillType = "target" | "essential" | "helpful";

export interface QueuedPracticeProblem {
  skillNumber: string;
  skillTitle: string;
  problemNumber: number | string;
  screenshotUrl: string;
  skillType: SkillType;
}

interface PracticeProblemQueueProps {
  items: QueuedPracticeProblem[];
  selectedItem: QueuedPracticeProblem | null;
  onSelect: (item: QueuedPracticeProblem) => void;
  onRemove: (item: QueuedPracticeProblem) => void;
}

// Using the tailwind colors defined in semantic-colors.ts:
// skill-target: purple (#6320EE)
// skill-essential: pink (#C855C8)
// skill-helpful: turquoise (#009FB7)
const colorClasses = {
  target: {
    badge: "bg-skill-target",
    selectedBorder: "ring-2 ring-skill-target ring-offset-2",
  },
  essential: {
    badge: "bg-skill-essential",
    selectedBorder: "ring-2 ring-skill-essential ring-offset-2",
  },
  helpful: {
    badge: "bg-skill-helpful",
    selectedBorder: "ring-2 ring-skill-helpful ring-offset-2",
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
        <h3 className="font-semibold text-gray-900 mb-3">
          Consideration Queue
        </h3>
        <div className="text-center py-8 text-gray-500">
          <ClipboardDocumentListIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-sm">
            Browse skills and click &quot;Add to Consideration&quot; on practice
            problems to add them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          Consideration Queue ({items.length})
        </h3>
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
        <div className="flex gap-4" style={{ minWidth: "min-content" }}>
          {items.map((item, index) => {
            const isSelected =
              selectedItem?.skillNumber === item.skillNumber &&
              selectedItem?.problemNumber === item.problemNumber;
            const colors = colorClasses[item.skillType];

            return (
              <div
                key={`${item.skillNumber}-${item.problemNumber}-${index}`}
                className={`relative flex-shrink-0 w-48 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? colors.selectedBorder : ""
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
                <div
                  className={`absolute top-1 left-1 z-10 ${colors.badge} text-white text-xs font-bold px-2 py-0.5 rounded`}
                >
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
                  <div
                    className="text-xs text-gray-600 truncate"
                    title={item.skillTitle}
                  >
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
