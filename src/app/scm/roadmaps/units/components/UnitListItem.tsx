"use client";

import { RoadmapUnit } from "@zod-schema/scm/roadmaps/roadmap-unit";

interface UnitListItemProps {
  unit: RoadmapUnit;
  isSelected: boolean;
  onClick: () => void;
  compact?: boolean;
}

export function UnitListItem({
  unit,
  isSelected,
  onClick,
  compact = false,
}: UnitListItemProps) {
  // Remove leading "XX - " pattern from unit title
  const cleanTitle = unit.unitTitle.replace(/^\d+\s*-\s*/, "");

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`p-3 border-b border-gray-200 cursor-pointer transition-all flex items-center justify-center ${
          isSelected
            ? "bg-blue-50 border-l-4 border-l-blue-600"
            : "hover:bg-gray-50 border-l-4 border-l-transparent"
        }`}
        title={`Unit ${unit.unitNumber}: ${cleanTitle}`}
      >
        <span
          className={`inline-flex items-center justify-center px-2 py-1 rounded ${
            isSelected ? "bg-gray-700" : "bg-gray-600"
          } text-white font-bold text-xs whitespace-nowrap`}
        >
          Unit {unit.unitNumber}
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
        isSelected
          ? "bg-blue-50 border-l-4 border-l-blue-600"
          : "hover:bg-gray-50 border-l-4 border-l-transparent"
      }`}
    >
      {/* Unit Number and Title */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`inline-flex items-center justify-center px-2 py-1 rounded ${
              isSelected ? "bg-gray-700" : "bg-gray-600"
            } text-white font-bold text-xs flex-shrink-0 whitespace-nowrap`}
          >
            Unit {unit.unitNumber}
          </span>
          <div
            className={`font-medium text-base ${isSelected ? "text-gray-900" : "text-gray-900"}`}
          >
            {cleanTitle}
          </div>
        </div>
      </div>

      {/* Skill Counts */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="font-medium text-skill-target">
            {unit.targetCount}
          </span>
          <span className="text-gray-500">Target</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-medium text-skill-essential">
            {unit.supportCount}
          </span>
          <span className="text-gray-500">Essential</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-medium text-skill-helpful">
            {unit.extensionCount}
          </span>
          <span className="text-gray-500">Helpful</span>
        </div>
      </div>
    </div>
  );
}
