"use client";

import { useState, useEffect } from "react";
import { fetchScopeAndSequence } from "@actions/313/scope-and-sequence";
import { fetchRoadmapsSkillsByNumbers } from "@actions/313/roadmaps-skills";
import { getRoadmapUnits } from "@/app/actions/313/roadmaps-units";
import { LessonDetailView } from "./components/LessonDetailView";
import { StudentFilter } from "./components/StudentFilter";
import { SkillGanttChart } from "./components/SkillGanttChart";
import { SkillDetailWrapper } from "../components/SkillDetailWrapper";
import { RoadmapsSkill } from "@zod-schema/313/roadmap-skill";
import { Student } from "@zod-schema/313/student";
import { RoadmapUnit } from "@zod-schema/313/roadmap-unit";
import { Spinner } from "@/components/core/feedback/Spinner";

interface ScopeAndSequenceEntry {
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

const SCOPE_SEQUENCE_TAG_OPTIONS = [
  { value: "", label: "Select Curriculum" },
  { value: "Grade 6", label: "Grade 6" },
  { value: "Grade 7", label: "Grade 7" },
  { value: "Grade 8", label: "Grade 8" },
  { value: "Algebra 1", label: "Algebra 1" },
];

export default function ScopeAndSequencePage() {
  const [allLessons, setAllLessons] = useState<ScopeAndSequenceEntry[]>([]);
  const [allUnits, setAllUnits] = useState<RoadmapUnit[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(true);
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [_selectedSkillNumber, setSelectedSkillNumber] = useState<string | null>(null);
  const [selectedSkillData, setSelectedSkillData] = useState<RoadmapsSkill | null>(null);
  const [loadingSkill, setLoadingSkill] = useState(false);
  const [selectedSkillColor, setSelectedSkillColor] = useState<'blue' | 'green' | 'orange' | 'purple'>('blue');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [contextSkillNumber, setContextSkillNumber] = useState<string | null>(null);
  const [contextSkillData, setContextSkillData] = useState<RoadmapsSkill | null>(null);
  const [loadingContextSkill, setLoadingContextSkill] = useState(false);

  // Load all lessons and units on mount
  useEffect(() => {
    loadLessons();
    loadUnits();
  }, []);

  const loadLessons = async () => {
    setIsLoadingLessons(true);
    try {
      const response = await fetchScopeAndSequence({
        page: 1,
        limit: 1000,
        sortBy: "unitNumber",
        sortOrder: "asc",
        filters: {},
        search: "",
        searchFields: []
      });

      if (response.success && response.items) {
        // Sort by unitNumber then lessonNumber
        const sorted = response.items.sort((a: ScopeAndSequenceEntry, b: ScopeAndSequenceEntry) => {
          if (a.unitNumber !== b.unitNumber) {
            return a.unitNumber - b.unitNumber;
          }
          return a.lessonNumber - b.lessonNumber;
        });
        setAllLessons(sorted);
      }
    } catch (error) {
      console.error("Error loading lessons:", error);
    } finally {
      setIsLoadingLessons(false);
    }
  };

  const loadUnits = async () => {
    try {
      const result = await getRoadmapUnits({
        successOnly: true,
        limit: 1000
      });

      if (result.success && result.data) {
        setAllUnits(Array.isArray(result.data) ? result.data as RoadmapUnit[] : []);
      }
    } catch (error) {
      console.error("Error loading units:", error);
    }
  };

  // Get unique units for the selected tag, grouped by grade
  const unitsByGrade = selectedTag
    ? allLessons
        .filter(lesson => lesson.scopeSequenceTag === selectedTag)
        .reduce((acc, lesson) => {
          const grade = lesson.grade;
          if (!acc[grade]) {
            acc[grade] = new Set<string>();
          }
          acc[grade].add(lesson.unit);
          return acc;
        }, {} as Record<string, Set<string>>)
    : {};

  // Convert to sorted array format for rendering
  const gradeGroups = Object.keys(unitsByGrade)
    .sort((a, b) => {
      // Sort grades: numeric grades first, then alphabetic (Algebra, Geometry, etc.)
      const aNum = parseInt(a);
      const bNum = parseInt(b);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      if (!isNaN(aNum)) return -1;
      if (!isNaN(bNum)) return 1;
      return a.localeCompare(b);
    })
    .map(grade => ({
      grade,
      units: Array.from(unitsByGrade[grade]).sort()
    }));

  // Get lessons for the selected tag and unit
  const filteredLessons = allLessons.filter(lesson => {
    if (!selectedTag) return false;
    if (!selectedUnit) return false;

    return lesson.scopeSequenceTag === selectedTag && lesson.unit === selectedUnit;
  });

  // Clear selected lesson when filters change
  useEffect(() => {
    setSelectedLessonId(null);
    setContextSkillNumber(null);
    setContextSkillData(null);
  }, [selectedTag, selectedUnit]);

  // Clear selected skill when lesson changes
  useEffect(() => {
    setSelectedSkillNumber(null);
    setSelectedSkillData(null);
    setContextSkillNumber(null);
    setContextSkillData(null);
  }, [selectedLessonId]);

  const handleLessonClick = (lessonId: string) => {
    setSelectedLessonId(lessonId);
  };

  const handleSkillClick = async (skillNumber: string, color: 'blue' | 'green' | 'orange' | 'purple' = 'blue') => {
    setSelectedSkillNumber(skillNumber);
    setSelectedSkillColor(color);
    setLoadingSkill(true);
    setSelectedSkillData(null); // Clear previous data
    try {
      const result = await fetchRoadmapsSkillsByNumbers([skillNumber]);
      if (result.success && result.data && result.data.length > 0) {
        setSelectedSkillData(result.data[0]);
      } else {
        // Skill not found - set a placeholder object to show error
        setSelectedSkillData({
          skillNumber,
          notFound: true,
        } as unknown as RoadmapsSkill);
      }
    } catch (error) {
      console.error('Error fetching skill:', error);
      setSelectedSkillData({
        skillNumber,
        notFound: true,
      } as unknown as RoadmapsSkill);
    } finally {
      setLoadingSkill(false);
    }
  };

  const handleContextSkillClick = async (skillNumber: string) => {
    setContextSkillNumber(skillNumber);
    setLoadingContextSkill(true);
    setContextSkillData(null);
    try {
      const result = await fetchRoadmapsSkillsByNumbers([skillNumber]);
      if (result.success && result.data && result.data.length > 0) {
        setContextSkillData(result.data[0]);
      } else {
        setContextSkillData({
          skillNumber,
          notFound: true,
        } as unknown as RoadmapsSkill);
      }
    } catch (error) {
      console.error('Error fetching context skill:', error);
      setContextSkillData({
        skillNumber,
        notFound: true,
      } as unknown as RoadmapsSkill);
    } finally {
      setLoadingContextSkill(false);
    }
  };

  // Get the selected lesson object
  const selectedLesson = selectedLessonId
    ? filteredLessons.find(l => l._id === selectedLessonId) || null
    : null;

  if (isLoadingLessons) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto p-6" style={{ maxWidth: "1600px" }}>
          <div className="flex justify-center items-center min-h-[400px]">
            <Spinner size="lg" variant="primary" />
          </div>
        </div>
      </div>
    );
  }

