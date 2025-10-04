"use client";

import React from 'react';

interface LessonSelectorProps {
  section: string;
  selectedLessons: number[];
  onLessonsChange: (lessons: number[]) => void;
  getAvailableLessons: () => number[];
}

export function LessonSelector({
  section,
  selectedLessons,
  onLessonsChange,
  getAvailableLessons
}: LessonSelectorProps) {
  const availableLessons = getAvailableLessons();
  
  const handleLessonToggle = (lessonNumber: number) => {
    if (selectedLessons.includes(lessonNumber)) {
      onLessonsChange(selectedLessons.filter(l => l !== lessonNumber));
    } else {
      onLessonsChange([...selectedLessons, lessonNumber].sort((a, b) => a - b));
    }
  };
  
  const handleSelectAll = () => {
    onLessonsChange(availableLessons);
  };
  
  const handleSelectNone = () => {
    onLessonsChange([]);
  };
  
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">Section {section.toUpperCase()} Lessons</h4>
        <div className="space-x-2">
          <button
            onClick={handleSelectAll}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Select All
          </button>
          <button
            onClick={handleSelectNone}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Select None
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-10 gap-2">
        {availableLessons.map(lessonNumber => (
          <label key={lessonNumber} className="flex items-center space-x-1 text-sm">
            <input
              type="checkbox"
              checked={selectedLessons.includes(lessonNumber)}
              onChange={() => handleLessonToggle(lessonNumber)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>{lessonNumber}</span>
          </label>
        ))}
      </div>
      
      <div className="mt-2 text-xs text-gray-600">
        Selected: {selectedLessons.length} lessons
        {selectedLessons.length > 0 && (
          <span className="ml-2">
            ({selectedLessons.join(', ')})
          </span>
        )}
      </div>
    </div>
  );
}
