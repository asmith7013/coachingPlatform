"use client";

import { useState } from "react";
import { CheckCircleIcon, UserGroupIcon, PresentationChartLineIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon as CheckCircleOutlineIcon, UserGroupIcon as UserGroupOutlineIcon } from "@heroicons/react/24/outline";

// Outline version of PresentationChartLineIcon (not available in heroicons)
function PresentationChartLineOutlineIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
    </svg>
  );
}
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
  /** Whether to exclude Ramp Ups from the view */
  excludeRampUps?: boolean;
  /** Callback when excludeRampUps toggle changes */
  onExcludeRampUpsChange?: (value: boolean) => void;
}

export function PacingProgressCard({
  pacingData,
  selectedUnit,
  showStudentNames: externalShowStudentNames,
  hideToggle = false,
  customHeader,
  noScheduleMessage,
  excludeRampUps = false,
  onExcludeRampUpsChange,
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
      {/* Title row with toggles */}
      <div className="flex items-center justify-between mb-2">
        {customHeader || (
          <h3 className="text-lg font-semibold text-gray-900">Unit {selectedUnit} Pace &amp; Progress</h3>
        )}
        {!hideToggle && (
          <div className="flex items-center gap-4">
            <ToggleSwitch
              checked={showStudentNames}
              onChange={setInternalShowStudentNames}
              label="Show Details"
            />
            {onExcludeRampUpsChange && (
              <ToggleSwitch
                checked={excludeRampUps}
                onChange={onExcludeRampUpsChange}
                label="Exclude Ramp Ups"
              />
            )}
          </div>
        )}
      </div>
      {/* Key row - only show when student names are shown */}
      {!hideToggle && showStudentNames && (
        <div className="flex items-center gap-6 text-xs text-gray-500 mb-4">
          <span className="font-semibold text-gray-700">Key:</span>
          {/* Mastery Check */}
          <span className="flex items-center gap-1.5">
            <span>Mastery:</span>
            <CheckCircleIcon className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-gray-400">Today</span>
            <CheckCircleOutlineIcon className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-gray-400">Yesterday</span>
          </span>
          <span className="text-gray-300">|</span>
          {/* Small Group */}
          <span className="flex items-center gap-1.5">
            <span>Small Group:</span>
            <UserGroupIcon className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-gray-400">Today</span>
            <UserGroupOutlineIcon className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-gray-400">Yesterday</span>
          </span>
          <span className="text-gray-300">|</span>
          {/* Inquiry */}
          <span className="flex items-center gap-1.5">
            <span>Inquiry:</span>
            <PresentationChartLineIcon className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-gray-400">Today</span>
            <PresentationChartLineOutlineIcon className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-gray-400">Yesterday</span>
          </span>
        </div>
      )}
      {/* Spacer when key is not shown */}
      {(!showStudentNames || hideToggle) && <div className="mb-2" />}

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
