import React from 'react';
import { Button } from '@/components/core/Button';
import { cn } from '@ui/utils/formatters';;
import { ScheduleModeToggleProps } from '../data/scheduleTypes';

/**
 * Component for toggling between edit and view modes
 */
export const ScheduleModeToggle: React.FC<ScheduleModeToggleProps> = ({
  isEditMode,
  onToggle
}) => {
  return (
    <Button 
      onClick={onToggle}
      className={cn("bg-gray-200 text-gray-800")}
    >
      {isEditMode ? "View Mode" : "Edit Mode"}
    </Button>
  );
}; 