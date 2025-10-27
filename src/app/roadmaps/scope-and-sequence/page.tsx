"use client";

import { useState, useEffect } from "react";
import { upsertScopeAndSequence, fetchScopeAndSequence } from "@actions/313/scope-and-sequence";
import { SCOPE_SEQUENCE_TAG_OPTIONS } from "@zod-schema/313/scope-and-sequence";
import { useRouter } from "next/navigation";

interface ScopeAndSequenceEntry {
  grade: string;
  unit: string;
  unitLessonId: string;
  unitNumber: number;
  lessonNumber: number;
  lessonName: string;
  section?: string;
  scopeSequenceTag?: string;
}

export default function ScopeAndSequencePage() {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [allLessons, setAllLessons] = useState<ScopeAndSequenceEntry[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(true);

  // Form state for adding a lesson
  const [formData, setFormData] = useState<ScopeAndSequenceEntry>({
    grade: "",
    unit: "",
    unitLessonId: "",
    unitNumber: 0,
    lessonNumber: 0,
    lessonName: "",
    section: "",
    scopeSequenceTag: ""
  });

  // Load all lessons on mount
  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    setIsLoadingLessons(true);
    try {
      const response = await fetchScopeAndSequence({
        page: 1,
        pageSize: 1000,
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

  const handleAddLesson = async () => {
    try {
      const result = await upsertScopeAndSequence(formData);

      if (result.success) {
        // Reload lessons
        await loadLessons();
        // Close modal and reset form
        setShowAddModal(false);
        setFormData({
          grade: "",
          unit: "",
          unitLessonId: "",
          unitNumber: 0,
          lessonNumber: 0,
          lessonName: "",
          section: "",
          scopeSequenceTag: ""
        });
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleFormChange = (field: keyof ScopeAndSequenceEntry, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Scope and Sequence</h1>
            <p className="text-gray-600">
              View and manage curriculum scope and sequence
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/roadmaps/scope-and-sequence-uploader")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              📤 Bulk Upload
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              + Add Lesson
            </button>
          </div>
        </div>

        {/* All Lessons Display */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">All Lessons ({allLessons.length})</h2>
          {isLoadingLessons ? (
            <p className="text-gray-500">Loading lessons...</p>
          ) : allLessons.length === 0 ? (
            <p className="text-gray-500">No lessons uploaded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lesson #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Section
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tag
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lesson Name
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allLessons.map((lesson: any, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {lesson.grade}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {lesson.unitNumber}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {lesson.lessonNumber}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600 font-medium">
                        {lesson.unitLessonId}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {lesson.unit}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-purple-600 font-medium">
                        {lesson.section || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {lesson.scopeSequenceTag ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {lesson.scopeSequenceTag}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {lesson.lessonName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Lesson Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Add New Lesson</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade
                  </label>
                  <input
                    type="text"
                    value={formData.grade}
                    onChange={(e) => handleFormChange("grade", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 8"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => handleFormChange("unit", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Unit 3 - Linear Relationships"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Lesson ID
                  </label>
                  <input
                    type="text"
                    value={formData.unitLessonId}
                    onChange={(e) => handleFormChange("unitLessonId", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 3.15"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Number
                    </label>
                    <input
                      type="number"
                      value={formData.unitNumber || ""}
                      onChange={(e) => handleFormChange("unitNumber", parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., 3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lesson Number
                    </label>
                    <input
                      type="number"
                      value={formData.lessonNumber || ""}
                      onChange={(e) => handleFormChange("lessonNumber", parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., 15"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.section || ""}
                      onChange={(e) => handleFormChange("section", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., A, B, C"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tag (Optional)
                    </label>
                    <select
                      value={formData.scopeSequenceTag || ""}
                      onChange={(e) => handleFormChange("scopeSequenceTag", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">None</option>
                      {SCOPE_SEQUENCE_TAG_OPTIONS.map((tag) => (
                        <option key={tag} value={tag}>
                          {tag}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lesson Name
                  </label>
                  <input
                    type="text"
                    value={formData.lessonName}
                    onChange={(e) => handleFormChange("lessonName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Using Linear Relations to Solve Problems"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddLesson}
                  disabled={!formData.grade || !formData.unit || !formData.unitLessonId ||
                    !formData.unitNumber || !formData.lessonNumber || !formData.lessonName}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  Add Lesson
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      grade: "",
                      unit: "",
                      unitLessonId: "",
                      unitNumber: 0,
                      lessonNumber: 0,
                      lessonName: "",
                      section: "",
                      scopeSequenceTag: ""
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
