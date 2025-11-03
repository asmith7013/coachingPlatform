"use client";

import { useState, useEffect } from "react";
import { RoadmapUnit } from "@zod-schema/313/roadmap-unit";
import { Student } from "@zod-schema/313/student";
import { RoadmapsSkill } from "@zod-schema/313/roadmap-skill";
import { fetchRoadmapsSkillsByNumbers } from "@/app/actions/313/roadmaps-skills";
import { fetchStudents } from "@/app/actions/313/students";

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
        <h2 className="text-xl font-bold text-gray-900">
          {unit.unitTitle.replace(/^\d+\s*-\s*/, '')}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Student Mastery Grid - {sectionStudents.length} students
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-20">
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="bg-gray-100 px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-300 w-24">Skill #</th>
              <th className="bg-gray-100 px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-300">Skill Name</th>
              {sectionStudents.map(student => (
                <th key={student._id} className="bg-gray-100 px-2 py-3 text-center font-semibold text-gray-700 border-r border-gray-300 text-xs min-w-[80px]">
                  <div className="break-words">
                    {student.firstName} {student.lastName}
                  </div>
                </th>
              ))}
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
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white text-xs font-bold">
                          {skill.skillNumber}
                        </span>
                      </div>
                    </td>
                    <td className="bg-purple-50 px-4 py-3 border-r border-gray-300 font-medium text-gray-900">
                      {skill.title}
                      <span className="ml-2 text-xs text-gray-500">
                        ({masteredCount}/{sectionStudents.length})
                      </span>
                    </td>
                    {sectionStudents.map(student => {
                      const isMastered = hasMastered(student, skill.skillNumber);
                      return (
                        <td key={student._id} className="px-2 py-3 border-r border-gray-300 text-center">
                          <div className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center ${
                            isMastered ? 'bg-green-600' : 'border-2 border-gray-300'
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

                  {/* Essential Skills Rows */}
                  {skill.essentialSkills && skill.essentialSkills.length > 0 && (
                    <>
                      {skill.essentialSkills.map((essentialSkill) => {
                        const essentialMasteredCount = sectionStudents.filter(student =>
                          hasMastered(student, essentialSkill.skillNumber)
                        ).length;

                        return (
                          <tr key={essentialSkill.skillNumber} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="bg-white px-4 py-2 border-r border-gray-300 pl-8">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-600 text-white text-xs font-bold">
                                  {essentialSkill.skillNumber}
                                </span>
                              </div>
                            </td>
                            <td className="bg-white px-4 py-2 border-r border-gray-300 text-gray-700 pl-6">
                              {essentialSkill.title}
                              <span className="ml-2 text-xs text-gray-500">
                                ({essentialMasteredCount}/{sectionStudents.length})
                              </span>
                            </td>
                            {sectionStudents.map(student => {
                              const isMastered = hasMastered(student, essentialSkill.skillNumber);
                              return (
                                <td key={student._id} className="px-2 py-2 border-r border-gray-300 text-center">
                                  <div className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center ${
                                    isMastered ? 'bg-green-600' : 'border-2 border-gray-300'
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
                            <td className="bg-white px-4 py-2 border-r border-gray-300 pl-8">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-cyan-600 text-white text-xs font-bold">
                                  {helpfulSkill.skillNumber}
                                </span>
                              </div>
                            </td>
                            <td className="bg-white px-4 py-2 border-r border-gray-300 text-gray-700 pl-6">
                              {helpfulSkill.title}
                              <span className="ml-2 text-xs text-gray-500">
                                ({helpfulMasteredCount}/{sectionStudents.length})
                              </span>
                            </td>
                            {sectionStudents.map(student => {
                              const isMastered = hasMastered(student, helpfulSkill.skillNumber);
                              return (
                                <td key={student._id} className="px-2 py-2 border-r border-gray-300 text-center">
                                  <div className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center ${
                                    isMastered ? 'bg-green-600' : 'border-2 border-gray-300'
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
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Import React for Fragment
import React from 'react';
