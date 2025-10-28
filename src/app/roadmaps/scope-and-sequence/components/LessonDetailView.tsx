"use client";

import { useState, useEffect } from "react";
import { fetchRoadmapsSkillsByNumbers } from "@/app/actions/313/roadmaps-skills";
import { RoadmapsSkill } from "@zod-schema/313/roadmap-skill";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon as CheckCircleOutlineIcon } from "@heroicons/react/24/outline";

interface Lesson {
  _id: string;
  grade: string;
  unit: string;
  unitLessonId: string;
  unitNumber: number;
  lessonNumber: number;
  lessonName: string;
  section?: string;
  scopeSequenceTag?: string;
  roadmapSkills?: string[];
  targetSkills?: string[];
}

interface LessonDetailViewProps {
  lesson: Lesson | null;
  onSkillClick?: (skillNumber: string, color: 'blue' | 'green' | 'orange' | 'purple') => void;
  masteredSkills?: string[];
}

export function LessonDetailView({ lesson, onSkillClick, masteredSkills = [] }: LessonDetailViewProps) {
  const [roadmapSkillsData, setRoadmapSkillsData] = useState<RoadmapsSkill[]>([]);
  const [_targetSkillsData, setTargetSkillsData] = useState<RoadmapsSkill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  // Fetch skills when lesson changes
  useEffect(() => {
    if (!lesson) {
      setRoadmapSkillsData([]);
      setTargetSkillsData([]);
      return;
    }

    const fetchSkills = async () => {
      setLoadingSkills(true);
      try {
        // Fetch roadmap skills
        if (lesson.roadmapSkills && lesson.roadmapSkills.length > 0) {
          const roadmapResult = await fetchRoadmapsSkillsByNumbers(lesson.roadmapSkills);
          if (roadmapResult.success && roadmapResult.data) {
            setRoadmapSkillsData(roadmapResult.data);
          }
        } else {
          setRoadmapSkillsData([]);
        }

        // Fetch target skills
        if (lesson.targetSkills && lesson.targetSkills.length > 0) {
          const targetResult = await fetchRoadmapsSkillsByNumbers(lesson.targetSkills);
          if (targetResult.success && targetResult.data) {
            setTargetSkillsData(targetResult.data);
          }
        } else {
          setTargetSkillsData([]);
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchSkills();
  }, [lesson]);

  // Empty state
  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">📚</div>
          <div className="text-gray-600 font-medium mb-1">No Lesson Selected</div>
          <div className="text-gray-500 text-sm">Select a grade, unit, and lesson to view details</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Card - Lesson Title */}
      <div className="border-b border-gray-200 p-6 bg-gray-50">
        <div className="flex items-start gap-3">
          <span className="inline-flex items-center px-3 py-2 rounded-md text-sm font-semibold flex-shrink-0 bg-gray-600 text-white">
            Lesson {lesson.lessonNumber}
          </span>
          <div className="text-2xl font-bold text-gray-900">
            {lesson.lessonName}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Roadmap Skills Section */}
        {loadingSkills ? (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading skills...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Roadmap Skills */}
            {(lesson.roadmapSkills && lesson.roadmapSkills.length > 0) || roadmapSkillsData.length > 0 ? (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Roadmap Skills ({lesson.roadmapSkills?.length || 0})
                </h3>
                {roadmapSkillsData.length > 0 ? (
                  <div className="space-y-2">
                    {roadmapSkillsData.map((skill) => {
                      const isTargetSkill = lesson.targetSkills?.includes(skill.skillNumber);
                      const hasEssentialSkills = skill.essentialSkills && skill.essentialSkills.length > 0;
                      const hasHelpfulSkills = skill.helpfulSkills && skill.helpfulSkills.length > 0;
                      const hasPrerequisites = hasEssentialSkills || hasHelpfulSkills;

                      const isMastered = masteredSkills.includes(skill.skillNumber);

                      return (
                        <div
                          key={skill.skillNumber}
                          className={`border rounded-lg transition-colors ${
                            isTargetSkill
                              ? 'border-green-300 bg-green-50'
                              : 'border-blue-200 bg-blue-50'
                          }`}
                        >
                          {/* Main skill card */}
                          <div className="flex items-center gap-3 p-3">
                            <span
                              onClick={() => onSkillClick?.(skill.skillNumber, isTargetSkill ? 'green' : 'blue')}
                              className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-sm flex-shrink-0 cursor-pointer hover:opacity-80 ${
                                isTargetSkill ? 'bg-green-600' : 'bg-blue-600'
                              }`}
                            >
                              {skill.skillNumber}
                            </span>
                            {/* Mastery Indicator */}
                            {masteredSkills.length > 0 && (
                              <div className="flex-shrink-0">
                                {isMastered ? (
                                  <CheckCircleIcon className="w-5 h-5 text-green-600" title="Mastered" />
                                ) : (
                                  <CheckCircleOutlineIcon className="w-5 h-5 text-gray-400" title="Not yet mastered" />
                                )}
                              </div>
                            )}
                            <div className="flex-1">
                              <span className="font-medium text-gray-900">
                                {skill.title}
                              </span>
                              {isTargetSkill && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-200 text-green-800">
                                  Target Skill
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Prerequisites - always shown */}
                          {hasPrerequisites && (
                            <div className="px-3 pb-3 pt-1 space-y-3 border-t border-gray-200">
                              {/* Essential Skills */}
                              {hasEssentialSkills && (
                                <div>
                                  <div className="text-xs font-semibold text-gray-700 mb-2">Essential Skills</div>
                                  <div className="flex flex-wrap gap-2">
                                    {skill.essentialSkills!.map((essentialSkill) => {
                                      const skillNum = typeof essentialSkill === 'string' ? essentialSkill : essentialSkill.skillNumber;
                                      const skillTitle = typeof essentialSkill === 'object' ? essentialSkill.title : undefined;
                                      const isSkillMastered = masteredSkills.includes(skillNum);
                                      return (
                                        <div
                                          key={skillNum}
                                          className="inline-flex items-center gap-2 px-2 py-1 rounded bg-orange-50 border border-orange-200"
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
                                            <span className="text-xs text-gray-900">{skillTitle}</span>
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
                                  <div className="text-xs font-semibold text-gray-700 mb-2">Helpful Skills</div>
                                  <div className="flex flex-wrap gap-2">
                                    {skill.helpfulSkills!.map((helpfulSkill) => {
                                      const skillNum = typeof helpfulSkill === 'string' ? helpfulSkill : helpfulSkill.skillNumber;
                                      const skillTitle = typeof helpfulSkill === 'object' ? helpfulSkill.title : undefined;
                                      const isSkillMastered = masteredSkills.includes(skillNum);
                                      return (
                                        <div
                                          key={skillNum}
                                          className="inline-flex items-center gap-2 px-2 py-1 rounded bg-purple-50 border border-purple-200"
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
                                            <span className="text-xs text-gray-900">{skillTitle}</span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {lesson.roadmapSkills?.map((skillNumber) => {
                      const isTargetSkill = lesson.targetSkills?.includes(skillNumber);
                      return (
                        <span
                          key={skillNumber}
                          onClick={() => onSkillClick?.(skillNumber, isTargetSkill ? 'green' : 'blue')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer hover:opacity-80 ${
                            isTargetSkill
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {skillNumber}
                          {isTargetSkill && ' ⭐'}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}
          </>
        )}

        {/* Placeholder for future content */}
        {!lesson.roadmapSkills?.length && !lesson.targetSkills?.length && (
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-blue-800 text-sm">
                No skills tagged to this lesson yet. Skills can be added to track roadmap and target skills for this lesson.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
