"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  GRADE_OPTIONS,
  SECTION_OPTIONS,
  LESSON_TYPE_OPTIONS,
  SCOPE_SEQUENCE_TAG_OPTIONS,
  type ScopeAndSequence,
  type ScopeAndSequenceInput,
  type Standard,
  type StandardContext,
} from "@zod-schema/scm/scope-and-sequence/scope-and-sequence";

interface EditEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScopeAndSequenceInput) => void;
  entry: ScopeAndSequence | null;
  isLoading?: boolean;
}

const STANDARD_CONTEXT_OPTIONS: StandardContext[] = [
  "current",
  "buildingOn",
  "buildingTowards",
];

// Pattern validation helpers
function getExpectedLessonType(
  section: string,
): "lesson" | "rampUp" | "assessment" | null {
  if (section === "Ramp Ups") return "rampUp";
  if (section === "Unit Assessment") return "assessment";
  if (["A", "B", "C", "D", "E", "F"].includes(section)) return "lesson";
  return null;
}

function getExpectedUnitLessonId(
  unitNumber: number,
  lessonNumber: number,
  lessonType: string,
): string {
  if (lessonType === "rampUp") return `${unitNumber}.RU${lessonNumber}`;
  if (lessonType === "assessment") return `${unitNumber}.UA`;
  return `${unitNumber}.${lessonNumber}`;
}

function getExpectedLessonName(
  lessonNumber: number,
  lessonTitle: string,
  lessonType: string,
): string | null {
  if (!lessonTitle && lessonType !== "assessment") return null;
  if (lessonType === "rampUp") return `Ramp Up ${lessonNumber}: ${lessonTitle}`;
  if (lessonType === "assessment") return "Unit Assessment";
  return `Lesson ${lessonNumber}: ${lessonTitle}`;
}

function getExpectedGrade(scopeSequenceTag: string): string | null {
  const tagToGrade: Record<string, string> = {
    "Grade 6": "6",
    "Grade 7": "7",
    "Grade 8": "8",
    "Algebra 1": "Algebra 1",
  };
  return tagToGrade[scopeSequenceTag] || null;
}

interface PatternViolation {
  field: string;
  message: string;
  expected?: string;
  actual?: string;
}

