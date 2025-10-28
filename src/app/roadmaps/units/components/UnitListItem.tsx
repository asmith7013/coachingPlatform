"use client";

import { RoadmapUnit } from "@zod-schema/313/roadmap-unit";

interface UnitListItemProps {
  unit: RoadmapUnit;
  isSelected: boolean;
  onClick: () => void;
}

export function UnitListItem({ unit, isSelected, onClick }: UnitListItemProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-50 border-l-4 border-l-blue-600'
          : 'hover:bg-gray-50 border-l-4 border-l-transparent'
      }`}
    >
      {/* Unit Number and Title */}
      <div className={`font-medium mb-2 ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
        {unit.unitNumber} - {unit.unitTitle}
      </div>

      {/* Skill Counts */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="font-medium text-blue-600">{unit.targetCount}</span>
          <span className="text-gray-500">Target</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-medium text-green-600">{unit.supportCount}</span>
          <span className="text-gray-500">Support</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-medium text-purple-600">{unit.extensionCount}</span>
          <span className="text-gray-500">Extension</span>
        </div>
      </div>
    </div>
  );
}
