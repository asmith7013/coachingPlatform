"use client";

import type { PacingData } from "../../hooks/usePacingData";
import { PacingZoneCard } from "./components/PacingZoneCard";
import { UnitProgressBar } from "./components/UnitProgressBar";

interface PacingProgressCardProps {
  pacingData: PacingData;
  selectedUnit: number;
}

export function PacingProgressCard({ pacingData, selectedUnit }: PacingProgressCardProps) {
  const { students, unitSections, sectionLessonCounts, loading, error, noScheduleData, expectedSection } = pacingData;

  if (loading) {
    return (
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-5 gap-4">
            <div className="h-32 bg-gray-100 rounded"></div>
            <div className="h-32 bg-gray-100 rounded"></div>
            <div className="h-32 bg-gray-100 rounded"></div>
            <div className="h-32 bg-gray-100 rounded"></div>
            <div className="h-32 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  if (noScheduleData) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Pacing Progress</h3>
        <p className="text-gray-500 text-sm">
          No pacing schedule found for this unit. Set up section dates in the unit schedule to enable pacing tracking.
        </p>
      </div>
    );
  }

  if (!expectedSection) {
    return null;
  }

  const totalStudents = students.farBehind.length + students.behind.length + students.onTrack.length + students.ahead.length + students.farAhead.length;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      {/* Header with Unit Progress Bar */}
      <div className="flex items-center gap-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 whitespace-nowrap">Unit {selectedUnit} Pacing Progress</h3>
        <div className="flex-1">
          <UnitProgressBar unitSections={unitSections} />
        </div>
      </div>

      {/* Five zones */}
      <div className="grid grid-cols-5 gap-3">
        <PacingZoneCard
          title="Far Behind"
          sectionInfo={sectionLessonCounts.farBehind}
          students={students.farBehind}
          color="red"
          showSectionBadge
        />
        <PacingZoneCard
          title="Previous Section"
          sectionInfo={sectionLessonCounts.behind}
          students={students.behind}
          color="yellow"
        />
        <PacingZoneCard
          title="On Pace"
          sectionInfo={sectionLessonCounts.onTrack}
          students={students.onTrack}
          color="green"
        />
        <PacingZoneCard
          title="Next Section"
          sectionInfo={sectionLessonCounts.ahead}
          students={students.ahead}
          color="sky"
        />
        <PacingZoneCard
          title="Far Ahead"
          sectionInfo={sectionLessonCounts.farAhead}
          students={students.farAhead}
          color="blue"
          showSectionBadge
        />
      </div>

      {/* Summary bar */}
      {totalStudents > 0 && (() => {
        const farBehindPercent = Math.round((students.farBehind.length / totalStudents) * 100);
        const behindPercent = Math.round((students.behind.length / totalStudents) * 100);
        const onPacePercent = Math.round((students.onTrack.length / totalStudents) * 100);
        const aheadPercent = Math.round((students.ahead.length / totalStudents) * 100);
        const farAheadPercent = Math.round((students.farAhead.length / totalStudents) * 100);

        // Determine which segments are first and last for rounded corners
        const segments = [
          { percent: farBehindPercent, bg: "bg-red-50", border: "border-red-500", text: "text-red-700" },
          { percent: behindPercent, bg: "bg-yellow-50", border: "border-yellow-500", text: "text-yellow-700" },
          { percent: onPacePercent, bg: "bg-green-50", border: "border-green-500", text: "text-green-700" },
          { percent: aheadPercent, bg: "bg-sky-50", border: "border-sky-500", text: "text-sky-700" },
          { percent: farAheadPercent, bg: "bg-blue-100", border: "border-blue-600", text: "text-blue-700" },
        ].filter(s => s.percent > 0);

        return (
          <div className="mt-4">
            <div className="flex h-6">
              {segments.map((segment, index) => {
                const isFirst = index === 0;
                const isLast = index === segments.length - 1;
                const roundedClass = isFirst && isLast
                  ? "rounded-full"
                  : isFirst
                    ? "rounded-l-full"
                    : isLast
                      ? "rounded-r-full"
                      : "";
                return (
                  <div
                    key={index}
                    className={`${segment.bg} border ${segment.border} ${roundedClass} flex items-center justify-center`}
                    style={{ width: `${segment.percent}%` }}
                  >
                    <span className={`text-xs ${segment.text} font-bold whitespace-nowrap overflow-hidden`}>
                      {segment.percent}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
