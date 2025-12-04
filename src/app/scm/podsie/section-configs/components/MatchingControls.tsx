import { PlusIcon } from "@heroicons/react/24/outline";

interface MatchingControlsProps {
  matchedCount: number;
  totalCount: number;
  showUnmatchedOnly: boolean;
  onToggleUnmatched: (show: boolean) => void;
  onAutoMatch: () => void;
  onSaveAll: () => void;
  saving: boolean;
}

export function MatchingControls({
  matchedCount,
  totalCount,
  showUnmatchedOnly,
  onToggleUnmatched,
  onAutoMatch,
  onSaveAll,
  saving
}: MatchingControlsProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">
          Match Assignments ({matchedCount} / {totalCount})
        </h2>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showUnmatchedOnly}
            onChange={(e) => onToggleUnmatched(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          <span className="text-gray-700">Show unmatched only</span>
        </label>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onAutoMatch}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg font-medium hover:bg-purple-700 transition-colors cursor-pointer"
        >
          Auto-Match
        </button>
        <button
          onClick={onSaveAll}
          disabled={matchedCount === 0 || saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <PlusIcon className="w-5 h-5" />
          {saving ? 'Saving...' : `Save All (${matchedCount})`}
        </button>
      </div>
    </div>
  );
}
