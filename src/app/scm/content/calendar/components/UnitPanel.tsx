"use client";

import React from "react";
import { Spinner } from "@/components/core/feedback/Spinner";
import type {
  SectionConfigOption,
  SelectionMode,
  LessonForSubsection,
} from "../../calendar-old/components";
import type { UnitScheduleLocal } from "../../calendar-old/components/types";
import { SimplifiedUnitView } from "./SimplifiedUnitView";

interface UnitPanelProps {
  isContentLoading: boolean;
  isLoadingGradeData: boolean;
  pendingSectionKey: string | null;
  sectionConfigsLength: number;
  selectedSection: SectionConfigOption | null;
  selectedUnit: UnitScheduleLocal | null;
  selectedUnitIndex: number;
  selectionMode: SelectionMode;
  calculateSchoolDays: (startDate: string, endDate: string) => number;
  onOpenSubsections: (
    unitKey: string,
    sectionId: string,
    sectionName: string,
    lessons: LessonForSubsection[],
  ) => void;
  onStartDateSelection: (
    unitKey: string,
    sectionId: string,
    type: "start" | "end",
    subsection?: number,
  ) => void;
  onClearSectionDates: (
    unitKey: string,
    sectionId: string,
    subsection?: number,
  ) => void;
  onUnitDateChange: (
    unitKey: string,
    field: "startDate" | "endDate",
    value: string,
  ) => void;
  onAddLesson: () => void;
}

export function UnitPanel({
  isContentLoading,
  isLoadingGradeData,
  pendingSectionKey,
  sectionConfigsLength,
  selectedSection,
  selectedUnit,
  selectedUnitIndex,
  selectionMode,
  calculateSchoolDays,
  onOpenSubsections,
  onStartDateSelection,
  onClearSectionDates,
  onUnitDateChange,
  onAddLesson,
}: UnitPanelProps) {
  return (
    <div className="w-1/3 p-4 overflow-y-auto border-r border-gray-200 relative">
      {(isContentLoading ||
        (pendingSectionKey && sectionConfigsLength === 0)) && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-blue-600">
            <Spinner size="sm" variant="primary" />
            <span className="text-sm font-medium">
              {isLoadingGradeData
                ? "Loading grade data..."
                : pendingSectionKey
                  ? "Restoring selection..."
                  : "Loading schedules..."}
            </span>
          </div>
        </div>
      )}

      {!selectedSection && !pendingSectionKey ? (
        <div className="h-full">
          <div className="bg-white rounded-lg shadow-md p-8 h-full flex flex-col items-center justify-center text-center">
            <svg
              className="w-12 h-12 mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-lg font-medium text-gray-900 mb-2">
              Select a Class Section
            </p>
            <p className="text-sm text-gray-500 max-w-xs">
              Choose a grade and class section from the dropdown above to view
              and edit the unit schedule.
            </p>
          </div>
        </div>
      ) : selectedSection && selectedUnit ? (
        <SimplifiedUnitView
          unit={selectedUnit}
          unitIndex={selectedUnitIndex}
          selectionMode={selectionMode}
          calculateSchoolDays={calculateSchoolDays}
          onOpenSubsections={onOpenSubsections}
          onStartDateSelection={onStartDateSelection}
          onClearSectionDates={onClearSectionDates}
          onUnitDateChange={onUnitDateChange}
          onAddLesson={onAddLesson}
        />
      ) : (
        <div className="h-full" />
      )}
    </div>
  );
}
