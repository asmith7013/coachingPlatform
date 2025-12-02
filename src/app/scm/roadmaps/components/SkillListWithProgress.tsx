"use client";

import { useState, useEffect } from "react";
import { RoadmapsSkill } from "@zod-schema/313/roadmap-skill";
import { Student } from "@zod-schema/313/student";
import { fetchRoadmapsSkillsByNumbers } from "@/app/actions/313/roadmaps-skills";
import { fetchStudentsBySection } from "@/app/actions/313/students";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon as CheckCircleOutlineIcon } from "@heroicons/react/24/outline";

interface SkillListWithProgressProps {
  skillNumbers: string[];
  selectedSection?: string;
  onSkillClick?: (skillNumber: string, color: 'blue' | 'green' | 'orange' | 'purple') => void;
  skillType?: 'target' | 'essential' | 'helpful' | 'support';
  showPrerequisites?: boolean;
  masteredSkills?: string[];
  targetSkillNumbers?: string[];
  selectedStudents?: Student[];
}

export function SkillListWithProgress({
  skillNumbers,
  selectedSection,
  onSkillClick,
  skillType = 'target',
  showPrerequisites = true,
  masteredSkills = [],
  targetSkillNumbers = [],
  selectedStudents = [],
}: SkillListWithProgressProps) {
  // Use compact mode for support skills
  const isCompactMode = skillType === 'support';
  const [skills, setSkills] = useState<RoadmapsSkill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [sectionStudents, setSectionStudents] = useState<Student[]>([]);

  // Fetch skills when skillNumbers change
  useEffect(() => {
    if (!skillNumbers || skillNumbers.length === 0) {
      setSkills([]);
      return;
    }

    const fetchSkills = async () => {
      setLoadingSkills(true);
      try {
        const result = await fetchRoadmapsSkillsByNumbers(skillNumbers);
        if (result.success && result.data) {
          setSkills(result.data);
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchSkills();
  }, [skillNumbers]);

  // Fetch section students when selectedSection changes
  useEffect(() => {
    if (!selectedSection) {
      setSectionStudents([]);
      return;
    }

    const fetchSectionData = async () => {
      try {
        const result = await fetchStudentsBySection(selectedSection);
        if (result.success && result.items) {
          // Map MongoDB documents to Student type
          const students: Student[] = result.items.map((item: Record<string, unknown>) => ({
            _id: (item._id as { toString(): string }).toString(),
            ownerIds: item.ownerIds as string[],
            studentID: item.studentID as number,
            firstName: item.firstName as string,
            lastName: item.lastName as string,
            school: item.school as Student['school'],
            section: item.section as Student['section'],
            active: item.active as boolean,
            roadmapSkills: item.roadmapSkills as string[],
            roadmap: item.roadmap as string,
            studentGrade: item.studentGrade as string,
            skillGrade: item.skillGrade as string,
            lastAssessmentDate: item.lastAssessmentDate as string | undefined,
            masteredSkills: (item.masteredSkills as string[]) || [],
            classActivities: (item.classActivities as Student['classActivities']) || [],
            skillPerformances: (item.skillPerformances as Student['skillPerformances']) || [],
            zearnLessons: (item.zearnLessons as Student['zearnLessons']) || [],
            rampUpProgress: (item.rampUpProgress as Student['rampUpProgress']) || []
          }));
          setSectionStudents(students);
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
    return Math.round((masteredCount / sectionStudents.length) * 100);
  };

  // Get students who have/haven't mastered a skill
  const getStudentsByMastery = (skillNumber: string): { mastered: Student[]; notMastered: Student[] } => {
    const mastered = sectionStudents.filter(s => s.masteredSkills?.includes(skillNumber));
    const notMastered = sectionStudents.filter(s => !s.masteredSkills?.includes(skillNumber));
    return { mastered, notMastered };
  };

  // Get color class based on skill type
  const getSkillColor = (type: 'target' | 'essential' | 'helpful' | 'support'): {
    bg: string;
    border: string;
    bgLight: string;
    clickColor: 'blue' | 'green' | 'orange' | 'purple';
    checkColor: string;
  } => {
    switch (type) {
      case 'target':
        return { bg: 'bg-skill-target', border: 'border-skill-target-200', bgLight: 'bg-skill-target-50', clickColor: 'green', checkColor: 'text-skill-target' };
      case 'essential':
        return { bg: 'bg-skill-essential', border: 'border-skill-essential-200', bgLight: 'bg-skill-essential-50', clickColor: 'orange', checkColor: 'text-skill-essential' };
      case 'helpful':
        return { bg: 'bg-skill-helpful', border: 'border-skill-helpful-200', bgLight: 'bg-skill-helpful-50', clickColor: 'purple', checkColor: 'text-skill-helpful' };
      case 'support':
        return { bg: 'bg-skill-support', border: 'border-skill-support-200', bgLight: 'bg-skill-support-50', clickColor: 'blue', checkColor: 'text-skill-support' };
    }
  };

  const colorClasses = getSkillColor(skillType);

  // Use multi-student mode if selectedStudents has items
  const useMultiStudentMode = selectedStudents.length > 0;

  // Progress bar with tooltip component
  const ProgressBarWithTooltip = ({
    skillNumber,
    percentage,
    bgColor
  }: {
    skillNumber: string;
    percentage: number;
    bgColor: string;
  }) => {
    const { mastered, notMastered } = getStudentsByMastery(skillNumber);

    return (
      <div className="flex items-center gap-2 flex-shrink-0 relative group">
        <div className="w-24 bg-gray-200 rounded-full h-2 cursor-help">
          <div
            className={`${bgColor} h-2 rounded-full transition-all`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-700 w-10 text-right">
          {percentage}%
        </span>
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 delay-400 z-50">
          <div className="bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3 min-w-[300px]">
            <div className="grid grid-cols-2 gap-4">
              {/* Mastered column */}
              <div>
                <div className="font-semibold mb-1 text-green-400">Mastered ({mastered.length})</div>
                <div className="space-y-0.5">
                  {mastered.length > 0 ? (
                    mastered.map((student) => (
                      <div key={student._id} className="text-gray-200">
                        {student.firstName} {student.lastName}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 italic">None</div>
                  )}
                </div>
              </div>
              {/* Not Mastered column */}
              <div>
                <div className="font-semibold mb-1 text-red-400">Not Mastered ({notMastered.length})</div>
                <div className="space-y-0.5">
                  {notMastered.length > 0 ? (
                    notMastered.map((student) => (
                      <div key={student._id} className="text-gray-200">
                        {student.firstName} {student.lastName}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 italic">None</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loadingSkills) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading skills...</span>
      </div>
    );
  }

  if (skills.length === 0) {
    return null;
  }

  return (
    <div className={isCompactMode ? "space-y-1" : "space-y-3"}>
      {skills.map((skill) => {
        const isTargetSkill = targetSkillNumbers.includes(skill.skillNumber);
        const hasEssentialSkills = skill.essentialSkills && skill.essentialSkills.length > 0;
        const hasHelpfulSkills = skill.helpfulSkills && skill.helpfulSkills.length > 0;
        const hasPrerequisites = hasEssentialSkills || hasHelpfulSkills;
        const masteryPercentage = selectedSection ? calculateMasteryPercentage(skill.skillNumber) : null;
        const isMastered = masteredSkills.includes(skill.skillNumber);

        // Compact rendering for support skills
        if (isCompactMode) {
          return (
            <div
              key={skill.skillNumber}
              onClick={() => onSkillClick?.(skill.skillNumber, colorClasses.clickColor)}
              className={`flex items-center justify-between ${colorClasses.bgLight} border ${colorClasses.border} px-2 py-1.5 rounded gap-2 cursor-pointer hover:shadow-md hover:border-gray-400 transition-all`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${colorClasses.bg} text-white font-bold text-xs flex-shrink-0`}
                >
                  {skill.skillNumber}
                </span>
                {masteredSkills.length > 0 && (
                  <div className="flex-shrink-0">
                    {isMastered ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-600" title="Mastered" />
                    ) : (
                      <CheckCircleOutlineIcon className="w-5 h-5 text-gray-400" title="Not yet mastered" />
                    )}
                  </div>
                )}
                <span className="text-xs text-gray-900 font-medium truncate">
                  {skill.title}
                </span>
              </div>
              {/* Multi-student checkmarks */}
              {useMultiStudentMode && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {selectedStudents.map((student) => {
                    const hasMastered = student.masteredSkills?.includes(skill.skillNumber);
                    return (
                      <div
                        key={student._id}
                        className="relative group cursor-help"
                      >
                        {hasMastered ? (
                          <CheckCircleIcon className={`w-5 h-5 ${colorClasses.checkColor}`} />
                        ) : (
                          <CheckCircleOutlineIcon className={`w-5 h-5 ${colorClasses.checkColor}`} />
                        )}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-75 z-10">
                          {student.firstName} {student.lastName}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Section progress bar */}
              {!useMultiStudentMode && masteryPercentage !== null && (
                <ProgressBarWithTooltip
                  skillNumber={skill.skillNumber}
                  percentage={masteryPercentage}
                  bgColor={colorClasses.bg}
                />
              )}
            </div>
          );
        }

        // Standard rendering for target skills
        return (
          <div
            key={skill.skillNumber}
            className={`border rounded-lg transition-colors ${
              isTargetSkill
                ? 'border-skill-target-300 bg-gray-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            {/* Main skill card */}
            <div
              className="p-3 cursor-pointer hover:bg-gray-100 transition-all rounded-t-lg"
              onClick={() => onSkillClick?.(skill.skillNumber, colorClasses.clickColor)}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <span
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-xs flex-shrink-0 ${colorClasses.bg}`}
                  >
                    {skill.skillNumber}
                  </span>
                  {/* Mastery Indicator */}
                  {masteredSkills.length > 0 && (
                    <div className="flex-shrink-0">
                      {isMastered ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-600" title="Mastered" />
                      ) : (
                        <CheckCircleOutlineIcon className="w-5 h-5 text-gray-400" title="Not yet mastered" />
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">
                        {skill.title}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Multi-student checkmarks */}
                {useMultiStudentMode && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {selectedStudents.map((student) => {
                      const hasMastered = student.masteredSkills?.includes(skill.skillNumber);
                      return (
                        <div
                          key={student._id}
                          className="relative group cursor-help"
                        >
                          {hasMastered ? (
                            <CheckCircleIcon className={`w-5 h-5 ${colorClasses.checkColor}`} />
                          ) : (
                            <CheckCircleOutlineIcon className={`w-5 h-5 ${colorClasses.checkColor}`} />
                          )}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-75 z-10">
                            {student.firstName} {student.lastName}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Section progress bar (only if not in multi-student mode) */}
                {!useMultiStudentMode && masteryPercentage !== null && (
                  <ProgressBarWithTooltip
                    skillNumber={skill.skillNumber}
                    percentage={masteryPercentage}
                    bgColor={colorClasses.bg}
                  />
                )}
              </div>
            </div>

            {/* Prerequisites - always shown if available and showPrerequisites is true */}
            {showPrerequisites && hasPrerequisites && (
              <div className="px-3 pb-3 pt-1 space-y-3 border-t border-gray-200">
                {/* Essential Skills */}
                {hasEssentialSkills && (
                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-2">Essential Skills ({skill.essentialSkills!.length})</div>
                    <div className="space-y-1">
                      {skill.essentialSkills!.map((essentialSkill) => {
                        const skillNum = typeof essentialSkill === 'string' ? essentialSkill : essentialSkill.skillNumber;
                        const skillTitle = typeof essentialSkill === 'object' ? essentialSkill.title : undefined;
                        const isSkillMastered = masteredSkills.includes(skillNum);
                        const essentialMastery = selectedSection ? calculateMasteryPercentage(skillNum) : null;

                        return (
                          <div
                            key={skillNum}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSkillClick?.(skillNum, 'orange');
                            }}
                            className="flex items-center justify-between bg-skill-essential-50 border border-skill-essential-200 px-2 py-1.5 rounded gap-2 cursor-pointer hover:shadow-md hover:border-skill-essential-300 transition-all"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-skill-essential text-white font-bold text-xs flex-shrink-0"
                              >
                                {skillNum}
                              </span>
                              {masteredSkills.length > 0 && (
                                <div className="flex-shrink-0">
                                  {isSkillMastered ? (
                                    <CheckCircleIcon className="w-4 h-4 text-green-600" title="Mastered" />
                                  ) : (
                                    <CheckCircleOutlineIcon className="w-4 h-4 text-gray-400" title="Not yet mastered" />
                                  )}
                                </div>
                              )}
                              {skillTitle && (
                                <span className="text-xs text-gray-900 truncate">{skillTitle}</span>
                              )}
                            </div>
                            {/* Multi-student checkmarks for essential skills */}
                            {useMultiStudentMode && (
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {selectedStudents.map((student) => {
                                  const hasMastered = student.masteredSkills?.includes(skillNum);
                                  return (
                                    <div
                                      key={student._id}
                                      className="relative group cursor-help"
                                    >
                                      {hasMastered ? (
                                        <CheckCircleIcon className="w-5 h-5 text-skill-essential" />
                                      ) : (
                                        <CheckCircleOutlineIcon className="w-5 h-5 text-skill-essential" />
                                      )}
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-75 z-10">
                                        {student.firstName} {student.lastName}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {/* Section progress bar for essential skills */}
                            {!useMultiStudentMode && essentialMastery !== null && (
                              <ProgressBarWithTooltip
                                skillNumber={skillNum}
                                percentage={essentialMastery}
                                bgColor="bg-skill-essential"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Helpful Skills */}
                {hasHelpfulSkills && (
                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-2">Helpful Skills ({skill.helpfulSkills!.length})</div>
                    <div className="space-y-1">
                      {skill.helpfulSkills!.map((helpfulSkill) => {
                        const skillNum = typeof helpfulSkill === 'string' ? helpfulSkill : helpfulSkill.skillNumber;
                        const skillTitle = typeof helpfulSkill === 'object' ? helpfulSkill.title : undefined;
                        const isSkillMastered = masteredSkills.includes(skillNum);
                        const helpfulMastery = selectedSection ? calculateMasteryPercentage(skillNum) : null;

                        return (
                          <div
                            key={skillNum}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSkillClick?.(skillNum, 'purple');
                            }}
                            className="flex items-center justify-between bg-skill-helpful-50 border border-skill-helpful-200 px-2 py-1.5 rounded gap-2 cursor-pointer hover:shadow-md hover:border-skill-helpful-300 transition-all"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-skill-helpful text-white font-bold text-xs flex-shrink-0"
                              >
                                {skillNum}
                              </span>
                              {masteredSkills.length > 0 && (
                                <div className="flex-shrink-0">
                                  {isSkillMastered ? (
                                    <CheckCircleIcon className="w-4 h-4 text-green-600" title="Mastered" />
                                  ) : (
                                    <CheckCircleOutlineIcon className="w-4 h-4 text-gray-400" title="Not yet mastered" />
                                  )}
                                </div>
                              )}
                              {skillTitle && (
                                <span className="text-xs text-gray-900 truncate">{skillTitle}</span>
                              )}
                            </div>
                            {/* Multi-student checkmarks for helpful skills */}
                            {useMultiStudentMode && (
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {selectedStudents.map((student) => {
                                  const hasMastered = student.masteredSkills?.includes(skillNum);
                                  return (
                                    <div
                                      key={student._id}
                                      className="relative group cursor-help"
                                    >
                                      {hasMastered ? (
                                        <CheckCircleIcon className="w-5 h-5 text-skill-helpful" />
                                      ) : (
                                        <CheckCircleOutlineIcon className="w-5 h-5 text-skill-helpful" />
                                      )}
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-75 z-10">
                                        {student.firstName} {student.lastName}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {/* Section progress bar for helpful skills */}
                            {!useMultiStudentMode && helpfulMastery !== null && (
                              <ProgressBarWithTooltip
                                skillNumber={skillNum}
                                percentage={helpfulMastery}
                                bgColor="bg-skill-helpful"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
