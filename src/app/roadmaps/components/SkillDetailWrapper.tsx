"use client";

import { RoadmapsSkill } from "@zod-schema/313/roadmap-skill";
import { SkillDetailView } from "./SkillDetailView";

interface SkillDetailWrapperProps {
  skill: RoadmapsSkill | null;
  onSkillClick?: (skillNumber: string, color: 'blue' | 'green' | 'orange' | 'purple') => void;
  color?: 'blue' | 'green' | 'orange' | 'purple';
  masteredSkills?: string[];
  onClose?: () => void;
  loading?: boolean;
  showHeader?: boolean;
  headerTitle?: string;
}

export function SkillDetailWrapper({
  skill,
  onSkillClick,
  color = 'green',
  masteredSkills = [],
  onClose,
  loading = false,
  showHeader = false,
  headerTitle = "Skill Details"
}: SkillDetailWrapperProps) {
  return (
    <>
      {showHeader && (
        <div className={`sticky top-0 border-b border-gray-200 px-4 py-3 z-10 flex items-center justify-between ${
          onClose ? 'bg-gray-600' : 'bg-gray-50'
        }`}>
          <h3 className={`font-semibold ${onClose ? 'text-white' : 'text-gray-900'}`}>{headerTitle}</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-500 transition-colors cursor-pointer"
              title="Close"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}
      <div className="overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <span className="text-gray-600 text-sm mt-2 block">Loading skill...</span>
          </div>
        ) : (
          <SkillDetailView
            skill={skill}
            onSkillClick={onSkillClick}
            color={color}
            masteredSkills={masteredSkills}
          />
        )}
      </div>
    </>
  );
}
