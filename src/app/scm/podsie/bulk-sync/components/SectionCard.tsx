import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { UnitCard } from "./UnitCard";
import type { AssignmentContent } from "@zod-schema/scm/podsie/section-config";

interface UnitGroup {
  unitNumber: number;
  unitName: string;
  assignments: AssignmentContent[];
}

interface SectionCardProps {
  sectionName: string;
  school: string;
  teacher?: string;
  gradeLevel: string;
  assignmentsCount: number;
  unitGroups: UnitGroup[];
  syncing: boolean;
  onSyncSection: () => void;
  onSyncUnit: (unitNumber: number) => void;
}

export function SectionCard({
  sectionName,
  school,
  teacher,
  gradeLevel,
  assignmentsCount,
  unitGroups,
  syncing,
  onSyncSection,
  onSyncUnit
}: SectionCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {sectionName}
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {school}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {teacher && `${teacher} • `}
              Grade {gradeLevel} • {assignmentsCount} assignments
            </p>
          </div>
          <button
            onClick={onSyncSection}
            disabled={syncing}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
              syncing
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            }`}
          >
            <ArrowPathIcon className={`w-5 h-5 ${syncing ? "animate-spin" : ""}`} />
            Sync Section
          </button>
        </div>
      </div>

      {/* Units within Section */}
      <div className="p-6 space-y-6">
        {unitGroups.map((unitGroup) => (
          <UnitCard
            key={unitGroup.unitNumber}
            unitNumber={unitGroup.unitNumber}
            assignments={unitGroup.assignments}
            syncing={syncing}
            onSyncUnit={() => onSyncUnit(unitGroup.unitNumber)}
          />
        ))}
      </div>
    </div>
  );
}
