"use client";

import { CheckCircleIcon, UserGroupIcon, PresentationChartLineIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon as CheckCircleOutlineIcon, UserGroupIcon as UserGroupOutlineIcon } from "@heroicons/react/24/outline";
import { getZoneStyles } from "./zone-styles";
import { ActivityRow, PresentationChartLineOutlineIcon } from "./shared-ui";
import type { ColumnConfig } from "./types";
import type { StudentLessonInfo } from "../../../hooks/usePacingData";

// Student detail card showing name and 3 activity rows
function StudentDetailCard({
  student,
  styles,
  showBorderTop,
}: {
  student: StudentLessonInfo;
  styles: ReturnType<typeof getZoneStyles>;
  showBorderTop: boolean;
}) {
  return (
    <div
      className={`text-[9px] ${styles.text} leading-tight px-2 py-1 overflow-hidden ${showBorderTop ? `border-t ${styles.border}` : ''}`}
    >
      {/* Row 1: Student name + Mastery data */}
      <div className={`flex items-center justify-between pb-0.5 border-b ${styles.border}`}>
        <span className="truncate font-medium">{student.name}</span>
        <ActivityRow
          todayIcon={<CheckCircleIcon className="w-3 h-3" />}
          yesterdayIcon={<CheckCircleOutlineIcon className="w-3 h-3" />}
          todayCount={student.completedToday}
          yesterdayCount={student.completedYesterday}
          iconColor={styles.lessonIcon}
        />
      </div>
      {/* Row 2: Small Group */}
      <div className={`py-0.5 border-b ${styles.border}`}>
        <ActivityRow
          todayIcon={<UserGroupIcon className="w-3 h-3" />}
          yesterdayIcon={<UserGroupOutlineIcon className="w-3 h-3" />}
          todayCount={student.smallGroupToday ? 1 : 0}
          yesterdayCount={student.smallGroupYesterday ? 1 : 0}
          iconColor={styles.lessonIcon}
        />
      </div>
      {/* Row 3: Inquiry */}
      <div className="pt-0.5">
        <ActivityRow
          todayIcon={<PresentationChartLineIcon className="w-3 h-3" />}
          yesterdayIcon={<PresentationChartLineOutlineIcon className="w-3 h-3" />}
          todayCount={student.inquiryToday ? 1 : 0}
          yesterdayCount={student.inquiryYesterday ? 1 : 0}
          iconColor={styles.lessonIcon}
        />
      </div>
    </div>
  );
}

export function ColumnStudentNamesRow({
  config,
}: {
  config: ColumnConfig;
}) {
  const styles = getZoneStyles(config.zone);
  const zoneLessonCount = config.sections.reduce((sum, s) => sum + (s.lessons?.length || 0), 0);

  const widthStyle = config.isFixedWidth
    ? { width: config.width, flexShrink: 0 }
    : { width: `${config.width}%` };

  const borderClasses = config.isCompleteColumn
    ? `border-l`
    : (!config.isLastColumn ? `border-r` : "");

  // Complete column shows student details with activity rows (same as zones)
  if (config.isCompleteColumn) {
    const students = config.completedStudents || [];
    return (
      <div
        className={`${styles.bg} border-t ${styles.border} ${borderClasses} flex flex-col justify-start`}
        style={widthStyle}
      >
        {students.length > 0 ? (
          students.map((student, index) => (
            <StudentDetailCard
              key={index}
              student={student}
              styles={styles}
              showBorderTop={index > 0}
            />
          ))
        ) : (
          <span className={`text-[9px] ${styles.text} opacity-30 px-2 py-1`}>—</span>
        )}
      </div>
    );
  }

  // Regular zones show detailed student info with activity rows
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

        // Use sectionId + subsection for unique key
        const sectionKey = section.subsection !== undefined
          ? `${section.sectionId}:${section.subsection}`
          : section.sectionId;

        return (
          <div
            key={`names-section-${sectionKey}`}
            className={`flex ${!isLastSection ? `border-r ${styles.border}` : ""}`}
            style={{ width: `${sectionWidthPercent}%` }}
          >
            {lessons.length > 0 ? (
              lessons.map((lesson, lessonIndex) => {
                const isLastLesson = lessonIndex === lessons.length - 1;
                const students = lesson.students || [];
                return (
                  <div
                    key={`names-${sectionKey}-${lesson.lessonId}-${lessonIndex}`}
                    className={`flex-1 flex flex-col justify-start overflow-hidden ${!isLastLesson ? `border-r ${styles.border}` : ""}`}
                  >
                    {students.length > 0 ? (
                      students.map((student, studentIndex) => (
                        <StudentDetailCard
                          key={studentIndex}
                          student={student}
                          styles={styles}
                          showBorderTop={studentIndex > 0}
                        />
                      ))
                    ) : (
                      <span className={`text-[9px] ${styles.text} opacity-30 px-2 py-1`}>—</span>
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
}
