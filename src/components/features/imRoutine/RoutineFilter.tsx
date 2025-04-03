'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { spacing, textColors, backgroundColors, borderColors, radii, typography } from '@/lib/ui/tokens';
import { cn } from '@/lib/utils';

type RoutineFilterProps = {
  allRoutines: string[];
  selectedRoutines: string[];
  setSelectedRoutines: (routines: string[]) => void;
  selectedLesson?: string;
  lessonRoutines?: string[];
  onLessonSelected?: () => void;
  setDetailedView: (detailedView: boolean) => void;
  detailedView: boolean;
};

export function RoutineFilter({
  allRoutines,
  selectedRoutines,
  setSelectedRoutines,
  selectedLesson,
  lessonRoutines,
  onLessonSelected,
}: RoutineFilterProps) {
  const routinesToShow = selectedLesson && lessonRoutines ? lessonRoutines : allRoutines;

  if (selectedLesson && onLessonSelected) {
    onLessonSelected();
  }

  const handleClick = (routine: string) => {
    if (selectedRoutines.length === routinesToShow.length) {
      setSelectedRoutines([routine]);
    } else if (selectedRoutines.includes(routine)) {
      setSelectedRoutines(selectedRoutines.filter((r) => r !== routine));
    } else {
      setSelectedRoutines([...selectedRoutines, routine]);
    }
  };

  return (
    <div className={spacing.md}>
      <label className={cn(typography.weight.bold, 'mb-1')}>
        Filter by Routine:
      </label>
      <div className="flex flex-wrap gap-2">
        {routinesToShow.map((routine, index) => {
          const isSelected = selectedRoutines.includes(routine);
          const isMLR = /^MLR\d+/.test(routine);
          
          const buttonClasses = cn(
            typography.text.xs,
            typography.weight.medium,
            spacing.sm,
            radii.sm,
            // Selected state
            isSelected
              ? isMLR
                ? cn(backgroundColors.primary, textColors.white, borderColors.primary)
                : cn(backgroundColors.secondary, textColors.white, borderColors.secondary)
              : isMLR
                ? cn(backgroundColors.white, textColors.primary, borderColors.primary)
                : cn(backgroundColors.white, textColors.secondary, borderColors.secondary)
          );

          return (
            <Button
              key={`${routine}-${index}`}
              onClick={() => handleClick(routine)}
              size="sm"
              className={buttonClasses}
            >
              {routine}
            </Button>
          );
        })}

        <Button
          onClick={() => setSelectedRoutines(routinesToShow)}
          size="sm"
          className={cn(
            backgroundColors.surface,
            textColors.white,
            borderColors.surface
          )}
        >
          Select All
        </Button>
      </div>
    </div>
  );
}
