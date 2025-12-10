"use client";

import { UserIcon } from "@heroicons/react/24/solid";
import type { UnitSectionInfo } from "../../../hooks/usePacingData";

interface UnitProgressBarProps {
  unitSections: UnitSectionInfo[];
}

export function UnitProgressBar({ unitSections }: UnitProgressBarProps) {
  if (unitSections.length === 0) return null;

  // Calculate total lessons for proportional sizing
  const totalLessons = unitSections.reduce((sum, s) => sum + s.lessonCount, 0);

  // Set a minimum width percentage so small sections aren't invisible
  const MIN_WIDTH_PERCENT = 8;

  // Calculate widths with minimum constraint
  const sectionsWithWidth = unitSections.map(section => {
    const rawPercent = totalLessons > 0 ? (section.lessonCount / totalLessons) * 100 : 100 / unitSections.length;
    return {
      ...section,
      rawPercent,
    };
  });

  // Adjust widths to ensure minimum visibility while maintaining relative proportions
  const adjustedSections = sectionsWithWidth.map(section => {
    const adjustedPercent = Math.max(section.rawPercent, MIN_WIDTH_PERCENT);
    return {
      ...section,
      adjustedPercent,
    };
  });

  // Normalize so total is 100%
  const totalAdjusted = adjustedSections.reduce((sum, s) => sum + s.adjustedPercent, 0);
  const normalizedSections = adjustedSections.map(section => ({
    ...section,
    finalPercent: (section.adjustedPercent / totalAdjusted) * 100,
  }));

  return (
    <div>
      <div className="flex h-14 rounded-lg overflow-hidden border border-gray-200">
        {normalizedSections.map((section, index) => {
          const isLast = index === normalizedSections.length - 1;

          // Style based on pacing zone - matches the zone card colors
          const getZoneStyles = () => {
            switch (section.zone) {
              case "far-behind":
                return {
                  bg: "bg-red-50",
                  border: "border-red-200",
                  text: "text-red-900 font-semibold",
                  badge: "bg-red-100 text-red-700",
                };
              case "behind":
                return {
                  bg: "bg-yellow-50",
                  border: "border-yellow-200",
                  text: "text-yellow-900 font-semibold",
                  badge: "bg-yellow-100 text-yellow-700",
                };
              case "on-track":
                return {
                  bg: "bg-green-50",
                  border: "border-green-200",
                  text: "text-green-900 font-semibold",
                  badge: "bg-green-100 text-green-700",
                };
              case "ahead":
                return {
                  bg: "bg-sky-50",
                  border: "border-sky-200",
                  text: "text-sky-900 font-semibold",
                  badge: "bg-sky-100 text-sky-700",
                };
              case "far-ahead":
                return {
                  bg: "bg-blue-100",
                  border: "border-blue-300",
                  text: "text-blue-900 font-semibold",
                  badge: "bg-blue-200 text-blue-700",
                };
              default:
                return {
                  bg: "bg-gray-50",
                  border: "border-gray-200",
                  text: "text-gray-700",
                  badge: "bg-gray-200 text-gray-600",
                };
            }
          };

          const styles = getZoneStyles();
          const bgClass = styles.bg;
          const borderClass = styles.border;
          const textClass = styles.text;
          const badgeBgClass = styles.badge;

          return (
            <div
              key={section.sectionId}
              className={`${bgClass} ${!isLast ? `border-r ${borderClass}` : ""} flex flex-col items-center justify-center px-2 py-1`}
              style={{ width: `${section.finalPercent}%` }}
            >
              <span className={`text-sm ${textClass} truncate max-w-full`}>
                {section.sectionName}
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className={`text-[10px] ${badgeBgClass} px-1.5 py-0.5 rounded-full`}>
                  {section.lessonCount} lesson{section.lessonCount !== 1 ? "s" : ""}
                </span>
                {section.studentCount > 0 && (
                  <span className={`text-[10px] ${badgeBgClass} px-1.5 py-0.5 rounded-full flex items-center gap-0.5`}>
                    <UserIcon className="w-2.5 h-2.5" />
                    {section.studentCount}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
