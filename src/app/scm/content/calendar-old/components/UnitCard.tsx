"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import type { UnitScheduleLocal, SectionSchedule, SelectionMode, LessonForSubsection } from "./types";
import { UNIT_COLORS } from "./types";

interface UnitCardProps {
  unit: UnitScheduleLocal;
  unitIndex: number;
  selectionMode: SelectionMode;
  calculateSchoolDays: (startDate: string, endDate: string) => number;
  onStartDateSelection: (unitKey: string, sectionId: string, type: "start" | "end", subsection?: number) => void;
  onClearSectionDates: (unitKey: string, sectionId: string, subsection?: number) => void;
  onUnitDateChange: (unitKey: string, field: "startDate" | "endDate", value: string) => void;
  onOpenSubsections?: (unitKey: string, sectionId: string, sectionName: string, lessons: LessonForSubsection[]) => void;
}

// Display row can be either a parent row (section header) or a section row (actual data)
type DisplayRow =
  | { isParentRow: true; sectionId: string; sectionName: string; allLessons: LessonForSubsection[] }
  | (SectionSchedule & { isParentRow: false; isChildRow: boolean });

export function UnitCard({
  unit,
  unitIndex,
  selectionMode,
  calculateSchoolDays,
  onStartDateSelection,
  onClearSectionDates,
  onUnitDateChange,
  onOpenSubsections,
}: UnitCardProps) {
  const unitColor = UNIT_COLORS[unitIndex % UNIT_COLORS.length];

  // Transform sections into display rows with parent rows for split sections
  const displayRows = useMemo(() => {
    const rows: DisplayRow[] = [];
    const processedSectionIds = new Set<string>();

    unit.sections.forEach((section) => {
      if (processedSectionIds.has(section.sectionId)) return;
      processedSectionIds.add(section.sectionId);

      const sectionsForId = unit.sections.filter(s => s.sectionId === section.sectionId);
      const allLessons = sectionsForId
        .flatMap((s) => s.lessons || [])
        .sort((a, b) => a.lessonNumber - b.lessonNumber);
      const isSplit = sectionsForId.length > 1;

      // Get base section name (without Part X or Unassigned suffix)
      const baseName = section.name
        .replace(/ \(Part \d+\)$/, "")
        .replace(/ \(Unassigned\)$/, "");

      if (isSplit) {
        // Add parent row
        rows.push({
          isParentRow: true,
          sectionId: section.sectionId,
          sectionName: baseName,
          allLessons,
        });
        // Add child rows (the actual subsection data)
        sectionsForId.forEach(s => {
          rows.push({ ...s, isParentRow: false, isChildRow: true });
        });
      } else {
        // Single section - show normally
        rows.push({ ...section, isParentRow: false, isChildRow: false });
      }
    });

    return rows;
  }, [unit.sections]);

  const columns = useMemo<ColumnDef<DisplayRow>[]>(
    () => [
      // Column 1: Section title
      {
        id: "section",
        header: "Section",
        size: 160,
        cell: ({ row }) => {
          const data = row.original;

          if (data.isParentRow) {
            // Parent row - just show section name
            return (
              <span className="font-medium text-gray-700 text-sm">{data.sectionName}</span>
            );
          }

          // Child row or normal row
          const section = data as SectionSchedule & { isChildRow: boolean };
          const baseName = section.name
            .replace(/ \(Part \d+\)$/, "")
            .replace(/ \(Unassigned\)$/, "");

          if (section.isChildRow) {
            // Indented child row - show Part badge only
            return (
              <div className="flex items-center gap-1.5 pl-4">
                {section.subsection !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">
                    Part {section.subsection}
                  </span>
                )}
                {section.subsection === undefined && section.name.includes("(Unassigned)") && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-500">
                    Unassigned
                  </span>
                )}
              </div>
            );
          }

          // Normal row (non-split section)
          return (
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-700 text-sm">{baseName}</span>
            </div>
          );
        },
      },
      // Column 2: Lessons
      {
        id: "lessons",
        header: "Lessons",
        cell: ({ row }) => {
          const data = row.original;

          // Parent rows don't show lessons
          if (data.isParentRow) {
            return null;
          }

          const section = data as SectionSchedule;
          if (!section.lessons || section.lessons.length === 0) {
            return <span className="text-gray-400 text-xs">-</span>;
          }

          // For Ramp Up lessons (lessonNumber 0), show RU1, RU2, etc. based on position
          const isRampUp = section.sectionId === "Ramp Up" || section.sectionId === "Ramp Ups";

          return (
            <div className="flex flex-wrap gap-0.5">
              {section.lessons.map((lesson, index) => (
                <span
                  key={lesson.scopeAndSequenceId}
                  className="text-[10px] px-1 py-0.5 rounded"
                  style={{
                    backgroundColor: unitColor.light,
                    color: unitColor.base,
                  }}
                  title={lesson.lessonName}
                >
                  {isRampUp ? `RU${index + 1}` : `L${lesson.lessonNumber}`}
                </span>
              ))}
            </div>
          );
        },
      },
      // Column 3: Subsections button (left-aligned)
      {
        id: "subsections",
        header: "",
        size: 110,
        cell: ({ row }) => {
          const data = row.original;

          if (data.isParentRow) {
            // Parent row - always show Subsections button
            if (!onOpenSubsections || data.allLessons.length === 0) return null;

            return (
              <button
                onClick={() => onOpenSubsections(unit.unitKey, data.sectionId, `Section ${data.sectionId}`, data.allLessons)}
                className="text-[10px] px-1.5 py-0.5 rounded cursor-pointer whitespace-nowrap"
                style={{
                  backgroundColor: unitColor.base,
                  color: "white",
                  border: `1px solid ${unitColor.base}`,
                }}
                title="Manage subsections"
              >
                Edit Subsections
              </button>
            );
          }

          // Child rows don't show subsections button
          const section = data as SectionSchedule & { isChildRow: boolean };
          if (section.isChildRow) {
            return null;
          }

          // Normal row - show + Subsections button
          if (!onOpenSubsections) return null;
          const allLessons = unit.sections
            .filter((s) => s.sectionId === section.sectionId)
            .flatMap((s) => s.lessons || [])
            .sort((a, b) => a.lessonNumber - b.lessonNumber);
          if (allLessons.length === 0) return null;

          return (
            <button
              onClick={() => onOpenSubsections(unit.unitKey, section.sectionId, `Section ${section.sectionId}`, allLessons)}
              className="text-[10px] px-1.5 py-0.5 rounded cursor-pointer whitespace-nowrap"
              style={{
                backgroundColor: "white",
                color: unitColor.base,
                border: `1px solid ${unitColor.base}`,
              }}
              title="Manage subsections"
            >
              + Subsections
            </button>
          );
        },
      },
      // Column 4: Days (allocated / lesson count)
      {
        id: "days",
        header: "Days",
        size: 70,
        cell: ({ row }) => {
          const data = row.original;

          // Parent rows don't show days
          if (data.isParentRow) {
            return null;
          }

          const section = data as SectionSchedule;
          const allocatedDays =
            section.startDate && section.endDate
              ? calculateSchoolDays(section.startDate, section.endDate)
              : null;

          return (
            <div className="text-xs whitespace-nowrap">
              {allocatedDays !== null ? (
                <span style={{ color: allocatedDays >= section.lessonCount ? unitColor.base : "#DC2626" }}>
                  {allocatedDays}d / {section.lessonCount}L
                </span>
              ) : (
                <span className="text-gray-400">- / {section.lessonCount}L</span>
              )}
            </div>
          );
        },
      },
      // Column 5: Dates (Start + End + Clear)
      {
        id: "dates",
        header: "Dates",
        size: 180,
        cell: ({ row }) => {
          const data = row.original;

          // Parent rows don't show dates
          if (data.isParentRow) {
            return null;
          }

          const section = data as SectionSchedule;
          const isSelected =
            selectionMode?.unitKey === unit.unitKey &&
            selectionMode?.sectionId === section.sectionId &&
            selectionMode?.subsection === section.subsection;
          const isSelectingStart = isSelected && selectionMode?.type === "start";
          const isSelectingEnd = isSelected && selectionMode?.type === "end";

          return (
            <div className="flex items-center gap-1.5">
              {/* Start button */}
              <button
                onClick={() => onStartDateSelection(unit.unitKey, section.sectionId, "start", section.subsection)}
                className="text-xs px-2 py-1 rounded cursor-pointer whitespace-nowrap"
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
                  : "Start"}
              </button>

              <span className="text-gray-400 text-xs">→</span>

              {/* End button */}
              <button
                onClick={() => onStartDateSelection(unit.unitKey, section.sectionId, "end", section.subsection)}
                className="text-xs px-2 py-1 rounded cursor-pointer whitespace-nowrap"
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
                  : "End"}
              </button>

              {/* Clear button */}
              {(section.startDate || section.endDate) && (
                <button
                  onClick={() => onClearSectionDates(unit.unitKey, section.sectionId, section.subsection)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded p-0.5 cursor-pointer"
                  title="Clear dates"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [unit.unitKey, unit.sections, unitColor, selectionMode, calculateSchoolDays, onStartDateSelection, onClearSectionDates, onOpenSubsections]
  );

  const table = useReactTable({
    data: displayRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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

      {/* Sections Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: header.column.getSize() !== 150 ? header.column.getSize() : undefined }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.map((row) => {
              const data = row.original;
              const isParent = data.isParentRow;

              // For selection highlighting on child/normal rows
              let isSelected = false;
              if (!isParent) {
                const section = data as SectionSchedule;
                isSelected =
                  selectionMode?.unitKey === unit.unitKey &&
                  selectionMode?.sectionId === section.sectionId &&
                  selectionMode?.subsection === section.subsection;
              }

              return (
                <tr
                  key={row.id}
                  style={{
                    backgroundColor: isSelected ? unitColor.light : "white",
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2.5 align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
