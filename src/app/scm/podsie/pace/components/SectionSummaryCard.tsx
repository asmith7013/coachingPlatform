"use client";

import { useMemo, useEffect } from "react";
import { UserIcon } from "@heroicons/react/24/solid";
import { usePacingData } from "@/app/scm/podsie/progress/hooks/usePacingData";
import { useLessons } from "@/app/scm/podsie/progress/hooks/useLessons";
import { useUnitsAndConfig } from "@/app/scm/podsie/progress/hooks/useUnitsAndConfig";
import { useProgressData } from "@/app/scm/podsie/progress/hooks/useProgressData";
import { getScopeTagForSection } from "@/app/scm/podsie/progress/utils/sectionHelpers";
import type { CurrentUnitInfo } from "@/app/actions/calendar/current-unit";

export interface PaceZoneCounts {
  farBehind: number;
  behind: number;
  onTrack: number;
  ahead: number;
  farAhead: number;
  complete: number;
}

interface SectionSummaryCardProps {
  section: string;
  school: string;
  currentUnitInfo: CurrentUnitInfo | null;
  /** Optional callback to report student counts when data loads */
  onCountsLoaded?: (sectionId: string, counts: PaceZoneCounts) => void;
}

export function SectionSummaryCard({
  section,
  school,
  currentUnitInfo,
  onCountsLoaded,
}: SectionSummaryCardProps) {
  const currentUnit = currentUnitInfo?.currentUnit ?? null;

  // Derive scope tag from section
  const scopeSequenceTag = useMemo(() => getScopeTagForSection(section), [section]);

  // Load units and config
  const { sectionConfigAssignments, loading: loadingConfig } = useUnitsAndConfig(
    scopeSequenceTag,
    section
  );

  // Load all lessons for the unit
  const { lessons: allLessonsInUnit, loading: loadingLessons } = useLessons(
    scopeSequenceTag,
    section,
    currentUnit,
    "all",
    sectionConfigAssignments
  );

  // Load progress data
  const { progressData, loading: loadingProgress } = useProgressData(
    section,
    currentUnit,
    allLessonsInUnit
  );

  // Compute pacing data
  const pacingData = usePacingData(section, currentUnit, allLessonsInUnit, progressData);

  const isLoading = loadingConfig || loadingLessons || loadingProgress || pacingData.loading;

  const { students, completedStudents } = pacingData;

  // Extract counts as primitives to stabilize useEffect dependencies
  const farBehindCount = students.farBehind.length;
  const behindCount = students.behind.length;
  const onTrackCount = students.onTrack.length;
  const aheadCount = students.ahead.length;
  const farAheadCount = students.farAhead.length;
  const completeCount = completedStudents?.count ?? 0;

  // Report counts to parent when data loads (must be before any early returns)
  useEffect(() => {
    if (onCountsLoaded && !isLoading && currentUnitInfo && currentUnit !== null) {
      onCountsLoaded(section, {
        farBehind: farBehindCount,
        behind: behindCount,
        onTrack: onTrackCount,
        ahead: aheadCount,
        farAhead: farAheadCount,
        complete: completeCount,
      });
    }
  }, [onCountsLoaded, section, isLoading, currentUnitInfo, currentUnit, farBehindCount, behindCount, onTrackCount, aheadCount, farAheadCount, completeCount]);

  // No calendar data case
  if (!currentUnitInfo || currentUnit === null) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">{section}</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-600 text-white">
            {school}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
            No Schedule
          </span>
        </div>
        <p className="text-sm text-gray-500">No calendar schedule configured</p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">{section}</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-600 text-white">
            {school}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            Unit {currentUnit}
          </span>
        </div>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  const totalStudents =
    students.farBehind.length +
    students.behind.length +
    students.onTrack.length +
    students.ahead.length +
    students.farAhead.length +
    completeCount;

  // Calculate percentages
  const farBehindPercent = totalStudents > 0 ? Math.round((students.farBehind.length / totalStudents) * 100) : 0;
  const behindPercent = totalStudents > 0 ? Math.round((students.behind.length / totalStudents) * 100) : 0;
  const onTrackPercent = totalStudents > 0 ? Math.round((students.onTrack.length / totalStudents) * 100) : 0;
  const aheadPercent = totalStudents > 0 ? Math.round((students.ahead.length / totalStudents) * 100) : 0;
  const farAheadPercent = totalStudents > 0 ? Math.round((students.farAhead.length / totalStudents) * 100) : 0;
  const completePercent = totalStudents > 0 ? Math.round((completeCount / totalStudents) * 100) : 0;

  const segments = [
    { percent: farBehindPercent, count: students.farBehind.length, bg: "bg-red-50", border: "border-red-500", text: "text-red-700", dot: "bg-red-500", label: "Far Behind" },
    { percent: behindPercent, count: students.behind.length, bg: "bg-yellow-50", border: "border-yellow-500", text: "text-yellow-700", dot: "bg-yellow-500", label: "Previous Section" },
    { percent: onTrackPercent, count: students.onTrack.length, bg: "bg-green-50", border: "border-green-500", text: "text-green-700", dot: "bg-green-500", label: "On Pace" },
    { percent: aheadPercent, count: students.ahead.length, bg: "bg-sky-50", border: "border-sky-500", text: "text-sky-700", dot: "bg-sky-500", label: "Next Section" },
    { percent: farAheadPercent, count: students.farAhead.length, bg: "bg-blue-100", border: "border-blue-600", text: "text-blue-700", dot: "bg-blue-600", label: "Far Ahead" },
    { percent: completePercent, count: completeCount, bg: "bg-purple-100", border: "border-purple-500", text: "text-purple-700", dot: "bg-purple-500", label: "Complete" },
  ].filter(s => s.percent > 0);

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg font-bold text-gray-900">{section}</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-600 text-white">
          {school}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          Unit {currentUnit}
        </span>
      </div>

      {/* Progress Bar */}
      {totalStudents > 0 ? (
        <>
          {/* Percentage bar */}
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
                  className={`${segment.bg} border ${segment.border} ${roundedClass} flex items-center justify-center overflow-hidden`}
                  style={{ width: `${segment.percent}%` }}
                  title={`${segment.label}: ${segment.count} (${segment.percent}%)`}
                >
                  {segment.percent >= 8 && (
                    <span className={`text-[10px] ${segment.text} font-bold whitespace-nowrap`}>
                      {segment.percent}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {/* Student counts row below bar */}
          <div className="flex mt-1">
            {segments.map((segment, index) => (
              <div
                key={index}
                className="flex items-center justify-center"
                style={{ width: `${segment.percent}%` }}
              >
                <span className={`flex items-center gap-0.5 text-[10px] ${segment.text}`}>
                  <UserIcon className={`w-2.5 h-2.5 ${segment.dot.replace('bg-', 'text-')}`} />
                  {segment.count}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-500">No student data available</p>
      )}
    </div>
  );
}
