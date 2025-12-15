"use client";

import { RoadmapsSkill } from "@zod-schema/scm/roadmaps/roadmap-skill";
import { MapPinIcon } from "@heroicons/react/24/outline";

interface TargetSkillsListProps {
  lessonSkills: RoadmapsSkill[];
  targetSkillNumbers: string[];
  selectedSkillId: string | null;
  contextSkillId: string | null;
  onSkillClick: (skillId: string) => void;
}

export function TargetSkillsList({
  lessonSkills,
  targetSkillNumbers,
  selectedSkillId,
  contextSkillId,
  onSkillClick,
}: TargetSkillsListProps) {
  const targetSkills = lessonSkills.filter(s => targetSkillNumbers.includes(s.skillNumber));

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all ${
      contextSkillId ? "w-[12.5%]" : "w-2/5"
    }`}>
      <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-3 z-10">
        <h3 className="font-semibold text-gray-900">
          Target Skills ({targetSkills.length})
        </h3>
      </div>
      <div className="overflow-y-auto max-h-[500px]">
        {targetSkills.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MapPinIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <div className="text-sm">No target skills found for this lesson</div>
          </div>
        ) : (
          targetSkills.map(skill => (
            <div
              key={skill._id}
              onClick={() => onSkillClick(skill._id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedSkillId === skill._id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-skill-target text-white font-bold text-sm flex-shrink-0">
                  {skill.skillNumber}
                </span>
                <span className="text-sm font-medium text-gray-900 line-clamp-2">
                  {skill.title}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
