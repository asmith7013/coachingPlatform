"use client";

import React, { useState } from "react";
import { Button } from "@/components/core/Button";
// import { Text } from '@/components/core/typography/Text';
import { typography } from "@/lib/tokens/typography";
import { cn } from "@ui/utils/formatters";
import { motion, AnimatePresence } from "framer-motion";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

type RoutineFilterProps = {
  allRoutines: string[];
  selectedRoutines: string[];
  setSelectedRoutines: (routines: string[]) => void;
  selectedLesson?: string;
  lessonRoutines?: string[];
  onLessonSelected?: () => void;
  version: "KH" | "ILC";
  setVersion: (version: "KH" | "ILC") => void;
};

export function RoutineFilter({
  allRoutines,
  selectedRoutines,
  setSelectedRoutines,
  version,
  setVersion,
  // Intentionally unused props
  selectedLesson: _selectedLesson,
  lessonRoutines: _lessonRoutines,
  onLessonSelected: _onLessonSelected,
}: RoutineFilterProps) {
  const [hasManuallyFiltered, setHasManuallyFiltered] = useState(false);

  // Sort routines to display MLR routines first
  const sortedRoutines = allRoutines.sort((a, b) => {
    const isMLRa = /^MLR\d+/.test(a);
    const isMLRb = /^MLR\d+/.test(b);
    if (isMLRa === isMLRb) return 0;
    return isMLRa ? -1 : 1;
  });

  const handleClick = (routine: string) => {
    if (!hasManuallyFiltered) {
      setHasManuallyFiltered(true);
      setSelectedRoutines([routine]);
      return;
    }

    if (selectedRoutines.includes(routine)) {
      setSelectedRoutines(selectedRoutines.filter((r) => r !== routine));
    } else {
      setSelectedRoutines([...selectedRoutines, routine]);
    }
  };

  const handleSelectAllMLRs = () => {
    setHasManuallyFiltered(true);
    const mlrRoutines = sortedRoutines.filter((routine) =>
      /^MLR\d+/.test(routine),
    );
    setSelectedRoutines(mlrRoutines);
  };

  const handleVersionChange = (newVersion: "KH" | "ILC") => {
    setVersion(newVersion);
    setSelectedRoutines([]); // Reset selected routines when changing versions
    setHasManuallyFiltered(false);
  };

  return (
    <div className="space-y-6">
      {/* Curriculum Version Toggle */}
      <div>
        <motion.label
          layout
          className={cn(typography.weight.bold, "text-text block mb-2")}
        >
          Currently Viewing:
        </motion.label>

        <div className="flex gap-2">
          <Button
            onClick={() => handleVersionChange("KH")}
            textSize="sm"
            padding="sm"
            intent="secondary"
            appearance={version === "KH" ? "solid" : "outline"}
          >
            Kendall Hunt
          </Button>
          <Button
            onClick={() => handleVersionChange("ILC")}
            textSize="sm"
            padding="sm"
            intent="primary"
            appearance={version === "ILC" ? "solid" : "outline"}
          >
            ILC
          </Button>
        </div>
      </div>

      {/* Routine Filters */}
      <motion.div layout>
        <motion.label
          layout
          className={cn(typography.weight.bold, "text-text block mb-2")}
        >
          Filter All:
        </motion.label>
        {/* Filter Actions */}
        <motion.div layout className="flex flex-wrap gap-2 mb-6">
          <AnimatePresence mode="popLayout">
            {version === "KH" && (
              <motion.div
                key="select-all-routines"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  onClick={() => {
                    setHasManuallyFiltered(true);
                    setSelectedRoutines(sortedRoutines);
                  }}
                  textSize="sm"
                  padding="sm"
                  disabled={
                    selectedRoutines.length === sortedRoutines.length &&
                    hasManuallyFiltered
                  }
                  intent="secondary"
                  appearance={
                    selectedRoutines.length === sortedRoutines.length &&
                    hasManuallyFiltered
                      ? "outline"
                      : "solid"
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    {selectedRoutines.length !== sortedRoutines.length &&
                      hasManuallyFiltered && (
                        // <CheckIcon className="h-4 w-4 shrink-0 text-white" />
                        <CheckIcon className="w-4 h-4 min-w-4 min-h-4 text-white align-middle" />
                      )}
                    <span>Select All Routines</span>
                  </span>
                </Button>
              </motion.div>
            )}

            {/* Select All MLRs Button */}
            {(() => {
              const mlrRoutines = sortedRoutines.filter((routine) =>
                /^MLR\d+/.test(routine),
              );
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
                    textSize="sm"
                    padding="sm"
                    disabled={areAllMLRsSelected && hasManuallyFiltered}
                    title={
                      mlrRoutines.length === 0
                        ? "No MLRs available in this view"
                        : areAllMLRsSelected && hasManuallyFiltered
                          ? "All MLRs already selected"
                          : "Select all MLRs"
                    }
                    intent="primary"
                    appearance={
                      areAllMLRsSelected && hasManuallyFiltered
                        ? "outline"
                        : "solid"
                    }
                  >
                    <span className="inline-flex items-center gap-2">
                      {!areAllMLRsSelected && hasManuallyFiltered && (
                        <CheckIcon className="h-4 w-4 shrink-0 text-white" />
                      )}
                      <span>Select All MLRs</span>
                    </span>
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
                onClick={() => {
                  setHasManuallyFiltered(true);
                  setSelectedRoutines([]);
                }}
                textSize="sm"
                padding="sm"
                disabled={selectedRoutines.length === 0}
                intent="secondary"
                appearance={selectedRoutines.length === 0 ? "outline" : "solid"}
              >
                <span className="inline-flex items-center gap-2">
                  {selectedRoutines.length > 0 && hasManuallyFiltered && (
                    <XMarkIcon className="h-4 w-4 shrink-0 text-white" />
                  )}
                  <span>Deselect All</span>
                </span>
              </Button>
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <motion.label
          layout
          className={cn(typography.weight.bold, "text-text block mb-2")}
        >
          Filter Routines:
        </motion.label>
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
                    textSize="sm"
                    padding="sm"
                    intent={isMLR ? "primary" : "secondary"}
                    appearance={
                      isSelected && hasManuallyFiltered ? "solid" : "outline"
                    }
                    className="justify-start text-left"
                  >
                    <span className="inline-flex items-center gap-2">
                      {isSelected && hasManuallyFiltered && (
                        <CheckIcon className="h-4 w-4 shrink-0 text-white" />
                      )}
                      <span>{routine}</span>
                    </span>
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
