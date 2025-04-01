'use client';

// import { Switch } from '@components/tailwind/switch';

import React from 'react';
import { Button } from '@/components/ui/button';
import { spacing, 
  // textColors 
} from '@/lib/ui/tokens';
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
      {/* <div className="mb-4 flex items-center gap-3">
        <span className="text-sm font-medium">{detailedView ? 'More Detail' : 'Less Detail'}</span>
        <Switch
          checked={detailedView}
          onChange={setDetailedView}
          color="blue"
        />
      </div> */}
      <label className={`block font-bold mb-1`}>
        Filter by Routine:
      </label>
      <div className="flex flex-wrap gap-2">
        {routinesToShow.map((routine, index) => {
          const isSelected = selectedRoutines.includes(routine);
          const isMLR = /^MLR\d+/.test(routine);
          
          const buttonClasses = cn(
            // Base styles
            "font-medium transition-colors duration-200",
            // Selected state
            isSelected
              ? isMLR
                ? "bg-purple-600 text-white hover:bg-purple-700 border-transparent"
                : "bg-blue-600 text-white hover:bg-blue-700 border-transparent"
              : isMLR
                ? "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200"
                : "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200"
          );

          return (
            <Button
              key={`${routine}-${index}`}
              onClick={() => handleClick(routine)}
              variant={isSelected ? "primary" : "outline"}
              size="sm"
              className={buttonClasses}
            >
              {routine}
            </Button>
          );
        })}
        <Button
          onClick={() => setSelectedRoutines(routinesToShow)}
          // variant="outline"
          size="sm"
          className="bg-gray-600 text-white border-gray-300 hover:bg-gray-700"
        >
          Select All
        </Button>
      </div>
    </div>
  );
}