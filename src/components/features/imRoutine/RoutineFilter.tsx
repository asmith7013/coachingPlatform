'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
// import { Text } from '@/components/ui/typography/Text';
import { typography } from '@/lib/ui/tokens';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type RoutineFilterProps = {
  allRoutines: string[];
  selectedRoutines: string[];
  setSelectedRoutines: (routines: string[]) => void;
  selectedLesson?: string;
  lessonRoutines?: string[];
  onLessonSelected?: () => void;
  version: 'KH' | 'ILC';
  setVersion: (version: 'KH' | 'ILC') => void;
};

export function RoutineFilter({
  allRoutines,
  selectedRoutines,
  setSelectedRoutines,
  selectedLesson,
  lessonRoutines,
  onLessonSelected,
  version,
  setVersion,
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
    if (selectedRoutines.includes(routine)) {
      setSelectedRoutines(selectedRoutines.filter((r) => r !== routine));
    } else {
      setSelectedRoutines([...selectedRoutines, routine]);
    }
  };

  const handleSelectAllMLRs = () => {
    const mlrRoutines = sortedRoutines.filter((routine) => /^MLR\d+/.test(routine));
    setSelectedRoutines(mlrRoutines);
  };

  const handleVersionChange = (newVersion: 'KH' | 'ILC') => {
    setVersion(newVersion);
    setSelectedRoutines([]); // Reset selected routines when changing versions
  };

  return (
    <div className="space-y-6">
      {/* Curriculum Version Toggle */}
      <div>
        <label className={cn(typography.weight.bold, 'text-text mb-2 block')}>
          Currently Viewing:
        </label>
        <div className="flex gap-2">
          <Button
            onClick={() => handleVersionChange('KH')}
            size="sm"
            variant={version === 'KH' ? 'text-white bg-secondary font-bold' : 'text-secondary border-2 border-secondary font-bold'}
          >
            Kendall Hunt
          </Button>
          <Button
            onClick={() => handleVersionChange('ILC')}
            size="sm"
            variant={version === 'ILC' ? 'text-white bg-primary font-bold' : 'text-primary border-2 border-primary font-bold'}
          >
            ILC
          </Button>
        </div>
      </div>

      {/* Routine Filters */}
      <motion.div layout>
        <label className={cn(typography.weight.bold, 'text-text block mb-2')}>
          Filter Routines:
        </label>

        {/* Filter Actions */}
        <motion.div layout className="flex flex-wrap gap-2 mb-6">
          <AnimatePresence mode="popLayout">
            {version === 'KH' && (
              <motion.div
                key="select-all-routines"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  onClick={() => setSelectedRoutines(sortedRoutines)}
                  size="sm"
                  disabled={selectedRoutines.length === sortedRoutines.length}
                  variant={selectedRoutines.length === sortedRoutines.length
                    ? 'bg-secondary text-white opacity-50 cursor-not-allowed'
                    : 'bg-muted-700 text-text border-2 border-secondary'}
                  className="font-bold border-2"
                >
                  Select All Routines
                </Button>
              </motion.div>
            )}

            {/* Select All MLRs Button */}
            {(() => {
              const mlrRoutines = sortedRoutines.filter((routine) => /^MLR\d+/.test(routine));
              const areAllMLRsSelected =
                mlrRoutines.length > 0 &&
                mlrRoutines.every((mlr) => selectedRoutines.includes(mlr));

              return (
                <motion.div
                  key="select-all-mlrs"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    onClick={handleSelectAllMLRs}
                    size="sm"
                    disabled={areAllMLRsSelected || mlrRoutines.length === 0}
                    title={
                      mlrRoutines.length === 0
                        ? 'No MLRs available in this view'
                        : areAllMLRsSelected
                          ? 'All MLRs already selected'
                          : 'Select all MLRs'
                    }
                    variant={areAllMLRsSelected || mlrRoutines.length === 0
                      ? 'bg-primary text-white border-2 opacity-50 border-white'
                      : 'bg-primary-900 text-primary border-2 border-primary'}
                    className="font-bold border-2"
                  >
                    Select All MLRs
                  </Button>
                </motion.div>
              );
            })()}

            {/* Deselect All */}
            <motion.div
              key="deselect-all"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                onClick={() => setSelectedRoutines([])}
                size="sm"
                disabled={selectedRoutines.length === 0}
                variant={selectedRoutines.length === 0
                  ? 'bg-muted-300 text-white opacity-50 cursor-not-allowed'
                  : 'bg-muted-800 text-text border-2 border-secondary'}
                className="font-bold border-2"
              >
                Deselect All
              </Button>
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <label className={cn(typography.weight.bold, 'text-text block mb-2')}>
          Quick Select:
        </label>
        {/* Animated Routine Buttons */}
        <motion.div layout className="flex flex-wrap gap-2">
          <AnimatePresence initial={false}>
            {sortedRoutines.map((routine, index) => {
              const isSelected = selectedRoutines.includes(routine);
              const isMLR = /^MLR\d+/.test(routine);

              return (
                <motion.div
                  key={`${routine}-${index}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <Button
                    onClick={() => handleClick(routine)}
                    size="sm"
                    variant={`${isSelected
                      ? isMLR
                        ? 'text-white bg-primary focus:ring-primary'
                        : 'text-white bg-secondary focus:ring-secondary'
                      : isMLR
                        ? 'text-white bg-primary-800 border-2 border-primary'
                        : 'text-white bg-secondary-800 border-2 border-secondary'
                    } focus:ring-2 font-medium`}
                  >
                    {routine}
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
