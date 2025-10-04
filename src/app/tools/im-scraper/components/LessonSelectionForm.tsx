"use client";

import React from 'react';
import { SectionLessonSelection } from '../lib/types';
import { LessonSelector } from './LessonSelector';

interface LessonSelectionFormProps {
  urlParams: {
    grade: number;
    startUnit: number;
    endUnit: number;
    selectedSections: string[];
    sectionLessons: SectionLessonSelection;
    delayBetweenRequests: number;
  };
  onUrlParamsChange: (updater: (prev: LessonSelectionFormProps['urlParams']) => LessonSelectionFormProps['urlParams']) => void;
  getAvailableLessons: () => number[];
}

export function LessonSelectionForm({
  urlParams,
  onUrlParamsChange,
  getAvailableLessons
}: LessonSelectionFormProps) {
  // Handler for section selection changes
  const handleSectionChange = (sections: string[]) => {
    onUrlParamsChange(prev => {
      const newSectionLessons = { ...prev.sectionLessons };
      
      // Remove lessons for deselected sections
      Object.keys(newSectionLessons).forEach(section => {
        if (!sections.includes(section)) {
          delete newSectionLessons[section];
        }
      });
      
      // Add empty arrays for newly selected sections
      sections.forEach(section => {
        if (!newSectionLessons[section]) {
          newSectionLessons[section] = []; // Start with no lessons selected
        }
      });
      
      return {
        ...prev,
        selectedSections: sections,
        sectionLessons: newSectionLessons
      };
    });
  };

  // Handler for lesson selection within a section
  const handleLessonChange = (section: string, lessons: number[]) => {
    onUrlParamsChange(prev => ({
      ...prev,
      sectionLessons: {
        ...prev.sectionLessons,
        [section]: lessons
      }
    }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Lesson Selection</h3>
      
      {/* Grade, Start Unit, End Unit */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
          <select
            value={urlParams.grade}
            onChange={(e) => onUrlParamsChange(prev => ({ ...prev, grade: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={6}>Grade 6</option>
            <option value={7}>Grade 7</option>
            <option value={8}>Grade 8</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Unit</label>
          <select
            value={urlParams.startUnit}
            onChange={(e) => onUrlParamsChange(prev => ({ ...prev, startUnit: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 9 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Unit {i + 1}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Unit</label>
          <select
            value={urlParams.endUnit}
            onChange={(e) => onUrlParamsChange(prev => ({ ...prev, endUnit: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 9 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Unit {i + 1}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Section Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sections</label>
        <select
          multiple
          value={urlParams.selectedSections}
          onChange={(e) => handleSectionChange(Array.from(e.target.selectedOptions, option => option.value))}
          className="w-full p-2 border border-gray-300 rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="a">Section A</option>
          <option value="b">Section B</option>
          <option value="c">Section C</option>
          <option value="d">Section D</option>
          <option value="e">Section E</option>
          <option value="f">Section F</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple sections</p>
      </div>
      
      {/* Dynamic Lesson Selectors */}
      {urlParams.selectedSections.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-800">Select Lessons for Each Section</h4>
          {urlParams.selectedSections.map(section => (
            <LessonSelector
              key={section}
              section={section}
              selectedLessons={urlParams.sectionLessons[section] || []}
              onLessonsChange={(lessons) => handleLessonChange(section, lessons)}
              getAvailableLessons={getAvailableLessons}
            />
          ))}
        </div>
      )}
      
      {/* Delay setting */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Delay Between Requests (ms)</label>
        <input
          type="number"
          value={urlParams.delayBetweenRequests}
          onChange={(e) => onUrlParamsChange(prev => ({ ...prev, delayBetweenRequests: parseInt(e.target.value) }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="1000"
          max="10000"
        />
        <p className="text-xs text-gray-500 mt-1">Recommended: 2000ms to avoid rate limiting</p>
      </div>
    </div>
  );
}
