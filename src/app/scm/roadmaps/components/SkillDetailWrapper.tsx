"use client";

import { RoadmapsSkill, PracticeProblem } from "@zod-schema/scm/curriculum/roadmap-skill";
import { SkillDetailView, SkillDetailSections } from "./SkillDetailView";

export type SkillType = 'target' | 'essential' | 'helpful';

interface SkillDetailWrapperProps {
  skill: RoadmapsSkill | null;
  onSkillClick?: (skillNumber: string, color: 'blue' | 'green' | 'orange' | 'purple') => void;
  color?: 'blue' | 'green' | 'orange' | 'purple';
  /** The type of skill (target, essential, helpful) - used for proper coloring in queues */
  skillType?: SkillType;
  masteredSkills?: string[];
  onClose?: () => void;
  loading?: boolean;
  showHeader?: boolean;
  headerTitle?: string;
  /** Configure which sections to show. By default, all sections are shown. */
  sections?: SkillDetailSections;
  /** Callback to add a practice problem to the consideration queue */
  onAddProblemToQueue?: (problem: PracticeProblem, skillNumber: string, skillTitle: string, skillType: SkillType) => void;
  /** Function to check if a practice problem is already in the queue */
  isProblemInQueue?: (skillNumber: string, problemNumber: number | string) => boolean;
}

export function SkillDetailWrapper({
  skill,
  onSkillClick,
  color = 'green',
  skillType = 'target',
  masteredSkills = [],
  onClose,
  loading = false,
  showHeader = false,
  headerTitle = "Skill Details",
  sections,
  onAddProblemToQueue,
  isProblemInQueue,
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
            skillType={skillType}
            masteredSkills={masteredSkills}
            sections={sections}
            onAddProblemToQueue={onAddProblemToQueue}
            isProblemInQueue={isProblemInQueue}
          />
        )}
      </div>
    </>
  );
}
