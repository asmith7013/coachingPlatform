"use client";

import { Tooltip } from "@/components/core/feedback/Tooltip";
import { getZoneStyles } from "./zone-styles";
import { formatShortDate, EmptyPlaceholder } from "./shared-ui";
import type { ColumnConfig } from "./types";

export function ColumnSectionRow({ config }: { config: ColumnConfig }) {
  const styles = getZoneStyles(config.zone);
  const zoneLessonCount = config.sections.reduce(
    (sum, s) => sum + (s.lessons?.length || 0),
    0,
  );

  const widthStyle = config.isFixedWidth
    ? { width: config.width, flexShrink: 0 }
    : { width: `${config.width}%` };

  const borderClasses = config.isCompleteColumn
    ? `border-l ${styles.border}`
    : !config.isLastColumn
      ? `border-r ${styles.border}`
      : "";

  // Complete column shows just a dash
  if (config.isCompleteColumn) {
    return (
      <div
        className={`${styles.bg} flex items-center justify-center ${borderClasses}`}
        style={widthStyle}
      >
        <EmptyPlaceholder textClass={styles.text} />
      </div>
    );
  }

  // Regular zones show section names with dates
  return (
    <div className={`flex ${styles.bg} ${borderClasses}`} style={widthStyle}>
      {config.sections.map((section, sectionIndex) => {
        const isLastSection = sectionIndex === config.sections.length - 1;

        // Calculate proportional width based on lesson count (matches ColumnLessonsRow)
        const sectionLessonCount = section.lessons?.length || 1;
        const sectionWidthPercent =
          zoneLessonCount > 0
            ? (sectionLessonCount / zoneLessonCount) * 100
            : 100;

        // Extract base section name (remove Part X suffix if present in sectionName)
        const baseSectionName = section.sectionName
          .replace(/ \(Part \d+\)$/, "")
          .replace(/ \(Unassigned\)$/, "");

        const sectionContent = (
          <div className="flex flex-col justify-center px-2 pt-2 pb-1 w-full">
            <div className="flex items-center gap-1.5">
              <span className={`text-sm ${styles.text} leading-none`}>
                {baseSectionName}
              </span>
              {section.subsection !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${styles.partBadge} leading-none`}
                >
                  Part {section.subsection}
                </span>
              )}
            </div>
            {section.startDate && section.endDate && (
              <Tooltip
                content={
                  <div className="space-y-1">
                    <div>
                      <strong>{section.lessonCount}</strong> lessons
                    </div>
                    {section.dayCount > 0 && (
                      <div>
                        <strong>{section.dayCount}</strong> school days
                      </div>
                    )}
                    <div>
                      {formatShortDate(section.startDate)} –{" "}
                      {formatShortDate(section.endDate)}
                    </div>
                  </div>
                }
                position="bottom"
              >
                <span className="text-[10px] text-gray-500 whitespace-nowrap cursor-help leading-none mt-0.5">
                  {formatShortDate(section.startDate)} –{" "}
                  {formatShortDate(section.endDate)}
                </span>
              </Tooltip>
            )}
          </div>
        );

        // Use sectionId + subsection for unique key
        const sectionKey =
          section.subsection !== undefined
            ? `${section.sectionId}:${section.subsection}`
            : section.sectionId;

        const wrapperClasses = `flex ${!isLastSection ? `border-r ${styles.border}` : ""}`;

        return (
          <div
            key={sectionKey}
            className={wrapperClasses}
            style={{ width: `${sectionWidthPercent}%` }}
          >
            {sectionContent}
          </div>
        );
      })}
    </div>
  );
}
