import React from 'react';
import { cn } from '@/lib/utils';
import { radii } from '@/lib/ui/tokens';
import { SchoolSelectorProps } from '../data/scheduleTypes';

/**
 * Component for selecting a school from a dropdown list
 */
export const SchoolSelector: React.FC<SchoolSelectorProps> = ({
  schools,
  selectedSchool,
  onSchoolChange,
  isLoading
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Select School:</label>
      <select 
        value={selectedSchool}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSchoolChange(e.target.value)}
        className={cn("w-full max-w-xs p-2 border", radii.md)}
        disabled={isLoading}
      >
        <option value="">Select a school</option>
        {schools.map((school) => (
          <option key={school._id} value={school._id}>
            {school.schoolName}
          </option>
        ))}
      </select>
    </div>
  );
}; 