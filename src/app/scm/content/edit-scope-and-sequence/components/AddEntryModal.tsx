"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Dialog } from "@/components/composed/dialogs/Dialog";
import {
  GRADE_OPTIONS,
  SECTION_OPTIONS,
  SCOPE_SEQUENCE_TAG_OPTIONS,
  type ScopeAndSequence,
  type ScopeAndSequenceInput,
} from "@zod-schema/scm/scope-and-sequence/scope-and-sequence";

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScopeAndSequenceInput) => void;
  isLoading?: boolean;
  // Pre-populated from page filters
  defaultTag?: string;
  defaultGrade?: string;
  defaultUnit?: number;
  // Existing data for determining available lesson numbers
  existingEntries?: ScopeAndSequence[];
}

// Derive lessonType from section
function getLessonTypeFromSection(
  section: string,
): "lesson" | "rampUp" | "assessment" {
  if (section === "Ramp Ups") return "rampUp";
  if (section === "Unit Assessment") return "assessment";
  return "lesson";
}

// Generate unitLessonId based on type
function generateUnitLessonId(
  unitNumber: number,
  lessonNumber: number,
  lessonType: string,
): string {
  if (lessonType === "rampUp") {
    return `${unitNumber}.RU${lessonNumber}`;
  }
  if (lessonType === "assessment") {
    return `${unitNumber}.UA`;
  }
  return `${unitNumber}.${lessonNumber}`;
}

// Generate lessonName based on type
function generateLessonName(
  lessonNumber: number,
  lessonTitle: string,
  lessonType: string,
): string {
  if (lessonType === "rampUp") {
    return `Ramp Up ${lessonNumber}: ${lessonTitle}`;
  }
  if (lessonType === "assessment") {
    return "Unit Assessment";
  }
  return `Lesson ${lessonNumber}: ${lessonTitle}`;
}

