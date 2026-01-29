"use client";

import React, { useRef } from "react";
import type {
  UnitScheduleLocal,
  SectionSchedule,
  SelectionMode,
  LessonForSubsection,
} from "../../calendar-old/components/types";

// Distinct color palette for individual sections/subsections within a unit
export const SECTION_COLORS = [
  { base: "#2563EB", light: "#DBEAFE", border: "#93C5FD" }, // blue
  { base: "#059669", light: "#D1FAE5", border: "#6EE7B7" }, // green
  { base: "#D97706", light: "#FEF3C7", border: "#FCD34D" }, // amber
  { base: "#7C3AED", light: "#EDE9FE", border: "#C4B5FD" }, // purple
  { base: "#DB2777", light: "#FCE7F3", border: "#F9A8D4" }, // pink
  { base: "#0891B2", light: "#CFFAFE", border: "#67E8F9" }, // cyan
  { base: "#EA580C", light: "#FFEDD5", border: "#FDBA74" }, // orange
  { base: "#0D9488", light: "#CCFBF1", border: "#5EEAD4" }, // teal
];

function getSectionColor(index: number) {
  return SECTION_COLORS[index % SECTION_COLORS.length];
}

interface SimplifiedUnitViewProps {
  unit: UnitScheduleLocal;
  unitIndex: number;
  selectionMode: SelectionMode;
  calculateSchoolDays: (startDate: string, endDate: string) => number;
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
  onOpenSubsections?: (
    unitKey: string,
    sectionId: string,
    sectionName: string,
    lessons: LessonForSubsection[],
  ) => void;
  onAddLesson?: () => void;
}

// A flat display entry: each section or subsection gets its own row with its own color
interface DisplayEntry {
  section: SectionSchedule;
  label: string;
  lessons: LessonForSubsection[];
  colorIndex: number;
  // For subsections: reference to all lessons in the parent section (for subsections button)
  parentSectionId: string;
  allParentLessons: LessonForSubsection[];
  isSplit: boolean;
}

