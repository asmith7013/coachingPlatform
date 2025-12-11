"use client";

import { Tooltip } from "@/components/core/feedback/Tooltip";
import { getZoneStyles } from "./zone-styles";
import { formatShortDate, EmptyPlaceholder } from "./shared-ui";
import type { ColumnConfig } from "./types";

export function ColumnSectionRow({
  config,
  showStudentNames,
}: {
  config: ColumnConfig;
  showStudentNames: boolean;
}) {
  const styles = getZoneStyles(config.zone);

  const widthStyle = config.isFixedWidth
    ? { width: config.width, flexShrink: 0 }
    : { width: `${config.width}%` };

  const borderClasses = config.isCompleteColumn
    ? `border-l ${styles.border}`
    : (!config.isLastColumn ? `border-r ${styles.border}` : "");

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
    <div
      className={`flex ${styles.bg} ${borderClasses}`}
      style={widthStyle}
    >
      {config.sections.map((section, sectionIndex) => {
        const isLastSection = sectionIndex === config.sections.length - 1;
        const sectionStudentNames = section.lessons
          ?.flatMap(l => l.studentNames || [])
          .filter((name, idx, arr) => arr.indexOf(name) === idx) || [];
        const sectionTooltipContent = sectionStudentNames.length > 0 ? sectionStudentNames.join("\n") : "";

        const sectionContent = (
          <div
            className={`flex-1 flex flex-col justify-center px-2 pt-2 pb-1 ${!isLastSection ? `border-r ${styles.border}` : ""}`}
          >
            <span className={`text-sm ${styles.text} leading-none`}>
              {section.sectionName}
            </span>
            {section.startDate && section.endDate && (
              <Tooltip content={
                <div className="space-y-1">
                  <div><strong>{section.lessonCount}</strong> lessons</div>
                  {section.dayCount > 0 && <div><strong>{section.dayCount}</strong> school days</div>}
                  <div>{formatShortDate(section.startDate)} – {formatShortDate(section.endDate)}</div>
                </div>
              } position="bottom">
                <span className="text-[10px] text-gray-500 whitespace-nowrap cursor-help leading-none mt-0.5">
                  {formatShortDate(section.startDate)} – {formatShortDate(section.endDate)}
                </span>
              </Tooltip>
            )}
          </div>
        );

        if (!showStudentNames && sectionTooltipContent) {
          return (
            <Tooltip key={section.sectionId} content={sectionTooltipContent}>
              {sectionContent}
            </Tooltip>
          );
        }
        return <div key={section.sectionId} className="contents">{sectionContent}</div>;
      })}
    </div>
  );
}
