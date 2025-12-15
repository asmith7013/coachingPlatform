"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  GRADE_OPTIONS,
  SECTION_OPTIONS,
  LESSON_TYPE_OPTIONS,
  SCOPE_SEQUENCE_TAG_OPTIONS,
  type ScopeAndSequence,
  type ScopeAndSequenceInput,
  type Standard,
  type StandardContext,
} from "@zod-schema/scm/curriculum/scope-and-sequence";

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScopeAndSequenceInput) => void;
  entry?: ScopeAndSequence | null;
  isLoading?: boolean;
}

const STANDARD_CONTEXT_OPTIONS: StandardContext[] = ["current", "buildingOn", "buildingTowards"];

export function AddEditModal({
  isOpen,
  onClose,
  onSubmit,
  entry,
  isLoading,
}: AddEditModalProps) {
  const isEditing = !!entry;

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
    } else {
      // Reset to defaults for new entry
      setGrade("8");
      setUnit("");
      setUnitLessonId("");
      setUnitNumber(1);
      setLessonNumber(1);
      setLessonName("");
      setLessonType("lesson");
      setLessonTitle("");
      setSection("");
      setScopeSequenceTag("");
      setRoadmapSkills([]);
      setTargetSkills([]);
      setStandards([]);
      setLearningTargets([]);
    }
  }, [entry, isOpen]);

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
      section: section as "Ramp Ups" | "A" | "B" | "C" | "D" | "E" | "F" | "Unit Assessment" | undefined,
      scopeSequenceTag: scopeSequenceTag as "Grade 6" | "Grade 7" | "Grade 8" | "Algebra 1" | undefined,
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

  const updateStandard = (index: number, field: keyof Standard, value: string) => {
    const updated = [...standards];
    if (field === "context") {
      updated[index] = { ...updated[index], [field]: value as StandardContext || undefined };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setStandards(updated);
  };

  const removeStandard = (index: number) => {
    setStandards(standards.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">
            {isEditing ? "Edit Scope & Sequence Entry" : "Add New Entry"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded cursor-pointer"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Basic Information</h3>
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
                  onChange={(e) => setLessonNumber(parseInt(e.target.value) || 0)}
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
            <h3 className="text-sm font-medium text-gray-700 mb-3">Classification</h3>
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
                      {type === "lesson" ? "Lesson" : type === "rampUp" ? "Ramp Up" : "Assessment"}
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
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRoadmapSkill())}
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
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTargetSkill())}
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
                <div key={i} className="flex gap-2 items-start bg-white p-3 rounded border">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={standard.code}
                      onChange={(e) => updateStandard(i, "code", e.target.value)}
                      placeholder="Code (e.g., NY-8.G.1)"
                      className="px-2 py-1 border rounded text-sm"
                    />
                    <input
                      type="text"
                      value={standard.text}
                      onChange={(e) => updateStandard(i, "text", e.target.value)}
                      placeholder="Standard text"
                      className="px-2 py-1 border rounded text-sm md:col-span-2"
                    />
                    <select
                      value={standard.context || ""}
                      onChange={(e) => updateStandard(i, "context", e.target.value)}
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
                <p className="text-sm text-gray-500 italic">No standards added yet.</p>
              )}
            </div>
          </div>

          {/* Learning Targets Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Learning Targets</h3>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newLearningTarget}
                onChange={(e) => setNewLearningTarget(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLearningTarget())}
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
                <p className="text-sm text-gray-500 italic">No learning targets added yet.</p>
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
            {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