export function EditEntryModal({
  isOpen,
  onClose,
  onSubmit,
  entry,
  isLoading,
}: EditEntryModalProps) {
  // Form state
  const [grade, setGrade] = useState<string>("8");
  const [unit, setUnit] = useState("");
  const [unitLessonId, setUnitLessonId] = useState("");
  const [unitNumber, setUnitNumber] = useState<number>(1);
  const [lessonNumber, setLessonNumber] = useState<number>(1);
  const [lessonName, setLessonName] = useState("");
  const [lessonType, setLessonType] = useState<string>("lesson");
  const [lessonTitle, setLessonTitle] = useState("");
  const [section, setSection] = useState<string>("");
  const [scopeSequenceTag, setScopeSequenceTag] = useState<string>("");
  const [roadmapSkills, setRoadmapSkills] = useState<string[]>([]);
  const [targetSkills, setTargetSkills] = useState<string[]>([]);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [learningTargets, setLearningTargets] = useState<string[]>([]);

  // Input state for array fields
  const [newRoadmapSkill, setNewRoadmapSkill] = useState("");
  const [newTargetSkill, setNewTargetSkill] = useState("");
  const [newLearningTarget, setNewLearningTarget] = useState("");

  // Reset form when entry changes
  useEffect(() => {
    if (entry) {
      setGrade(entry.grade);
      setUnit(entry.unit);
      setUnitLessonId(entry.unitLessonId);
      setUnitNumber(entry.unitNumber);
      setLessonNumber(entry.lessonNumber);
      setLessonName(entry.lessonName);
      setLessonType(entry.lessonType || "lesson");
      setLessonTitle(entry.lessonTitle || "");
      setSection(entry.section || "");
      setScopeSequenceTag(entry.scopeSequenceTag || "");
      setRoadmapSkills(entry.roadmapSkills || []);
      setTargetSkills(entry.targetSkills || []);
      setStandards(entry.standards || []);
      setLearningTargets(entry.learningTargets || []);
    }
  }, [entry, isOpen]);

  // Calculate pattern violations
  const violations = useMemo<PatternViolation[]>(() => {
    const result: PatternViolation[] = [];

    // Check lessonType matches section
    if (section) {
      const expectedType = getExpectedLessonType(section);
      if (expectedType && lessonType !== expectedType) {
        result.push({
          field: "lessonType",
          message: `Lesson type doesn't match section "${section}"`,
          expected: expectedType,
          actual: lessonType,
        });
      }
    }

    // Check unitLessonId format
    if (unitNumber && lessonType) {
      const expectedId = getExpectedUnitLessonId(
        unitNumber,
        lessonNumber,
        lessonType,
      );
      if (unitLessonId && unitLessonId !== expectedId) {
        result.push({
          field: "unitLessonId",
          message: "Unit Lesson ID doesn't match expected pattern",
          expected: expectedId,
          actual: unitLessonId,
        });
      }
    }

    // Check lessonName format
    if (lessonType && (lessonTitle || lessonType === "assessment")) {
      const expectedName = getExpectedLessonName(
        lessonNumber,
        lessonTitle,
        lessonType,
      );
      if (expectedName && lessonName && lessonName !== expectedName) {
        result.push({
          field: "lessonName",
          message: "Lesson name doesn't match expected pattern",
          expected: expectedName,
          actual: lessonName,
        });
      }
    }

    // Check grade matches scopeSequenceTag
    if (scopeSequenceTag) {
      const expectedGrade = getExpectedGrade(scopeSequenceTag);
      if (expectedGrade && grade !== expectedGrade) {
        result.push({
          field: "grade",
          message: `Grade doesn't match Scope & Sequence Tag "${scopeSequenceTag}"`,
          expected: expectedGrade,
          actual: grade,
        });
      }
    }

    // Check assessment has lessonNumber 0
    if (lessonType === "assessment" && lessonNumber !== 0) {
      result.push({
        field: "lessonNumber",
        message: "Assessments should have lesson number 0",
        expected: "0",
        actual: String(lessonNumber),
      });
    }

    return result;
  }, [
    grade,
    unitLessonId,
    unitNumber,
    lessonNumber,
    lessonName,
    lessonType,
    lessonTitle,
    section,
    scopeSequenceTag,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: ScopeAndSequenceInput = {
      grade: grade as "6" | "7" | "8" | "Algebra 1",
      unit,
      unitLessonId,
      unitNumber,
      lessonNumber,
      lessonName,
      lessonType: lessonType as "lesson" | "rampUp" | "assessment" | undefined,
      lessonTitle: lessonTitle || undefined,
      section: section as
        | "Ramp Ups"
        | "A"
        | "B"
        | "C"
        | "D"
        | "E"
        | "F"
        | "Unit Assessment"
        | undefined,
      scopeSequenceTag: scopeSequenceTag as
        | "Grade 6"
        | "Grade 7"
        | "Grade 8"
        | "Algebra 1"
        | undefined,
      roadmapSkills,
      targetSkills,
      standards,
      learningTargets,
    };

    onSubmit(data);
  };

  // Array field helpers
  const addRoadmapSkill = () => {
    if (newRoadmapSkill.trim()) {
      setRoadmapSkills([...roadmapSkills, newRoadmapSkill.trim()]);
      setNewRoadmapSkill("");
    }
  };

  const removeRoadmapSkill = (index: number) => {
    setRoadmapSkills(roadmapSkills.filter((_, i) => i !== index));
  };

  const addTargetSkill = () => {
    if (newTargetSkill.trim()) {
      setTargetSkills([...targetSkills, newTargetSkill.trim()]);
      setNewTargetSkill("");
    }
  };

  const removeTargetSkill = (index: number) => {
    setTargetSkills(targetSkills.filter((_, i) => i !== index));
  };

  const addLearningTarget = () => {
    if (newLearningTarget.trim()) {
      setLearningTargets([...learningTargets, newLearningTarget.trim()]);
      setNewLearningTarget("");
    }
  };

  const removeLearningTarget = (index: number) => {
    setLearningTargets(learningTargets.filter((_, i) => i !== index));
  };

  const addStandard = () => {
    setStandards([...standards, { code: "", text: "", context: undefined }]);
  };

  const updateStandard = (
    index: number,
    field: keyof Standard,
    value: string,
  ) => {
    const updated = [...standards];
    if (field === "context") {
      updated[index] = {
        ...updated[index],
        [field]: (value as StandardContext) || undefined,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setStandards(updated);
  };

  const removeStandard = (index: number) => {
    setStandards(standards.filter((_, i) => i !== index));
  };

  // Auto-fix helper
  const autoFixViolation = (violation: PatternViolation) => {
    if (violation.expected) {
      switch (violation.field) {
        case "lessonType":
          setLessonType(violation.expected);
          break;
        case "unitLessonId":
          setUnitLessonId(violation.expected);
          break;
        case "lessonName":
          setLessonName(violation.expected);
          break;
        case "grade":
          setGrade(violation.expected);
          break;
        case "lessonNumber":
          setLessonNumber(parseInt(violation.expected) || 0);
          break;
      }
    }
  };

  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Edit Scope & Sequence Entry</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded cursor-pointer"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Pattern Violations Warning */}
        {violations.length > 0 && (
          <div className="mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-amber-800">
                  Pattern Violations Detected ({violations.length})
                </h4>
                <p className="text-xs text-amber-700 mt-1">
                  This entry has values that don&apos;t match expected patterns.
                  You can fix them or keep the existing values.
                </p>
                <ul className="mt-2 space-y-2">
                  {violations.map((v, i) => (
                    <li
                      key={i}
                      className="flex items-start justify-between gap-2 text-xs bg-white p-2 rounded border border-amber-100"
                    >
                      <div>
                        <span className="font-medium text-amber-800">
                          {v.field}:
                        </span>{" "}
                        <span className="text-gray-700">{v.message}</span>
                        {v.expected && v.actual && (
                          <div className="mt-1 text-gray-500">
                            Expected:{" "}
                            <code className="bg-green-50 px-1 rounded">
                              {v.expected}
                            </code>
                            {" → "}
                            Actual:{" "}
                            <code className="bg-red-50 px-1 rounded">
                              {v.actual}
                            </code>
                          </div>
                        )}
                      </div>
                      {v.expected && (
                        <button
                          type="button"
                          onClick={() => autoFixViolation(v)}
                          className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded hover:bg-amber-200 cursor-pointer whitespace-nowrap"
                        >
                          Fix
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {/* Basic Info Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Basic Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Grade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade *
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                  required
                >
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g === "Algebra 1" ? "Algebra 1" : `Grade ${g}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unit Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Number *
                </label>
                <input
                  type="number"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border rounded-lg"
                  min={1}
                  required
                />
              </div>

              {/* Lesson Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Number *
                </label>
                <input
                  type="number"
                  value={lessonNumber}
                  onChange={(e) =>
                    setLessonNumber(parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              {/* Unit Lesson ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Lesson ID *
                </label>
                <input
                  type="text"
                  value={unitLessonId}
                  onChange={(e) => setUnitLessonId(e.target.value)}
                  placeholder="e.g., 3.15 or 3.RU1"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Unit Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Title *
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g., Unit 3 - Linear Relationships"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              {/* Lesson Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Name *
                </label>
                <input
                  type="text"
                  value={lessonName}
                  onChange={(e) => setLessonName(e.target.value)}
                  placeholder="e.g., Ramp Up 1: Division of Fractions"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>
          </div>

          {/* Classification Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Classification
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Lesson Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Type
                </label>
                <select
                  value={lessonType}
                  onChange={(e) => setLessonType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                >
                  <option value="">-- Select --</option>
                  {LESSON_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type === "lesson"
                        ? "Lesson"
                        : type === "rampUp"
                          ? "Ramp Up"
                          : "Assessment"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                >
                  <option value="">-- Select --</option>
                  {SECTION_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scope Sequence Tag */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scope Sequence Tag
                </label>
                <select
                  value={scopeSequenceTag}
                  onChange={(e) => setScopeSequenceTag(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                >
                  <option value="">-- Select --</option>
                  {SCOPE_SEQUENCE_TAG_OPTIONS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lesson Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Title
                </label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="Title without prefix"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Skills</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Roadmap Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Roadmap Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newRoadmapSkill}
                    onChange={(e) => setNewRoadmapSkill(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), addRoadmapSkill())
                    }
                    placeholder="Add skill number"
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={addRoadmapSkill}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {roadmapSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeRoadmapSkill(i)}
                        className="hover:text-blue-900 cursor-pointer"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Target Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTargetSkill}
                    onChange={(e) => setNewTargetSkill(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), addTargetSkill())
                    }
                    placeholder="Add skill number"
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={addTargetSkill}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {targetSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeTargetSkill(i)}
                        className="hover:text-green-900 cursor-pointer"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Standards Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Standards</h3>
              <button
                type="button"
                onClick={addStandard}
                className="flex items-center gap-1 px-2 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 cursor-pointer"
              >
                <PlusIcon className="h-4 w-4" />
                Add Standard
              </button>
            </div>
            <div className="space-y-3">
              {standards.map((standard, i) => (
                <div
                  key={i}
                  className="flex gap-2 items-start bg-white p-3 rounded border"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={standard.code}
                      onChange={(e) =>
                        updateStandard(i, "code", e.target.value)
                      }
                      placeholder="Code (e.g., NY-8.G.1)"
                      className="px-2 py-1 border rounded text-sm"
                    />
                    <input
                      type="text"
                      value={standard.text}
                      onChange={(e) =>
                        updateStandard(i, "text", e.target.value)
                      }
                      placeholder="Standard text"
                      className="px-2 py-1 border rounded text-sm md:col-span-2"
                    />
                    <select
                      value={standard.context || ""}
                      onChange={(e) =>
                        updateStandard(i, "context", e.target.value)
                      }
                      className="px-2 py-1 border rounded text-sm cursor-pointer"
                    >
                      <option value="">-- Context --</option>
                      {STANDARD_CONTEXT_OPTIONS.map((ctx) => (
                        <option key={ctx} value={ctx}>
                          {ctx === "current"
                            ? "Current"
                            : ctx === "buildingOn"
                              ? "Building On"
                              : "Building Towards"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStandard(i)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {standards.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  No standards added yet.
                </p>
              )}
            </div>
          </div>

          {/* Learning Targets Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Learning Targets
            </h3>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newLearningTarget}
                onChange={(e) => setNewLearningTarget(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addLearningTarget())
                }
                placeholder="Add a learning target"
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button
                type="button"
                onClick={addLearningTarget}
                className="px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 cursor-pointer"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
            <ul className="space-y-2">
              {learningTargets.map((target, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 bg-white p-2 rounded border"
                >
                  <span className="flex-1 text-sm">{target}</span>
                  <button
                    type="button"
                    onClick={() => removeLearningTarget(i)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </li>
              ))}
              {learningTargets.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  No learning targets added yet.
                </p>
              )}
            </ul>
          </div>
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
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Saving..." : "Update Entry"}
          </button>
        </div>
      </div>
    </div>
  );
}
