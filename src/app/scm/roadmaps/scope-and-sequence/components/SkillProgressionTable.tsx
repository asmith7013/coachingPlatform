"use client";

import { useMemo, useState, useEffect } from "react";
import { fetchRoadmapsSkillsByNumbers } from "@/app/actions/scm/roadmaps/roadmaps-skills";
import { RoadmapsSkill } from "@zod-schema/scm/roadmaps/roadmap-skill";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon as CheckCircleOutlineIcon } from "@heroicons/react/24/outline";

interface Lesson {
  _id: string;
  lessonNumber: number;
  lessonName: string;
  section?: string;
  targetSkills?: string[];
  roadmapSkills?: string[];
}

interface SkillProgressionTableProps {
  lessons: Lesson[];
  onLessonClick?: (lessonId: string) => void;
  masteredSkills?: string[];
  selectedLessonId?: string | null;
}

// Generate distinct colors for each skill column
const SKILL_COLORS = [
  { bg: "bg-blue-100", border: "border-blue-300", dot: "bg-blue-600" },
  { bg: "bg-green-100", border: "border-green-300", dot: "bg-green-600" },
  { bg: "bg-purple-100", border: "border-purple-300", dot: "bg-purple-600" },
  { bg: "bg-pink-100", border: "border-pink-300", dot: "bg-pink-600" },
  { bg: "bg-yellow-100", border: "border-yellow-300", dot: "bg-yellow-600" },
  { bg: "bg-indigo-100", border: "border-indigo-300", dot: "bg-indigo-600" },
  { bg: "bg-red-100", border: "border-red-300", dot: "bg-red-600" },
  { bg: "bg-orange-100", border: "border-orange-300", dot: "bg-orange-600" },
  { bg: "bg-teal-100", border: "border-teal-300", dot: "bg-teal-600" },
  { bg: "bg-cyan-100", border: "border-cyan-300", dot: "bg-cyan-600" },
];

