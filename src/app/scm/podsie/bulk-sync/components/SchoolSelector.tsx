import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface SyncProgress {
  totalAssignments: number;
  completedAssignments: number;
  currentSchool: string;
  currentSection: string;
  currentLesson: string;
  currentActivity: string;
}

interface SchoolSelectorProps {
  schools: string[];
  selectedSchool: string;
  onSchoolChange: (school: string) => void;
  hasSections: boolean;
  syncing: boolean;
  syncProgress: SyncProgress | null;
  onSyncAll: () => void;
}

export function SchoolSelector({
  schools,
  selectedSchool,
  onSchoolChange,
  hasSections,
  syncing,
  syncProgress,
  onSyncAll
}: SchoolSelectorProps) {
  // Calculate progress for the Sync All School button
  const schoolSyncProgress = syncProgress && syncProgress.totalAssignments > 0
    ? (syncProgress.completedAssignments / syncProgress.totalAssignments) * 100
    : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            School
          </label>
          <select
            value={selectedSchool}
            onChange={(e) => onSchoolChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
          >
            <option value="">Select school...</option>
            {schools.map(school => (
              <option key={school} value={school}>{school}</option>
            ))}
          </select>
        </div>

        {/* Sync All School Button with Progress Bar */}
        {selectedSchool && hasSections && (
          <div className="flex items-center gap-3">
            {/* Progress bar to the left */}
            {syncing && syncProgress && (
              <div className="flex-shrink-0 w-48">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${schoolSyncProgress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-1 text-center">
                  {syncProgress.completedAssignments} / {syncProgress.totalAssignments}
                </div>
              </div>
            )}
            <button
              onClick={onSyncAll}
              disabled={syncing}
              className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                syncing
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
              }`}
            >
              <ArrowPathIcon className={`w-5 h-5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Sync All School"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