export function SimplifiedUnitView({
  unit,
  unitIndex: _unitIndex,
  selectionMode,
  calculateSchoolDays,
  onStartDateSelection,
  onClearSectionDates,
  onUnitDateChange,
  onOpenSubsections,
  onAddLesson,
}: SimplifiedUnitViewProps) {
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  // Build flat list: each section/subsection is its own entry with its own color
  const entries: DisplayEntry[] = [];
  const seenSectionIds = new Set<string>();
  let colorIdx = 0;

  for (const section of unit.sections) {
    if (!seenSectionIds.has(section.sectionId)) {
      seenSectionIds.add(section.sectionId);

      const sectionsForId = unit.sections.filter(
        (s) => s.sectionId === section.sectionId,
      );
      const allLessons = sectionsForId
        .flatMap((s) => s.lessons || [])
        .sort((a, b) => a.lessonNumber - b.lessonNumber);
      const isSplit = sectionsForId.length > 1;
      const baseName = section.name
        .replace(/ \(Part \d+\)$/, "")
        .replace(/ \(Unassigned\)$/, "");

      if (isSplit) {
        // Each subsection becomes its own entry with its own color
        for (const sub of sectionsForId) {
          const subLabel =
            sub.subsection !== undefined
              ? `${baseName} - Part ${sub.subsection}`
              : `${baseName} - Unassigned`;
          entries.push({
            section: sub,
            label: subLabel,
            lessons: sub.lessons || [],
            colorIndex: colorIdx,
            parentSectionId: section.sectionId,
            allParentLessons: allLessons,
            isSplit: true,
          });
          colorIdx++;
        }
      } else {
        entries.push({
          section,
          label: baseName,
          lessons: section.lessons || [],
          colorIndex: colorIdx,
          parentSectionId: section.sectionId,
          allParentLessons: allLessons,
          isSplit: false,
        });
        colorIdx++;
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border-l-4 border-gray-400">
      {/* Unit Header */}
      <div className="px-4 py-3 font-semibold text-sm flex items-center justify-between bg-gray-600 text-white">
        <span>{unit.unitName}</span>
        <div className="flex items-center gap-1.5 text-xs font-normal">
          <button
            type="button"
            onClick={() => startDateRef.current?.showPicker()}
            className="px-1.5 py-0.5 rounded border border-gray-500 bg-gray-500 text-white min-w-[60px] text-center cursor-pointer"
          >
            {unit.startDate
              ? new Date(unit.startDate + "T12:00:00").toLocaleDateString(
                  "en-US",
                  { month: "2-digit", day: "2-digit" },
                )
              : "mm/dd"}
          </button>
          <input
            ref={startDateRef}
            type="date"
            value={unit.startDate || ""}
            onChange={(e) =>
              onUnitDateChange(unit.unitKey, "startDate", e.target.value)
            }
            className="sr-only"
            title="Unit Start Date"
          />
          <span className="text-gray-300">to</span>
          <button
            type="button"
            onClick={() => endDateRef.current?.showPicker()}
            className="px-1.5 py-0.5 rounded border border-gray-500 bg-gray-500 text-white min-w-[60px] text-center cursor-pointer"
          >
            {unit.endDate
              ? new Date(unit.endDate + "T12:00:00").toLocaleDateString(
                  "en-US",
                  { month: "2-digit", day: "2-digit" },
                )
              : "mm/dd"}
          </button>
          <input
            ref={endDateRef}
            type="date"
            value={unit.endDate || ""}
            onChange={(e) =>
              onUnitDateChange(unit.unitKey, "endDate", e.target.value)
            }
            className="sr-only"
            title="Unit End Date"
          />
        </div>
      </div>

      {/* Unit context row */}
      <div className="px-4 py-1.5 bg-gray-200 border-b border-gray-300 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-3">
          <span>
            {unit.sections.reduce(
              (sum, s) => sum + (s.lessons?.length || 0),
              0,
            )}{" "}
            lessons
          </span>
          <span className="text-gray-300">·</span>
          <span>
            {new Set(unit.sections.map((s) => s.sectionId)).size} sections
          </span>
          {unit.startDate && unit.endDate && (
            <>
              <span className="text-gray-300">·</span>
              <span>
                {calculateSchoolDays(unit.startDate, unit.endDate)} school days
              </span>
            </>
          )}
        </div>
        {onAddLesson && (
          <button
            onClick={onAddLesson}
            className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded cursor-pointer"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Lesson
          </button>
        )}
      </div>

      {/* Show prompt if no start date set yet */}
      {!unit.startDate ? (
        <div className="px-4 py-6 text-center text-sm text-gray-400">
          Select a start date above to view sections
        </div>
      ) : (
        /* Flat list of sections/subsections */
        <div className="space-y-0">
          {entries.map((entry) => {
            const color = getSectionColor(entry.colorIndex);
            const { section } = entry;
            const isRampUp =
              section.sectionId === "Ramp Up" ||
              section.sectionId === "Ramp Ups";

            const isSelected =
              selectionMode?.unitKey === unit.unitKey &&
              selectionMode?.sectionId === section.sectionId &&
              selectionMode?.subsection === section.subsection;
            const isSelectingStart =
              isSelected && selectionMode?.type === "start";
            const isSelectingEnd = isSelected && selectionMode?.type === "end";

            const allocatedDays =
              section.startDate && section.endDate
                ? calculateSchoolDays(section.startDate, section.endDate)
                : null;

            return (
              <div
                key={`${section.sectionId}-${section.subsection ?? "main"}`}
                className="border-b border-gray-100 last:border-b-0"
              >
                {/* Section/Subsection Header */}
                <div
                  className="px-4 py-2 flex items-center justify-between"
                  style={{ backgroundColor: color.light }}
                >
                  <span
                    className="font-medium text-sm"
                    style={{ color: color.base }}
                  >
                    {entry.label}
                  </span>
                  {onOpenSubsections &&
                    entry.allParentLessons.length > 0 &&
                    !entry.isSplit && (
                      <button
                        onClick={() =>
                          onOpenSubsections(
                            unit.unitKey,
                            entry.parentSectionId,
                            `Section ${entry.parentSectionId}`,
                            entry.allParentLessons,
                          )
                        }
                        className="text-[10px] px-2 py-0.5 rounded cursor-pointer whitespace-nowrap"
                        style={{
                          backgroundColor: "white",
                          color: color.base,
                          border: `1px solid ${color.base}`,
                        }}
                      >
                        + Subsections
                      </button>
                    )}
                  {onOpenSubsections &&
                    entry.allParentLessons.length > 0 &&
                    entry.isSplit && (
                      <button
                        onClick={() =>
                          onOpenSubsections(
                            unit.unitKey,
                            entry.parentSectionId,
                            `Section ${entry.parentSectionId}`,
                            entry.allParentLessons,
                          )
                        }
                        className="text-[10px] px-2 py-0.5 rounded cursor-pointer whitespace-nowrap"
                        style={{
                          backgroundColor: color.base,
                          color: "white",
                          border: `1px solid ${color.base}`,
                        }}
                      >
                        Edit Subsections
                      </button>
                    )}
                </div>

                <div className="px-4 py-2">
                  {/* Lessons */}
                  {entry.lessons.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {entry.lessons.map((lesson, index) => (
                        <span
                          key={lesson.scopeAndSequenceId}
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: color.light,
                            color: color.base,
                          }}
                          title={lesson.lessonName}
                        >
                          {isRampUp
                            ? `Ramp Up ${index + 1}`
                            : `Lesson ${lesson.lessonNumber}`}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Date row */}
                  <div
                    className="flex items-center gap-2 py-1 rounded px-1"
                    style={{
                      backgroundColor: isSelected ? color.light : undefined,
                    }}
                  >
                    {/* Days */}
                    <span
                      className="text-xs min-w-[55px]"
                      style={{
                        color:
                          allocatedDays !== null &&
                          allocatedDays >= section.lessonCount
                            ? color.base
                            : allocatedDays !== null
                              ? "#DC2626"
                              : "#9CA3AF",
                      }}
                    >
                      {allocatedDays !== null
                        ? `${allocatedDays}d / ${section.lessonCount}L`
                        : `- / ${section.lessonCount}L`}
                    </span>

                    {/* Start button */}
                    <button
                      onClick={() =>
                        onStartDateSelection(
                          unit.unitKey,
                          section.sectionId,
                          "start",
                          section.subsection,
                        )
                      }
                      className="text-xs px-2 py-1 rounded cursor-pointer whitespace-nowrap"
                      style={{
                        backgroundColor:
                          isSelectingStart || section.startDate
                            ? color.base
                            : "white",
                        color:
                          isSelectingStart || section.startDate
                            ? "white"
                            : color.base,
                        border:
                          !isSelectingStart && !section.startDate
                            ? `1px solid ${color.base}`
                            : "1px solid transparent",
                      }}
                    >
                      {section.startDate
                        ? new Date(
                            section.startDate + "T12:00:00",
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "Start"}
                    </button>

                    <span className="text-gray-400 text-xs">→</span>

                    {/* End button */}
                    <button
                      onClick={() =>
                        onStartDateSelection(
                          unit.unitKey,
                          section.sectionId,
                          "end",
                          section.subsection,
                        )
                      }
                      className="text-xs px-2 py-1 rounded cursor-pointer whitespace-nowrap"
                      style={{
                        backgroundColor:
                          isSelectingEnd || section.endDate
                            ? color.base
                            : "white",
                        color:
                          isSelectingEnd || section.endDate
                            ? "white"
                            : color.base,
                        border:
                          !isSelectingEnd && !section.endDate
                            ? `1px solid ${color.base}`
                            : "1px solid transparent",
                      }}
                    >
                      {section.endDate
                        ? new Date(
                            section.endDate + "T12:00:00",
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "End"}
                    </button>

                    {/* Clear button */}
                    {(section.startDate || section.endDate) && (
                      <button
                        onClick={() =>
                          onClearSectionDates(
                            unit.unitKey,
                            section.sectionId,
                            section.subsection,
                          )
                        }
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded p-0.5 cursor-pointer"
                        title="Clear dates"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
