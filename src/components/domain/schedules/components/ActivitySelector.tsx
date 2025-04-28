import React from 'react';
import { cn } from '@ui/utils/formatters';
import { radii } from '@/lib/ui/tokens';
import { ActivitySelectorProps } from '../data/scheduleTypes';

/**
 * Component for selecting activities from a dropdown list
 */
export const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  value,
  onChange,
  options
}) => {
  return (
    <select 
      value={value}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
      className={cn("w-full p-1 border", radii.md)}
    >
      <option value="">Select activity</option>
      {options.map((activity) => (
        <option key={activity.value} value={activity.value}>
          {activity.label}
        </option>
      ))}
    </select>
  );
}; 