export function AddEntryModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  defaultTag,
  defaultGrade,
  defaultUnit,
  existingEntries = [],
}: AddEntryModalProps) {
  // Form state - cascading dropdowns
  const [scopeSequenceTag, setScopeSequenceTag] = useState<string>("");
  const [grade, setGrade] = useState<string>("");
  const [unitNumber, setUnitNumber] = useState<number | null>(null);
  const [section, setSection] = useState<string>("");
  const [lessonNumber, setLessonNumber] = useState<number | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");

  // Initialize from defaults when modal opens
  useEffect(() => {
    if (isOpen) {
      setScopeSequenceTag(defaultTag || "");
      setGrade(defaultGrade || "");
      setUnitNumber(defaultUnit || null);
      setSection("");
      setLessonNumber(null);
      setLessonTitle("");
    }
  }, [isOpen, defaultTag, defaultGrade, defaultUnit]);

  // Derived values
  const lessonType = section ? getLessonTypeFromSection(section) : "lesson";
  const isAssessment = lessonType === "assessment";

  // Filter grades based on selected tag
  const availableGrades = useMemo(() => {
    if (!scopeSequenceTag) return GRADE_OPTIONS;
    // Tag maps to specific grades
    const tagToGrade: Record<string, string> = {
      "Grade 6": "6",
      "Grade 7": "7",
      "Grade 8": "8",
      "Algebra 1": "Algebra 1",
    };
    const matchedGrade = tagToGrade[scopeSequenceTag];
    if (matchedGrade) {
      return GRADE_OPTIONS.filter((g) => g === matchedGrade);
    }
    return GRADE_OPTIONS;
  }, [scopeSequenceTag]);

  // Auto-select grade when tag is selected (if only one option)
  useEffect(() => {
    if (availableGrades.length === 1 && !grade) {
      setGrade(availableGrades[0]);
    }
  }, [availableGrades, grade]);

  // Get available units from existing entries for the selected grade+tag
  const availableUnits = useMemo(() => {
    if (!grade || !scopeSequenceTag) return [];
    const units = new Set<number>();
    existingEntries.forEach((entry) => {
      if (
        entry.grade === grade &&
        entry.scopeSequenceTag === scopeSequenceTag
      ) {
        units.add(entry.unitNumber);
      }
    });
    // Sort and return, include option to add new unit
    const sortedUnits = Array.from(units).sort((a, b) => a - b);
    return sortedUnits;
  }, [existingEntries, grade, scopeSequenceTag]);

  // Get unit title from existing entries
  const unitTitle = useMemo(() => {
    if (!grade || !unitNumber) return "";
    const matchingEntry = existingEntries.find(
      (e) => e.grade === grade && e.unitNumber === unitNumber,
    );
    return matchingEntry?.unit || `Unit ${unitNumber}`;
  }, [existingEntries, grade, unitNumber]);

  // Get available lesson numbers based on what already exists
  const availableLessonNumbers = useMemo(() => {
    if (!grade || !unitNumber || !section || !scopeSequenceTag) return [];

    // Filter existing entries for this unit and section type
    const existingInSection = existingEntries.filter(
      (entry) =>
        entry.grade === grade &&
        entry.unitNumber === unitNumber &&
        entry.scopeSequenceTag === scopeSequenceTag &&
        entry.section === section,
    );

    const existingNumbers = new Set(
      existingInSection.map((e) => e.lessonNumber),
    );

    if (lessonType === "assessment") {
      // Assessment doesn't need a lesson number
      return [];
    }

    if (lessonType === "rampUp") {
      // Ramp ups typically 1-5, show gaps and next available
      const numbers: number[] = [];
      for (let i = 1; i <= 5; i++) {
        if (!existingNumbers.has(i)) {
          numbers.push(i);
        }
      }
      // Add next available after 5 if all 1-5 are taken
      if (numbers.length === 0) {
        const max = Math.max(...Array.from(existingNumbers), 0);
        numbers.push(max + 1);
      }
      return numbers;
    }

    // Regular lessons - show gaps and next available
    const numbers: number[] = [];
    const maxExisting =
      existingNumbers.size > 0 ? Math.max(...Array.from(existingNumbers)) : 0;

    // Show gaps (1 to max)
    for (let i = 1; i <= maxExisting; i++) {
      if (!existingNumbers.has(i)) {
        numbers.push(i);
      }
    }
    // Add next available numbers (up to 3 more than max)
    for (let i = maxExisting + 1; i <= maxExisting + 3; i++) {
      numbers.push(i);
    }
    // If no lessons exist, start with 1-3
    if (numbers.length === 0) {
      return [1, 2, 3];
    }
    return numbers;
  }, [
    existingEntries,
    grade,
    unitNumber,
    section,
    scopeSequenceTag,
    lessonType,
  ]);

  // Auto-calculated fields for preview
  const previewUnitLessonId = useMemo(() => {
    if (!unitNumber || (!lessonNumber && !isAssessment)) return "";
    return generateUnitLessonId(unitNumber, lessonNumber || 0, lessonType);
  }, [unitNumber, lessonNumber, lessonType, isAssessment]);

  const previewLessonName = useMemo(() => {
    if (!lessonTitle && !isAssessment) return "";
    if (isAssessment) return "Unit Assessment";
    if (!lessonNumber) return "";
    return generateLessonName(lessonNumber, lessonTitle, lessonType);
  }, [lessonNumber, lessonTitle, lessonType, isAssessment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!scopeSequenceTag || !grade || !unitNumber || !section) {
      return;
    }

    if (!isAssessment && (!lessonNumber || !lessonTitle)) {
      return;
    }

    const data: ScopeAndSequenceInput = {
      grade: grade as "6" | "7" | "8" | "Algebra 1",
      unit: unitTitle,
      unitLessonId: previewUnitLessonId,
      unitNumber,
      lessonNumber: isAssessment ? 0 : lessonNumber!,
      lessonName: previewLessonName,
      lessonType: lessonType as "lesson" | "rampUp" | "assessment",
      lessonTitle: isAssessment ? undefined : lessonTitle,
      section: section as
        | "Ramp Ups"
        | "A"
        | "B"
        | "C"
        | "D"
        | "E"
        | "F"
        | "Unit Assessment",
      scopeSequenceTag: scopeSequenceTag as
        | "Grade 6"
        | "Grade 7"
        | "Grade 8"
        | "Algebra 1",
      roadmapSkills: [],
      targetSkills: [],
      standards: [],
      learningTargets: [],
    };

    onSubmit(data);
  };

  const canSubmit =
    scopeSequenceTag &&
    grade &&
    unitNumber &&
    section &&
    (isAssessment || (lessonNumber && lessonTitle));

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Add New Entry"
      size="md"
      padding="none"
    >
      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 pb-4 space-y-4">
        {/* Row 1: Scope & Sequence Tag + Grade */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scope & Sequence Tag *
            </label>
            <select
              value={scopeSequenceTag}
              onChange={(e) => {
                setScopeSequenceTag(e.target.value);
                setGrade("");
                setUnitNumber(null);
                setSection("");
                setLessonNumber(null);
              }}
              className="w-full px-3 py-2 border rounded-lg cursor-pointer"
              required
            >
              <option value="">-- Select Tag --</option>
              {SCOPE_SEQUENCE_TAG_OPTIONS.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade *
            </label>
            <select
              value={grade}
              onChange={(e) => {
                setGrade(e.target.value);
                setUnitNumber(null);
                setSection("");
                setLessonNumber(null);
              }}
              className="w-full px-3 py-2 border rounded-lg cursor-pointer"
              required
              disabled={!scopeSequenceTag}
            >
              <option value="">-- Select Grade --</option>
              {availableGrades.map((g) => (
                <option key={g} value={g}>
                  {g === "Algebra 1" ? "Algebra 1" : `Grade ${g}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Unit + Section */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit *
            </label>
            <select
              value={unitNumber ?? ""}
              onChange={(e) => {
                setUnitNumber(e.target.value ? parseInt(e.target.value) : null);
                setSection("");
                setLessonNumber(null);
              }}
              className="w-full px-3 py-2 border rounded-lg cursor-pointer"
              required
              disabled={!grade}
            >
              <option value="">-- Select Unit --</option>
              {availableUnits.map((u) => (
                <option key={u} value={u}>
                  Unit {u}
                </option>
              ))}
              {/* Option to add new unit number */}
              {availableUnits.length > 0 && (
                <option value={Math.max(...availableUnits) + 1}>
                  Unit {Math.max(...availableUnits) + 1} (new)
                </option>
              )}
              {availableUnits.length === 0 && (
                <>
                  <option value={1}>Unit 1 (new)</option>
                  <option value={2}>Unit 2 (new)</option>
                  <option value={3}>Unit 3 (new)</option>
                </>
              )}
            </select>
            {unitNumber && unitTitle && (
              <p className="text-xs text-gray-500 mt-1">{unitTitle}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section *
            </label>
            <select
              value={section}
              onChange={(e) => {
                setSection(e.target.value);
                setLessonNumber(null);
                setLessonTitle("");
              }}
              className="w-full px-3 py-2 border rounded-lg cursor-pointer"
              required
              disabled={!unitNumber}
            >
              <option value="">-- Select Section --</option>
              {SECTION_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {section && (
              <p className="text-xs text-gray-500 mt-1">
                Type:{" "}
                {lessonType === "rampUp"
                  ? "Ramp Up"
                  : lessonType === "assessment"
                    ? "Assessment"
                    : "Lesson"}
              </p>
            )}
          </div>
        </div>

        {/* Row 3: Lesson Number + Lesson Title (not shown for assessments) */}
        {!isAssessment && section && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {lessonType === "rampUp" ? "Ramp Up #" : "Lesson #"} *
              </label>
              <select
                value={lessonNumber ?? ""}
                onChange={(e) =>
                  setLessonNumber(
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
                className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                required
              >
                <option value="">-- Select Number --</option>
                {availableLessonNumbers.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lesson Title *
              </label>
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="e.g., Division of Fractions"
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          </div>
        )}

        {/* Preview Section */}
        {(previewUnitLessonId || previewLessonName) && (
          <div className="bg-blue-50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium text-blue-800">Preview</h4>
            {previewUnitLessonId && (
              <p className="text-sm">
                <span className="text-gray-600">Unit Lesson ID:</span>{" "}
                <span className="font-mono bg-white px-1 rounded">
                  {previewUnitLessonId}
                </span>
              </p>
            )}
            {previewLessonName && (
              <p className="text-sm">
                <span className="text-gray-600">Lesson Name:</span>{" "}
                <span className="font-medium">{previewLessonName}</span>
              </p>
            )}
          </div>
        )}
      </form>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !canSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? "Creating..." : "Create Entry"}
        </button>
      </div>
    </Dialog>
  );
}
