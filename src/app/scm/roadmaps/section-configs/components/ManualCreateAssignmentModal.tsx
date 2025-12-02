"use client";

import { useState, useMemo } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { addPodsieAssignment } from "@/app/actions/313/section-config";
import { createScopeAndSequence, fetchScopeAndSequence } from "@/app/actions/313/scope-and-sequence";
import type { PodsieAssignment } from "@zod-schema/313/section-config";
import { Sections313, SectionsPS19 } from "@schema/enum/313";

interface ManualCreateAssignmentModalProps {
  school: string;
  classSection: string;
  gradeLevel: string;
  onClose: () => void;
  onSuccess: () => void;
}

// Section option with metadata
interface SectionOption {
  school: "IS313" | "PS19" | "X644";
  section: string;
  gradeLevel: string;
}

export function ManualCreateAssignmentModal({
  school,
  classSection,
  gradeLevel,
  onClose,
  onSuccess,
}: ManualCreateAssignmentModalProps) {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  const [failedSections, setFailedSections] = useState<string[]>([]);

  // Selected sections for multi-select (initialize with current section)
  const [selectedSections, setSelectedSections] = useState<string[]>([
    `${school}:${classSection}`
  ]);

  // Form state
  const [formData, setFormData] = useState({
    podsieAssignmentId: "",
    lessonName: "",
    unitLessonId: "",
    lessonSection: "Ramp Ups" as string, // Section within unit (A, B, C, etc.)
    assignmentType: "mastery-check" as "lesson" | "mastery-check",
    totalQuestions: 10,
    notes: "",
  });

  // Lesson section options (sections within a unit)
  const LESSON_SECTION_OPTIONS = [
    "Ramp Ups",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "Unit Assessment"
  ] as const;

  // Build section options grouped by school
  const sectionOptions = useMemo((): SectionOption[] => {
    const options: SectionOption[] = [];

    // IS313 sections
    Sections313.forEach(section => {
      const grade = section.startsWith('6') ? '6' : section.startsWith('7') ? '7' : '8';
      options.push({
        school: "IS313",
        section,
        gradeLevel: grade,
      });
    });

    // PS19 sections
    SectionsPS19.forEach(section => {
      const grade = section.startsWith('6') ? '6' : section.startsWith('7') ? '7' : '8';
      options.push({
        school: "PS19",
        section,
        gradeLevel: grade,
      });
    });

    return options;
  }, []);

  // Group sections by school for display
  const sectionsBySchool = useMemo(() => {
    const grouped: Record<string, SectionOption[]> = {};
    sectionOptions.forEach(option => {
      if (!grouped[option.school]) {
        grouped[option.school] = [];
      }
      grouped[option.school].push(option);
    });
    return grouped;
  }, [sectionOptions]);

  // Toggle section selection
  const toggleSection = (school: string, section: string) => {
    const key = `${school}:${section}`;
    setSelectedSections(prev => {
      if (prev.includes(key)) {
        return prev.filter(s => s !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  // Toggle all sections for a school
  const toggleSchool = (schoolName: string) => {
    const schoolSections = sectionsBySchool[schoolName];
    const schoolKeys = schoolSections.map(s => `${s.school}:${s.section}`);
    const allSelected = schoolKeys.every(key => selectedSections.includes(key));

    if (allSelected) {
      // Deselect all
      setSelectedSections(prev => prev.filter(key => !schoolKeys.includes(key)));
    } else {
      // Select all
      setSelectedSections(prev => {
        const newSelection = [...prev];
        schoolKeys.forEach(key => {
          if (!newSelection.includes(key)) {
            newSelection.push(key);
          }
        });
        return newSelection;
      });
    }
  };

  // Validate unitLessonId format (should be like "3.15" or "4.RU1")
  const validateUnitLessonId = (id: string): boolean => {
    const pattern = /^\d+\.(RU\d+|\d+)$/;
    return pattern.test(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessCount(0);
    setFailedSections([]);

    // Validation
    if (!formData.podsieAssignmentId.trim()) {
      setFormError("Podsie Assignment ID is required");
      return;
    }

    if (!formData.lessonName.trim()) {
      setFormError("Lesson Name is required");
      return;
    }

    if (!formData.unitLessonId.trim()) {
      setFormError("Unit.Lesson ID is required");
      return;
    }

    if (!validateUnitLessonId(formData.unitLessonId)) {
      setFormError(
        'Unit.Lesson ID must be in format "Unit.Lesson" (e.g., "3.15") or "Unit.RU#" (e.g., "4.RU1")'
      );
      return;
    }

    if (formData.totalQuestions < 1) {
      setFormError("Total Questions must be at least 1");
      return;
    }

    if (selectedSections.length === 0) {
      setFormError("Please select at least one section");
      return;
    }

    setSaving(true);

    try {
      let successfulAdds = 0;
      const failed: string[] = [];

      // First, ensure scope-and-sequence entry exists for this lesson
      const sectionGrade = formData.unitLessonId.startsWith('4.') ? '8' :
                          formData.unitLessonId.startsWith('6.') ? '6' :
                          formData.unitLessonId.startsWith('7.') ? '7' : '8';

      // Determine scope tag from the first selected section
      const firstSectionKey = selectedSections[0];
      const [, firstSection] = firstSectionKey.split(':');
      const scopeTag = firstSection === '802' ? 'Algebra 1' : `Grade ${sectionGrade}`;

      // Check if scope-and-sequence entry exists
      const scopeResult = await fetchScopeAndSequence({
        page: 1,
        limit: 1,
        sortBy: 'unitLessonId',
        sortOrder: 'asc',
        filters: {
          unitLessonId: formData.unitLessonId,
          scopeSequenceTag: scopeTag
        },
        search: '',
        searchFields: []
      });

      // If no scope-and-sequence entry exists, create it
      if (!scopeResult.success || !scopeResult.items || scopeResult.items.length === 0) {
        // Extract unit number from unitLessonId (e.g., "4.RU1" -> 4)
        const unitNumber = parseInt(formData.unitLessonId.split('.')[0]);
        const unitName = `Unit ${unitNumber}`;

        // Determine lesson type based on unitLessonId pattern
        const isRampUp = formData.unitLessonId.includes('RU');
        const lessonType = isRampUp ? 'ramp-up' : 'lesson';
        const lessonNumber = isRampUp ? 0 : parseInt(formData.unitLessonId.split('.')[1]) || 0;

        const createScopeResult = await createScopeAndSequence({
          grade: sectionGrade,
          unit: unitName,
          unitNumber,
          unitLessonId: formData.unitLessonId,
          lessonNumber,
          lessonName: formData.lessonName,
          section: formData.lessonSection,
          lessonType,
          scopeSequenceTag: scopeTag,
          roadmapSkills: [],
          targetSkills: [],
          ownerIds: []
        });

        if (!createScopeResult.success) {
          console.warn('Failed to create scope-and-sequence entry:', createScopeResult.error);
          // Continue anyway - the assignment can still be added
        }
      }

      // Add assignment to each selected section
      for (const sectionKey of selectedSections) {
        const [sectionSchool, section] = sectionKey.split(':');
        const sectionGradeLevel = section.startsWith('6') ? '6' : section.startsWith('7') ? '7' : '8';

        const assignment: PodsieAssignment = {
          unitLessonId: formData.unitLessonId,
          lessonName: formData.lessonName,
          grade: sectionGradeLevel,
          assignmentType: formData.assignmentType,
          podsieAssignmentId: formData.podsieAssignmentId,
          podsieQuestionMap: [], // Empty initially - can be populated later
          totalQuestions: formData.totalQuestions,
          hasZearnLesson: false,
          active: true,
          notes: formData.notes || undefined,
        };

        const result = await addPodsieAssignment(sectionSchool, section, assignment);

        if (result.success) {
          successfulAdds++;
        } else {
          failed.push(`${sectionSchool} ${section}: ${result.error}`);
        }
      }

      setSuccessCount(successfulAdds);
      setFailedSections(failed);

      // If all succeeded, close modal
      if (failed.length === 0) {
        setTimeout(() => {
          onSuccess();
        }, 1000);
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
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Manually Add Podsie Assignment
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {school} - Section {classSection} (Grade {gradeLevel})
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {formError}
              </div>
            )}

            {successCount > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                Successfully added to {successCount} section{successCount !== 1 ? 's' : ''}
                {failedSections.length > 0 && `, ${failedSections.length} failed`}
              </div>
            )}

            {failedSections.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                <div className="font-medium mb-1">Failed sections:</div>
                <ul className="list-disc list-inside space-y-1">
                  {failedSections.map((error, idx) => (
                    <li key={idx} className="text-xs">{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                When to use this form
              </h4>
              <p className="text-sm text-blue-800">
                Use this form to manually add Podsie assignments that don&apos;t appear
                in the API fetch. You can add the same assignment to multiple sections at once.
              </p>
            </div>

            {/* Section Multi-Select */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Select Sections ({selectedSections.length} selected)
              </h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {Object.entries(sectionsBySchool).map(([schoolName, sections]) => (
                  <div key={schoolName} className="border border-gray-300 rounded-lg overflow-hidden">
                    {/* School Header */}
                    <div
                      className="bg-gray-100 px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-200"
                      onClick={() => toggleSchool(schoolName)}
                    >
                      <span className="font-semibold text-sm text-gray-900">{schoolName}</span>
                      <span className="text-xs text-gray-600">
                        {sections.filter(s => selectedSections.includes(`${s.school}:${s.section}`)).length} / {sections.length} selected
                      </span>
                    </div>
                    {/* Sections */}
                    <div className="bg-white divide-y divide-gray-200">
                      {sections.map(option => {
                        const key = `${option.school}:${option.section}`;
                        const isSelected = selectedSections.includes(key);
                        return (
                          <label
                            key={key}
                            className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSection(option.school, option.section)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="ml-2 text-sm text-gray-900">
                              {option.section}
                            </span>
                            <span className="ml-auto text-xs text-gray-500">
                              Grade {option.gradeLevel}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Click school header to select/deselect all sections in that school
              </p>
            </div>

            {/* Required Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Podsie Assignment ID *
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 123456"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  The unique assignment ID from Podsie
                </p>
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
                  placeholder="e.g., Lesson 15: Area and Volume"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  The display name for this assignment
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit.Lesson ID *
                  </label>
                  <input
                    type="text"
                    value={formData.unitLessonId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, unitLessonId: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 3.15 or 4.RU1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: &quot;3.15&quot; or &quot;4.RU1&quot;
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lesson Section *
                  </label>
                  <select
                    value={formData.lessonSection}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, lessonSection: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {LESSON_SECTION_OPTIONS.map(section => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Section within the unit
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignment Type *
                  </label>
                  <select
                    value={formData.assignmentType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        assignmentType: e.target.value as "lesson" | "mastery-check",
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="mastery-check">Mastery Check</option>
                    <option value="lesson">Lesson Activity</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Usually &quot;Mastery Check&quot; for assessments
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Questions *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.totalQuestions}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        totalQuestions: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of questions in this assignment
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional notes about this assignment..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional additional notes
                </p>
              </div>
            </div>

            {/* Auto-filled Fields Display */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Summary
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Grade:</span> Auto-filled per section
                </div>
                <div>
                  <span className="font-medium">Active:</span> Yes
                </div>
                <div>
                  <span className="font-medium">Lesson Section:</span> {formData.lessonSection}
                </div>
                <div>
                  <span className="font-medium">Assignment Type:</span> {formData.assignmentType}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Question Map:</span> Empty (can be populated later)
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
                disabled={saving || selectedSections.length === 0}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  saving || selectedSections.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                }`}
              >
                {saving
                  ? `Adding to ${selectedSections.length} section${selectedSections.length !== 1 ? 's' : ''}...`
                  : `Add to ${selectedSections.length} section${selectedSections.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
