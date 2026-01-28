"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { LessonForSubsection } from "./types";

interface SubsectionsModalProps {
  isOpen: boolean;
  sectionName: string;
  lessons: LessonForSubsection[];
  onClose: () => void;
  onSave: (updates: LessonForSubsection[]) => void;
  isSaving?: boolean;
}

const COLUMNS = [
  { id: null, label: "Unassigned" },
  { id: 1, label: "Part 1" },
  { id: 2, label: "Part 2" },
  { id: 3, label: "Part 3" },
] as const;

export function SubsectionsModal({
  isOpen,
  sectionName,
  lessons: initialLessons,
  onClose,
  onSave,
  isSaving = false,
}: SubsectionsModalProps) {
  // Track lessons with their current subsection assignments
  const [lessons, setLessons] = useState<LessonForSubsection[]>(() =>
    [...initialLessons].sort((a, b) => a.lessonNumber - b.lessonNumber)
  );

  // Track if this is a fresh modal open
  const wasOpenRef = useRef(false);

  // Reset lessons state when modal opens (not on every prop change, to preserve drag state)
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      // Modal just opened - sync with fresh initial data
      setLessons([...initialLessons].sort((a, b) => a.lessonNumber - b.lessonNumber));
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, initialLessons]);

  // Track which lesson is being dragged
  const [draggedLesson, setDraggedLesson] = useState<LessonForSubsection | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);

  // Get lessons for a specific column (subsection)
  const getLessonsForColumn = useCallback(
    (subsection: number | null) => {
      if (subsection === null) {
        // "Unassigned" column: lessons with undefined or null subsection
        return lessons.filter((l) => l.subsection === undefined || l.subsection === null);
      }
      return lessons.filter((l) => l.subsection === subsection);
    },
    [lessons]
  );

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, lesson: LessonForSubsection) => {
    setDraggedLesson(lesson);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", lesson.scopeAndSequenceId);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedLesson(null);
    setDragOverColumn(null);
  };

  // Handle drag over column
  const handleDragOver = (e: React.DragEvent, columnId: number | null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  // Handle drop on column
  const handleDrop = (e: React.DragEvent, newSubsection: number | null) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedLesson) return;

    // Update the lesson's subsection
    setLessons((prev) =>
      prev.map((l) =>
        l.scopeAndSequenceId === draggedLesson.scopeAndSequenceId
          ? { ...l, subsection: newSubsection === null ? undefined : newSubsection }
          : l
      )
    );

    setDraggedLesson(null);
  };

  // Handle save
  const handleSave = () => {
    onSave(lessons);
  };

  // Check if there are changes
  const hasChanges = lessons.some((lesson) => {
    const original = initialLessons.find((l) => l.scopeAndSequenceId === lesson.scopeAndSequenceId);
    return original?.subsection !== lesson.subsection;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Manage Subsections - {sectionName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Instructions */}
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 text-sm text-blue-700">
          Drag lessons between columns to assign them to subsections. Lessons in &quot;Unassigned&quot; will appear in the main section.
        </div>

        {/* Columns */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-4 gap-4 min-h-[300px]">
            {COLUMNS.map((column) => {
              const columnLessons = getLessonsForColumn(column.id);
              const isDragOver = dragOverColumn === column.id;

              return (
                <div
                  key={column.label}
                  className={`rounded-lg border-2 p-3 transition-colors ${
                    isDragOver
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  {/* Column header */}
                  <div className="font-medium text-sm text-gray-700 mb-3 pb-2 border-b border-gray-200">
                    {column.label}
                    <span className="ml-2 text-gray-400 font-normal">
                      ({columnLessons.length})
                    </span>
                  </div>

                  {/* Lesson cards */}
                  <div className="space-y-2">
                    {columnLessons.map((lesson) => (
                      <div
                        key={lesson.scopeAndSequenceId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lesson)}
                        onDragEnd={handleDragEnd}
                        className={`px-3 py-2 bg-white rounded border shadow-sm cursor-grab active:cursor-grabbing transition-opacity ${
                          draggedLesson?.scopeAndSequenceId === lesson.scopeAndSequenceId
                            ? "opacity-50"
                            : ""
                        }`}
                      >
                        <div className="font-medium text-sm text-gray-900">
                          L{lesson.lessonNumber}
                        </div>
                        <div className="text-xs text-gray-500 truncate" title={lesson.lessonName}>
                          {lesson.lessonName}
                        </div>
                      </div>
                    ))}

                    {/* Empty state */}
                    {columnLessons.length === 0 && (
                      <div className="text-center text-gray-400 text-sm py-8">
                        Drop lessons here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={`px-4 py-2 text-sm rounded cursor-pointer ${
              hasChanges && !isSaving
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
