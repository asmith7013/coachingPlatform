"use client";

import { RoadmapsSkill, PracticeProblem } from "@zod-schema/scm/curriculum/roadmap-skill";
import { MapPinIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { SkillDetailHeader } from "./SkillDetailHeader";
import { DescriptionSection } from "./DescriptionSection";
import { StandardsSection } from "./StandardsSection";
import { AppearsInSection } from "./AppearsInSection";
import { PrerequisitesSection } from "./PrerequisitesSection";
import { VideoSection } from "./VideoSection";
import { PracticeProblemsSection } from "./PracticeProblemsSection";
import { EssentialQuestionSection } from "./EssentialQuestionSection";
import { CommonMisconceptionsSection } from "./CommonMisconceptionsSection";
import { VocabularySection } from "./VocabularySection";
import { ModelsAndManipulativesSection } from "./ModelsAndManipulativesSection";

export type SkillType = 'target' | 'essential' | 'helpful';

/** Configuration for which sections to show in the skill detail view */
export interface SkillDetailSections {
  description?: boolean;
  standards?: boolean;
  appearsIn?: boolean;
  prerequisites?: boolean;
  video?: boolean;
  practiceProblems?: boolean;
  essentialQuestion?: boolean;
  commonMisconceptions?: boolean;
  vocabulary?: boolean;
  modelsAndManipulatives?: boolean;
}

export interface SkillDetailViewProps {
  skill: RoadmapsSkill | null;
  onSkillClick?: (skillNumber: string, color: 'blue' | 'green' | 'orange' | 'purple') => void;
  onClose?: () => void;
  color?: 'blue' | 'green' | 'orange' | 'purple';
  /** The type of skill (target, essential, helpful) - used for proper coloring in queues */
  skillType?: SkillType;
  masteredSkills?: string[];
  /** Configure which sections to show. By default, all sections are shown. */
  sections?: SkillDetailSections;
  /** Callback to add a practice problem to the consideration queue */
  onAddProblemToQueue?: (problem: PracticeProblem, skillNumber: string, skillTitle: string, skillType: SkillType) => void;
  /** Function to check if a practice problem is already in the queue */
  isProblemInQueue?: (skillNumber: string, problemNumber: number | string) => boolean;
}

export function SkillDetailView({
  skill,
  onSkillClick,
  onClose,
  color = 'blue',
  skillType = 'target',
  masteredSkills = [],
  sections,
  onAddProblemToQueue,
  isProblemInQueue,
}: SkillDetailViewProps) {
  // By default, show all sections
  const showSection = {
    description: sections?.description !== false,
    standards: sections?.standards !== false,
    appearsIn: sections?.appearsIn !== false,
    prerequisites: sections?.prerequisites !== false,
    video: sections?.video !== false,
    practiceProblems: sections?.practiceProblems !== false,
    essentialQuestion: sections?.essentialQuestion !== false,
    commonMisconceptions: sections?.commonMisconceptions !== false,
    vocabulary: sections?.vocabulary !== false,
    modelsAndManipulatives: sections?.modelsAndManipulatives !== false,
  };

  if (!skill) {
    return (
      <div className="p-6 text-center text-gray-500">
        <MapPinIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <div className="text-sm">Click any skill to view details</div>
      </div>
    );
  }

  // Check if skill was not found
  if ((skill as unknown as { notFound?: boolean }).notFound) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="border-b border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-600 text-white font-bold text-sm flex-shrink-0">
              {skill.skillNumber}
            </span>
            <div className="text-xl font-bold text-gray-900">
              Skill Not Found
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div>
                <div className="font-semibold text-yellow-900 mb-1">
                  Skill {skill.skillNumber} not found in database
                </div>
                <div className="text-sm text-yellow-800">
                  This skill may not have been scraped yet or the skill number might be incorrect.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <SkillDetailHeader
        skillNumber={skill.skillNumber}
        title={skill.title}
        color={color}
        onClose={onClose}
      />

      {/* Content */}
      <div className="p-6 space-y-0">
        {showSection.description && skill.description && (
          <DescriptionSection description={skill.description} />
        )}

        {showSection.standards && skill.standards && (
          <StandardsSection standards={skill.standards} />
        )}

        {showSection.appearsIn && skill.appearsIn && (
          <AppearsInSection appearsIn={skill.appearsIn} />
        )}

        {showSection.prerequisites && (
          <PrerequisitesSection
            essentialSkills={skill.essentialSkills}
            helpfulSkills={skill.helpfulSkills}
            masteredSkills={masteredSkills}
            onSkillClick={onSkillClick}
          />
        )}

        {showSection.video && skill.videoUrl && (
          <VideoSection videoUrl={skill.videoUrl} skillNumber={skill.skillNumber} />
        )}

        {showSection.practiceProblems && skill.practiceProblems && skill.practiceProblems.length > 0 && (
          <PracticeProblemsSection
            practiceProblems={skill.practiceProblems as unknown as PracticeProblem[]}
            skillNumber={skill.skillNumber}
            skillTitle={skill.title}
            skillType={skillType}
            onAddToQueue={onAddProblemToQueue}
            isInQueue={isProblemInQueue}
          />
        )}

        {showSection.essentialQuestion && skill.essentialQuestion && (
          <EssentialQuestionSection essentialQuestion={skill.essentialQuestion} />
        )}

        {showSection.commonMisconceptions && skill.commonMisconceptions && (
          <CommonMisconceptionsSection commonMisconceptions={skill.commonMisconceptions} />
        )}

        {showSection.vocabulary && skill.vocabulary && skill.vocabulary.length > 0 && (
          <VocabularySection vocabulary={skill.vocabulary} />
        )}

        {showSection.modelsAndManipulatives && skill.primerHtml && (
          <ModelsAndManipulativesSection primerHtml={skill.primerHtml} />
        )}
      </div>
    </div>
  );
}
