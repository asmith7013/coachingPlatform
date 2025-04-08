'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/typography/Text';
import { typography } from '@/lib/ui/tokens';
import { cn } from '@/lib/utils';

type RoutineFilterProps = {
  allRoutines: string[];
  selectedRoutines: string[];
  setSelectedRoutines: (routines: string[]) => void;
  selectedLesson?: string;
  lessonRoutines?: string[];
  onLessonSelected?: () => void;
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

  // Sort routines to display MLR routines first
  const sortedRoutines = routinesToShow.sort((a, b) => {
    const isMLRa = /^MLR\d+/.test(a);
    const isMLRb = /^MLR\d+/.test(b);
    if (isMLRa === isMLRb) return 0;
    return isMLRa ? -1 : 1;
  });

  const handleClick = (routine: string) => {
    if (selectedRoutines.length === routinesToShow.length) {
      setSelectedRoutines([routine]);
    } else if (selectedRoutines.includes(routine)) {
      setSelectedRoutines(selectedRoutines.filter((r) => r !== routine));
    } else {
      setSelectedRoutines([...selectedRoutines, routine]);
    }
  };

  const handleSelectAllMLRs = () => {
    const mlrRoutines = sortedRoutines.filter((routine) => /^MLR\d+/.test(routine));
    setSelectedRoutines(mlrRoutines);
  };

  return (
    <div>
      <label className={cn(typography.weight.bold, 'text-text font-bold')}>
        Filter Routines:
      </label>

      {/* Filter Actions */}
      <div className="flex flex-wrap gap-2 mt-2 mb-4">
        <Button
          onClick={() => setSelectedRoutines(sortedRoutines)}
          size="sm"
          variant='text-white bg-secondary-200 focus:ring-3 focus:ring-secondary'
        >
          Select All Routines
        </Button>
        <Button
          onClick={handleSelectAllMLRs}
          size="sm"
          variant='text-white bg-secondary-200 focus:ring-3 focus:ring-primary'
        >
          Select All MLRs
        </Button>
      </div>

      {/* Routine Buttons */}
      <div className="flex flex-wrap gap-2">
        {sortedRoutines.map((routine, index) => {
          const isSelected = selectedRoutines.includes(routine);
          const isMLR = /^MLR\d+/.test(routine);
          
          return (
            <Button
              key={`${routine}-${index}`}
              onClick={() => handleClick(routine)}
              size="sm"
              variant={`${isSelected 
                ? isMLR 
                  ? 'text-white bg-primary focus:ring-primary'
                  : 'text-white bg-secondary focus:ring-secondary'
                : isMLR
                  ? 'text-primary bg-white border-2 border-primary'
                  : 'text-secondary bg-white border-2 border-secondary'
              } focus:ring-2 font-medium`}
            >
              {routine}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
