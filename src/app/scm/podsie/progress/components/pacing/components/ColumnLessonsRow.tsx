"use client";

import { Tooltip } from "@/components/core/feedback/Tooltip";
import { getZoneStyles } from "./zone-styles";
import { StudentIcons } from "./shared-ui";
import type { ColumnConfig } from "./types";

export function ColumnLessonsRow({
  config,
  showStudentNames,
}: {
  config: ColumnConfig;
  showStudentNames: boolean;
}) {
  const styles = getZoneStyles(config.zone);
  const zoneLessonCount = config.sections.reduce((sum, s) => sum + (s.lessons?.length || 0), 0);

  const widthStyle = config.isFixedWidth
    ? { width: config.width, flexShrink: 0 }
    : { width: `${config.width}%` };

  const borderClasses = config.isCompleteColumn
    ? `border-l`
    : (!config.isLastColumn ? `border-r` : "");

  // Complete column shows "Complete" label with student icons
  if (config.isCompleteColumn) {
    const completeTooltipContent = config.studentNames.length > 0
      ? config.studentNames.join("\n")
      : "";

    const completeContent = (
      <div
        className={`${styles.bg} border-t ${styles.border} ${borderClasses} flex flex-col justify-start items-start px-2 py-1.5 h-full`}
        style={widthStyle}
      >
        <span className={`text-[9px] ${styles.text} leading-none text-left`}>Complete</span>
        <StudentIcons count={config.totalStudents} iconClass={styles.lessonIcon} />
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
  }

  // Regular zones show lessons with student icons
  return (
    <div
      className={`flex ${styles.bg} border-t ${styles.border} ${borderClasses}`}
      style={widthStyle}
    >
      {config.sections.map((section, sectionIndex) => {
        const isLastSection = sectionIndex === config.sections.length - 1;
        const lessons = section.lessons || [];
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
                const tooltipContent = studentNames.length > 0 ? studentNames.join("\n") : "";
                const uniqueKey = `${section.sectionId}-${lesson.lessonId}-${lessonIndex}`;
                const lessonWidthPercent = 100 / lessons.length;

                const lessonContent = (
                  <div className="flex flex-col justify-start items-start px-2 py-1.5 w-full h-full">
                    <span className={`text-[9px] ${styles.text} leading-none text-left`}>
                      {lesson.lessonName}
                    </span>
                    <StudentIcons count={lesson.studentCount} iconClass={styles.lessonIcon} />
                  </div>
                );

                const wrapperClasses = `flex ${!isLastLesson ? `border-r ${styles.border}` : ""}`;

                if (!showStudentNames && tooltipContent) {
                  return (
                    <div key={uniqueKey} className={wrapperClasses} style={{ width: `${lessonWidthPercent}%` }}>
                      <Tooltip content={tooltipContent}>
                        {lessonContent}
                      </Tooltip>
                    </div>
                  );
                }
                return <div key={uniqueKey} className={wrapperClasses} style={{ width: `${lessonWidthPercent}%` }}>{lessonContent}</div>;
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
}
