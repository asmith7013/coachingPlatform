"use client";

import { useState } from "react";
import { XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import {
  createScopeAndSequence,
} from "@/app/actions/scm/scope-and-sequence";
import {
  fetchAssignmentsForSection,
  PodsieAssignmentInfo,
} from "@/app/actions/scm/podsie-sync";
import { SCOPE_SEQUENCE_TAG_OPTIONS } from "@zod-schema/scm/curriculum/scope-and-sequence";

interface CreateAssignmentModalProps {
  scopeSequenceTag: string;
  selectedUnit: number | null;
  selectedSection: string | null;
  sections: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateAssignmentModal({
  scopeSequenceTag,
  selectedUnit,
  selectedSection,
  sections,
  onClose,
  onSuccess,
}: CreateAssignmentModalProps) {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [podsieAssignments, setPodsieAssignments] = useState<PodsieAssignmentInfo[]>([]);
  const [podsieSection, setPodsieSection] = useState<string>(selectedSection || "");

  // Derive grade from scopeSequenceTag
  const getGradeFromTag = (tag: string): string => {
    if (tag === "Algebra 1") return "8";
    if (tag.startsWith("Grade ")) return tag.replace("Grade ", "");
    return "8";
  };

  // Form state with prefilled values
  const [formData, setFormData] = useState({
    grade: getGradeFromTag(scopeSequenceTag),
    unit: selectedUnit ? `Unit ${selectedUnit}` : "",
    unitNumber: selectedUnit || 1,
    lessonNumber: 0,
    unitLessonId: selectedUnit ? `${selectedUnit}.RU1` : "",
    lessonName: "",
    section: "Ramp Ups",
    scopeSequenceTag: scopeSequenceTag || "",
    lessonType: "ramp-up" as const,
    podsieAssignmentId: "",
    totalQuestions: 10,
  });

  // Update unitLessonId when unitNumber changes
  const handleUnitNumberChange = (value: number) => {
    setFormData((prev) => ({
      ...prev,
      unitNumber: value,
      unit: `Unit ${value}`,
      unitLessonId: `${value}.RU1`,
    }));
  };

  // Fetch assignments from Podsie for the current section
  const handleFetchAssignments = async () => {
    if (!podsieSection) {
      setFormError("Please select a class section first");
      return;
    }

    setLoadingAssignments(true);
    setFormError(null);

    try {
      const result = await fetchAssignmentsForSection(podsieSection);
      if (result.success) {
        setPodsieAssignments(result.assignments);
        if (result.assignments.length === 0) {
          setFormError("No assignments found for this section");
        }
      } else {
        setFormError(result.error || "Failed to fetch assignments");
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to fetch assignments");
    } finally {
      setLoadingAssignments(false);
    }
  };

  // Handle selecting an assignment from the dropdown
  const handleSelectAssignment = (assignment: PodsieAssignmentInfo) => {
    setFormData((prev) => ({
      ...prev,
      podsieAssignmentId: String(assignment.assignmentId),
      lessonName: assignment.assignmentName,
      totalQuestions: assignment.totalQuestions,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    try {
      const result = await createScopeAndSequence({
        ...formData,
        roadmapSkills: [],
        targetSkills: [],
        ownerIds: [],
      });

      if (result.success) {
        onSuccess();
      } else {
        setFormError(result.error || "Failed to create ramp-up");
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Create New Assignment</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {formError}
              </div>
            )}

            {/* Prefilled/readonly fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scope Sequence Tag
                </label>
                <select
                  value={formData.scopeSequenceTag}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      scopeSequenceTag: e.target.value,
                      grade: getGradeFromTag(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Tag</option>
                  {SCOPE_SEQUENCE_TAG_OPTIONS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade
                </label>
                <input
                  type="text"
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, grade: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  placeholder="e.g., 8"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Number *
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.unitNumber}
                  onChange={(e) => handleUnitNumberChange(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Lesson ID *
                </label>
                <input
                  type="text"
                  value={formData.unitLessonId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, unitLessonId: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 4.RU1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lesson Name *
              </label>
              <input
                type="text"
                value={formData.lessonName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lessonName: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Ramp-Up 1: Equivalent Expressions"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <select
                  value={formData.section}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, section: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Ramp Ups">Ramp Ups</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Number
                </label>
                <input
                  type="number"
                  value={formData.lessonNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lessonNumber: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  placeholder="0 for ramp-ups"
                />
              </div>
            </div>

            {/* Podsie Assignment Section */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-blue-900">
                  Podsie Assignment
                </h4>
              </div>

              {/* Class section selector for Podsie fetch */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-blue-900 mb-1">
                    Class Section
                  </label>
                  <select
                    value={podsieSection}
                    onChange={(e) => setPodsieSection(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select class section...</option>
                    {sections.map((section) => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="pt-6">
                  <button
                    type="button"
                    onClick={handleFetchAssignments}
                    disabled={loadingAssignments || !podsieSection}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                  >
                    {loadingAssignments && (
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    )}
                    {loadingAssignments ? "Fetching..." : "Fetch from Podsie"}
                  </button>
                </div>
              </div>

              {podsieAssignments.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1">
                    Select Assignment
                  </label>
                  <select
                    onChange={(e) => {
                      const selected = podsieAssignments.find(
                        (a) => String(a.assignmentId) === e.target.value
                      );
                      if (selected) handleSelectAssignment(selected);
                    }}
                    value={formData.podsieAssignmentId}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select an assignment...</option>
                    {podsieAssignments.map((a) => (
                      <option key={a.assignmentId} value={String(a.assignmentId)}>
                        {a.assignmentName} ({a.totalQuestions} questions)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Podsie Assignment ID
                </label>
                <input
                  type="text"
                  value={formData.podsieAssignmentId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      podsieAssignmentId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Auto-filled from selection above"
                  readOnly={podsieAssignments.length > 0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Questions
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.totalQuestions}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      totalQuestions: parseInt(e.target.value) || 10,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  readOnly={podsieAssignments.length > 0}
                />
              </div>
            </div>

            {/* Readonly fields display */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Auto-filled Fields
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Unit:</span> {formData.unit}
                </div>
                <div>
                  <span className="font-medium">Lesson Type:</span> {formData.lessonType}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  saving
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                }`}
              >
                {saving ? "Creating..." : "Create Assignment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
