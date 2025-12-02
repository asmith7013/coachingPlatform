"use client";

import React, { useState, useEffect } from "react";
import { fetchLessonsForUnit } from "../actions";

interface Lesson {
  _id: string;
  unitLessonId: string;
  lessonName: string;
  lessonNumber: number;
}

interface LessonPickerProps {
  grade: string;
  unitNumber: number;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
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
}: LessonPickerProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLessons() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchLessonsForUnit(grade, unitNumber);

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
  }, [grade, unitNumber]);

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
      {lessons.map((lesson) => (
        <option key={lesson._id} value={lesson._id}>
          {lesson.unitLessonId} - {lesson.lessonName}
        </option>
      ))}
    </select>
  );
}