  if (allLessons.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto p-6" style={{ maxWidth: "1600px" }}>
          <h1 className="text-3xl font-bold mb-6">Scope and Sequence</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-yellow-600 mr-2">ℹ️</div>
              <div className="text-yellow-800">
                No lessons found in the database. Use the uploader to import lessons.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6" style={{ maxWidth: "1600px" }}>
        {/* Navigation */}

        {/* Header and Filters */}
        <div className="flex gap-4 mb-6">
          {/* Left Card: Title and Curriculum/Unit Filters */}
          <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
            <div className="mb-4">
              <h1 className="text-3xl font-bold mb-2">Scope and Sequence</h1>
              <p className="text-gray-600">
                Select a curriculum and unit to view lessons
              </p>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <div className="w-1/3">
                <label htmlFor="tag-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Curriculum
                </label>
                <select
                  id="tag-filter"
                  value={selectedTag}
                  onChange={(e) => {
                    setSelectedTag(e.target.value);
                    setSelectedUnit("");
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !selectedTag
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-300'
                  }`}
                >
                  {SCOPE_SEQUENCE_TAG_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label htmlFor="unit-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Unit
                </label>
                <select
                  id="unit-filter"
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  disabled={!selectedTag}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    selectedTag && !selectedUnit
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-300'
                  } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                >
                  <option value="">Select Unit</option>
                  {gradeGroups.map(({ grade, units }) => (
                    <optgroup key={grade} label={`Grade ${grade}`}>
                      {units.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Stats Summary - shown when unit is selected */}
            {selectedTag && selectedUnit && filteredLessons.length > 0 && (() => {
              // Get unitNumber from the first filtered lesson
              const unitNumber = filteredLessons[0]?.unitNumber;

              // Map selectedTag to full grade name
              const gradeMap: Record<string, string> = {
                "Grade 6": "Illustrative Math New York - 6th Grade",
                "Grade 7": "Illustrative Math New York - 7th Grade",
                "Grade 8": "Illustrative Math New York - 8th Grade",
                "Algebra 1": "Illustrative Math New York - Algebra 1",
              };

              const fullGradeName = gradeMap[selectedTag] || selectedTag;

              const currentUnit = allUnits.find(u =>
                u.unitNumber === unitNumber && u.grade === fullGradeName
              );

              console.log('Stats lookup:', { selectedTag, fullGradeName, selectedUnit, unitNumber, currentUnit, allUnitsCount: allUnits.length });

              if (!currentUnit) {
                return (
                  <div className="mt-6">
                    <div className="text-xs text-gray-500">Loading unit data...</div>
                  </div>
                );
              }

              return (
                <div className="mt-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-skill-target">
                        {currentUnit.targetCount || 0}
                      </div>
                      <div className="text-sm text-gray-500">Target Skills</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-skill-essential">
                        {currentUnit.supportCount || 0}
                      </div>
                      <div className="text-sm text-gray-500">Essential Skills</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-skill-helpful">
                        {currentUnit.extensionCount || 0}
                      </div>
                      <div className="text-sm text-gray-500">Helpful Skills</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Right Card: Student Filter - Only show when grade and unit are selected */}
          {selectedTag && selectedUnit && (
            <div className="w-1/4 bg-white rounded-lg shadow-sm p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Student Filter</h2>
                <p className="text-sm text-gray-600">
                  View mastery progress
                </p>
              </div>
              <div>
                <label htmlFor="student-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Students
                </label>
                <StudentFilter
                  selectedStudent={selectedStudent}
                  onStudentSelect={setSelectedStudent}
                  onSectionSelect={setSelectedSection}
                  multiSelect={true}
                  onStudentsSelect={setSelectedStudents}
                  selectedStudents={selectedStudents}
                  maxStudents={5}
                />
              </div>
            </div>
          )}
        </div>

        {/* Skill Progression Visualization */}
        {selectedTag && selectedUnit && filteredLessons.length > 0 && (
          <SkillGanttChart
            lessons={filteredLessons}
            onLessonClick={handleLessonClick}
            selectedLessonId={selectedLessonId}
            onSkillClick={handleSkillClick}
          />
        )}

        {/* Two-Column Layout: Adjust based on context column */}
        <div className="flex gap-6">
          {/* Left Column: Lesson Detail View */}
          <div className={`transition-all ${contextSkillNumber ? 'w-1/4' : 'w-2/5'}`}>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-3 z-10">
                <h3 className="font-semibold text-gray-900">Lesson Skills</h3>
              </div>
              <div className="overflow-y-auto">
                <LessonDetailView
                  lesson={selectedLesson}
                  onSkillClick={handleSkillClick}
                  masteredSkills={selectedStudent?.masteredSkills || []}
                  selectedSection={selectedSection}
                  selectedStudents={selectedStudents}
                />
              </div>
            </div>
          </div>

          {/* Middle Column: Skill Detail View */}
          <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all ${
            contextSkillNumber ? 'w-2/5' : 'w-3/5'
          }`}>
            <SkillDetailWrapper
              skill={selectedSkillData}
              onSkillClick={handleContextSkillClick}
              color={selectedSkillColor}
              masteredSkills={selectedStudent?.masteredSkills || []}
              loading={loadingSkill}
              showHeader={true}
              headerTitle="Skill Details"
            />
          </div>

          {/* Right Column: Context Skill View (only when contextSkillNumber is set) */}
          {contextSkillNumber && (
            <div className="w-1/3 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all">
              <SkillDetailWrapper
                skill={contextSkillData}
                onSkillClick={handleContextSkillClick}
                color="orange"
                masteredSkills={selectedStudent?.masteredSkills || []}
                loading={loadingContextSkill}
                showHeader={true}
                onClose={() => {
                  setContextSkillNumber(null);
                  setContextSkillData(null);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
