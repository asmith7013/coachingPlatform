"use client";

import { useMemo } from "react";
import { PacingProgressCard } from "@/app/scm/podsie/progress/components/pacing";
import { usePacingData } from "@/app/scm/podsie/progress/hooks/usePacingData";
import { useLessons } from "@/app/scm/podsie/progress/hooks/useLessons";
import { useUnitsAndConfig } from "@/app/scm/podsie/progress/hooks/useUnitsAndConfig";
import { useProgressData } from "@/app/scm/podsie/progress/hooks/useProgressData";
import { getScopeTagForSection } from "@/app/scm/podsie/progress/utils/sectionHelpers";
import type { CurrentUnitInfo } from "@/app/actions/calendar/current-unit";

interface SectionPacingCardProps {
  section: string;
  school: string;
  currentUnitInfo: CurrentUnitInfo | null;
  showStudentNames: boolean;
}

export function SectionPacingCard({
  section,
  school,
  currentUnitInfo,
  showStudentNames,
}: SectionPacingCardProps) {
  const currentUnit = currentUnitInfo?.currentUnit ?? null;

  // Derive scope tag from section
  const scopeSequenceTag = useMemo(() => getScopeTagForSection(section), [section]);

  // Load units and config
  const { sectionConfigAssignments } = useUnitsAndConfig(scopeSequenceTag, section);

  // Load all lessons for the unit (pass 'all' to get everything)
  const { lessons: allLessonsInUnit } = useLessons(
    scopeSequenceTag,
    section,
    currentUnit,
    "all",
    sectionConfigAssignments
  );

  // Load progress data
  const { progressData } = useProgressData(section, currentUnit, allLessonsInUnit);

  // Compute pacing data
  const pacingData = usePacingData(section, currentUnit, allLessonsInUnit, progressData);

  // Build custom header with section badges
  const customHeader = (
    <div className="flex items-center gap-3">
      <h3 className="text-lg font-bold text-gray-900">{section}</h3>
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-600 text-white">
        {school}
      </span>
      {currentUnit !== null ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
          Unit {currentUnit}
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-800">
          No Schedule
        </span>
      )}
    </div>
  );

  // No calendar data case - show placeholder card
  if (!currentUnitInfo || currentUnit === null) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {customHeader}
        <p className="text-gray-500 text-sm mt-4">
          No calendar schedule found for this section. Set up unit dates in the Unit Calendar to enable pacing tracking.
        </p>
      </div>
    );
  }

  return (
    <PacingProgressCard
      pacingData={pacingData}
      selectedUnit={currentUnit}
      showStudentNames={showStudentNames}
      hideToggle={true}
      customHeader={customHeader}
      noScheduleMessage="No pacing schedule found for this section. Set up unit dates in the Unit Calendar to enable pacing tracking."
    />
  );
}
