"use client";

import { useState } from "react";
import { CheckCircleIcon, UserGroupIcon, PresentationChartLineIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon as CheckCircleOutlineIcon } from "@heroicons/react/24/outline";
import type { PacingData } from "../../hooks/usePacingData";
// import { PacingZoneCard } from "./components/PacingZoneCard";
import { UnitProgressBar } from "./components/UnitProgressBar";
import { ToggleSwitch } from "@/components/core/fields/ToggleSwitch";

interface PacingProgressCardProps {
  pacingData: PacingData;
  selectedUnit: number;
  /** Optional: externally controlled showStudentNames state */
  showStudentNames?: boolean;
  /** Optional: hide the internal toggle (when controlled externally) */
  hideToggle?: boolean;
  /** Optional: custom header content (replaces default title) */
  customHeader?: React.ReactNode;
  /** Optional: message to show when no schedule data exists */
  noScheduleMessage?: string;
}

export function PacingProgressCard({
  pacingData,
  selectedUnit,
  showStudentNames: externalShowStudentNames,
  hideToggle = false,
  customHeader,
  noScheduleMessage,
}: PacingProgressCardProps) {
  const { students, unitSections, completedStudents, loading, error, noScheduleData, expectedSection } = pacingData;
  const [internalShowStudentNames, setInternalShowStudentNames] = useState(false);

  // Use external state if provided, otherwise use internal state
  const showStudentNames = externalShowStudentNames ?? internalShowStudentNames;

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
        {customHeader || <h3 className="text-lg font-semibold text-gray-900 mb-2">Pacing Progress</h3>}
        <p className="text-gray-500 text-sm">
          {noScheduleMessage || "No pacing schedule found for this unit. Set up section dates in the unit schedule to enable pacing tracking."}
        </p>
      </div>
    );
  }

  if (!expectedSection) {
    return null;
  }

  const completeCount = completedStudents?.count ?? 0;
  const totalStudents = students.farBehind.length + students.behind.length + students.onTrack.length + students.ahead.length + students.farAhead.length + completeCount;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      {/* Title row with toggle */}
      <div className="flex items-center justify-between mb-4">
        {customHeader || (
          <h3 className="text-lg font-semibold text-gray-900">Unit {selectedUnit} Pace &amp; Progress</h3>
        )}
        {!hideToggle && (
          <div className="flex items-center gap-4">
            {/* Icons key - only show when student names are shown */}
            {showStudentNames && (
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="font-semibold text-gray-700">Key:</span>
                {/* Activity type icons */}
                <span className="flex items-center gap-1">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-gray-500" />
                  <span>Mastery Check</span>
                </span>
                <span className="flex items-center gap-1">
                  <UserGroupIcon className="w-3.5 h-3.5 text-gray-500" />
                  <span>Small Group</span>
                </span>
                <span className="flex items-center gap-1">
                  <PresentationChartLineIcon className="w-3.5 h-3.5 text-gray-500" />
                  <span>Inquiry</span>
                </span>
                {/* Today/Yesterday distinction */}
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-green-600" />
                  <span>Today</span>
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircleOutlineIcon className="w-3.5 h-3.5 text-green-600" />
                  <span>Yesterday</span>
                </span>
              </div>
            )}
            <ToggleSwitch
              checked={showStudentNames}
              onChange={setInternalShowStudentNames}
              label="Show Details"
            />
          </div>
        )}
      </div>

      {/* Unit Progress Bar */}
      <div className="mb-6">
        <UnitProgressBar unitSections={unitSections} completedStudents={completedStudents} showStudentNames={showStudentNames} />
      </div>

      {/* Five zones - commented out for now
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
      */}

      {/* Summary bar */}
      {totalStudents > 0 && (() => {
        const farBehindPercent = Math.round((students.farBehind.length / totalStudents) * 100);
        const behindPercent = Math.round((students.behind.length / totalStudents) * 100);
        const onPacePercent = Math.round((students.onTrack.length / totalStudents) * 100);
        const aheadPercent = Math.round((students.ahead.length / totalStudents) * 100);
        const farAheadPercent = Math.round((students.farAhead.length / totalStudents) * 100);
        const completePercent = Math.round((completeCount / totalStudents) * 100);

        // Determine which segments are first and last for rounded corners
        const segments = [
          { percent: farBehindPercent, bg: "bg-red-50", border: "border-red-500", text: "text-red-700" },
          { percent: behindPercent, bg: "bg-yellow-50", border: "border-yellow-500", text: "text-yellow-700" },
          { percent: onPacePercent, bg: "bg-green-50", border: "border-green-500", text: "text-green-700" },
          { percent: aheadPercent, bg: "bg-sky-50", border: "border-sky-500", text: "text-sky-700" },
          { percent: farAheadPercent, bg: "bg-blue-100", border: "border-blue-600", text: "text-blue-700" },
          { percent: completePercent, bg: "bg-purple-100", border: "border-purple-500", text: "text-purple-700" },
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
