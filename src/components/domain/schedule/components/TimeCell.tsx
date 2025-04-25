import React from 'react';
import { cn } from '@/lib/utils';
import { radii } from '@/lib/ui/tokens';
import { TimeCellProps } from '../data/scheduleTypes';

/**
 * Component for displaying and editing time cells
 */
export const TimeCell: React.FC<TimeCellProps> = ({
  startTime,
  endTime,
  timeSlot,
  isEditMode,
  onStartTimeChange,
  onEndTimeChange,
  validateTime
}) => {
  if (isEditMode) {
    return (
      <>
        <td className="py-2 px-4 border">
          <input
            type="text"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            placeholder="HH:MM"
            className={cn(
              "w-full p-1 border", 
              radii.md,
              !validateTime(startTime) && startTime && "border-red-500"
            )}
          />
          {!validateTime(startTime) && startTime && (
            <div className="text-red-500 text-xs mt-1">Invalid time format (HH:MM)</div>
          )}
        </td>
        <td className="py-2 px-4 border">
          <input
            type="text"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            placeholder="HH:MM"
            className={cn(
              "w-full p-1 border", 
              radii.md,
              !validateTime(endTime) && endTime && "border-red-500"
            )}
          />
          {!validateTime(endTime) && endTime && (
            <div className="text-red-500 text-xs mt-1">Invalid time format (HH:MM)</div>
          )}
        </td>
      </>
    );
  }
  
  return (
    <td className="py-2 px-4 border">
      {timeSlot}
    </td>
  );
}; 