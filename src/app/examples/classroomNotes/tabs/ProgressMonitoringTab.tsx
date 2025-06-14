"use client";

import React from 'react';
import { tv } from 'tailwind-variants';
import { Checkbox } from '@components/core/fields/Checkbox';
import { ClassroomObservationNoteInput } from '@zod-schema/observations/classroom-observation';

const sectionTitle = tv({
  base: "text-lg font-semibold border-b pb-2 mb-3"
});

interface ProgressMonitoringTabProps {
  formData: ClassroomObservationNoteInput;
  onCheckboxChange: (criterionIndex: number) => void;
}

export function ProgressMonitoringTab({ formData, onCheckboxChange }: ProgressMonitoringTabProps) {
  return (
    <div>
      <h3 className={sectionTitle()}>Progress Monitoring</h3>
      <div className="space-y-2">
        {formData.progressMonitoring.observedCriteria.map((criterion: typeof formData.progressMonitoring.observedCriteria[number], index: number) => (
          <div key={index} className="flex items-start gap-2">
            <Checkbox 
              id={`progress.observedCriteria.${index}`}
              checked={criterion.observed}
              onChange={() => onCheckboxChange(index)}
            />
            <label htmlFor={`progress.observedCriteria.${index}`} className="text-sm">
              {criterion.criterion}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
} 