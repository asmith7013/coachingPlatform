"use client";

import { useState, useEffect } from "react";
import { RoadmapUnit } from "@zod-schema/313/roadmap-unit";
import { Student } from "@zod-schema/313/student";
import { SkillListWithProgress } from "../../components/SkillListWithProgress";
import { fetchRoadmapsSkillsByNumbers } from "@/app/actions/313/roadmaps-skills";

interface UnitDetailViewProps {
  unit: RoadmapUnit | null;
  selectedSection: string;
  onSkillClick?: (skillNumber: string, color: 'blue' | 'green' | 'orange' | 'purple') => void;
  selectedStudents?: Student[];
}

// Calculate mastery for a single student
function calculateStudentMastery(student: Student | undefined, skillNumbers: string[]): { mastered: number; total: number } {
  if (!student || !skillNumbers || skillNumbers.length === 0) {
    return { mastered: 0, total: skillNumbers?.length || 0 };
  }

  const masteredSkills = student.masteredSkills || [];
  const masteredCount = skillNumbers.filter(skill => masteredSkills.includes(skill)).length;

  return { mastered: masteredCount, total: skillNumbers.length };
}

export function UnitDetailView({ unit, selectedSection, onSkillClick, selectedStudents = [] }: UnitDetailViewProps) {
  const [essentialSkillsFromTargets, setEssentialSkillsFromTargets] = useState<string[]>([]);
  const [helpfulSkillsFromTargets, setHelpfulSkillsFromTargets] = useState<string[]>([]);
  const [isLoadingPrerequisites, setIsLoadingPrerequisites] = useState(false);

  // Fetch essential and helpful skills from all target skills
  useEffect(() => {
    if (!unit || !unit.targetSkills || unit.targetSkills.length === 0) {
      setEssentialSkillsFromTargets([]);
      setHelpfulSkillsFromTargets([]);
      return;
    }

    const loadPrerequisiteSkills = async () => {
      setIsLoadingPrerequisites(true);
      try {
        const result = await fetchRoadmapsSkillsByNumbers(unit.targetSkills);
        if (result.success && result.data) {
          // Aggregate all essential skills from target skills
          const allEssentialSkills = new Set<string>();
          const allHelpfulSkills = new Set<string>();

          result.data.forEach(skill => {
            if (skill.essentialSkills) {
              skill.essentialSkills.forEach((essential: { skillNumber: string }) => {
                allEssentialSkills.add(essential.skillNumber);
              });
            }
            if (skill.helpfulSkills) {
              skill.helpfulSkills.forEach((helpful: { skillNumber: string }) => {
                allHelpfulSkills.add(helpful.skillNumber);
              });
            }
          });

          setEssentialSkillsFromTargets(Array.from(allEssentialSkills));
          setHelpfulSkillsFromTargets(Array.from(allHelpfulSkills));
        }
      } catch (error) {
        console.error('Error fetching prerequisite skills:', error);
        setEssentialSkillsFromTargets([]);
        setHelpfulSkillsFromTargets([]);
      } finally {
        setIsLoadingPrerequisites(false);
      }
    };

    loadPrerequisiteSkills();
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

  // Determine if we're showing a single student's mastery
  const singleStudent = selectedStudents.length === 1 ? selectedStudents[0] : undefined;

  // Calculate mastery for each category if single student
  const targetMastery = singleStudent ? calculateStudentMastery(singleStudent, unit.targetSkills) : null;

  // Essential Skills: Use aggregated essential skills from all target skills
  const essentialMastery = singleStudent
    ? calculateStudentMastery(singleStudent, essentialSkillsFromTargets)
    : null;

  // Helpful Skills: Use aggregated helpful skills from all target skills
  const helpfulMastery = singleStudent
    ? calculateStudentMastery(singleStudent, helpfulSkillsFromTargets)
    : null;

  // Support Skills: Use unit.additionalSupportSkills (if exists and not empty)
  const hasSupportSkills = unit.additionalSupportSkills && unit.additionalSupportSkills.length > 0;
  const supportMastery = singleStudent && hasSupportSkills
    ? calculateStudentMastery(singleStudent, unit.additionalSupportSkills)
    : null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header Card - Unit Title + Stats */}
      <div className="border-b border-gray-200 p-6 bg-gray-50">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-600 text-white font-semibold text-sm flex-shrink-0 whitespace-nowrap">
            Unit {unit.unitNumber}
          </span>
          <h2 className="text-2xl font-bold text-gray-900 min-w-0">
            {unit.unitTitle.replace(/^\d+\s*-\s*/, '')}
          </h2>
        </div>

        {/* Stats Summary for this Unit */}
        <div className={`grid gap-4 ${hasSupportSkills ? 'grid-cols-4' : 'grid-cols-3'}`}>
          {/* Target Skills */}
          <div className="text-center bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-2xl font-bold text-skill-target">
              {targetMastery ? `${targetMastery.mastered}/${targetMastery.total}` : unit.targetCount}
            </div>
            <div className="text-xs text-gray-500">Target Skills</div>
          </div>

          {/* Essential Skills */}
          <div className="text-center bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-2xl font-bold text-skill-essential">
              {isLoadingPrerequisites ? (
                <span className="text-sm text-gray-400">...</span>
              ) : essentialMastery ? (
                `${essentialMastery.mastered}/${essentialMastery.total}`
              ) : (
                essentialSkillsFromTargets.length
              )}
            </div>
            <div className="text-xs text-gray-500">Essential Skills</div>
          </div>

          {/* Helpful Skills */}
          <div className="text-center bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-2xl font-bold text-skill-helpful">
              {isLoadingPrerequisites ? (
                <span className="text-sm text-gray-400">...</span>
              ) : helpfulMastery ? (
                `${helpfulMastery.mastered}/${helpfulMastery.total}`
              ) : (
                helpfulSkillsFromTargets.length
              )}
            </div>
            <div className="text-xs text-gray-500">Helpful Skills</div>
          </div>

          {/* Support Skills (if applicable) */}
          {hasSupportSkills && (
            <div className="text-center bg-white rounded-lg border border-gray-200 p-3">
              <div className="text-2xl font-bold text-skill-support">
                {supportMastery ? `${supportMastery.mastered}/${supportMastery.total}` : unit.additionalSupportSkills.length}
              </div>
              <div className="text-xs text-gray-500">Support Skills</div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Target Skills Section */}
        {unit.targetSkills && unit.targetSkills.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Target Skills ({singleStudent ? `${targetMastery?.mastered}/${targetMastery?.total}` : unit.targetSkills.length})
            </h3>
            <SkillListWithProgress
              skillNumbers={unit.targetSkills}
              selectedSection={selectedSection}
              onSkillClick={onSkillClick}
              skillType="target"
              showPrerequisites={true}
              selectedStudents={selectedStudents}
            />
          </div>
        )}

        {/* Support Skills Section - Displayed as individual skills in unit */}
        {unit.additionalSupportSkills && unit.additionalSupportSkills.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Support Skills ({singleStudent && supportMastery ? `${supportMastery.mastered}/${supportMastery.total}` : unit.additionalSupportSkills.length})
            </h3>
            <SkillListWithProgress
              skillNumbers={unit.additionalSupportSkills}
              selectedSection={selectedSection}
              onSkillClick={onSkillClick}
              skillType="support"
              showPrerequisites={false}
              selectedStudents={selectedStudents}
            />
          </div>
        )}

        {/* Helpful Skills Section - Note: These are shown nested under Target Skills above */}
        {/* The count in the stats represents aggregated helpful prerequisites from all target skills */}

        {/* Support Skills Section (if applicable) */}
        {/* Currently no separate support skills in schema - placeholder for future use */}
      </div>
    </div>
  );
}
