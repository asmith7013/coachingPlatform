'use client';

// import { Switch } from '@components/tailwind/switch';

import React from 'react';
import { Button } from '@/components/ui/button';
import { spacing, textColors } from '@/lib/ui/tokens';

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
      {/* <div className="mb-4 flex items-center gap-3">
        <span className="text-sm font-medium">{detailedView ? 'More Detail' : 'Less Detail'}</span>
        <Switch
          checked={detailedView}
          onChange={setDetailedView}
          color="blue"
        />
      </div> */}
      <label className={`block ${textColors.primary} font-bold mb-1`}>
        Filter by Routine:
      </label>
      <div className="flex flex-wrap gap-2">
        {routinesToShow.map((routine, index) => {
          const selected = selectedRoutines.includes(routine);
          const isMLR = /^MLR\d+/.test(routine);
          const variant = selected ? 'primary' : 'outline';
          return (
            <Button
              key={`${routine}-${index}`}
              onClick={() => handleClick(routine)}
              variant={variant}
              size="sm"
              className={`${isMLR ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-blue-100 text-blue-800 border-blue-300'}`}
            >
              {routine}
            </Button>
          );
        })}
        <Button
          onClick={() => setSelectedRoutines(routinesToShow)}
          variant="outline"
          size="sm"
          className="bg-gray-600 text-white border-gray-300"
        >
          Select All
        </Button>
      </div>
    </div>
  );
}