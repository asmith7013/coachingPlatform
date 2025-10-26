"use client";

import { useState, useEffect } from "react";
import { RoadmapUnit } from "@zod-schema/313/roadmap-unit";
import { RoadmapsSkill } from "@zod-schema/313/roadmap-skill";
import { fetchRoadmapsSkillsByNumbers } from "@/app/actions/313/roadmaps-skills";

interface UnitDetailViewProps {
  unit: RoadmapUnit | null;
}

export function UnitDetailView({ unit }: UnitDetailViewProps) {
  const [targetSkills, setTargetSkills] = useState<RoadmapsSkill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  // Fetch target skills when unit changes
  useEffect(() => {
    if (!unit || !unit.targetSkills || unit.targetSkills.length === 0) {
      setTargetSkills([]);
      return;
    }

    const fetchSkills = async () => {
      setLoadingSkills(true);
      try {
        const result = await fetchRoadmapsSkillsByNumbers(unit.targetSkills);
        if (result.success && result.data) {
          setTargetSkills(result.data);
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchSkills();
  }, [unit]);

  // Empty state
  if (!unit) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center p-8">
          <div className="text-gray-400 text-lg mb-2">📚</div>
          <div className="text-gray-600 font-medium mb-1">No Unit Selected</div>
          <div className="text-gray-500 text-sm">Select a grade and unit to view details</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header Card - Unit Title + Stats */}
      <div className="border-b border-gray-200 p-6 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {unit.unitTitle}
        </h2>

        {/* Stats Summary for this Unit */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-2xl font-bold text-blue-600">{unit.targetCount}</div>
            <div className="text-xs text-gray-500">Target Skills</div>
          </div>
          <div className="text-center bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-2xl font-bold text-green-600">{unit.supportCount}</div>
            <div className="text-xs text-gray-500">Support Skills</div>
          </div>
          <div className="text-center bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-2xl font-bold text-purple-600">{unit.extensionCount}</div>
            <div className="text-xs text-gray-500">Extension Skills</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Target Skills Section */}
        {loadingSkills ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading target skills...</span>
          </div>
        ) : targetSkills.length > 0 ? (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Target Skills ({targetSkills.length})
            </h3>
            <div className="space-y-3">
              {targetSkills.map((skill, idx) => (
                <div key={skill.skillNumber} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  {/* Skill Title */}
                  <div className="font-medium text-gray-900 mb-2">
                    {idx + 1}. {skill.title} ({skill.skillNumber})
                  </div>

                  {/* Essential and Helpful Skills in compact format */}
                  <div className="space-y-1">
                    {/* Essential Skills */}
                    {skill.essentialSkills && skill.essentialSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-xs font-medium text-gray-600 mr-1">Essential:</span>
                        {skill.essentialSkills.map((s) => (
                          <span
                            key={s.skillNumber}
                            className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium"
                          >
                            {s.title} ({s.skillNumber})
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Helpful Skills */}
                    {skill.helpfulSkills && skill.helpfulSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-xs font-medium text-gray-600 mr-1">Helpful:</span>
                        {skill.helpfulSkills.map((s) => (
                          <span
                            key={s.skillNumber}
                            className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium"
                          >
                            {s.title} ({s.skillNumber})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Additional Support Skills Section - just show skill numbers */}
        {unit.additionalSupportSkills && unit.additionalSupportSkills.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Additional Support Skills ({unit.additionalSupportSkills.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {unit.additionalSupportSkills.map((skillNumber) => (
                <span
                  key={skillNumber}
                  className="bg-green-100 text-green-800 px-3 py-1.5 rounded-md text-sm font-medium"
                >
                  {skillNumber}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Extension Skills Section - just show skill numbers */}
        {unit.extensionSkills && unit.extensionSkills.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Extension Skills ({unit.extensionSkills.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {unit.extensionSkills.map((skillNumber) => (
                <span
                  key={skillNumber}
                  className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-md text-sm font-medium"
                >
                  {skillNumber}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
