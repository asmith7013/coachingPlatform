"use client";

import { UserIcon, TrophyIcon } from "@heroicons/react/24/solid";
import { Tooltip } from "@/components/core/feedback/Tooltip";
import type { UnitSectionInfo, CompletedStudentInfo } from "../../../hooks/usePacingData";

// Format date as "M/D" (e.g., "12/8")
function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

interface UnitProgressBarProps {
  unitSections: UnitSectionInfo[];
  completedStudents?: CompletedStudentInfo;
  showStudentNames?: boolean;
}

// Zone order and labels
const ZONE_ORDER = ["far-behind", "behind", "on-track", "ahead", "far-ahead"] as const;
const ZONE_LABELS: Record<string, string> = {
  "far-behind": "Far Behind",
  "behind": "Previous Section",
  "on-track": "On Pace",
  "ahead": "Next Section",
  "far-ahead": "Far Ahead",
};

export function UnitProgressBar({ unitSections, completedStudents, showStudentNames = false }: UnitProgressBarProps) {
  if (unitSections.length === 0) return null;

  // Group sections by zone
  const sectionsByZone = new Map<string, typeof unitSections>();
  for (const zone of ZONE_ORDER) {
    const zoneSections = unitSections.filter(s => s.zone === zone);
    if (zoneSections.length > 0) {
      sectionsByZone.set(zone, zoneSections);
    }
  }

  // Calculate total lessons for proportional sizing
  const totalLessons = unitSections.reduce((sum, s) => sum + s.lessonCount, 0);

  // Set a minimum width percentage so small zones aren't invisible
  const MIN_WIDTH_PERCENT = 8;

  // Calculate zone widths based on total lessons in each zone
  const zonesWithWidth = Array.from(sectionsByZone.entries()).map(([zone, sections]) => {
    const zoneLessons = sections.reduce((sum, s) => sum + s.lessonCount, 0);
    const rawPercent = totalLessons > 0 ? (zoneLessons / totalLessons) * 100 : 100 / sectionsByZone.size;
    return {
      zone,
      sections,
      rawPercent,
      adjustedPercent: Math.max(rawPercent, MIN_WIDTH_PERCENT),
    };
  });

  // Normalize so total is 100%
  const totalAdjusted = zonesWithWidth.reduce((sum, z) => sum + z.adjustedPercent, 0);
  const normalizedZones = zonesWithWidth.map(z => ({
    ...z,
    finalPercent: (z.adjustedPercent / totalAdjusted) * 100,
  }));

  // Helper to get zone styles
  const getZoneStyles = (zone: string | null) => {
    switch (zone) {
      case "far-behind":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-900 font-semibold",
          badge: "bg-red-100 text-red-700",
          studentBadge: "bg-red-600 text-white",
          lessonIcon: "text-red-500",
          headerBg: "bg-red-100",
        };
      case "behind":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-900 font-semibold",
          badge: "bg-yellow-100 text-yellow-700",
          studentBadge: "bg-yellow-500 text-white",
          lessonIcon: "text-yellow-600",
          headerBg: "bg-yellow-100",
        };
      case "on-track":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-900 font-semibold",
          badge: "bg-green-100 text-green-700",
          studentBadge: "bg-green-600 text-white",
          lessonIcon: "text-green-600",
          headerBg: "bg-green-100",
        };
      case "ahead":
        return {
          bg: "bg-sky-50",
          border: "border-sky-200",
          text: "text-sky-900 font-semibold",
          badge: "bg-sky-100 text-sky-700",
          studentBadge: "bg-sky-600 text-white",
          lessonIcon: "text-sky-600",
          headerBg: "bg-sky-100",
        };
      case "far-ahead":
        return {
          bg: "bg-blue-100",
          border: "border-blue-300",
          text: "text-blue-900 font-semibold",
          badge: "bg-blue-200 text-blue-700",
          studentBadge: "bg-blue-600 text-white",
          lessonIcon: "text-blue-600",
          headerBg: "bg-blue-200",
        };
      case "complete":
        return {
          bg: "bg-purple-100",
          border: "border-purple-300",
          text: "text-purple-900 font-semibold",
          badge: "bg-purple-200 text-purple-800",
          studentBadge: "bg-purple-600 text-white",
          lessonIcon: "text-purple-600",
          headerBg: "bg-purple-200",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-700",
          badge: "bg-gray-200 text-gray-600",
          studentBadge: "bg-gray-600 text-white",
          lessonIcon: "text-gray-500",
          headerBg: "bg-gray-100",
        };
    }
  };

  // Build tooltip content for a section
  const getTooltipContent = (section: UnitSectionInfo) => {
    const hasDateRange = section.startDate && section.endDate;
    return (
      <div className="space-y-1">
        <div><strong>{section.lessonCount}</strong> lessons</div>
        {section.dayCount > 0 && <div><strong>{section.dayCount}</strong> school days</div>}
        {hasDateRange && (
          <div>{formatShortDate(section.startDate!)} – {formatShortDate(section.endDate!)}</div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Zone header row */}
      <div className="flex h-7 rounded-t-lg overflow-hidden border border-gray-200 border-b-0">
        {normalizedZones.map((zoneData, index) => {
          const isLast = index === normalizedZones.length - 1 && !completedStudents;
          const styles = getZoneStyles(zoneData.zone);
          const totalStudents = zoneData.sections.reduce((sum, s) => sum + s.studentCount, 0);

          // Get dot color for zone
          const getDotColor = (zone: string) => {
            switch (zone) {
              case "far-behind": return "bg-red-500";
              case "behind": return "bg-yellow-500";
              case "on-track": return "bg-green-500";
              case "ahead": return "bg-sky-500";
              case "far-ahead": return "bg-blue-600";
              default: return "bg-gray-500";
            }
          };

          return (
            <div
              key={`header-${zoneData.zone}`}
              className={`${styles.headerBg} ${!isLast ? `border-r ${styles.border}` : ""} flex items-center justify-between px-3`}
              style={{ width: `${zoneData.finalPercent}%` }}
            >
              <div className="flex items-center">
                <span className={`w-2.5 h-2.5 rounded-full ${getDotColor(zoneData.zone)} mr-2 flex-shrink-0`} />
                <span className={`text-sm ${styles.text} truncate`}>
                  {ZONE_LABELS[zoneData.zone]}
                </span>
              </div>
              {totalStudents > 0 && (
                <span className={`text-[10px] ${styles.studentBadge} px-1.5 py-0.5 rounded-full flex items-center gap-0.5 flex-shrink-0`}>
                  <UserIcon className="w-2.5 h-2.5" />
                  {totalStudents}
                </span>
              )}
            </div>
          );
        })}
        {/* Complete column header */}
        {completedStudents && (
          <div
            className={`${getZoneStyles("complete").headerBg} flex items-center justify-center px-2 border-l ${getZoneStyles("complete").border}`}
            style={{ width: "80px", flexShrink: 0 }}
          >
            <TrophyIcon className={`w-4 h-4 ${getZoneStyles("complete").lessonIcon}`} />
            {completedStudents.count > 0 && (
              <span className={`ml-1.5 text-[10px] ${getZoneStyles("complete").studentBadge} px-1.5 py-0.5 rounded-full flex items-center gap-0.5 flex-shrink-0`}>
                <UserIcon className="w-2.5 h-2.5" />
                {completedStudents.count}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Section names row */}
      <div className="flex h-12 border border-gray-200 border-t-0 border-b-0">
        {normalizedZones.map((zoneData, zoneIndex) => {
          const isLastZone = zoneIndex === normalizedZones.length - 1 && !completedStudents;
          const styles = getZoneStyles(zoneData.zone);

          return (
            <div
              key={`sections-${zoneData.zone}`}
              className={`flex ${styles.bg} ${!isLastZone ? `border-r ${styles.border}` : ""}`}
              style={{ width: `${zoneData.finalPercent}%` }}
            >
              {zoneData.sections.map((section, sectionIndex) => {
                const isLastSection = sectionIndex === zoneData.sections.length - 1;
                return (
                  <div
                    key={section.sectionId}
                    className={`flex-1 flex flex-col justify-center px-2 pt-2 pb-1 ${!isLastSection ? `border-r ${styles.border}` : ""}`}
                  >
                    <span className={`text-sm ${styles.text} leading-none`}>
                      {section.sectionName}
                    </span>
                    {section.startDate && section.endDate && (
                      <Tooltip content={getTooltipContent(section)} position="bottom">
                        <span className="text-[10px] text-gray-500 whitespace-nowrap cursor-help leading-none mt-0.5">
                          {formatShortDate(section.startDate)} – {formatShortDate(section.endDate)}
                        </span>
                      </Tooltip>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
        {/* Complete column - empty for section names */}
        {completedStudents && (
          <div
            className={`${getZoneStyles("complete").bg} flex items-center justify-center border-l ${getZoneStyles("complete").border}`}
            style={{ width: "80px", flexShrink: 0 }}
          >
            <span className={`text-[9px] ${getZoneStyles("complete").text} opacity-30`}>—</span>
          </div>
        )}
      </div>

      {/* Lessons sub-bar - shows individual lessons within each section */}
      {/* Each lesson gets proportional width based on total lessons across all zones */}
      <div className={`flex h-auto min-h-[1.75rem] overflow-hidden border border-gray-200 border-t-0 ${!showStudentNames ? 'rounded-b-lg' : ''}`}>
        {normalizedZones.map((zoneData, zoneIndex) => {
          const isLastZone = zoneIndex === normalizedZones.length - 1 && !completedStudents;
          const styles = getZoneStyles(zoneData.zone);
          const zoneLessonCount = zoneData.sections.reduce((sum, s) => sum + (s.lessons?.length || 0), 0);

          return (
            <div
              key={`lessons-${zoneData.zone}`}
              className={`flex ${styles.bg} border-t ${styles.border} ${!isLastZone ? `border-r` : ""}`}
              style={{ width: `${zoneData.finalPercent}%` }}
            >
              {zoneData.sections.map((section, sectionIndex) => {
                const isLastSection = sectionIndex === zoneData.sections.length - 1;
                const lessons = section.lessons || [];
                // Calculate section width as proportion of zone (based on lesson count)
                const sectionLessonCount = lessons.length || 1;
                const sectionWidthPercent = zoneLessonCount > 0 ? (sectionLessonCount / zoneLessonCount) * 100 : 100;

                return (
                  <div
                    key={`lessons-section-${section.sectionId}`}
                    className={`flex ${!isLastSection ? `border-r ${styles.border}` : ""}`}
                    style={{ width: `${sectionWidthPercent}%` }}
                  >
                    {lessons.length > 0 ? (
                      lessons.map((lesson, lessonIndex) => {
                        const isLastLesson = lessonIndex === lessons.length - 1;
                        const studentNames = lesson.studentNames || [];
                        const tooltipContent = studentNames.length > 0 ? studentNames.join(", ") : "";

                        const lessonContent = (
                          <div
                            key={lesson.lessonId}
                            className={`flex-1 flex flex-col justify-start px-2 py-1.5 ${!isLastLesson ? `border-r ${styles.border}` : ""}`}
                          >
                            <span className={`text-[9px] ${styles.text} leading-none`}>
                              {lesson.lessonName}
                            </span>
                            {lesson.studentCount > 0 && (
                              lesson.studentCount <= 7 ? (
                                <div className={`flex flex-wrap gap-px mt-1 ${styles.lessonIcon}`}>
                                  {Array.from({ length: lesson.studentCount }).map((_, i) => (
                                    <UserIcon key={i} className="w-2.5 h-2.5" />
                                  ))}
                                </div>
                              ) : (
                                <span className={`text-[8px] ${styles.lessonIcon} flex items-center gap-0.5 mt-1`}>
                                  <UserIcon className="w-2.5 h-2.5" />
                                  {lesson.studentCount}
                                </span>
                              )
                            )}
                          </div>
                        );

                        // Show tooltip with student names when names are hidden
                        if (!showStudentNames && tooltipContent) {
                          return (
                            <Tooltip key={lesson.lessonId} content={tooltipContent}>
                              {lessonContent}
                            </Tooltip>
                          );
                        }
                        return lessonContent;
                      })
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <span className={`text-[9px] ${styles.text} opacity-50`}>—</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
        {/* Complete column - shows "Complete" label */}
        {completedStudents && (() => {
          const completeTooltipContent = completedStudents.studentNames.length > 0 ? completedStudents.studentNames.join(", ") : "";
          const completeContent = (
            <div
              className={`${getZoneStyles("complete").bg} border-t ${getZoneStyles("complete").border} border-l flex flex-col justify-start px-2 py-1.5`}
              style={{ width: "80px", flexShrink: 0 }}
            >
              <span className={`text-[9px] ${getZoneStyles("complete").text} leading-none`}>Complete</span>
            </div>
          );
          if (!showStudentNames && completeTooltipContent) {
            return (
              <Tooltip content={completeTooltipContent}>
                {completeContent}
              </Tooltip>
            );
          }
          return completeContent;
        })()}
      </div>

      {/* Student names sub-bar - shows student first names below each lesson (only when toggle is on) */}
      {showStudentNames && (
        <div className="flex h-auto rounded-b-lg overflow-hidden border border-gray-200 border-t-0">
          {normalizedZones.map((zoneData, zoneIndex) => {
            const isLastZone = zoneIndex === normalizedZones.length - 1 && !completedStudents;
            const styles = getZoneStyles(zoneData.zone);
            const zoneLessonCount = zoneData.sections.reduce((sum, s) => sum + (s.lessons?.length || 0), 0);

            return (
              <div
                key={`names-${zoneData.zone}`}
                className={`flex ${styles.bg} border-t ${styles.border} ${!isLastZone ? `border-r` : ""}`}
                style={{ width: `${zoneData.finalPercent}%` }}
              >
                {zoneData.sections.map((section, sectionIndex) => {
                  const isLastSection = sectionIndex === zoneData.sections.length - 1;
                  const lessons = section.lessons || [];
                  // Calculate section width as proportion of zone (based on lesson count)
                  const sectionLessonCount = lessons.length || 1;
                  const sectionWidthPercent = zoneLessonCount > 0 ? (sectionLessonCount / zoneLessonCount) * 100 : 100;

                  return (
                    <div
                      key={`names-section-${section.sectionId}`}
                      className={`flex ${!isLastSection ? `border-r ${styles.border}` : ""}`}
                      style={{ width: `${sectionWidthPercent}%` }}
                    >
                      {lessons.length > 0 ? (
                        lessons.map((lesson, lessonIndex) => {
                          const isLastLesson = lessonIndex === lessons.length - 1;
                          const studentNames = lesson.studentNames || [];
                          return (
                            <div
                              key={`names-${lesson.lessonId}`}
                              className={`flex-1 flex flex-col justify-start px-2 py-1 ${!isLastLesson ? `border-r ${styles.border}` : ""}`}
                            >
                              {studentNames.length > 0 ? (
                                studentNames.map((name, nameIndex) => (
                                  <span
                                    key={nameIndex}
                                    className={`text-[9px] ${styles.text} leading-tight`}
                                  >
                                    {name}
                                  </span>
                                ))
                              ) : (
                                <span className={`text-[9px] ${styles.text} opacity-30`}>—</span>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex-1 flex items-center justify-center py-1">
                          <span className={`text-[9px] ${styles.text} opacity-30`}>—</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {/* Complete column - shows names of students who completed the unit */}
          {completedStudents && (
            <div
              className={`${getZoneStyles("complete").bg} border-t ${getZoneStyles("complete").border} border-l flex flex-col justify-start px-2 py-1`}
              style={{ width: "80px", flexShrink: 0 }}
            >
              {completedStudents.studentNames.length > 0 ? (
                completedStudents.studentNames.map((name, nameIndex) => (
                  <span
                    key={nameIndex}
                    className={`text-[9px] ${getZoneStyles("complete").text} leading-tight`}
                  >
                    {name}
                  </span>
                ))
              ) : (
                <span className={`text-[9px] ${getZoneStyles("complete").text} opacity-30`}>—</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
