"use client";

import { useState, useEffect } from "react";
import { RoadmapUnit } from "@zod-schema/scm/roadmaps/roadmap-unit";
import { Student } from "@zod-schema/scm/student/student";
import { RoadmapsSkill } from "@zod-schema/scm/roadmaps/roadmap-skill";
import { fetchRoadmapsSkillsByNumbers } from "@/app/actions/scm/roadmaps/roadmaps-skills";
import { fetchStudents } from "@/app/actions/scm/student/students";
import { SkillProgressBar } from "./SkillProgressBar";
import React from "react";
import { BookOpenIcon } from "@heroicons/react/24/outline";

interface AllUnitsGridViewProps {
  units: RoadmapUnit[];
  selectedSection: string;
  selectedGrade?: string;
}

interface GroupedSupportSkill {
  skill: RoadmapsSkill;
  gradeLevel: number;
}

export function AllUnitsGridView({
  units,
  selectedSection,
  selectedGrade,
}: AllUnitsGridViewProps) {
  const [unitSkillsMap, setUnitSkillsMap] = useState<
    Map<string, RoadmapsSkill[]>
  >(new Map());
  const [supportSkills, setSupportSkills] = useState<GroupedSupportSkill[]>([]);
  const [sectionStudents, setSectionStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all students in the selected section
  useEffect(() => {
    if (!selectedSection) {
      setSectionStudents([]);
      return;
    }

    const loadSectionStudents = async () => {
      try {
        const result = await fetchStudents({
          page: 1,
          limit: 1000,
          sortBy: "lastName",
          sortOrder: "asc",
          filters: { active: true, section: selectedSection },
          search: "",
          searchFields: [],
        });

        if (result.success && result.items) {
          setSectionStudents(result.items as Student[]);
        }
      } catch (error) {
        console.error("Error loading section students:", error);
      }
    };

    loadSectionStudents();
  }, [selectedSection]);

  // Fetch all target skills for all units
  useEffect(() => {
    if (!units || units.length === 0) {
      setUnitSkillsMap(new Map());
      return;
    }

    const loadAllSkills = async () => {
      setLoading(true);
      try {
        const skillsMap = new Map<string, RoadmapsSkill[]>();

        for (const unit of units) {
          if (unit.targetSkills && unit.targetSkills.length > 0) {
            const result = await fetchRoadmapsSkillsByNumbers(
              unit.targetSkills,
            );
            if (result.success && result.data) {
              skillsMap.set(unit._id, result.data as RoadmapsSkill[]);
            }
          }
        }

        setUnitSkillsMap(skillsMap);
      } catch (error) {
        console.error("Error loading skills:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAllSkills();
  }, [units]);

  // Collect and organize support skills
  useEffect(() => {
    if (!units || units.length === 0 || unitSkillsMap.size === 0) {
      setSupportSkills([]);
      return;
    }

    const loadSupportSkills = async () => {
      try {
        const supportSkillNumbers = new Set<string>();
        const targetSkillNumbers = new Set<string>();

        // Collect all target skill numbers
        units.forEach((unit) => {
          if (unit.targetSkills) {
            unit.targetSkills.forEach((num) => targetSkillNumbers.add(num));
          }
        });

        // Collect all support skills from various sources
        units.forEach((unit) => {
          // Add additionalSupportSkills
          if (unit.additionalSupportSkills) {
            unit.additionalSupportSkills.forEach((num) =>
              supportSkillNumbers.add(num),
            );
          }

          // Add essential and helpful skills from target skills
          const targetSkills = unitSkillsMap.get(unit._id) || [];
          targetSkills.forEach((skill) => {
            if (skill.essentialSkills) {
              skill.essentialSkills.forEach((es) =>
                supportSkillNumbers.add(es.skillNumber),
              );
            }
            if (skill.helpfulSkills) {
              skill.helpfulSkills.forEach((hs) =>
                supportSkillNumbers.add(hs.skillNumber),
              );
            }
          });
        });

        // Remove any skills that are already target skills
        targetSkillNumbers.forEach((num) => supportSkillNumbers.delete(num));

        // Fetch all support skills
        if (supportSkillNumbers.size > 0) {
          const result = await fetchRoadmapsSkillsByNumbers(
            Array.from(supportSkillNumbers),
          );
          if (result.success && result.data) {
            const skills = result.data as RoadmapsSkill[];

            // Parse grade level and create grouped skills
            const grouped: GroupedSupportSkill[] = skills.map((skill) => ({
              skill,
              gradeLevel: parseGradeLevel(skill.standards),
            }));

            // Sort by grade level (highest first)
            grouped.sort((a, b) => b.gradeLevel - a.gradeLevel);

            setSupportSkills(grouped);
          }
        }
      } catch (error) {
        console.error("Error loading support skills:", error);
      }
    };

    loadSupportSkills();
  }, [units, unitSkillsMap]);

  // Helper to parse grade level from standards string (e.g., "NY.7.SP.8a: Description..." -> 7)
  const parseGradeLevel = (standards: string): number => {
    if (!standards) return 999;
    const match = standards.match(/NY\.(\d+)/);
    return match ? parseInt(match[1], 10) : 999; // Use 999 for unparseable grades (sort to end)
  };

  // Helper to check if student has mastered a skill
  const hasMastered = (student: Student, skillNumber: string): boolean => {
    return student.masteredSkills?.includes(skillNumber) || false;
  };

  // Helper to get unit badges for a support skill in the selected grade
  const getUnitBadges = (skill: RoadmapsSkill): number[] => {
    if (!skill.appearsIn || !selectedGrade) return [];

    const unitNumbers = new Set<number>();

    // Check asEssential (skills that have this skill as essential)
    if (skill.appearsIn.asEssential) {
      skill.appearsIn.asEssential.forEach((item) => {
        item.units?.forEach((unit) => {
          if (unit.grade === selectedGrade) {
            unitNumbers.add(unit.unitNumber);
          }
        });
      });
    }

    // Check asHelpful (skills that have this skill as helpful)
    if (skill.appearsIn.asHelpful) {
      skill.appearsIn.asHelpful.forEach((item) => {
        item.units?.forEach((unit) => {
          if (unit.grade === selectedGrade) {
            unitNumbers.add(unit.unitNumber);
          }
        });
      });
    }

    // Check asSupport (units where this skill appears as additional support)
    if (skill.appearsIn.asSupport) {
      skill.appearsIn.asSupport.forEach((unit) => {
        if (unit.grade === selectedGrade) {
          unitNumbers.add(unit.unitNumber);
        }
      });
    }

    return Array.from(unitNumbers).sort((a, b) => a - b);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-gray-600">Loading all units...</div>
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
        <BookOpenIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <div className="text-gray-600">No units available</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-bold text-gray-900">
          All Units - Mastery Grid
        </h2>
        <p className="text-sm text-gray-600">
          {units.length} units - {sectionStudents.length} students
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[800px] overflow-y-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr className="bg-gray-100 border-b border-gray-300 sticky top-0 z-20">
              <th className="bg-gray-100 px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-300 w-24">
                Skill #
              </th>
              <th className="bg-gray-100 px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-300">
                Skill Name
              </th>
              <th className="bg-gray-100 px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-300 w-32">
                Units
              </th>
              {sectionStudents.map((student) => (
                <th
                  key={student._id}
                  className="bg-gray-100 px-2 py-3 text-center font-semibold text-gray-700 border-r border-gray-300 text-xs min-w-[80px]"
                >
                  <div className="break-words">
                    {student.firstName} {student.lastName}
                  </div>
                </th>
              ))}
            </tr>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="bg-gray-100 px-4 py-2 border-r border-gray-300"></th>
              <th className="bg-gray-100 px-4 py-2 border-r border-gray-300"></th>
              <th className="bg-gray-100 px-4 py-2 border-r border-gray-300"></th>
              {sectionStudents.map((student) => {
                // Collect all skill numbers across all units
                const allSkillNumbers: string[] = [];

                // Add all target skills from all units
                unitSkillsMap.forEach((skills) => {
                  skills.forEach((skill) =>
                    allSkillNumbers.push(skill.skillNumber),
                  );
                });

                // Add all support skills
                supportSkills.forEach((gs) =>
                  allSkillNumbers.push(gs.skill.skillNumber),
                );

                // Count mastered skills
                const masteredCount = allSkillNumbers.filter((skillNum) =>
                  hasMastered(student, skillNum),
                ).length;
                const totalCount = allSkillNumbers.length;

                return (
                  <th
                    key={student._id}
                    className="bg-gray-100 px-2 py-2 text-center text-xs font-semibold text-gray-700 border-r border-gray-300"
                  >
                    {masteredCount}/{totalCount}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* Render each unit's target skills */}
            {units.map((unit) => {
              const unitSkills = unitSkillsMap.get(unit._id) || [];

              return (
                <React.Fragment key={unit._id}>
                  {/* Unit Header Row */}
                  <tr className="bg-gray-200 border-t-2 border-b border-gray-400">
                    <td
                      colSpan={3}
                      className="px-4 py-2 text-left font-semibold text-gray-900 text-xs"
                    >
                      Unit {unit.unitNumber} -{" "}
                      {unit.unitTitle.replace(/^\d+\s*-\s*/, "")}
                    </td>
                    {sectionStudents.map((student) => {
                      // Count how many skills in this unit the student has mastered
                      const unitSkillNumbers = unitSkills.map(
                        (s) => s.skillNumber,
                      );
                      const masteredInUnit = unitSkillNumbers.filter(
                        (skillNum) => hasMastered(student, skillNum),
                      ).length;
                      return (
                        <td
                          key={student._id}
                          className="px-2 py-3 text-center font-semibold text-gray-700 border-r border-gray-300 text-xs"
                        >
                          {masteredInUnit}/{unitSkillNumbers.length}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Target Skills for this unit */}
                  {unitSkills.map((skill) => {
                    const masteredCount = sectionStudents.filter((student) =>
                      hasMastered(student, skill.skillNumber),
                    ).length;

                    return (
                      <tr
                        key={skill.skillNumber}
                        className="bg-purple-50 border-b border-gray-200"
                      >
                        <td className="bg-purple-50 px-4 py-2 border-r border-gray-300">
                          <SkillProgressBar
                            skillNumber={skill.skillNumber}
                            masteredCount={masteredCount}
                            totalCount={sectionStudents.length}
                            color="purple"
                          />
                        </td>
                        <td className="bg-purple-50 px-4 py-2 border-r border-gray-300 text-gray-700">
                          {skill.title}
                        </td>
                        <td className="bg-purple-50 px-4 py-2 border-r border-gray-300"></td>
                        {sectionStudents.map((student) => {
                          const isMastered = hasMastered(
                            student,
                            skill.skillNumber,
                          );
                          return (
                            <td
                              key={student._id}
                              className="px-2 py-2 border-r border-gray-300 text-center"
                            >
                              <div
                                className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center ${
                                  isMastered
                                    ? "bg-purple-600"
                                    : "border-2 border-gray-300"
                                }`}
                              >
                                {isMastered && (
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}

            {/* Support Skills Section Header */}
            {supportSkills.length > 0 && (
              <tr className="bg-gray-200 border-t-2 border-b border-gray-400">
                <td
                  colSpan={3 + sectionStudents.length}
                  className="px-4 py-3 text-left font-bold text-gray-900"
                >
                  Support Skills
                </td>
              </tr>
            )}

            {/* Support Skills Rows (sorted by grade level, highest first) */}
            {supportSkills.map(({ skill, gradeLevel }, index) => {
              const masteredCount = sectionStudents.filter((student) =>
                hasMastered(student, skill.skillNumber),
              ).length;

              // Check if this is the first skill of a new grade level
              const isNewGradeLevel =
                index === 0 ||
                supportSkills[index - 1].gradeLevel !== gradeLevel;

              return (
                <React.Fragment key={skill.skillNumber}>
                  {/* Grade Level Header Row */}
                  {isNewGradeLevel && (
                    <tr className="bg-gray-100 border-t border-b border-gray-300">
                      <td
                        colSpan={3}
                        className="px-4 py-2 text-left font-semibold text-gray-700"
                      >
                        Grade {gradeLevel === 999 ? "Unknown" : gradeLevel}
                      </td>
                      {sectionStudents.map((student) => {
                        // Count how many skills in this grade level the student has mastered
                        const gradeLevelSkillNumbers = supportSkills
                          .filter((s) => s.gradeLevel === gradeLevel)
                          .map((s) => s.skill.skillNumber);
                        const masteredInGrade = gradeLevelSkillNumbers.filter(
                          (skillNum) => hasMastered(student, skillNum),
                        ).length;
                        return (
                          <td
                            key={student._id}
                            className="px-2 py-2 text-center font-semibold text-gray-600 border-r border-gray-300 text-xs"
                          >
                            {masteredInGrade}/{gradeLevelSkillNumbers.length}
                          </td>
                        );
                      })}
                    </tr>
                  )}

                  {/* Skill Row */}
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="bg-white px-4 py-2 border-r border-gray-300">
                      <SkillProgressBar
                        skillNumber={skill.skillNumber}
                        masteredCount={masteredCount}
                        totalCount={sectionStudents.length}
                        color="support"
                      />
                    </td>
                    <td className="bg-white px-4 py-2 border-r border-gray-300 text-gray-700">
                      {skill.title}
                    </td>
                    <td className="bg-white px-4 py-2 border-r border-gray-300">
                      <div className="grid grid-cols-2 gap-1 w-20">
                        {getUnitBadges(skill).map((unitNum) => (
                          <span
                            key={unitNum}
                            className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-200 text-gray-600"
                          >
                            U{unitNum}
                          </span>
                        ))}
                      </div>
                    </td>
                    {sectionStudents.map((student) => {
                      const isMastered = hasMastered(
                        student,
                        skill.skillNumber,
                      );
                      return (
                        <td
                          key={student._id}
                          className="px-2 py-2 border-r border-gray-300 text-center"
                        >
                          <div
                            className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center ${
                              isMastered
                                ? "bg-skill-support"
                                : "border-2 border-gray-300"
                            }`}
                          >
                            {isMastered && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
