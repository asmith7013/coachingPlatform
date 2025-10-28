"use client";

import { useState } from "react";
import { RoadmapsSkill } from "@zod-schema/313/roadmap-skill";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon as CheckCircleOutlineIcon } from "@heroicons/react/24/outline";

interface SkillDetailViewProps {
  skill: RoadmapsSkill | null;
  onSkillClick?: (skillNumber: string, color: 'blue' | 'green' | 'orange' | 'purple') => void;
  color?: 'blue' | 'green' | 'orange' | 'purple';
  masteredSkills?: string[];
}

const colorClasses = {
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  orange: 'bg-orange-600',
  purple: 'bg-purple-600',
};

export function SkillDetailView({ skill, onSkillClick, color = 'blue', masteredSkills = [] }: SkillDetailViewProps) {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);

  if (!skill) {
    return (
      <div className="p-6 text-center text-gray-500">
        <div className="text-gray-400 text-lg mb-2">🎯</div>
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
              <div className="text-yellow-600 text-xl">⚠️</div>
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

  const hasEssentialSkills = skill.essentialSkills && skill.essentialSkills.length > 0;
  const hasHelpfulSkills = skill.helpfulSkills && skill.helpfulSkills.length > 0;
  const hasProblems = skill.practiceProblems && skill.practiceProblems.length > 0;

  const nextProblem = () => {
    if (hasProblems) {
      setCurrentProblemIndex((prev) => (prev + 1) % skill.practiceProblems!.length);
    }
  };

  const prevProblem = () => {
    if (hasProblems) {
      setCurrentProblemIndex((prev) =>
        prev === 0 ? skill.practiceProblems!.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="border-b border-gray-200 p-6 bg-gray-50">
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-sm flex-shrink-0 ${colorClasses[color]}`}>
            {skill.skillNumber}
          </span>
          <div className="text-xl font-bold text-gray-900">
            {skill.title}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-0">
        {/* Standards */}
        {skill.standards && (
          <div className="border-b border-gray-200 pb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Standards</h4>
            <div
              className="text-sm text-gray-600 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: skill.standards }}
            />
          </div>
        )}

        {/* Prerequisites - moved to top */}
        {(hasEssentialSkills || hasHelpfulSkills) && (
          <div className="border-b border-gray-200 pb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Prerequisites</h4>

            {/* Essential Skills */}
            {hasEssentialSkills && (
              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-600 mb-2">Essential Skills</div>
                <div className="flex flex-wrap gap-2">
                  {skill.essentialSkills!.map((essentialSkill) => {
                    const skillNum = typeof essentialSkill === 'string' ? essentialSkill : essentialSkill.skillNumber;
                    const skillTitle = typeof essentialSkill === 'object' ? essentialSkill.title : undefined;
                    const isSkillMastered = masteredSkills.includes(skillNum);
                    return (
                      <div
                        key={skillNum}
                        className="flex items-center gap-2 px-2 py-1 rounded bg-orange-50 border border-orange-200 max-w-full"
                      >
                        <span
                          onClick={() => onSkillClick?.(skillNum, 'orange')}
                          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-600 text-white font-bold text-xs flex-shrink-0 cursor-pointer hover:opacity-80"
                        >
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
                  {skill.helpfulSkills!.map((helpfulSkill) => {
                    const skillNum = typeof helpfulSkill === 'string' ? helpfulSkill : helpfulSkill.skillNumber;
                    const skillTitle = typeof helpfulSkill === 'object' ? helpfulSkill.title : undefined;
                    const isSkillMastered = masteredSkills.includes(skillNum);
                    return (
                      <div
                        key={skillNum}
                        className="flex items-center gap-2 px-2 py-1 rounded bg-purple-50 border border-purple-200 max-w-full"
                      >
                        <span
                          onClick={() => onSkillClick?.(skillNum, 'purple')}
                          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex-shrink-0 cursor-pointer hover:opacity-80"
                        >
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
        )}

        {/* Description */}
        {skill.description && (
          <div className="border-b border-gray-200 py-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
            <div
              className="text-sm text-gray-600 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: skill.description }}
            />
          </div>
        )}

        {/* Video */}
        {skill.videoUrl && skill.videoUrl.trim() !== '' && (
          <div className="border-b border-gray-200 py-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Worked Example Video</h4>
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
              <video
                controls
                className="w-full"
                preload="metadata"
                style={{ aspectRatio: '16/9' }}
              >
                <source src={skill.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}

        {/* Practice Problems */}
        {hasProblems && (
          <div className="border-b border-gray-200 py-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Practice Problems ({skill.practiceProblems!.length})
            </h4>
            <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden">
              <img
                src={skill.practiceProblems![currentProblemIndex].screenshotUrl}
                alt={`Practice Problem ${skill.practiceProblems![currentProblemIndex].problemNumber}`}
                className="w-full"
              />

              {skill.practiceProblems!.length > 1 && (
                <>
                  <button
                    onClick={prevProblem}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                    aria-label="Previous problem"
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={nextProblem}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                    aria-label="Next problem"
                  >
                    <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {currentProblemIndex + 1} / {skill.practiceProblems!.length}
                  </div>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Problem {skill.practiceProblems![currentProblemIndex].problemNumber}
            </p>
          </div>
        )}

        {/* Essential Question */}
        {skill.essentialQuestion && (
          <div className="border-b border-gray-200 py-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Essential Question</h4>
            <p className="text-sm text-gray-600">{skill.essentialQuestion}</p>
          </div>
        )}

        {/* Common Misconceptions */}
        {skill.commonMisconceptions && (
          <div className="border-b border-gray-200 py-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Common Misconceptions</h4>
            <div
              className="text-sm text-gray-600 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: skill.commonMisconceptions }}
            />
          </div>
        )}

        {/* Vocabulary */}
        {skill.vocabulary && skill.vocabulary.length > 0 && (
          <div className="border-b border-gray-200 py-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Vocabulary</h4>
            <div className="flex flex-wrap gap-2">
              {skill.vocabulary.map((term, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Models and Manipulatives - moved to end */}
        {skill.modelsAndManipulatives && (
          <div className="py-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Models & Manipulatives</h4>
            <div
              className="text-sm text-gray-600 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: skill.modelsAndManipulatives }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
