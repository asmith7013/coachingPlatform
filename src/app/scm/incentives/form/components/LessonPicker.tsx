"use client";

import React, { useState, useEffect, useMemo } from "react";
import { fetchLessonsForUnit } from "../actions";

interface Lesson {
  _id: string;
  unitLessonId: string;
  lessonName: string;
  lessonNumber: number;
  section?: string;
  lessonType?: string;
}

interface LessonPickerProps {
  grade: string;
  unitNumber: number;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  scopeSequenceTag?: string;
}

/**
 * Section ordering for scope and sequence
 * Ramp Ups come first, then A-F
 */
const SECTION_ORDER: Record<string, number> = {
  'Ramp Ups': 0,
  'A': 1,
  'B': 2,
  'C': 3,
  'D': 4,
  'E': 5,
  'F': 6,
  'Unit Assessment': 99,
};

function getSectionOrder(section: string | undefined): number {
  if (!section) return 50;
  return SECTION_ORDER[section] ?? 50;
}

/**
 * Sort lessons: Ramp Ups first (in RU number order), then A, B, C, D by lesson number
 */
function sortLessons(lessons: Lesson[]): Lesson[] {
  return [...lessons].sort((a, b) => {
    const sectionA = getSectionOrder(a.section);
    const sectionB = getSectionOrder(b.section);
    if (sectionA !== sectionB) return sectionA - sectionB;

    // For ramp-ups, sort by the RU number in unitLessonId (e.g., "3.RU1" -> 1)
    if (a.section === 'Ramp Ups' && b.section === 'Ramp Ups') {
      const numA = parseInt(a.unitLessonId.replace(/.*RU/, '')) || 0;
      const numB = parseInt(b.unitLessonId.replace(/.*RU/, '')) || 0;
      return numA - numB;
    }

    return a.lessonNumber - b.lessonNumber;
  });
}

/**
 * Format lesson display text
 * - Ramp ups: Show just the lessonName (e.g., "Ramp Up 1: Equivalent Ratios")
 * - Regular lessons: Show "Lesson X: Title" (e.g., "Lesson 1: Understanding Proportional Relationships")
 */
function formatLessonDisplay(lesson: Lesson): string {
  if (lesson.lessonType === 'rampUp' || lesson.section === 'Ramp Ups') {
    // Ramp ups already have "Ramp Up X: Title" format in lessonName
    return lesson.lessonName;
  }
  // Regular lessons: "Lesson X: Title"
  return `Lesson ${lesson.lessonNumber}: ${lesson.lessonName}`;
}

/**
 * Dropdown for lesson selection (Small Group Acceleration)
 */
export function LessonPicker({
  grade,
  unitNumber,
  value,
  onChange,
  required = false,
  scopeSequenceTag,
}: LessonPickerProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLessons() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchLessonsForUnit(grade, unitNumber, scopeSequenceTag);

        if (typeof result === 'string') {
          setError("Failed to load lessons");
        } else if (result.success && result.data) {
          setLessons(result.data as Lesson[]);
        } else {
          setError(result.error ?? "Failed to load lessons");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    loadLessons();
  }, [grade, unitNumber, scopeSequenceTag]);

  // Sort lessons with ramp ups first
  const sortedLessons = useMemo(() => sortLessons(lessons), [lessons]);

  if (isLoading) {
    return (
      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
        Loading lessons...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-600 text-sm">
        {error}
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
        No lessons found for this unit
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Select lesson...</option>
      {sortedLessons.map((lesson) => (
        <option key={lesson._id} value={lesson._id}>
          {formatLessonDisplay(lesson)}
        </option>
      ))}
    </select>
  );
}
