"use client";

import { useState, useEffect } from "react";
import { fetchScopeAndSequence } from "@actions/313/scope-and-sequence";
import { LessonListItem } from "./components/LessonListItem";
import { LessonDetailView } from "./components/LessonDetailView";

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

const GRADE_OPTIONS = [
  { value: "", label: "Select Grade" },
  { value: "6", label: "6th Grade" },
  { value: "7", label: "7th Grade" },
  { value: "8", label: "8th Grade" },
  { value: "Algebra 1", label: "Algebra 1" },
];

export default function ScopeAndSequencePage() {
  const [allLessons, setAllLessons] = useState<ScopeAndSequenceEntry[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

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

  // Get unique units for the selected grade
  const availableUnits = selectedGrade
    ? Array.from(new Set(
        allLessons
          .filter(lesson => lesson.grade === selectedGrade)
          .map(lesson => lesson.unit)
      )).sort()
    : [];

  // Get lessons for the selected grade and unit
  const filteredLessons = allLessons.filter(lesson => {
    if (!selectedGrade) return false;
    if (!selectedUnit) return false;
    return lesson.grade === selectedGrade && lesson.unit === selectedUnit;
  });

  // Clear selected lesson when filters change
  useEffect(() => {
    setSelectedLessonId(null);
  }, [selectedGrade, selectedUnit]);

  const handleLessonClick = (lessonId: string) => {
    setSelectedLessonId(lessonId);
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
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-4">
            <h1 className="text-3xl font-bold mb-2">Scope and Sequence</h1>
            <p className="text-gray-600">
              Select a grade and unit to view lessons
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="w-64">
              <label htmlFor="grade-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Grade
              </label>
              <select
                id="grade-filter"
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setSelectedUnit("");
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {GRADE_OPTIONS.map((option) => (
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
                disabled={!selectedGrade}
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

        {/* Split View Layout: Lesson List (40%) + Detail View (60%) */}
        <div className="flex gap-6">
          {/* Left Column: Lesson List */}
          <div className="w-2/5 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-3 z-10">
              <h3 className="font-semibold text-gray-900">Lessons</h3>
            </div>
            <div className="overflow-y-auto">
              {!selectedGrade || !selectedUnit ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-gray-400 text-lg mb-2">📚</div>
                  <div className="text-sm">Select a grade and unit to view lessons</div>
                </div>
              ) : filteredLessons.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-gray-400 text-lg mb-2">📝</div>
                  <div className="text-sm">No lessons found for this selection</div>
                </div>
              ) : (
                filteredLessons.map((lesson) => (
                  <LessonListItem
                    key={lesson._id}
                    lesson={lesson}
                    isSelected={selectedLessonId === lesson._id}
                    onClick={() => handleLessonClick(lesson._id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right Column: Lesson Detail View */}
          <div className="w-3/5">
            <LessonDetailView lesson={selectedLesson} />
          </div>
        </div>
      </div>
    </div>
  );
}
