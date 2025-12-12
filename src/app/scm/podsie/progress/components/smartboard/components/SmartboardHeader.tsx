import { TvIcon, ArrowPathIcon, PlayIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

interface SmartboardHeaderProps {
  selectedUnit: number;
  formattedLessonSection: string;
  formattedDueDate: string;
  dueDate: string;
  onDueDateChange: (date: string) => void;
  assignmentCount: number;
  isEditMode: boolean;
  isFullscreen: boolean;
  textSizeLevel?: number; // -1 = smaller, 0 = normal, 1 = larger
  onToggleFullscreen: () => void;
  onTextSizeIncrease?: () => void;
  onTextSizeDecrease?: () => void;
  onSyncAll?: () => void;
  syncingAll?: boolean;
  activeYoutubeUrl?: string;
  activeVideoTitle?: string;
  onPlayVideo?: () => void;
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
  textSizeLevel = 0,
  onToggleFullscreen,
  onTextSizeIncrease,
  onTextSizeDecrease,
  onSyncAll,
  syncingAll = false,
  activeYoutubeUrl,
  activeVideoTitle,
  onPlayVideo,
}: SmartboardHeaderProps) {
  // Text size helpers based on textSizeLevel (-1, 0, 1, 2)
  const getTextSize = (smaller: string, normal: string, larger: string, extraLarge: string) => {
    if (textSizeLevel === 2) return extraLarge;
    if (textSizeLevel === 1) return larger;
    if (textSizeLevel === -1) return smaller;
    return normal;
  };

  const textSizes = {
    badge: getTextSize("text-base", isFullscreen ? "text-2xl" : "text-lg", "text-3xl", "text-4xl"),
    unit: getTextSize("text-sm", isFullscreen ? "text-xl" : "text-base", "text-2xl", "text-3xl"),
    date: getTextSize("text-sm", isFullscreen ? "text-xl" : "text-base", "text-2xl", "text-3xl"),
    count: getTextSize("text-sm", isFullscreen ? "text-xl" : "text-base", "text-2xl", "text-3xl"),
  };

  return (
    <div className={`bg-indigo-900 rounded-t-xl flex items-center justify-between ${isFullscreen ? "p-8" : "p-4"}`}>
      <div className="flex items-center gap-4">
        <div className={`bg-teal-500 text-white rounded-lg font-bold ${isFullscreen ? "px-6 py-3" : "px-4 py-2"} ${textSizes.badge}`}>
          Mini Goal
        </div>
        <div className={`bg-indigo-700 text-white rounded-lg font-semibold ${isFullscreen ? "px-6 py-3" : "px-4 py-2"} ${textSizes.unit}`}>
          Unit {selectedUnit}: {formattedLessonSection}
        </div>
        {isEditMode ? (
          <input
            type="date"
            value={dueDate}
            onChange={(e) => onDueDateChange(e.target.value)}
            className={`bg-indigo-600 text-white rounded-lg border border-indigo-400 focus:outline-none focus:ring-2 focus:ring-white ${isFullscreen ? "px-6 py-3" : "px-4 py-2"} ${textSizes.date}`}
          />
        ) : (
          <div className={`bg-indigo-600 text-white rounded-lg ${isFullscreen ? "px-6 py-3" : "px-4 py-2"} ${textSizes.date}`}>
            By {formattedDueDate}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className={`bg-white text-indigo-900 rounded-lg font-bold ${isFullscreen ? "px-6 py-3" : "px-4 py-2"} ${textSizes.count}`}>
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
        {!isEditMode && activeYoutubeUrl && onPlayVideo && (
          <button
            onClick={onPlayVideo}
            className={`bg-red-600 hover:bg-red-500 rounded-lg transition-colors cursor-pointer ${isFullscreen ? "p-3" : "p-2"}`}
            title={activeVideoTitle || "Play Video"}
          >
            <PlayIcon className={isFullscreen ? "w-8 h-8 text-white" : "w-6 h-6 text-white"} />
          </button>
        )}
        {(onTextSizeDecrease || onTextSizeIncrease) && (
          <div className="flex items-center gap-1">
            {onTextSizeDecrease && (
              <button
                onClick={onTextSizeDecrease}
                disabled={textSizeLevel <= -1}
                className={`bg-indigo-700 hover:bg-indigo-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isFullscreen ? "p-2" : "p-1.5"}`}
                title="Decrease Text Size"
              >
                <MinusIcon className={`${isFullscreen ? "w-5 h-5" : "w-4 h-4"} text-white`} />
              </button>
            )}
            <span className={`font-bold text-white ${isFullscreen ? "text-base" : "text-sm"} w-6 text-center`}>A</span>
            {onTextSizeIncrease && (
              <button
                onClick={onTextSizeIncrease}
                disabled={textSizeLevel >= 2}
                className={`bg-indigo-700 hover:bg-indigo-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isFullscreen ? "p-2" : "p-1.5"}`}
                title="Increase Text Size"
              >
                <PlusIcon className={`${isFullscreen ? "w-5 h-5" : "w-4 h-4"} text-white`} />
              </button>
            )}
          </div>
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
