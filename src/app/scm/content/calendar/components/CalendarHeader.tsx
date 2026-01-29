"use client";

import React from "react";
import { DocumentDuplicateIcon, PlusIcon } from "@heroicons/react/24/outline";
import type {
  SectionConfigOption,
  SelectionMode,
} from "../../calendar-old/components";
import type { UnitScheduleLocal } from "../../calendar-old/components/types";
import { GRADE_OPTIONS } from "../hooks/useCalendarState";

interface CalendarHeaderProps {
  schoolYear: string;
  isMutating: boolean;
  selectionMode: SelectionMode;
  selectedGrade: string;
  onGradeChange: (grade: string) => void;
  selectedSection: SectionConfigOption | null;
  onSectionChange: (section: SectionConfigOption | null) => void;
  matchingSections: SectionConfigOption[];
  unitSchedules: UnitScheduleLocal[];
  selectedUnitIndex: number;
  onUnitIndexChange: (index: number) => void;
  onCancelSelection: () => void;
  onShowCopyModal: () => void;
  onShowAddDayOff: () => void;
}

export function CalendarHeader({
  schoolYear,
  isMutating,
  selectionMode,
  selectedGrade,
  onGradeChange,
  selectedSection,
  onSectionChange,
  matchingSections,
  unitSchedules,
  selectedUnitIndex,
  onUnitIndexChange,
  onCancelSelection,
  onShowCopyModal,
  onShowAddDayOff,
}: CalendarHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Unit Calendar by Section
          </h1>
          <p className="text-sm text-gray-500">
            {schoolYear} School Year
            {isMutating && (
              <span className="ml-2 text-blue-600">Saving...</span>
            )}
            {selectionMode && (
              <span className="ml-2 text-green-600">
                Click a date to set {selectionMode.type} for Section{" "}
                {selectionMode.sectionId}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Grade selector */}
          <select
            value={selectedGrade}
            onChange={(e) => {
              onGradeChange(e.target.value);
              onSectionChange(null);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer"
          >
            {GRADE_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>

          {/* Section selector */}
          <select
            disabled={matchingSections.length === 0}
            value={
              selectedSection
                ? `${selectedSection.school}|${selectedSection.classSection}`
                : ""
            }
            onChange={(e) => {
              if (e.target.value === "") {
                onSectionChange(null);
              } else {
                const [school, classSection] = e.target.value.split("|");
                const section = matchingSections.find(
                  (s) => s.school === school && s.classSection === classSection,
                );
                onSectionChange(section || null);
              }
            }}
            className={`px-3 py-2 border border-gray-300 rounded-lg text-sm ${matchingSections.length === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <option value="">Select a class section...</option>
            {matchingSections.map((s) => (
              <option
                key={`${s.school}|${s.classSection}`}
                value={`${s.school}|${s.classSection}`}
              >
                {s.school} - {s.classSection}
                {s.teacher ? ` (${s.teacher})` : ""}
              </option>
            ))}
          </select>

          {/* Unit selector */}
          <select
            disabled={!selectedSection || unitSchedules.length === 0}
            value={selectedUnitIndex}
            onChange={(e) => onUnitIndexChange(Number(e.target.value))}
            className={`px-3 py-2 border border-gray-300 rounded-lg text-sm max-w-[320px] truncate ${!selectedSection || unitSchedules.length === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {unitSchedules.length === 0 && (
              <option value={0}>Select a unit...</option>
            )}
            {unitSchedules.map((u, i) => (
              <option key={u.unitKey} value={i}>
                {u.unitName}
              </option>
            ))}
          </select>

          {/* Copy button */}
          {matchingSections.length > 1 && (
            <button
              disabled={!selectedSection}
              onClick={onShowCopyModal}
              className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg ${!selectedSection ? "bg-blue-50/50 text-blue-400 opacity-50 cursor-not-allowed" : "bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"}`}
              title="Copy schedule from another section"
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
              Copy
            </button>
          )}

          {/* + Event button */}
          <button
            disabled={!selectedSection}
            onClick={onShowAddDayOff}
            className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg ${!selectedSection ? "bg-amber-50/50 text-amber-400 opacity-50 cursor-not-allowed" : "bg-amber-50 text-amber-700 hover:bg-amber-100 cursor-pointer"}`}
            title="Add an event for this section"
          >
            <PlusIcon className="h-4 w-4" />
            Event
          </button>

          {selectionMode && (
            <button
              onClick={onCancelSelection}
              className="px-3 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
            >
              Cancel Selection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
