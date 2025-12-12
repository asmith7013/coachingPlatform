"use client";

import React, { useState, useEffect, useRef } from "react";
import { LessonPicker } from "./LessonPicker";
import { SkillPicker } from "./SkillPicker";
import { getNextLessonForStudent } from "../actions";

type SmallGroupType = "mastery" | "prerequisite";

interface SmallGroupData {
  type: SmallGroupType;
  lessonId: string;
  skillId?: string;
}

interface SmallGroupPickerProps {
  grade: string;
  unitNumber: number;
  unitId: string;
  value: string; // JSON stringified SmallGroupData
  onChange: (value: string) => void;
  required?: boolean;
  scopeSequenceTag?: string;
  studentId?: string; // Student ID for auto-fill suggestion
  formDate?: string; // Form date (YYYY-MM-DD) for calculating "yesterday"
}

/**
 * Combined picker for Small Group activities
 * Includes lesson selection + toggle for mastery check vs prerequisite skill
 * Auto-fills lesson based on student's most recent mastery check
 */
export function SmallGroupPicker({
  grade,
  unitNumber,
  unitId,
  value,
  onChange,
  required = false,
  scopeSequenceTag,
  studentId,
  formDate,
}: SmallGroupPickerProps) {
  // Parse existing value or use defaults
  const parseValue = (val: string): SmallGroupData => {
    if (!val) {
      return { type: "mastery", lessonId: "", skillId: "" };
    }
    try {
      return JSON.parse(val);
    } catch {
      return { type: "mastery", lessonId: "", skillId: "" };
    }
  };

  const [data, setData] = useState<SmallGroupData>(() => parseValue(value));
  const [suggestionMessage, setSuggestionMessage] = useState<string | null>(null);
  const hasAutoFilled = useRef(false);

  // Sync with external value changes
  useEffect(() => {
    setData(parseValue(value));
  }, [value]);

  // Auto-fill lesson suggestion when component mounts or key props change
  useEffect(() => {
    // Only auto-fill if:
    // - We have studentId, formDate, unitNumber, and scopeSequenceTag
    // - The current lessonId is empty
    // - We haven't already auto-filled for this student
    if (!studentId || !formDate || !unitNumber || !scopeSequenceTag) {
      return;
    }

    const currentData = parseValue(value);
    if (currentData.lessonId) {
      // Already has a lesson selected, don't override
      return;
    }

    if (hasAutoFilled.current) {
      // Already attempted auto-fill for this mount
      return;
    }

    hasAutoFilled.current = true;

    async function fetchSuggestion() {
      try {
        const result = await getNextLessonForStudent(
          studentId!,
          formDate!,
          unitNumber,
          scopeSequenceTag!
        );

        if (result.success && result.data) {
          // Auto-fill the lesson
          const newData: SmallGroupData = {
            type: "mastery",
            lessonId: result.data.lessonId,
            skillId: "",
          };
          setData(newData);
          onChange(JSON.stringify(newData));
          setSuggestionMessage(`Auto-filled: ${result.data.unitLessonId}`);
        } else if (result.message) {
          setSuggestionMessage(result.message);
        }
      } catch (error) {
        console.error("Failed to fetch lesson suggestion:", error);
      }
    }

    fetchSuggestion();
  }, [studentId, formDate, unitNumber, scopeSequenceTag, value, onChange]);

  // Reset auto-fill flag when student changes
  useEffect(() => {
    hasAutoFilled.current = false;
    setSuggestionMessage(null);
  }, [studentId]);

  // Update parent when data changes
  const updateData = (updates: Partial<SmallGroupData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    onChange(JSON.stringify(newData));
  };

  return (
    <div className="space-y-3">
      {/* Lesson Picker + Toggle Row */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <LessonPicker
            grade={grade}
            unitNumber={unitNumber}
            value={data.lessonId}
            onChange={(lessonId) => updateData({ lessonId })}
            required={required}
            scopeSequenceTag={scopeSequenceTag}
          />
        </div>

        {/* Pill Toggle */}
        <div className="inline-flex rounded-full bg-gray-600 p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => updateData({ type: "mastery", skillId: "" })}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${
              data.type === "mastery"
                ? "bg-white text-gray-700 shadow-sm"
                : "bg-transparent text-white hover:text-gray-200"
            }`}
          >
            Mastery Check
          </button>
          <button
            type="button"
            onClick={() => updateData({ type: "prerequisite" })}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${
              data.type === "prerequisite"
                ? "bg-white text-gray-700 shadow-sm"
                : "bg-transparent text-white hover:text-gray-200"
            }`}
          >
            Prerequisite
          </button>
        </div>
      </div>

      {/* Auto-fill suggestion message */}
      {suggestionMessage && (
        <div className="text-xs text-gray-500 italic">
          {suggestionMessage}
        </div>
      )}

      {/* Skill Picker - only shown when prerequisite is selected */}
      {data.type === "prerequisite" && (
        <SkillPicker
          unitId={unitId}
          value={data.skillId || ""}
          onChange={(skillId) => updateData({ skillId })}
          required={required}
        />
      )}
    </div>
  );
}

/**
 * Parse small group data from JSON string
 */
export function parseSmallGroupData(value: string): SmallGroupData | null {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
