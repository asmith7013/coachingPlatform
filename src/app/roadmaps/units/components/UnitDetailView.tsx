"use client";

import { RoadmapUnit } from "@zod-schema/313/roadmap-unit";
import { Student } from "@zod-schema/313/student";
import { SkillListWithProgress } from "../../components/SkillListWithProgress";

interface UnitDetailViewProps {
  unit: RoadmapUnit | null;
  selectedSection: string;
  onSkillClick?: (skillNumber: string, color: 'blue' | 'green' | 'orange' | 'purple') => void;
  selectedStudents?: Student[];
}

export function UnitDetailView({ unit, selectedSection, onSkillClick, selectedStudents = [] }: UnitDetailViewProps) {
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
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-600 text-white font-semibold text-sm flex-shrink-0 whitespace-nowrap">
            Unit {unit.unitNumber}
          </span>
          <h2 className="text-2xl font-bold text-gray-900 min-w-0">
            {unit.unitTitle.replace(/^\d+\s*-\s*/, '')}
          </h2>
        </div>

        {/* Stats Summary for this Unit */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-2xl font-bold text-skill-target">{unit.targetCount}</div>
            <div className="text-xs text-gray-500">Target Skills</div>
          </div>
          <div className="text-center bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-2xl font-bold text-skill-support">{unit.supportCount}</div>
            <div className="text-xs text-gray-500">Support Skills</div>
          </div>
          <div className="text-center bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-2xl font-bold text-skill-helpful">{unit.extensionCount}</div>
            <div className="text-xs text-gray-500">Extension Skills</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Target Skills Section */}
        {unit.targetSkills && unit.targetSkills.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Target Skills ({unit.targetSkills.length})
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

        {/* Additional Support Skills Section */}
        {unit.additionalSupportSkills && unit.additionalSupportSkills.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Additional Support Skills ({unit.additionalSupportSkills.length})
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
