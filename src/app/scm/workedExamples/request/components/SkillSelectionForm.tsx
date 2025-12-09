"use client";

import { RoadmapsSkill } from "@zod-schema/313/curriculum/roadmap-skill";

interface SkillWithType {
  skill: RoadmapsSkill;
  type: "target" | "essential" | "helpful";
}

interface SkillSelectionFormProps {
  availableSkills: SkillWithType[];
  selectedSkills: Set<string>;
  onSkillToggle: (skillNumber: string) => void;
}

export function SkillSelectionForm({
  availableSkills,
  selectedSkills,
  onSkillToggle,
}: SkillSelectionFormProps) {
  const targetSkills = availableSkills.filter(s => s.type === "target");
  const essentialSkills = availableSkills.filter(s => s.type === "essential");
  const helpfulSkills = availableSkills.filter(s => s.type === "helpful");

  const renderSkillCheckbox = ({ skill, type }: SkillWithType) => {
    const isSelected = selectedSkills.has(skill.skillNumber);

    const colorClasses = {
      target: {
        selected: "bg-skill-target-100 border-skill-target",
        badge: "bg-skill-target",
        checkbox: "text-skill-target focus:ring-skill-target",
      },
      essential: {
        selected: "bg-skill-essential-100 border-skill-essential",
        badge: "bg-skill-essential",
        checkbox: "text-skill-essential focus:ring-skill-essential",
      },
      helpful: {
        selected: "bg-skill-helpful-100 border-skill-helpful",
        badge: "bg-skill-helpful",
        checkbox: "text-skill-helpful focus:ring-skill-helpful",
      },
    };

    const colors = colorClasses[type];

    return (
      <label
        key={skill._id}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
          isSelected
            ? colors.selected
            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
        }`}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSkillToggle(skill.skillNumber)}
          className={`rounded ${colors.checkbox} cursor-pointer`}
        />
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${colors.badge} text-white font-bold text-xs`}>
          {skill.skillNumber}
        </span>
        <span className="text-sm">{skill.title}</span>
      </label>
    );
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Which skills is the student struggling with? *
      </label>
      <div className="space-y-4">
        {/* Target Skills */}
        {targetSkills.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-2">Target Skills</div>
            <div className="flex flex-wrap gap-2">
              {targetSkills.map(renderSkillCheckbox)}
            </div>
          </div>
        )}

        {/* Essential Skills */}
        {essentialSkills.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-2">Essential Skills</div>
            <div className="flex flex-wrap gap-2">
              {essentialSkills.map(renderSkillCheckbox)}
            </div>
          </div>
        )}

        {/* Helpful Skills */}
        {helpfulSkills.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-2">Helpful Skills</div>
            <div className="flex flex-wrap gap-2">
              {helpfulSkills.map(renderSkillCheckbox)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
