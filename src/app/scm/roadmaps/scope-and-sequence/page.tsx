"use client";

import { useState, useEffect } from "react";
import { fetchLessonsListByScopeTag, fetchScopeAndSequenceById, fetchFullLessonsByUnit } from "@actions/scm/scope-and-sequence";
import { fetchRoadmapsSkillsByNumbers } from "@actions/scm/roadmaps-skills";
import { getRoadmapUnits } from "@/app/actions/scm/roadmaps-units";
import { LessonDetailView } from "./components/LessonDetailView";
import { StudentFilter } from "./components/StudentFilter";
import { SkillGanttChart } from "./components/SkillGanttChart";
import { SkillDetailWrapper } from "../components/SkillDetailWrapper";
import { RoadmapsSkill } from "@zod-schema/scm/curriculum/roadmap-skill";
import { Student } from "@zod-schema/scm/student/student";
import { RoadmapUnit } from "@zod-schema/scm/curriculum/roadmap-unit";
import { ScopeAndSequence } from "@zod-schema/scm/curriculum/scope-and-sequence";
import { Spinner } from "@/components/core/feedback/Spinner";

// Lightweight lesson data for dropdown population
interface LessonListItem {
  _id: string;
  unitNumber: number;
  lessonNumber: number;
  unitLessonId: string;
  lessonName: string;
  lessonTitle?: string;
  lessonType?: string;
  unit: string;
  grade: string;
  section?: string;
  scopeSequenceTag: string;
}

// Full lesson data (loaded on demand per unit)
type FullLessonData = ScopeAndSequence;

const SCOPE_SEQUENCE_TAG_OPTIONS = [
  { value: "", label: "Select Curriculum" },
  { value: "Grade 6", label: "Grade 6" },
  { value: "Grade 7", label: "Grade 7" },
  { value: "Grade 8", label: "Grade 8" },
  { value: "Algebra 1", label: "Algebra 1" },
];

export default function ScopeAndSequencePage() {
  // Lightweight lesson list (for dropdowns)
  const [lessonsListByTag, setLessonsListByTag] = useState<Record<string, LessonListItem[]>>({});
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Full lesson data for current unit (for Gantt chart)
  const [unitLessons, setUnitLessons] = useState<FullLessonData[]>([]);
  const [isLoadingUnit, setIsLoadingUnit] = useState(false);

  // Selected lesson full data
  const [selectedLessonFull, setSelectedLessonFull] = useState<FullLessonData | null>(null);

  // Other data
  const [allUnits, setAllUnits] = useState<RoadmapUnit[]>([]);
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

  // Load roadmap units on mount
  useEffect(() => {
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

    loadUnits();
  }, []);

  // Load lightweight lesson list when tag changes
  useEffect(() => {
    if (!selectedTag) return;

    // Check if we already have the list cached
    if (lessonsListByTag[selectedTag]) return;

    const loadLessonsList = async () => {
      setIsLoadingList(true);
      try {
        const result = await fetchLessonsListByScopeTag(selectedTag);
        if (result.success && result.data) {
          setLessonsListByTag(prev => ({
            ...prev,
            [selectedTag]: result.data
          }));
        }
      } catch (error) {
        console.error("Error loading lessons list:", error);
      } finally {
        setIsLoadingList(false);
      }
    };

    loadLessonsList();
  }, [selectedTag, lessonsListByTag]);

  // Load full lesson data for selected unit (for Gantt chart) - single query
  useEffect(() => {
    if (!selectedTag || !selectedUnit) {
      setUnitLessons([]);
      return;
    }

    const loadUnitLessons = async () => {
      setIsLoadingUnit(true);
      try {
        // Single query to fetch all lessons for this unit
        const result = await fetchFullLessonsByUnit(selectedTag, selectedUnit);

        if (result.success && result.data) {
          setUnitLessons(result.data);
        } else {
          setUnitLessons([]);
        }
      } catch (error) {
        console.error("Error loading unit lessons:", error);
        setUnitLessons([]);
      } finally {
        setIsLoadingUnit(false);
      }
    };

    loadUnitLessons();
  }, [selectedTag, selectedUnit]);

  // Get current lessons list for the selected tag
  const currentLessonsList = lessonsListByTag[selectedTag] || [];

  // Get unique units for the selected tag, grouped by grade
  const unitsByGrade = selectedTag
    ? currentLessonsList
        .filter(lesson => !lesson.lessonType || lesson.lessonType === "lesson")
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

  // Clear selected lesson when filters change
  useEffect(() => {
    setSelectedLessonId(null);
    setSelectedLessonFull(null);
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

  // Load full lesson data when lesson is selected
  useEffect(() => {
    if (!selectedLessonId) {
      setSelectedLessonFull(null);
      return;
    }

    // Check if we already have it from unitLessons
    const existingLesson = unitLessons.find(l => l._id === selectedLessonId);
    if (existingLesson) {
      setSelectedLessonFull(existingLesson);
      return;
    }

    // Otherwise fetch it
    const loadLesson = async () => {
      try {
        const result = await fetchScopeAndSequenceById(selectedLessonId);
        if (result.success && result.data) {
          setSelectedLessonFull(result.data as FullLessonData);
        }
      } catch (error) {
        console.error("Error loading lesson:", error);
      }
    };

    loadLesson();
  }, [selectedLessonId, unitLessons]);

  const handleLessonClick = (lessonId: string) => {
    setSelectedLessonId(lessonId);
  };

  const handleSkillClick = async (skillNumber: string, color: 'blue' | 'green' | 'orange' | 'purple' = 'blue') => {
    setSelectedSkillNumber(skillNumber);
    setSelectedSkillColor(color);
    setLoadingSkill(true);
    setSelectedSkillData(null);
    try {
      const result = await fetchRoadmapsSkillsByNumbers([skillNumber]);
      if (result.success && result.data && result.data.length > 0) {
        setSelectedSkillData(result.data[0]);
      } else {
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

  const isLoading = isLoadingList || isLoadingUnit;

  // Initial loading state
  if (isLoadingList && !selectedTag) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6" style={{ maxWidth: "1600px" }}>
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
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
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
                  disabled={!selectedTag || isLoadingList}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                    selectedTag && !selectedUnit
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-300'
                  } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                >
                  <option value="">{isLoadingList ? "Loading..." : "Select Unit"}</option>
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
            {selectedTag && selectedUnit && unitLessons.length > 0 && (() => {
              const unitNumber = unitLessons[0]?.unitNumber;

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

        {/* Loading state for unit lessons */}
        {isLoadingUnit && selectedUnit && (
          <div className="flex justify-center items-center min-h-[200px]">
            <Spinner size="lg" variant="primary" />
          </div>
        )}

        {/* Skill Progression Visualization */}
        {selectedTag && selectedUnit && unitLessons.length > 0 && !isLoadingUnit && (
          <SkillGanttChart
            lessons={unitLessons}
            onLessonClick={handleLessonClick}
            selectedLessonId={selectedLessonId}
            onSkillClick={handleSkillClick}
          />
        )}

        {/* Two-Column Layout: Adjust based on context column */}
        {!isLoading && (
          <div className="flex gap-6">
            {/* Left Column: Lesson Detail View */}
            <div className={`transition-all ${contextSkillNumber ? 'w-1/4' : 'w-2/5'}`}>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-3 z-10">
                  <h3 className="font-semibold text-gray-900">Lesson Skills</h3>
                </div>
                <div className="overflow-y-auto">
                  <LessonDetailView
                    lesson={selectedLessonFull}
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
        )}
      </div>
    </div>
  );
}
