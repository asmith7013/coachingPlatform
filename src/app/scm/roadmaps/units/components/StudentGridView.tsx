"use client";

import { useState, useEffect } from "react";
import { RoadmapUnit } from "@zod-schema/313/curriculum/roadmap-unit";
import { Student } from "@zod-schema/313/student/student";
import { RoadmapsSkill } from "@zod-schema/313/curriculum/roadmap-skill";
import { fetchRoadmapsSkillsByNumbers } from "@/app/actions/313/roadmaps-skills";
import { fetchStudents } from "@/app/actions/313/students";
import { SkillProgressBar } from "./SkillProgressBar";

interface StudentGridViewProps {
  unit: RoadmapUnit | null;
  selectedStudents: Student[];
  selectedSection: string;
}

export function StudentGridView({
  unit,
  selectedStudents: _selectedStudents,
  selectedSection
}: StudentGridViewProps) {
  const [skills, setSkills] = useState<RoadmapsSkill[]>([]);
  const [supportSkills, setSupportSkills] = useState<RoadmapsSkill[]>([]);
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
          searchFields: []
        });

        if (result.success && result.items) {
          setSectionStudents(result.items as Student[]);
        }
      } catch (error) {
        console.error('Error loading section students:', error);
      }
    };

    loadSectionStudents();
  }, [selectedSection]);

  // Fetch all target skills for this unit
  useEffect(() => {
    if (!unit || !unit.targetSkills || unit.targetSkills.length === 0) {
      setSkills([]);
      return;
    }

    const loadSkills = async () => {
      setLoading(true);
      try {
        const result = await fetchRoadmapsSkillsByNumbers(unit.targetSkills);
        if (result.success && result.data) {
          setSkills(result.data as RoadmapsSkill[]);
        }
      } catch (error) {
        console.error('Error loading skills:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSkills();
  }, [unit]);

  // Fetch support skills for this unit
  useEffect(() => {
    if (!unit || !unit.additionalSupportSkills || unit.additionalSupportSkills.length === 0) {
      setSupportSkills([]);
      return;
    }

    const loadSupportSkills = async () => {
      try {
        const result = await fetchRoadmapsSkillsByNumbers(unit.additionalSupportSkills);
        if (result.success && result.data) {
          setSupportSkills(result.data as RoadmapsSkill[]);
        }
      } catch (error) {
        console.error('Error loading support skills:', error);
      }
    };

    loadSupportSkills();
  }, [unit]);

  // Helper to check if student has mastered a skill
  const hasMastered = (student: Student, skillNumber: string): boolean => {
    return student.masteredSkills?.includes(skillNumber) || false;
  };

  if (!unit) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
        <div className="text-gray-400 text-lg mb-2">📚</div>
        <div className="text-gray-600">No unit selected</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-gray-600">Loading skills...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-gray-700 text-white font-bold text-xs flex-shrink-0 whitespace-nowrap">
            Unit {unit.unitNumber}
          </span>
          <h2 className="text-xl font-bold text-gray-900">
            {unit.unitTitle.replace(/^\d+\s*-\s*/, '')}
          </h2>
        </div>
        <p className="text-sm text-gray-600">
          Student Mastery Grid - {sectionStudents.length} students
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[800px] overflow-y-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-20 bg-gray-100">
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="sticky top-0 bg-gray-100 px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-300 w-24">Skill #</th>
              <th className="sticky top-0 bg-gray-100 px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-300">Skill Name</th>
              {sectionStudents.map(student => (
                <th key={student._id} className="sticky top-0 bg-gray-100 px-2 py-3 text-center font-semibold text-gray-700 border-r border-gray-300 text-xs min-w-[80px]">
                  <div className="break-words">
                    {student.firstName} {student.lastName}
                  </div>
                </th>
              ))}
            </tr>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="bg-gray-100 px-4 py-2 border-r border-gray-300"></th>
              <th className="bg-gray-100 px-4 py-2 border-r border-gray-300"></th>
              {sectionStudents.map(student => {
                // Collect all skill numbers visible on this page
                const allSkillNumbers: string[] = [];

                // Add target skills
                skills.forEach(skill => {
                  allSkillNumbers.push(skill.skillNumber);
                  // Add essential skills
                  if (skill.essentialSkills) {
                    skill.essentialSkills.forEach(es => allSkillNumbers.push(es.skillNumber));
                  }
                  // Add helpful skills
                  if (skill.helpfulSkills) {
                    skill.helpfulSkills.forEach(hs => allSkillNumbers.push(hs.skillNumber));
                  }
                });

                // Add support skills
                supportSkills.forEach(ss => allSkillNumbers.push(ss.skillNumber));

                // Count mastered skills
                const masteredCount = allSkillNumbers.filter(skillNum =>
                  hasMastered(student, skillNum)
                ).length;
                const totalCount = allSkillNumbers.length;

                return (
                  <th key={student._id} className="bg-gray-100 px-2 py-2 text-center text-xs font-semibold text-gray-700 border-r border-gray-300">
                    {masteredCount}/{totalCount}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {skills.map((skill) => {
              // Count how many students have mastered this target skill
              const masteredCount = sectionStudents.filter(student =>
                hasMastered(student, skill.skillNumber)
              ).length;

              return (
                <React.Fragment key={skill.skillNumber}>
                  {/* Target Skill Row */}
                  <tr className="bg-purple-50 border-b border-gray-200">
                    <td className="bg-purple-50 px-4 py-3 border-r border-gray-300">
                      <SkillProgressBar
                        skillNumber={skill.skillNumber}
                        masteredCount={masteredCount}
                        totalCount={sectionStudents.length}
                        color="purple"
                        size="large"
                      />
                    </td>
                    <td className="bg-purple-50 px-4 py-3 border-r border-gray-300 font-medium text-gray-900 text-base">
                      {skill.title}
                    </td>
                    {sectionStudents.map(student => {
                      const isMastered = hasMastered(student, skill.skillNumber);
                      return (
                        <td key={student._id} className="px-2 py-3 border-r border-gray-300 text-center">
                          <div className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center ${
                            isMastered ? 'bg-purple-600' : 'border-2 border-gray-300'
                          }`}>
                            {isMastered && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Target Skill Description Row */}
                  <tr className="bg-purple-50 border-b border-gray-200">
                    <td className="bg-purple-50 px-4 py-2 border-r border-gray-300"></td>
                    <td colSpan={1 + sectionStudents.length} className="px-4 py-2">
                      {skill.description && (
                        <div className="text-sm text-gray-700">
                          <span className="font-semibold">Skill Description: </span>
                          {skill.description}
                        </div>
                      )}
                    </td>
                  </tr>

                  {/* Essential Skills Rows */}
                  {skill.essentialSkills && skill.essentialSkills.length > 0 && (
                    <>
                      {skill.essentialSkills.map((essentialSkill) => {
                        const essentialMasteredCount = sectionStudents.filter(student =>
                          hasMastered(student, essentialSkill.skillNumber)
                        ).length;

                        return (
                          <tr key={essentialSkill.skillNumber} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="bg-white px-4 py-2 border-r border-gray-300">
                              <SkillProgressBar
                                skillNumber={essentialSkill.skillNumber}
                                masteredCount={essentialMasteredCount}
                                totalCount={sectionStudents.length}
                                color="pink"
                              />
                            </td>
                            <td className="bg-white px-4 py-2 border-r border-gray-300 text-gray-700">
                              {essentialSkill.title}
                            </td>
                            {sectionStudents.map(student => {
                              const isMastered = hasMastered(student, essentialSkill.skillNumber);
                              return (
                                <td key={student._id} className="px-2 py-2 border-r border-gray-300 text-center">
                                  <div className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center ${
                                    isMastered ? 'bg-pink-600' : 'border-2 border-gray-300'
                                  }`}>
                                    {isMastered && (
                                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </>
                  )}

                  {/* Helpful Skills Rows */}
                  {skill.helpfulSkills && skill.helpfulSkills.length > 0 && (
                    <>
                      {skill.helpfulSkills.map((helpfulSkill) => {
                        const helpfulMasteredCount = sectionStudents.filter(student =>
                          hasMastered(student, helpfulSkill.skillNumber)
                        ).length;

                        return (
                          <tr key={helpfulSkill.skillNumber} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="bg-white px-4 py-2 border-r border-gray-300">
                              <SkillProgressBar
                                skillNumber={helpfulSkill.skillNumber}
                                masteredCount={helpfulMasteredCount}
                                totalCount={sectionStudents.length}
                                color="cyan"
                              />
                            </td>
                            <td className="bg-white px-4 py-2 border-r border-gray-300 text-gray-700">
                              {helpfulSkill.title}
                            </td>
                            {sectionStudents.map(student => {
                              const isMastered = hasMastered(student, helpfulSkill.skillNumber);
                              return (
                                <td key={student._id} className="px-2 py-2 border-r border-gray-300 text-center">
                                  <div className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center ${
                                    isMastered ? 'bg-cyan-600' : 'border-2 border-gray-300'
                                  }`}>
                                    {isMastered && (
                                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </>
                  )}
                </React.Fragment>
              );
            })}

            {/* Support Skills Section Header */}
            {supportSkills.length > 0 && (
              <tr className="bg-gray-100 border-t-2 border-b border-gray-300">
                <td colSpan={2 + sectionStudents.length} className="px-4 py-2 text-left font-semibold text-gray-700">
                  Support Skills
                </td>
              </tr>
            )}

            {/* Support Skills Rows */}
            {supportSkills.map((supportSkill) => {
              const supportMasteredCount = sectionStudents.filter(student =>
                hasMastered(student, supportSkill.skillNumber)
              ).length;

              return (
                <tr key={supportSkill.skillNumber} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="bg-white px-4 py-2 border-r border-gray-300">
                    <SkillProgressBar
                      skillNumber={supportSkill.skillNumber}
                      masteredCount={supportMasteredCount}
                      totalCount={sectionStudents.length}
                      color="support"
                    />
                  </td>
                  <td className="bg-white px-4 py-2 border-r border-gray-300 text-gray-700">
                    {supportSkill.title}
                  </td>
                  {sectionStudents.map(student => {
                    const isMastered = hasMastered(student, supportSkill.skillNumber);
                    return (
                      <td key={student._id} className="px-2 py-2 border-r border-gray-300 text-center">
                        <div className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center ${
                          isMastered ? 'bg-skill-support' : 'border-2 border-gray-300'
                        }`}>
                          {isMastered && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Import React for Fragment
import React from 'react';
