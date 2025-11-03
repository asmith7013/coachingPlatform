"use client";

import { RoadmapUnit } from "@zod-schema/313/roadmap-unit";
import { RoadmapsSkill } from "@zod-schema/313/roadmap-skill";
import { Student } from "@zod-schema/313/student";
import { SkillBadge } from "./SkillBadge";

interface OverviewTableProps {
  units: RoadmapUnit[];
  skills: RoadmapsSkill[];
  supportSkillsByGrade: Record<string, Array<{ skill: string; units: number[] }>>;
  selectedStudent: Student | null;
  selectedStudents: Student[];
  selectedSection: string;
}

export function OverviewTable({
  units,
  skills,
  supportSkillsByGrade,
  selectedStudent,
  selectedStudents,
  selectedSection
}: OverviewTableProps) {
  // Helper to get skill details by skill number
  const getSkillByNumber = (skillNumber: string) => {
    return skills.find(s => s.skillNumber === skillNumber);
  };

  // Helper to calculate mastery for a unit
  const calculateUnitMastery = (unit: RoadmapUnit): { mastered: number; total: number } | null => {
    if (!selectedStudent || selectedStudents.length !== 1) return null;

    const mastered = unit.targetSkills.filter(skillNum =>
      selectedStudent.masteredSkills?.includes(skillNum)
    ).length;

    return { mastered, total: unit.targetSkills.length };
  };

  // Helper to calculate class summary for a skill
  const calculateClassSummary = (skillNumber: string) => {
    if (!selectedStudents || selectedStudents.length === 0) {
      return { demonstrated: 0, attempted: 0, notStarted: 0 };
    }

    const demonstrated = selectedStudents.filter(student =>
      student.masteredSkills?.includes(skillNumber)
    ).length;

    // For now, we'll use placeholder logic for attempted/not started
    // You may need to add more detailed tracking in the Student schema
    const notStarted = selectedStudents.length - demonstrated;

    return { demonstrated, attempted: 0, notStarted };
  };

  // Extract unique standards from units and trim to just the code before the colon
  const getStandardsForSkill = (skillNumber: string): string => {
    const skill = getSkillByNumber(skillNumber);
    const standards = skill?.standards || "";

    // Match standard codes like NY.8.EE.8c, NY.A1.REI.3, etc.
    // Pattern: NY. followed by alphanumeric, then period, then alphanumeric (can repeat with more periods)
    const standardCodeRegex = /NY\.[A-Za-z0-9]+\.[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*/g;

    const matches = standards.match(standardCodeRegex);

    if (matches && matches.length > 0) {
      // Remove duplicates and join with commas
      const uniqueStandards = Array.from(new Set(matches));
      return uniqueStandards.join(', ');
    }

    return "";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 border-b-2 border-gray-300">
            <th className="px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-300">Unit</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-300">Skill Name</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-300">Skill Code</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-300">Skill Grade</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-300">Essential Skills</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-300">Helpful Skills</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-300">Standard(s)</th>
            <th colSpan={3} className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-300">Class Summary</th>
            {selectedSection && selectedStudents.length > 0 && (
              <>
                {selectedStudents.map(student => (
                  <th key={student._id} className="px-2 py-3 text-center font-semibold text-gray-700 border-r border-gray-300 text-xs rotate-0 whitespace-nowrap">
                    <div className="transform -rotate-45 origin-center">{student.firstName.charAt(0)}. {student.lastName}</div>
                  </th>
                ))}
              </>
            )}
          </tr>
          <tr className="bg-gray-50 border-b border-gray-300">
            <th colSpan={7} className="border-r border-gray-300"></th>
            <th className="px-2 py-2 text-center text-xs font-medium text-gray-600 border-r border-gray-300">Demonstrated</th>
            <th className="px-2 py-2 text-center text-xs font-medium text-gray-600 border-r border-gray-300">Attempted But Not Passed</th>
            <th className="px-2 py-2 text-center text-xs font-medium text-gray-600 border-r border-gray-300">Not Started</th>
            {selectedSection && selectedStudents.length > 0 && (
              <>
                {selectedStudents.map(student => (
                  <th key={student._id} className="border-r border-gray-300"></th>
                ))}
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {/* Target Skills Section Header */}
          <tr className="bg-blue-600">
            <td colSpan={7 + (selectedSection && selectedStudents.length > 0 ? selectedStudents.length + 3 : 3)} className="px-4 py-2 font-bold text-white">
              Target Skills
            </td>
          </tr>

          {/* Iterate through each unit */}
          {units.map(unit => {
            const unitMastery = calculateUnitMastery(unit);

            return (
              <React.Fragment key={unit._id}>
                {/* Unit Header Row */}
                <tr className="bg-cyan-400">
                  <td colSpan={7 + (selectedSection && selectedStudents.length > 0 ? selectedStudents.length + 3 : 3)} className="px-4 py-2 font-bold text-white">
                    {unit.unitTitle}
                    {unitMastery && ` (${unitMastery.mastered}/${unitMastery.total})`}
                  </td>
                </tr>

                {/* Target Skills for this unit */}
                {unit.targetSkills.map(skillNumber => {
                  const skill = getSkillByNumber(skillNumber);
                  const classSummary = calculateClassSummary(skillNumber);

                  return (
                    <tr key={skillNumber} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-2 border-r border-gray-200">{unit.unitTitle}</td>
                      <td className="px-4 py-2 border-r border-gray-200">{skill?.title || skillNumber}</td>
                      <td className="px-4 py-2 border-r border-gray-200 text-center">{skillNumber}</td>
                      <td className="px-4 py-2 border-r border-gray-200 text-center">{skill?.grade || unit.grade.replace('Illustrative Math New York - ', '')}</td>
                      <td className="px-4 py-2 border-r border-gray-200">
                        {/* Essential Skills Badges */}
                        {skill?.essentialSkills && skill.essentialSkills.length > 0 ? (
                          <div className="flex flex-wrap">
                            {skill.essentialSkills.map(essentialSkill => (
                              <SkillBadge
                                key={essentialSkill.skillNumber}
                                skillNumber={essentialSkill.skillNumber}
                                skillName={essentialSkill.title}
                                selectedStudent={selectedStudent}
                                selectedStudents={selectedStudents}
                                selectedSection={selectedSection}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2 border-r border-gray-200">
                        {/* Helpful Skills Badges */}
                        {skill?.helpfulSkills && skill.helpfulSkills.length > 0 ? (
                          <div className="flex flex-wrap">
                            {skill.helpfulSkills.map(helpfulSkill => (
                              <SkillBadge
                                key={helpfulSkill.skillNumber}
                                skillNumber={helpfulSkill.skillNumber}
                                skillName={helpfulSkill.title}
                                selectedStudent={selectedStudent}
                                selectedStudents={selectedStudents}
                                selectedSection={selectedSection}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2 border-r border-gray-200 text-xs">{getStandardsForSkill(skillNumber)}</td>
                      <td className="px-4 py-2 border-r border-gray-200 text-center">{classSummary.demonstrated}</td>
                      <td className="px-4 py-2 border-r border-gray-200 text-center">{classSummary.attempted}</td>
                      <td className="px-4 py-2 border-r border-gray-200 text-center">{classSummary.notStarted}</td>
                      {selectedSection && selectedStudents.length > 0 && (
                        <>
                          {selectedStudents.map(student => {
                            const isMastered = student.masteredSkills?.includes(skillNumber);
                            return (
                              <td key={student._id} className="px-2 py-2 border-r border-gray-200 text-center">
                                {isMastered && (
                                  <span className="inline-block px-2 py-1 bg-green-600 text-white text-xs font-medium rounded">PO</span>
                                )}
                              </td>
                            );
                          })}
                        </>
                      )}
                    </tr>
                  );
                })}
              </React.Fragment>
            );
          })}

          {/* Support Skills Section Header */}
          <tr className="bg-blue-600">
            <td colSpan={7 + (selectedSection && selectedStudents.length > 0 ? selectedStudents.length + 3 : 3)} className="px-4 py-2 font-bold text-white">
              Support Skills
            </td>
          </tr>

          {/* Support Skills grouped by grade band */}
          {Object.entries(supportSkillsByGrade).map(([gradeBand, skillsList]) => (
            <React.Fragment key={gradeBand}>
              <tr className="bg-cyan-400">
                <td colSpan={7 + (selectedSection && selectedStudents.length > 0 ? selectedStudents.length + 3 : 3)} className="px-4 py-2 font-bold text-white">
                  {gradeBand}
                </td>
              </tr>
              {skillsList.map(({ skill: skillNumber, units: unitNumbers }) => {
                const skill = getSkillByNumber(skillNumber);
                const classSummary = calculateClassSummary(skillNumber);
                const unitsList = unitNumbers.map(n => `Unit ${String(n).padStart(2, '0')}`).join(', ');

                return (
                  <tr key={skillNumber} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-2 border-r border-gray-200 text-xs">{unitsList}</td>
                    <td className="px-4 py-2 border-r border-gray-200">{skill?.title || skillNumber}</td>
                    <td className="px-4 py-2 border-r border-gray-200 text-center">{skillNumber}</td>
                    <td className="px-4 py-2 border-r border-gray-200 text-center">{skill?.grade || gradeBand}</td>
                    <td className="px-4 py-2 border-r border-gray-200">
                      {/* Essential Skills Badges for support skills */}
                      {skill?.essentialSkills && skill.essentialSkills.length > 0 ? (
                        <div className="flex flex-wrap">
                          {skill.essentialSkills.map(essentialSkill => (
                            <SkillBadge
                              key={essentialSkill.skillNumber}
                              skillNumber={essentialSkill.skillNumber}
                              skillName={essentialSkill.title}
                              selectedStudent={selectedStudent}
                              selectedStudents={selectedStudents}
                              selectedSection={selectedSection}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-200">
                      {/* Helpful Skills Badges for support skills */}
                      {skill?.helpfulSkills && skill.helpfulSkills.length > 0 ? (
                        <div className="flex flex-wrap">
                          {skill.helpfulSkills.map(helpfulSkill => (
                            <SkillBadge
                              key={helpfulSkill.skillNumber}
                              skillNumber={helpfulSkill.skillNumber}
                              skillName={helpfulSkill.title}
                              selectedStudent={selectedStudent}
                              selectedStudents={selectedStudents}
                              selectedSection={selectedSection}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-200 text-xs">{getStandardsForSkill(skillNumber)}</td>
                    <td className="px-4 py-2 border-r border-gray-200 text-center">{classSummary.demonstrated}</td>
                    <td className="px-4 py-2 border-r border-gray-200 text-center">{classSummary.attempted}</td>
                    <td className="px-4 py-2 border-r border-gray-200 text-center">{classSummary.notStarted}</td>
                    {selectedSection && selectedStudents.length > 0 && (
                      <>
                        {selectedStudents.map(student => {
                          const isMastered = student.masteredSkills?.includes(skillNumber);
                          return (
                            <td key={student._id} className="px-2 py-2 border-r border-gray-200 text-center">
                              {isMastered && (
                                <span className="inline-block px-2 py-1 bg-green-600 text-white text-xs font-medium rounded">PO</span>
                              )}
                            </td>
                          );
                        })}
                      </>
                    )}
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Need to import React for Fragment
import React from 'react';
