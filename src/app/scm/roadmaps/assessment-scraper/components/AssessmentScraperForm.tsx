"use client";

import React, { useState } from 'react';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/fields/Input';
import type { AssessmentScraperConfig } from '@/lib/schema/zod-schema/scm/assessment-scraper';
import { GradeLevels } from '@/lib/schema/enum/shared-enums';
import {
  getScraperSectionOptions,
  getScraperConfigForSection,
  type Sections313Type
} from '@/lib/schema/enum/313';

interface AssessmentScraperFormProps {
  onSubmit: (config: AssessmentScraperConfig) => void;
  isLoading: boolean;
}

export function AssessmentScraperForm({ onSubmit, isLoading }: AssessmentScraperFormProps) {
  const [email] = useState('alex.smith@teachinglab.org');
  const [password] = useState('rbx1KQD3fpv7qhd!erc');
  const [selectedSection, setSelectedSection] = useState<Sections313Type | ''>('804');
  const [selectedRoadmapIndex, setSelectedRoadmapIndex] = useState(0);
  const [classes, setClasses] = useState('804');
  const [roadmap, setRoadmap] = useState('Illustrative Math New York - 8th Grade');
  const [studentGrade, setStudentGrade] = useState('8th Grade');
  const [skillGrade, setSkillGrade] = useState('8th Grade');
  const [schoolId] = useState('school-313');
  const [delay] = useState(1000);

  const sectionOptions = getScraperSectionOptions();

  // Get current section config
  const currentSectionConfig = selectedSection
    ? getScraperConfigForSection(selectedSection as Sections313Type)
    : undefined;

  // Check if current section has multiple roadmaps (e.g., 802)
  const hasMultipleRoadmaps = (currentSectionConfig?.configs.length || 0) > 1;

  // Handle section selection change
  const handleSectionChange = (section: Sections313Type | '') => {
    setSelectedSection(section);
    setSelectedRoadmapIndex(0); // Reset to first roadmap

    if (section) {
      const config = getScraperConfigForSection(section as Sections313Type);
      if (config && config.configs.length > 0) {
        const firstConfig = config.configs[0];
        setClasses(firstConfig.classes.join(', '));
        setRoadmap(firstConfig.roadmap);
        setStudentGrade(firstConfig.studentGrade);
        setSkillGrade(firstConfig.skillGrade);
      }
    }
  };

  // Handle roadmap toggle for sections with multiple roadmaps
  const handleRoadmapIndexChange = (index: number) => {
    setSelectedRoadmapIndex(index);

    if (currentSectionConfig && currentSectionConfig.configs[index]) {
      const config = currentSectionConfig.configs[index];
      setClasses(config.classes.join(', '));
      setRoadmap(config.roadmap);
      setStudentGrade(config.studentGrade);
      setSkillGrade(config.skillGrade);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const config: AssessmentScraperConfig = {
      credentials: {
        email,
        password
      },
      filters: {
        classes: classes.split(',').map(c => c.trim()),
        roadmap,
        studentGrade: studentGrade as typeof GradeLevels[keyof typeof GradeLevels],
        skillGrade: skillGrade as typeof GradeLevels[keyof typeof GradeLevels]
      },
      schoolId,
      delayBetweenActions: delay
    };

    onSubmit(config);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Assessment History Scraper
        </h2>
        <p className="text-sm text-gray-600">
          Scrape assessment data and update student records automatically
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Filters Section */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-medium text-gray-900">Assessment Filters</h3>

          {/* Section Preset Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section Preset
            </label>
            <select
              value={selectedSection}
              onChange={(e) => handleSectionChange(e.target.value as Sections313Type | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              <option value="">Manual Entry (No Preset)</option>
              {sectionOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Select a section to auto-populate filters below
            </p>
          </div>

          {/* Roadmap Toggle for sections with multiple roadmaps (802) */}
          {hasMultipleRoadmaps && currentSectionConfig && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roadmap Selection for {currentSectionConfig.sectionName}
              </label>
              <div className="flex gap-2">
                {currentSectionConfig.configs.map((config, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleRoadmapIndexChange(index)}
                    disabled={isLoading}
                    className={`
                      flex-1 px-4 py-2 rounded-md font-medium transition-colors
                      ${selectedRoadmapIndex === index
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {config.roadmap.includes('Algebra') ? 'Algebra 1' : '8th Grade'}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                ℹ️ This section requires scraping both roadmaps separately. Select which one to scrape now.
              </p>
            </div>
          )}

          <Input
            label="Class(es)"
            value={classes}
            onChange={(e) => setClasses(e.target.value)}
            placeholder="804"
            helpText="Comma-separated for multiple classes (e.g., 804, 805)"
            required
            disabled={isLoading}
          />

          <Input
            label="Roadmap"
            value={roadmap}
            onChange={(e) => setRoadmap(e.target.value)}
            placeholder="Illustrative Math New York - 8th Grade"
            required
            disabled={isLoading}
          />

          <Input
            label="Student Grade"
            value={studentGrade}
            onChange={(e) => setStudentGrade(e.target.value)}
            placeholder="8th grade"
            required
            disabled={isLoading}
          />

          <Input
            label="Skill Grade"
            value={skillGrade}
            onChange={(e) => setSkillGrade(e.target.value)}
            placeholder="8th grade"
            required
            disabled={isLoading}
          />
        </div>


        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Scraping...' : 'Scrape & Update Student Data'}
          </Button>
        </div>
      </form>
    </div>
  );
}
