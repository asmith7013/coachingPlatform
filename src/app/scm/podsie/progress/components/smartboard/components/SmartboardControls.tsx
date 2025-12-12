import { PencilIcon, CheckIcon } from "@heroicons/react/24/outline";
import { ToggleSwitch } from "@/components/core/fields/ToggleSwitch";

interface SmartboardControlsProps {
  showDailyProgress: boolean;
  onShowDailyProgressChange: (value: boolean) => void;
  showSidekick: boolean;
  onShowSidekickChange: (value: boolean) => void;
  isEditMode: boolean;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onToggleEditMode: () => void;
}

export function SmartboardControls({
  showDailyProgress,
  onShowDailyProgressChange,
  showSidekick,
  onShowSidekickChange,
  isEditMode,
  hasUnsavedChanges,
  isSaving,
  onSave,
  onToggleEditMode,
}: SmartboardControlsProps) {
  return (
    <div className="flex justify-end gap-2 mb-2">
      <ToggleSwitch
        checked={showDailyProgress}
        onChange={onShowDailyProgressChange}
        label="Show Today's Progress"
      />
      <ToggleSwitch
        checked={showSidekick}
        onChange={onShowSidekickChange}
        label="Show Sidekick"
      />
      {isEditMode && hasUnsavedChanges && (
        <button
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        >
          <CheckIcon className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save"}
        </button>
      )}
      <button
        onClick={onToggleEditMode}
        disabled={isSaving}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${
          isEditMode
            ? "bg-indigo-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        <PencilIcon className="w-4 h-4" />
        {isEditMode ? (hasUnsavedChanges ? "Save & Close" : "Done Editing") : "Edit Display"}
      </button>
    </div>
  );
}
