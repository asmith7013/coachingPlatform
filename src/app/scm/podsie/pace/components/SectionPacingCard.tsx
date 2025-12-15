"use client";

import { useMemo, useState } from "react";
import { PacingProgressCard } from "@/app/scm/podsie/progress/components/pacing";
import { usePacingData } from "@/app/scm/podsie/progress/hooks/usePacingData";
import { useLessons } from "@/app/scm/podsie/progress/hooks/useLessons";
import { useUnitsAndConfig } from "@/app/scm/podsie/progress/hooks/useUnitsAndConfig";
import { useProgressData } from "@/app/scm/podsie/progress/hooks/useProgressData";
import { getScopeTagForSection } from "@/app/scm/podsie/progress/utils/sectionHelpers";
import { ToggleSwitch } from "@/components/core/fields/ToggleSwitch";
import type { CurrentUnitInfo } from "@/app/actions/calendar/current-unit";

interface SectionPacingCardProps {
  section: string;
  school: string;
  currentUnitInfo: CurrentUnitInfo | null;
  /** Special population classifications (e.g., ICT, 12-1-1, MLL) */
  specialPopulations?: string[];
}

// Badge styling for special populations
const SPECIAL_POP_BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  'ICT': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  '12-1-1': { bg: 'bg-teal-100', text: 'text-teal-800' },
  'MLL': { bg: 'bg-orange-100', text: 'text-orange-800' },
};

export function SectionPacingCard({
  section,
  school,
  currentUnitInfo,
  specialPopulations,
}: SectionPacingCardProps) {
  const [showStudentNames, setShowStudentNames] = useState(false);
  const [excludeRampUps, setExcludeRampUps] = useState(false);
  const [hideEmptySections, setHideEmptySections] = useState(false);
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
  const pacingData = usePacingData(section, currentUnit, allLessonsInUnit, progressData, excludeRampUps, undefined, hideEmptySections);

  // Build custom header with section badges and toggles
  const customHeader = (
    <div className="flex items-center justify-between w-full">
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
        {specialPopulations?.map((pop) => {
          const style = SPECIAL_POP_BADGE_STYLES[pop] || { bg: 'bg-gray-100', text: 'text-gray-800' };
          return (
            <span key={pop} className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${style.bg} ${style.text}`}>
              {pop}
            </span>
          );
        })}
      </div>
      <div className="flex items-center gap-4">
        <ToggleSwitch
          checked={showStudentNames}
          onChange={setShowStudentNames}
          label="Show Details"
        />
        <ToggleSwitch
          checked={excludeRampUps}
          onChange={setExcludeRampUps}
          label="Exclude Ramp Ups"
        />
        <ToggleSwitch
          checked={hideEmptySections}
          onChange={setHideEmptySections}
          label="Hide Empty Sections"
        />
      </div>
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
