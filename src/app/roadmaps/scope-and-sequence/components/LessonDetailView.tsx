"use client";

import { useState, useEffect } from "react";
import { fetchRoadmapsSkillsByNumbers } from "@/app/actions/313/roadmaps-skills";
import { RoadmapsSkill } from "@zod-schema/313/roadmap-skill";

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
}

export function LessonDetailView({ lesson }: LessonDetailViewProps) {
  const [roadmapSkillsData, setRoadmapSkillsData] = useState<RoadmapsSkill[]>([]);
  const [targetSkillsData, setTargetSkillsData] = useState<RoadmapsSkill[]>([]);
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
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center p-8">
          <div className="text-gray-400 text-lg mb-2">📚</div>
          <div className="text-gray-600 font-medium mb-1">No Lesson Selected</div>
          <div className="text-gray-500 text-sm">Select a grade, unit, and lesson to view details</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header Card - Lesson Title */}
      <div className="border-b border-gray-200 p-6 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {lesson.lessonName} - Lesson {lesson.lessonNumber}
        </h2>

        {/* Basic Info */}
        <div className="space-y-2">
          {/* <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Lesson ID:</span>
            <span className="text-sm text-blue-600 font-medium">{lesson.unitLessonId}</span>
          </div> */}
          {/* <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Unit:</span>
            <span className="text-sm text-gray-900">{lesson.unit}</span>
          </div> */}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Grade</div>
            <div className="text-lg font-bold text-gray-900">{lesson.grade}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Unit Number</div>
            <div className="text-lg font-bold text-gray-900">{lesson.unitNumber}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Lesson Number</div>
            <div className="text-lg font-bold text-gray-900">{lesson.lessonNumber}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Section</div>
            <div className="text-lg font-bold text-purple-600">
              {lesson.section || "-"}
            </div>
          </div>
        </div>

        {/* Tag Section */}
        {lesson.scopeSequenceTag && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Scope & Sequence Tag</h3>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {lesson.scopeSequenceTag}
            </span>
          </div>
        )}

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
                  <div className="space-y-3">
                    {roadmapSkillsData.map((skill, idx) => (
                      <div key={skill.skillNumber} className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                        <div className="font-medium text-gray-900 mb-1">
                          {idx + 1}. {skill.title} ({skill.skillNumber})
                        </div>
                        {skill.description && (
                          <div className="text-sm text-gray-600 mt-2">
                            {skill.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {lesson.roadmapSkills?.map((skillNumber) => (
                      <span
                        key={skillNumber}
                        className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-md text-sm font-medium"
                      >
                        {skillNumber}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {/* Target Skills */}
            {(lesson.targetSkills && lesson.targetSkills.length > 0) || targetSkillsData.length > 0 ? (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Target Skills ({lesson.targetSkills?.length || 0})
                </h3>
                {targetSkillsData.length > 0 ? (
                  <div className="space-y-3">
                    {targetSkillsData.map((skill, idx) => (
                      <div key={skill.skillNumber} className="border border-green-200 rounded-lg p-3 bg-green-50">
                        <div className="font-medium text-gray-900 mb-1">
                          {idx + 1}. {skill.title} ({skill.skillNumber})
                        </div>
                        {skill.description && (
                          <div className="text-sm text-gray-600 mt-2">
                            {skill.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {lesson.targetSkills?.map((skillNumber) => (
                      <span
                        key={skillNumber}
                        className="bg-green-100 text-green-800 px-3 py-1.5 rounded-md text-sm font-medium"
                      >
                        {skillNumber}
                      </span>
                    ))}
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
