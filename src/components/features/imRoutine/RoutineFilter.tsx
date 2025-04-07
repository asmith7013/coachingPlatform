'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { spacing, radii, typography } from '@/lib/ui/tokens';
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
    <div className={`${spacing.md} py-0`}>
      <label className={cn(typography.weight.bold)}>
        Filter by Routine:
      </label>
      <div className="flex flex-wrap gap-2 my-2">
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
                ? cn('bg-primary', 'border-2 border-primary')
                : cn('bg-secondary', 'border-2 border-secondary')
              : isMLR
                ? cn('text-gray-900', 'border-2 border-primary')
                : cn('bg-white', 'text-gray-900', 'border-2 border-secondary')
          );

          return (
            <Button
              key={`${routine}-${index}`}
              onClick={() => handleClick(routine)}
              size="sm"
              className={buttonClasses}
              variant = {isSelected
              ? isMLR
                ? 'primary'
                : 'secondary'
              : isMLR
                ? 'outline'
                : 'outline'
              }
            >
              {routine}
            </Button>
          );
        })}

        <Button
          onClick={() => setSelectedRoutines(routinesToShow)}
          size="sm"
          variant="secondary"
          className={cn(
            // borderColors.surface
            'bg-black',
          )}
        >
          Select All
        </Button>
      </div>
    </div>
  );
}
