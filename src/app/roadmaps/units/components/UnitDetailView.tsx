"use client";

import { useState, useEffect } from "react";
import { RoadmapUnit } from "@zod-schema/313/roadmap-unit";
import { RoadmapsSkill } from "@zod-schema/313/roadmap-skill";
import { Student } from "@zod-schema/313/student";
import { fetchRoadmapsSkillsByNumbers } from "@/app/actions/313/roadmaps-skills";
import { fetchStudentsBySection } from "@/app/actions/313/students";

interface UnitDetailViewProps {
  unit: RoadmapUnit | null;
  selectedSection: string;
  onSkillClick?: (skillNumber: string, color: 'blue' | 'green' | 'orange' | 'purple') => void;
}

export function UnitDetailView({ unit, selectedSection, onSkillClick }: UnitDetailViewProps) {
  const [targetSkills, setTargetSkills] = useState<RoadmapsSkill[]>([]);
  const [additionalSupportSkills, setAdditionalSupportSkills] = useState<RoadmapsSkill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [sectionStudents, setSectionStudents] = useState<Student[]>([]);

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

  // Fetch additional support skills when unit changes
  useEffect(() => {
    if (!unit || !unit.additionalSupportSkills || unit.additionalSupportSkills.length === 0) {
      setAdditionalSupportSkills([]);
      return;
    }

    const fetchSkills = async () => {
      try {
        const result = await fetchRoadmapsSkillsByNumbers(unit.additionalSupportSkills);
        if (result.success && result.data) {
          setAdditionalSupportSkills(result.data);
        }
      } catch (error) {
        console.error('Error fetching additional support skills:', error);
      }
    };

    fetchSkills();
  }, [unit]);

  // Fetch section students when selectedSection changes
  useEffect(() => {
    if (!selectedSection) {
      setSectionStudents([]);
      return;
    }

    const fetchSectionData = async () => {
      try {
        console.log('[UnitDetailView] Fetching section students for:', selectedSection);
        const result = await fetchStudentsBySection(selectedSection);
        console.log('[UnitDetailView] Section students result:', result);
        if (result.success && result.items) {
          setSectionStudents(result.items as Student[]);
          console.log('[UnitDetailView] Section students count:', result.items.length);
        }
      } catch (error) {
        console.error('Error fetching section students:', error);
      }
    };

    fetchSectionData();
  }, [selectedSection]);

  // Calculate mastery percentage for a skill
  const calculateMasteryPercentage = (skillNumber: string): number => {
    if (sectionStudents.length === 0) return 0;
    const masteredCount = sectionStudents.filter(s =>
      s.masteredSkills?.includes(skillNumber)
    ).length;
    const percentage = Math.round((masteredCount / sectionStudents.length) * 100);
    console.log(`[UnitDetailView] Skill ${skillNumber}: ${masteredCount}/${sectionStudents.length} = ${percentage}%`);
    return percentage;
  };

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
              {targetSkills.map((skill, idx) => {
                const masteryPercentage = sectionStudents.length > 0 ? calculateMasteryPercentage(skill.skillNumber) : null;

                return (
                  <div key={skill.skillNumber} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    {/* Skill Title with Progress Bar */}
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-600 text-white font-bold text-sm flex-shrink-0">
                          {skill.skillNumber}
                        </div>
                        <div className="font-medium text-gray-900">
                          {skill.title}
                        </div>
                      </div>
                      {masteryPercentage !== null && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${masteryPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600 w-10 text-right">
                            {masteryPercentage}%
                          </span>
                        </div>
                      )}
                    </div>

                  {/* Essential and Helpful Skills */}
                  <div className="space-y-2">
                    {/* Essential Skills */}
                    {skill.essentialSkills && skill.essentialSkills.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-1">Essential:</div>
                        <div className="space-y-1">
                          {skill.essentialSkills.map((s) => {
                            const essentialMastery = sectionStudents.length > 0 ? calculateMasteryPercentage(s.skillNumber) : null;
                            return (
                              <div key={s.skillNumber} className="flex items-center justify-between bg-orange-50 border border-orange-200 px-2 py-1.5 rounded gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 text-white font-bold text-xs flex-shrink-0">
                                    {s.skillNumber}
                                  </div>
                                  <span className="text-gray-900 text-xs font-medium">
                                    {s.title}
                                  </span>
                                </div>
                                {essentialMastery !== null && (
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-orange-500 h-2 rounded-full transition-all"
                                        style={{ width: `${essentialMastery}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-medium text-gray-700 w-10 text-right">
                                      {essentialMastery}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Helpful Skills */}
                    {skill.helpfulSkills && skill.helpfulSkills.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-1">Helpful:</div>
                        <div className="space-y-1">
                          {skill.helpfulSkills.map((s) => {
                            const helpfulMastery = sectionStudents.length > 0 ? calculateMasteryPercentage(s.skillNumber) : null;
                            return (
                              <div key={s.skillNumber} className="flex items-center justify-between bg-purple-50 border border-purple-200 px-2 py-1.5 rounded gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500 text-white font-bold text-xs flex-shrink-0">
                                    {s.skillNumber}
                                  </div>
                                  <span className="text-gray-900 text-xs font-medium">
                                    {s.title}
                                  </span>
                                </div>
                                {helpfulMastery !== null && (
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-purple-500 h-2 rounded-full transition-all"
                                        style={{ width: `${helpfulMastery}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-medium text-gray-700 w-10 text-right">
                                      {helpfulMastery}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        ) : null}

        {/* Additional Support Skills Section */}
        {additionalSupportSkills.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Additional Support Skills ({additionalSupportSkills.length})
            </h3>
            <div className="space-y-1">
              {additionalSupportSkills.map((skill) => {
                const supportMastery = sectionStudents.length > 0 ? calculateMasteryPercentage(skill.skillNumber) : null;
                return (
                  <div key={skill.skillNumber} className="flex items-center justify-between bg-blue-50 border border-blue-200 px-2 py-1.5 rounded gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-bold text-xs flex-shrink-0">
                        {skill.skillNumber}
                      </div>
                      <span className="text-gray-900 text-xs font-medium">
                        {skill.title}
                      </span>
                    </div>
                    {supportMastery !== null && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${supportMastery}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700 w-10 text-right">
                          {supportMastery}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
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
