"use client";

import React, { useState, useEffect } from "react";
import { LessonPicker } from "./LessonPicker";
import { SkillPicker } from "./SkillPicker";

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
}

/**
 * Combined picker for Small Group activities
 * Includes lesson selection + toggle for mastery check vs prerequisite skill
 */
export function SmallGroupPicker({
  grade,
  unitNumber,
  unitId,
  value,
  onChange,
  required = false,
  scopeSequenceTag,
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

  // Sync with external value changes
  useEffect(() => {
    setData(parseValue(value));
  }, [value]);

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
