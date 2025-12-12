"use client";

import type { UnitScheduleLocal, SectionSchedule, SelectionMode } from "./types";
import { UNIT_COLORS } from "./types";

interface UnitCardProps {
  unit: UnitScheduleLocal;
  unitIndex: number;
  selectionMode: SelectionMode;
  calculateSchoolDays: (startDate: string, endDate: string) => number;
  onStartDateSelection: (unitKey: string, sectionId: string, type: "start" | "end") => void;
  onClearSectionDates: (unitKey: string, sectionId: string) => void;
  onUnitDateChange: (unitKey: string, field: "startDate" | "endDate", value: string) => void;
}

export function UnitCard({
  unit,
  unitIndex,
  selectionMode,
  calculateSchoolDays,
  onStartDateSelection,
  onClearSectionDates,
  onUnitDateChange,
}: UnitCardProps) {
  const unitColor = UNIT_COLORS[unitIndex % UNIT_COLORS.length];

  return (
    <div
      className="bg-white rounded-lg shadow overflow-hidden"
      style={{ borderLeft: `4px solid ${unitColor.base}` }}
    >
      {/* Unit Header */}
      <div
        className="px-3 py-2 font-semibold text-sm flex items-center justify-between"
        style={{ backgroundColor: unitColor.light, color: unitColor.base }}
      >
        <span>{unit.unitName}</span>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={unit.startDate || ""}
            onChange={(e) => onUnitDateChange(unit.unitKey, "startDate", e.target.value)}
            className="text-xs px-2 py-1 rounded border border-current/30 bg-white/50"
            style={{ color: unitColor.base }}
            title="Unit Start Date"
          />
          <span className="text-xs">to</span>
          <input
            type="date"
            value={unit.endDate || ""}
            onChange={(e) => onUnitDateChange(unit.unitKey, "endDate", e.target.value)}
            className="text-xs px-2 py-1 rounded border border-current/30 bg-white/50"
            style={{ color: unitColor.base }}
            title="Unit End Date"
          />
        </div>
      </div>

      {/* Sections */}
      <div className="divide-y divide-gray-100">
        {unit.sections.map((section) => (
          <SectionRow
            key={section.sectionId}
            section={section}
            unitKey={unit.unitKey}
            unitColor={unitColor}
            selectionMode={selectionMode}
            calculateSchoolDays={calculateSchoolDays}
            onStartDateSelection={onStartDateSelection}
            onClearSectionDates={onClearSectionDates}
          />
        ))}
      </div>
    </div>
  );
}

interface SectionRowProps {
  section: SectionSchedule;
  unitKey: string;
  unitColor: (typeof UNIT_COLORS)[number];
  selectionMode: SelectionMode;
  calculateSchoolDays: (startDate: string, endDate: string) => number;
  onStartDateSelection: (unitKey: string, sectionId: string, type: "start" | "end") => void;
  onClearSectionDates: (unitKey: string, sectionId: string) => void;
}

function SectionRow({
  section,
  unitKey,
  unitColor,
  selectionMode,
  calculateSchoolDays,
  onStartDateSelection,
  onClearSectionDates,
}: SectionRowProps) {
  const isSelected = selectionMode?.unitKey === unitKey && selectionMode?.sectionId === section.sectionId;
  const isSelectingStart = isSelected && selectionMode?.type === "start";
  const isSelectingEnd = isSelected && selectionMode?.type === "end";
  const allocatedDays =
    section.startDate && section.endDate ? calculateSchoolDays(section.startDate, section.endDate) : null;

  return (
    <div
      className="flex items-center px-3 py-1.5"
      style={{ backgroundColor: isSelected ? unitColor.light : undefined }}
    >
      {/* Section name */}
      <div className="flex-1 text-sm text-gray-700">{section.name}</div>

      {/* Allocated days */}
      <div className="w-14 text-xs text-center">
        {allocatedDays !== null ? (
          <span style={{ color: allocatedDays >= section.lessonCount ? unitColor.base : "#DC2626" }}>
            {allocatedDays} days
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </div>

      {/* Lesson count */}
      <div className="w-16 text-xs text-center text-gray-500">{`${section.lessonCount} Lessons`}</div>

      {/* Start button */}
      <div className="w-20 text-center">
        <button
          onClick={() => onStartDateSelection(unitKey, section.sectionId, "start")}
          className="text-xs px-2 py-1 rounded cursor-pointer"
          style={{
            backgroundColor: isSelectingStart || section.startDate ? unitColor.base : "white",
            color: isSelectingStart || section.startDate ? "white" : unitColor.base,
            border: !isSelectingStart && !section.startDate ? `1px solid ${unitColor.base}` : "1px solid transparent",
          }}
        >
          {section.startDate
            ? new Date(section.startDate + "T12:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "Set Start"}
        </button>
      </div>

      {/* End button */}
      <div className="w-20 text-center">
        <button
          onClick={() => onStartDateSelection(unitKey, section.sectionId, "end")}
          className="text-xs px-2 py-1 rounded cursor-pointer"
          style={{
            backgroundColor: isSelectingEnd || section.endDate ? unitColor.base : "white",
            color: isSelectingEnd || section.endDate ? "white" : unitColor.base,
            border: !isSelectingEnd && !section.endDate ? `1px solid ${unitColor.base}` : "1px solid transparent",
          }}
        >
          {section.endDate
            ? new Date(section.endDate + "T12:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "Set End"}
        </button>
      </div>

      {/* Clear button */}
      <div className="w-6 text-center">
        {(section.startDate || section.endDate) && (
          <button
            onClick={() => onClearSectionDates(unitKey, section.sectionId)}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded p-1 cursor-pointer"
            title="Clear dates"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
