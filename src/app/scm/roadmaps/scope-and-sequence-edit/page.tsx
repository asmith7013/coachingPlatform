"use client";

import { useState, useEffect } from "react";
import { fetchScopeAndSequence, updateLessonSkills, updateScopeAndSequence } from "@actions/scm/scope-and-sequence";
import { useRouter } from "next/navigation";

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

interface EditState {
  [key: string]: {
    lessonName: string;
    roadmapSkills: string;
    targetSkills: string;
  };
}

export default function ScopeAndSequenceEditPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<ScopeAndSequenceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editState, setEditState] = useState<EditState>({});
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");

  const GRADE_OPTIONS = [
    { value: "", label: "All Grades" },
    { value: "6", label: "Grade 6" },
    { value: "7", label: "Grade 7" },
    { value: "8", label: "Grade 8" },
    { value: "Algebra 1", label: "Algebra 1" },
  ];

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    setIsLoading(true);
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
        const sorted = response.items.sort((a: ScopeAndSequenceEntry, b: ScopeAndSequenceEntry) => {
          if (a.grade !== b.grade) return a.grade.localeCompare(b.grade);
          if (a.unitNumber !== b.unitNumber) return a.unitNumber - b.unitNumber;
          return a.lessonNumber - b.lessonNumber;
        });
        setLessons(sorted);

        // Initialize edit state
        const initialEditState: EditState = {};
        sorted.forEach((lesson: ScopeAndSequenceEntry) => {
          initialEditState[lesson._id] = {
            lessonName: lesson.lessonName,
            roadmapSkills: (lesson.roadmapSkills || []).join(", "),
            targetSkills: (lesson.targetSkills || []).join(", "),
          };
        });
        setEditState(initialEditState);
      }
    } catch (error) {
      console.error("Error loading lessons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (id: string, field: keyof EditState[string], value: string) => {
    setEditState(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleSave = async (lesson: ScopeAndSequenceEntry) => {
    setSavingIds(prev => new Set(prev).add(lesson._id));

    try {
      const editData = editState[lesson._id];

      // Parse skills from comma-separated strings
      const roadmapSkills = editData.roadmapSkills
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const targetSkills = editData.targetSkills
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // Update lesson name if changed
      if (editData.lessonName !== lesson.lessonName) {
        await updateScopeAndSequence(lesson._id, {
          lessonName: editData.lessonName
        });
      }

      // Update skills
      const skillsResult = await updateLessonSkills(lesson._id, {
        roadmapSkills,
        targetSkills
      });

      if (skillsResult.success) {
        // Update local state
        setLessons(prev => prev.map(l =>
          l._id === lesson._id
            ? { ...l, lessonName: editData.lessonName, roadmapSkills, targetSkills }
            : l
        ));
      }
    } catch (error) {
      console.error("Error saving lesson:", error);
      alert("Failed to save changes");
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(lesson._id);
        return next;
      });
    }
  };

  const hasChanges = (lesson: ScopeAndSequenceEntry) => {
    const editData = editState[lesson._id];
    if (!editData) return false;

    const currentRoadmapSkills = (lesson.roadmapSkills || []).join(", ");
    const currentTargetSkills = (lesson.targetSkills || []).join(", ");

    return (
      editData.lessonName !== lesson.lessonName ||
      editData.roadmapSkills !== currentRoadmapSkills ||
      editData.targetSkills !== currentTargetSkills
    );
  };

  // Get unique units for the selected grade
  const availableUnits = selectedGrade
    ? Array.from(new Set(
        lessons
          .filter(lesson => lesson.grade === selectedGrade)
          .map(lesson => lesson.unit)
      )).sort()
    : [];

  // Filter lessons
  const filteredLessons = lessons.filter(lesson => {
    if (selectedGrade && lesson.grade !== selectedGrade) return false;
    if (selectedUnit && lesson.unit !== selectedUnit) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto p-6" style={{ maxWidth: "1600px" }}>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6" style={{ maxWidth: "1600px" }}>
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Edit Scope and Sequence
            </h1>
            <p className="text-gray-600">
              Edit lesson names and skills for all scope and sequence entries
            </p>
          </div>
          <button
            onClick={() => router.push("/scm/roadmaps/scope-and-sequence")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            ← Back to View
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {GRADE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="unit-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Unit
              </label>
              <select
                id="unit-filter"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                disabled={!selectedGrade}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">All Units</option>
                {availableUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing <strong>{filteredLessons.length}</strong> of <strong>{lessons.length}</strong> lessons
          </div>
        </div>

        {/* Lessons Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Grade
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Lesson ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lesson Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    Roadmap Skills
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    Target Skills
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLessons.map((lesson) => {
                  const isSaving = savingIds.has(lesson._id);
                  const changed = hasChanges(lesson);
                  const editData = editState[lesson._id] || {
                    lessonName: lesson.lessonName,
                    roadmapSkills: (lesson.roadmapSkills || []).join(", "),
                    targetSkills: (lesson.targetSkills || []).join(", "),
                  };

                  return (
                    <tr key={lesson._id} className={changed ? "bg-yellow-50" : ""}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {lesson.grade}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {lesson.unitLessonId}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editData.lessonName}
                          onChange={(e) => handleFieldChange(lesson._id, "lessonName", e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSaving}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editData.roadmapSkills}
                          onChange={(e) => handleFieldChange(lesson._id, "roadmapSkills", e.target.value)}
                          placeholder="e.g., 123, 456, 789"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                          disabled={isSaving}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editData.targetSkills}
                          onChange={(e) => handleFieldChange(lesson._id, "targetSkills", e.target.value)}
                          placeholder="e.g., 123, 456, 789"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                          disabled={isSaving}
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => handleSave(lesson)}
                          disabled={!changed || isSaving}
                          className={`px-3 py-1 text-sm font-medium rounded ${
                            changed
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          } ${isSaving ? "opacity-50 cursor-wait" : ""}`}
                        >
                          {isSaving ? "Saving..." : "Save"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredLessons.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No lessons found. Try adjusting your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
