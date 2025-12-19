"use client";

import type { UnitSectionInfo, CompletedStudentInfo } from "../../hooks/usePacingData";
import { ZONE_ORDER, ZONE_LABELS } from "./components/zone-styles";
import { ColumnHeader } from "./components/ColumnHeader";
import { ColumnSectionRow } from "./components/ColumnSectionRow";
import { ColumnLessonsRow } from "./components/ColumnLessonsRow";
import { ColumnStudentNamesRow } from "./components/ColumnStudentNamesRow";
import type { ColumnConfig } from "./components/types";

interface UnitProgressBarProps {
  unitSections: UnitSectionInfo[];
  completedStudents?: CompletedStudentInfo;
  showStudentNames?: boolean;
}

// Calculate proportional column widths from sections
function calculateColumnWidths(sectionsByZone: Map<string, UnitSectionInfo[]>, totalLessons: number) {
  const MIN_WIDTH_PERCENT = 8;

  const zonesWithWidth = Array.from(sectionsByZone.entries()).map(([zone, sections]) => {
    const zoneLessons = sections.reduce((sum, s) => sum + s.lessonCount, 0);
    const rawPercent = totalLessons > 0 ? (zoneLessons / totalLessons) * 100 : 100 / sectionsByZone.size;
    return {
      zone,
      sections,
      adjustedPercent: Math.max(rawPercent, MIN_WIDTH_PERCENT),
    };
  });

  const totalAdjusted = zonesWithWidth.reduce((sum, z) => sum + z.adjustedPercent, 0);
  return zonesWithWidth.map(z => ({
    ...z,
    finalPercent: (z.adjustedPercent / totalAdjusted) * 100,
  }));
}

// Build column configs from sections and completed students
function buildColumnConfigs(
  unitSections: UnitSectionInfo[],
  completedStudents: CompletedStudentInfo | undefined
): ColumnConfig[] {
  const hasCompletedStudents = completedStudents && completedStudents.count > 0;

  // Group sections by zone
  const sectionsByZone = new Map<string, UnitSectionInfo[]>();
  for (const zone of ZONE_ORDER) {
    const zoneSections = unitSections.filter(s => s.zone === zone);
    if (zoneSections.length > 0) {
      sectionsByZone.set(zone, zoneSections);
    }
  }

  const totalLessons = unitSections.reduce((sum, s) => sum + s.lessonCount, 0);
  const normalizedZones = calculateColumnWidths(sectionsByZone, totalLessons);

  // Build zone column configs
  const columnConfigs: ColumnConfig[] = normalizedZones.map((zoneData, index) => {
    const totalStudents = zoneData.sections.reduce((sum, s) => sum + s.studentCount, 0);
    const zoneStudentNames = zoneData.sections
      .flatMap(s => s.lessons?.flatMap(l => l.studentNames || []) || [])
      .filter((name, idx, arr) => arr.indexOf(name) === idx);

    return {
      zone: zoneData.zone,
      width: zoneData.finalPercent,
      isFixedWidth: false,
      isLastColumn: index === normalizedZones.length - 1 && !hasCompletedStudents,
      sections: zoneData.sections,
      headerLabel: ZONE_LABELS[zoneData.zone],
      totalStudents,
      studentNames: zoneStudentNames,
      isCompleteColumn: false,
    };
  });

  // Add complete column if there are completed students
  if (hasCompletedStudents) {
    columnConfigs.push({
      zone: "complete",
      width: "120px",
      isFixedWidth: true,
      isLastColumn: true,
      sections: [],
      totalStudents: completedStudents!.count,
      studentNames: completedStudents!.studentNames,
      isCompleteColumn: true,
      completedStudents: completedStudents!.students,
    });
  }

  return columnConfigs;
}

export function UnitProgressBar({
  unitSections,
  completedStudents,
  showStudentNames = false,
}: UnitProgressBarProps) {
  if (unitSections.length === 0) return null;

  const columnConfigs = buildColumnConfigs(unitSections, completedStudents);

  return (
    <div>
      {/* Zone header row */}
      <div className="flex h-7 rounded-t-lg overflow-hidden border border-gray-200 border-b-0">
        {columnConfigs.map((config) => (
          <ColumnHeader
            key={`header-${config.zone}`}
            config={config}
          />
        ))}
      </div>

      {/* Section names row */}
      <div className="flex h-12 border border-gray-200 border-t-0 border-b-0">
        {columnConfigs.map((config) => (
          <ColumnSectionRow
            key={`sections-${config.zone}`}
            config={config}
          />
        ))}
      </div>

      {/* Lessons sub-bar */}
      <div className={`flex h-auto min-h-[1.75rem] overflow-hidden border border-gray-200 border-t-0 ${!showStudentNames ? 'rounded-b-lg' : ''}`}>
        {columnConfigs.map((config) => (
          <ColumnLessonsRow
            key={`lessons-${config.zone}`}
            config={config}
            showStudentNames={showStudentNames}
          />
        ))}
      </div>

      {/* Student names sub-bar (only when toggle is on) */}
      {showStudentNames && (
        <div className="flex h-auto rounded-b-lg overflow-hidden border border-gray-200 border-t-0">
          {columnConfigs.map((config) => (
            <ColumnStudentNamesRow
              key={`names-${config.zone}`}
              config={config}
            />
          ))}
        </div>
      )}
    </div>
  );
}
