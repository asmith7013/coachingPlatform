"use client";

import React from 'react';
import { tv } from 'tailwind-variants';
import { Checkbox } from '@components/core/fields/Checkbox';
import { ClassroomObservationInput } from '@/lib/schema/zod-schema/visits/classroom-observation';

const sectionTitle = tv({
  base: "text-lg font-semibold border-b pb-2 mb-3"
});

interface ProgressMonitoringTabProps {
  formData: ClassroomObservationInput;
  onCheckboxChange: (criterionIndex: number) => void;
}

export function ProgressMonitoringTab({ formData, onCheckboxChange }: ProgressMonitoringTabProps) {
  // Type assertion to ensure progressMonitoring is properly typed
  const progressMonitoring = formData.progressMonitoring as {
    observedCriteria: Array<{ criterion: string; observed: boolean; }>;
  };

  return (
    <div>
      <h3 className={sectionTitle()}>Progress Monitoring</h3>
      <div className="space-y-2">
        {progressMonitoring.observedCriteria.map((criterion, index: number) => (
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