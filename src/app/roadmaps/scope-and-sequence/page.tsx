"use client";

import { useState, useEffect } from "react";
import { fetchScopeAndSequence } from "@actions/313/scope-and-sequence";
import { fetchRoadmapsSkillsByNumbers } from "@actions/313/roadmaps-skills";
import { LessonDetailView } from "./components/LessonDetailView";
import { SkillProgressionTable } from "./components/SkillProgressionTable";
import { SkillDetailView } from "./components/SkillDetailView";
import { StudentFilter } from "./components/StudentFilter";
import { RoadmapsSkill } from "@zod-schema/313/roadmap-skill";
import { Student } from "@zod-schema/313/student";

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

  // Load all lessons on mount
  useEffect(() => {
    loadLessons();
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

  // Get unique units for the selected tag
  const availableUnits = selectedTag
    ? Array.from(new Set(
        allLessons
          .filter(lesson => lesson.scopeSequenceTag === selectedTag)
          .map(lesson => lesson.unit)
      )).sort()
    : [];

  // Get lessons for the selected tag and unit
  const filteredLessons = allLessons.filter(lesson => {
    if (!selectedTag) return false;
    if (!selectedUnit) return false;

    return lesson.scopeSequenceTag === selectedTag && lesson.unit === selectedUnit;
  });

  // Clear selected lesson when filters change
  useEffect(() => {
    setSelectedLessonId(null);
  }, [selectedTag, selectedUnit]);

  // Clear selected skill when lesson changes
  useEffect(() => {
    setSelectedSkillNumber(null);
    setSelectedSkillData(null);
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

  // Get the selected lesson object
  const selectedLesson = selectedLessonId
    ? filteredLessons.find(l => l._id === selectedLessonId) || null
    : null;

  if (isLoadingLessons) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600">Loading lessons...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (allLessons.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
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
      <div className="container mx-auto p-6">
        {/* Header and Filters */}
        <div className="flex gap-4 mb-6">
          {/* Left Card: Curriculum/Unit Filters */}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Unit</option>
                  {availableUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right Card: Student Filter */}
          <div className="w-1/4 bg-white rounded-lg shadow-sm p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Student Filter</h2>
              <p className="text-sm text-gray-600">
                View mastery progress
              </p>
            </div>
            <div className={!selectedTag || !selectedUnit ? "opacity-50 pointer-events-none" : ""}>
              <label htmlFor="student-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Select Student
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
        </div>

        {/* Skill Progression Visualization */}
        {selectedTag && selectedUnit && filteredLessons.length > 0 && (
          <SkillProgressionTable
            lessons={filteredLessons}
            onLessonClick={handleLessonClick}
            masteredSkills={selectedStudent?.masteredSkills || []}
            selectedLessonId={selectedLessonId}
          />
        )}

        {/* Two-Column Layout: Lesson Detail (40%) + Skill Detail (60%) */}
        <div className="flex gap-6">
          {/* Left Column: Lesson Detail View */}
          <div className="w-2/5">
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

          {/* Right Column: Skill Detail View */}
          <div className="w-3/5 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-3 z-10">
              <h3 className="font-semibold text-gray-900">Skill Details</h3>
            </div>
            <div className="overflow-y-auto">
              {loadingSkill ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <span className="text-gray-600 text-sm mt-2 block">Loading skill...</span>
                </div>
              ) : (
                <SkillDetailView
                  skill={selectedSkillData}
                  onSkillClick={handleSkillClick}
                  color={selectedSkillColor}
                  masteredSkills={selectedStudent?.masteredSkills || []}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
