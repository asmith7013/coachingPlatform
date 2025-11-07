"use client";

import React, { useState } from 'react';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/fields/Input';
import type { AssessmentScraperConfig } from '@/lib/schema/zod-schema/313/assessment-scraper';

interface AssessmentScraperFormProps {
  onSubmit: (config: AssessmentScraperConfig) => void;
  isLoading: boolean;
}

export function AssessmentScraperForm({ onSubmit, isLoading }: AssessmentScraperFormProps) {
  const [email, setEmail] = useState('alex.smith@teachinglab.org');
  const [password, setPassword] = useState('rbx1KQD3fpv7qhd!erc');
  const [classes, setClasses] = useState('804');
  const [roadmap, setRoadmap] = useState('Illustrative Math New York - 8th Grade');
  const [studentGrade, setStudentGrade] = useState('8th Grade');
  const [skillGrade, setSkillGrade] = useState('8th Grade');
  const [schoolId, setSchoolId] = useState('school-313');
  const [delay, setDelay] = useState(1000);

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
        studentGrade,
        skillGrade
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
        {/* Credentials Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Roadmaps Credentials</h3>

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {/* Filters Section */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-medium text-gray-900">Assessment Filters</h3>

          <Input
            label="Class(es)"
            value={classes}
            onChange={(e) => setClasses(e.target.value)}
            placeholder="804"
            helperText="Comma-separated for multiple classes (e.g., 804, 805)"
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

        {/* Settings Section */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-medium text-gray-900">Settings</h3>

          <Input
            label="School ID"
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            placeholder="school-313"
            required
            disabled={isLoading}
          />

          <Input
            label="Delay Between Actions (ms)"
            type="number"
            value={delay}
            onChange={(e) => setDelay(parseInt(e.target.value, 10))}
            min={500}
            max={5000}
            step={100}
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