export function SkillProgressionTable({ lessons, onLessonClick, masteredSkills = [], selectedLessonId = null }: SkillProgressionTableProps) {
  const [skillsData, setSkillsData] = useState<Map<string, RoadmapsSkill>>(new Map());
  const [_loadingSkills, setLoadingSkills] = useState(false);
  const [showPrerequisites, setShowPrerequisites] = useState(false);

  // Extract all unique target skills across all lessons (to use as column headers)
  const allTargetSkills = useMemo(() => {
    const skillsSet = new Set<string>();
    lessons.forEach((lesson) => {
      lesson.targetSkills?.forEach((skill) => skillsSet.add(skill));
    });
    return Array.from(skillsSet).sort((a, b) => Number(a) - Number(b));
  }, [lessons]);

  // Fetch skill data for the target skills
  useEffect(() => {
    if (allTargetSkills.length === 0) return;

    const fetchSkills = async () => {
      setLoadingSkills(true);
      try {
        const result = await fetchRoadmapsSkillsByNumbers(allTargetSkills);
        if (result.success && result.data) {
          const skillMap = new Map<string, RoadmapsSkill>();
          result.data.forEach((skill) => {
            skillMap.set(skill.skillNumber, skill);
          });
          setSkillsData(skillMap);
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchSkills();
  }, [allTargetSkills]);

  // If no target skills, don't render anything
  if (allTargetSkills.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Target Skill Progression</h3>
        <button
          onClick={() => setShowPrerequisites(!showPrerequisites)}
          className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          {showPrerequisites ? 'Hide' : 'Show'} Prerequisites
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white text-center px-3 py-2 font-medium text-gray-700 border-b-2 border-gray-300 w-[60px]">
                Section
              </th>
              <th className="sticky left-[60px] bg-white text-center px-3 py-2 font-medium text-gray-700 border-b-2 border-gray-300 w-[60px]">
                Lesson
              </th>
              {allTargetSkills.map((skill, index) => {
                const colorScheme = SKILL_COLORS[index % SKILL_COLORS.length];
                const skillData = skillsData.get(skill);
                const isMastered = masteredSkills.includes(skill);
                return (
                  <th
                    key={skill}
                    className={`px-2 py-2 font-medium text-gray-900 border-b-2 ${colorScheme.border} ${colorScheme.bg} w-[120px] text-center`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5 justify-center">
                        <div className="font-bold">{skill}</div>
                        {masteredSkills.length > 0 && (
                          <div className="flex-shrink-0">
                            {isMastered ? (
                              <CheckCircleIcon className="w-4 h-4 text-green-600" title="Mastered" />
                            ) : (
                              <CheckCircleOutlineIcon className="w-4 h-4 text-gray-400" title="Not yet mastered" />
                            )}
                          </div>
                        )}
                      </div>
                      {skillData && (
                        <div className="text-xs font-normal text-gray-700 line-clamp-2">
                          {skillData.title}
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* Prerequisites Row - Essential and Helpful Skills */}
            {showPrerequisites && (
              <tr className="border-b-2 border-gray-400">
              <td className="sticky left-0 bg-gray-100 px-2 py-2 text-xs text-gray-700 font-semibold">
                Prerequisites
              </td>
              <td className="sticky left-[60px] bg-gray-100 px-2 py-2 text-xs text-gray-600">
                {/* Empty */}
              </td>
              {allTargetSkills.map((skill, skillIndex) => {
                const colorScheme = SKILL_COLORS[skillIndex % SKILL_COLORS.length];
                const skillData = skillsData.get(skill);
                const essentialSkills = skillData?.essentialSkills || [];
                const helpfulSkills = skillData?.helpfulSkills || [];

                return (
                  <td
                    key={skill}
                    className={`px-2 py-2 ${colorScheme.bg} bg-opacity-40 align-top`}
                  >
                    <div className="text-[10px] space-y-2">
                      {/* Essential Skills */}
                      {essentialSkills.length > 0 && (
                        <div>
                          <div className="font-semibold mb-1 text-skill-essential">Essential:</div>
                          <div className="space-y-0.5">
                            {essentialSkills.map((essSkill) => {
                              const skillNum = typeof essSkill === 'string' ? essSkill : essSkill.skillNumber;
                              const skillTitle = typeof essSkill === 'object' ? essSkill.title : undefined;
                              const isSkillMastered = masteredSkills.includes(skillNum);
                              return (
                                <div key={skillNum} className="text-gray-700 flex items-start gap-1">
                                  <span className="font-semibold">{skillNum}</span>
                                  {masteredSkills.length > 0 && (
                                    <div className="flex-shrink-0 mt-[1px]">
                                      {isSkillMastered ? (
                                        <CheckCircleIcon className="w-3 h-3 text-green-600" title="Mastered" />
                                      ) : (
                                        <CheckCircleOutlineIcon className="w-3 h-3 text-gray-400" title="Not yet mastered" />
                                      )}
                                    </div>
                                  )}
                                  {skillTitle && <span className="ml-0.5">- {skillTitle}</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Helpful Skills */}
                      {helpfulSkills.length > 0 && (
                        <div>
                          <div className="font-semibold mb-1 text-skill-helpful">Helpful:</div>
                          <div className="space-y-0.5">
                            {helpfulSkills.map((helpSkill) => {
                              const skillNum = typeof helpSkill === 'string' ? helpSkill : helpSkill.skillNumber;
                              const skillTitle = typeof helpSkill === 'object' ? helpSkill.title : undefined;
                              const isSkillMastered = masteredSkills.includes(skillNum);
                              return (
                                <div key={skillNum} className="text-gray-700 flex items-start gap-1">
                                  <span className="font-semibold">{skillNum}</span>
                                  {masteredSkills.length > 0 && (
                                    <div className="flex-shrink-0 mt-[1px]">
                                      {isSkillMastered ? (
                                        <CheckCircleIcon className="w-3 h-3 text-green-600" title="Mastered" />
                                      ) : (
                                        <CheckCircleOutlineIcon className="w-3 h-3 text-gray-400" title="Not yet mastered" />
                                      )}
                                    </div>
                                  )}
                                  {skillTitle && <span className="ml-0.5">- {skillTitle}</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                );
              })}
              </tr>
            )}

            {/* Lesson Rows */}
            {lessons.map((lesson, lessonIndex) => {
              const isSelected = selectedLessonId === lesson._id;
              return (
                <tr
                  key={lesson._id}
                  onClick={() => onLessonClick?.(lesson._id)}
                  className={`cursor-pointer transition-all group border-y ${
                    isSelected
                      ? 'border-blue-500 border-y-2'
                      : 'border-gray-200 hover:border-y-2 hover:border-blue-400'
                  }`}
                >
                  <td className={`sticky left-0 bg-inherit px-3 py-2 font-medium text-gray-700 text-center ${
                    isSelected
                      ? 'bg-gray-300'
                      : lessonIndex % 2 === 0
                        ? "bg-gray-50 group-hover:bg-blue-100"
                        : "bg-white group-hover:bg-blue-100"
                  }`}>
                    {lesson.section || '-'}
                  </td>
                  <td className={`sticky left-[60px] bg-inherit px-3 py-2 font-medium text-gray-700 text-center ${
                    isSelected
                      ? 'bg-gray-300'
                      : lessonIndex % 2 === 0
                        ? "bg-gray-50 group-hover:bg-blue-100"
                        : "bg-white group-hover:bg-blue-100"
                  }`}>
                    {lesson.lessonNumber}
                  </td>
                  {allTargetSkills.map((skill, skillIndex) => {
                    const colorScheme = SKILL_COLORS[skillIndex % SKILL_COLORS.length];
                    const hasSkill = lesson.roadmapSkills?.includes(skill);
                    const isMastered = masteredSkills.includes(skill);

                    return (
                      <td
                        key={skill}
                        className={`px-2 py-2 ${
                          isSelected ? 'bg-gray-300' : colorScheme.bg
                        } text-center`}
                      >
                      {hasSkill && (
                        <div className="flex items-center justify-center gap-1">
                          <div className={`w-3 h-3 rounded-full ${colorScheme.dot}`}></div>
                          {masteredSkills.length > 0 && isMastered && (
                            <CheckCircleIcon className="w-3 h-3 text-green-600" title="Mastered" />
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-gray-600">
        Showing {allTargetSkills.length} target skill{allTargetSkills.length !== 1 ? 's' : ''} across {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
