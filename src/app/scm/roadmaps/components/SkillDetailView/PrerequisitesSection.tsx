"use client";

import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon as CheckCircleOutlineIcon } from "@heroicons/react/24/outline";

interface SkillRef {
  skillNumber: string;
  title?: string;
}

interface PrerequisitesSectionProps {
  essentialSkills?: (string | SkillRef)[];
  helpfulSkills?: (string | SkillRef)[];
  masteredSkills?: string[];
  onSkillClick?: (skillNumber: string, color: 'blue' | 'green' | 'orange' | 'purple') => void;
}

export function PrerequisitesSection({
  essentialSkills,
  helpfulSkills,
  masteredSkills = [],
  onSkillClick
}: PrerequisitesSectionProps) {
  const hasEssentialSkills = essentialSkills && essentialSkills.length > 0;
  const hasHelpfulSkills = helpfulSkills && helpfulSkills.length > 0;

  if (!hasEssentialSkills && !hasHelpfulSkills) return null;

  return (
    <div className="border-b border-gray-200 py-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Prerequisites</h4>

      {/* Essential Skills */}
      {hasEssentialSkills && (
        <div className="mb-3">
          <div className="text-xs font-semibold text-gray-600 mb-2">Essential Skills</div>
          <div className="flex flex-wrap gap-2">
            {essentialSkills!.map((essentialSkill) => {
              const skillNum = typeof essentialSkill === 'string' ? essentialSkill : essentialSkill.skillNumber;
              const skillTitle = typeof essentialSkill === 'object' ? essentialSkill.title : undefined;
              const isSkillMastered = masteredSkills.includes(skillNum);
              return (
                <div
                  key={skillNum}
                  onClick={() => onSkillClick?.(skillNum, 'orange')}
                  className="flex items-center gap-2 px-2 py-1 rounded bg-skill-essential-100 border border-skill-essential-300 max-w-full cursor-pointer hover:bg-skill-essential-200 hover:shadow-sm transition-all"
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-skill-essential text-white font-bold text-xs flex-shrink-0">
                    {skillNum}
                  </span>
                  {masteredSkills.length > 0 && (
                    <div className="flex-shrink-0">
                      {isSkillMastered ? (
                        <CheckCircleIcon className="w-4 h-4 text-green-600" title="Mastered" />
                      ) : (
                        <CheckCircleOutlineIcon className="w-4 h-4 text-gray-400" title="Not yet mastered" />
                      )}
                    </div>
                  )}
                  {skillTitle && (
                    <span className="text-xs text-gray-900 break-words">{skillTitle}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Helpful Skills */}
      {hasHelpfulSkills && (
        <div>
          <div className="text-xs font-semibold text-gray-600 mb-2">Helpful Skills</div>
          <div className="flex flex-wrap gap-2">
            {helpfulSkills!.map((helpfulSkill) => {
              const skillNum = typeof helpfulSkill === 'string' ? helpfulSkill : helpfulSkill.skillNumber;
              const skillTitle = typeof helpfulSkill === 'object' ? helpfulSkill.title : undefined;
              const isSkillMastered = masteredSkills.includes(skillNum);
              return (
                <div
                  key={skillNum}
                  onClick={() => onSkillClick?.(skillNum, 'purple')}
                  className="flex items-center gap-2 px-2 py-1 rounded bg-skill-helpful-100 border border-skill-helpful-300 max-w-full cursor-pointer hover:bg-skill-helpful-200 hover:shadow-sm transition-all"
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-skill-helpful text-white font-bold text-xs flex-shrink-0">
                    {skillNum}
                  </span>
                  {masteredSkills.length > 0 && (
                    <div className="flex-shrink-0">
                      {isSkillMastered ? (
                        <CheckCircleIcon className="w-4 h-4 text-green-600" title="Mastered" />
                      ) : (
                        <CheckCircleOutlineIcon className="w-4 h-4 text-gray-400" title="Not yet mastered" />
                      )}
                    </div>
                  )}
                  {skillTitle && (
                    <span className="text-xs text-gray-900 break-words">{skillTitle}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
