"use client";

import { RoadmapsSkill } from "@zod-schema/313/roadmap-skill";

interface SkillListItemProps {
  skill: RoadmapsSkill;
  isSelected: boolean;
  onClick: () => void;
}

export function SkillListItem({ skill, isSelected, onClick }: SkillListItemProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-50 border-l-4 border-l-blue-600'
          : 'hover:bg-gray-50 border-l-4 border-l-transparent'
      }`}
    >
      {/* Skill Number */}
      <div className={`text-2xl font-bold mb-2 ${isSelected ? 'text-blue-700' : 'text-blue-600'}`}>
        {skill.skillNumber}
      </div>

      {/* Skill Title */}
      <div className={`text-sm font-medium line-clamp-2 ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
        {skill.title}
      </div>

      {/* Optional: Show unit count if available */}
      {skill.units && skill.units.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          {skill.units.length} unit{skill.units.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
