import { TvIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

interface SmartboardHeaderProps {
  selectedUnit: number;
  formattedLessonSection: string;
  formattedDueDate: string;
  dueDate: string;
  onDueDateChange: (date: string) => void;
  assignmentCount: number;
  isEditMode: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onSyncAll?: () => void;
  syncingAll?: boolean;
}

export function SmartboardHeader({
  selectedUnit,
  formattedLessonSection,
  formattedDueDate,
  dueDate,
  onDueDateChange,
  assignmentCount,
  isEditMode,
  isFullscreen,
  onToggleFullscreen,
  onSyncAll,
  syncingAll = false,
}: SmartboardHeaderProps) {
  return (
    <div className={`bg-indigo-900 rounded-t-xl flex items-center justify-between ${isFullscreen ? "p-8 text-xl" : "p-4"}`}>
      <div className="flex items-center gap-4">
        <div className={`bg-teal-500 text-white rounded-lg font-bold ${isFullscreen ? "px-6 py-3 text-2xl" : "px-4 py-2 text-lg"}`}>
          Mini Goal
        </div>
        <div className={`bg-indigo-700 text-white rounded-lg font-semibold ${isFullscreen ? "px-6 py-3 text-xl" : "px-4 py-2"}`}>
          Unit {selectedUnit}: {formattedLessonSection}
        </div>
        {isEditMode ? (
          <input
            type="date"
            value={dueDate}
            onChange={(e) => onDueDateChange(e.target.value)}
            className={`bg-indigo-600 text-white rounded-lg border border-indigo-400 focus:outline-none focus:ring-2 focus:ring-white ${isFullscreen ? "px-6 py-3 text-xl" : "px-4 py-2"}`}
          />
        ) : (
          <div className={`bg-indigo-600 text-white rounded-lg ${isFullscreen ? "px-6 py-3 text-xl" : "px-4 py-2"}`}>
            By {formattedDueDate}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className={`bg-white text-indigo-900 rounded-lg font-bold ${isFullscreen ? "px-6 py-3 text-xl" : "px-4 py-2"}`}>
          {assignmentCount} Assignment{assignmentCount !== 1 ? "s" : ""}
        </div>
        {onSyncAll && (
          <button
            onClick={onSyncAll}
            disabled={syncingAll}
            className={`bg-indigo-700 hover:bg-indigo-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isFullscreen ? "p-3" : "p-2"}`}
            title="Sync All Assignments"
          >
            <ArrowPathIcon className={`${isFullscreen ? "w-8 h-8" : "w-6 h-6"} text-white ${syncingAll ? 'animate-spin' : ''}`} />
          </button>
        )}
        <button
          onClick={onToggleFullscreen}
          className={`bg-indigo-700 hover:bg-indigo-600 rounded-lg transition-colors cursor-pointer ${isFullscreen ? "p-3" : "p-2"}`}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          <TvIcon className={isFullscreen ? "w-8 h-8 text-white" : "w-6 h-6 text-white"} />
        </button>
      </div>
    </div>
  );
}
