import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { AssignmentItem } from "./AssignmentItem";
import type { AssignmentContent } from "@zod-schema/313/podsie/section-config";

interface UnitCardProps {
  unitNumber: number;
  assignments: AssignmentContent[];
  syncing: boolean;
  onSyncUnit: () => void;
}

export function UnitCard({
  unitNumber,
  assignments,
  syncing,
  onSyncUnit
}: UnitCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg">
      {/* Unit Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Unit {unitNumber}
          </h3>
          <p className="text-sm text-gray-600">
            {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onSyncUnit}
          disabled={syncing}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            syncing
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
          }`}
        >
          <ArrowPathIcon className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          Sync Unit
        </button>
      </div>

      {/* Assignments List */}
      <div className="divide-y divide-gray-200">
        {assignments.map((assignment, idx) => (
          <AssignmentItem
            key={idx}
            assignment={assignment}
          />
        ))}
      </div>
    </div>
  );
}
