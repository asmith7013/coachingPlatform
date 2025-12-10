"use client";

import type { StudentPacingStatus, SectionLessonInfo } from "../../../hooks/usePacingData";

type ZoneColor = "red" | "yellow" | "green" | "sky" | "blue";

interface PacingZoneCardProps {
  title: string;
  sectionInfo: SectionLessonInfo | null;
  students: StudentPacingStatus[];
  color: ZoneColor;
  showSectionBadge?: boolean; // For far-behind/far-ahead, show section badge instead of progress bar
}

const colorClasses: Record<ZoneColor, {
  bg: string;
  border: string;
  dot: string;
  titleText: string;
  countText: string;
  subtitleText: string;
  emptyText: string;
  lessonText: string;
  nameText: string;
  progressBg: string;
  progressFill: string;
  progressText: string;
  divider: string;
  badgeBg: string;
  badgeText: string;
}> = {
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
    titleText: "text-red-900",
    countText: "text-red-700",
    subtitleText: "text-red-600",
    emptyText: "text-red-400",
    lessonText: "text-red-500",
    nameText: "text-red-800",
    progressBg: "bg-red-200",
    progressFill: "bg-red-500",
    progressText: "text-red-600",
    divider: "border-red-200",
    badgeBg: "bg-red-100",
    badgeText: "text-red-700",
  },
  yellow: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    dot: "bg-yellow-500",
    titleText: "text-yellow-900",
    countText: "text-yellow-700",
    subtitleText: "text-yellow-600",
    emptyText: "text-yellow-400",
    lessonText: "text-yellow-500",
    nameText: "text-yellow-800",
    progressBg: "bg-yellow-200",
    progressFill: "bg-yellow-500",
    progressText: "text-yellow-600",
    divider: "border-yellow-200",
    badgeBg: "bg-yellow-100",
    badgeText: "text-yellow-700",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    dot: "bg-green-500",
    titleText: "text-green-900",
    countText: "text-green-700",
    subtitleText: "text-green-600",
    emptyText: "text-green-400",
    lessonText: "text-green-500",
    nameText: "text-green-800",
    progressBg: "bg-green-200",
    progressFill: "bg-green-500",
    progressText: "text-green-600",
    divider: "border-green-200",
    badgeBg: "bg-green-100",
    badgeText: "text-green-700",
  },
  sky: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    dot: "bg-sky-500",
    titleText: "text-sky-900",
    countText: "text-sky-700",
    subtitleText: "text-sky-600",
    emptyText: "text-sky-400",
    lessonText: "text-sky-500",
    nameText: "text-sky-800",
    progressBg: "bg-sky-200",
    progressFill: "bg-sky-500",
    progressText: "text-sky-600",
    divider: "border-sky-200",
    badgeBg: "bg-sky-100",
    badgeText: "text-sky-700",
  },
  blue: {
    bg: "bg-blue-100",
    border: "border-blue-300",
    dot: "bg-blue-600",
    titleText: "text-blue-900",
    countText: "text-blue-700",
    subtitleText: "text-blue-600",
    emptyText: "text-blue-400",
    lessonText: "text-blue-500",
    nameText: "text-blue-800",
    progressBg: "bg-blue-200",
    progressFill: "bg-blue-600",
    progressText: "text-blue-600",
    divider: "border-blue-300",
    badgeBg: "bg-blue-200",
    badgeText: "text-blue-700",
  },
};

export function PacingZoneCard({
  title,
  sectionInfo,
  students,
  color,
  showSectionBadge = false,
}: PacingZoneCardProps) {
  const classes = colorClasses[color];

  // Group students by current lesson and sort by progress (least to most)
  const sortedStudents = [...students].sort(
    (a, b) => a.completedLessonsInSection - b.completedLessonsInSection
  );
  const groupedByLesson: { lesson: string; students: typeof sortedStudents }[] = [];
  let currentLesson: string | null = null;
  let currentGroup: typeof sortedStudents = [];

  for (const student of sortedStudents) {
    const lesson = student.currentLesson || "Done";
    if (lesson !== currentLesson) {
      if (currentGroup.length > 0) {
        groupedByLesson.push({ lesson: currentLesson!, students: currentGroup });
      }
      currentLesson = lesson;
      currentGroup = [student];
    } else {
      currentGroup.push(student);
    }
  }
  if (currentGroup.length > 0) {
    groupedByLesson.push({ lesson: currentLesson!, students: currentGroup });
  }

  // Format section name for badge display
  // Single letters (A, B, C, D) get "Section" prefix, Ramp Ups stays as is
  const getShortSectionName = () => {
    if (!sectionInfo?.sectionName) return null;
    const name = sectionInfo.sectionName;
    // Ramp Ups stays as "Ramp Ups"
    if (name === "Ramp Ups" || name === "Ramp Up") return "Ramp Ups";
    // Single letters get "Section" prefix
    if (/^[A-F]$/.test(name)) return `Section ${name}`;
    // Already has "Section" prefix, keep as is
    if (name.startsWith("Section ")) return name;
    // Other cases, just show the name
    return name;
  };
  const shortSectionName = getShortSectionName();

  // Format lesson display - "Lesson 1", "Lesson 2" or "Ramp Up 1", "Ramp Up 2"
  const formatLessonName = (lesson: string) => {
    if (!lesson) return lesson;
    // Handle "Lesson X" format - already good
    if (lesson.startsWith("Lesson ")) return lesson;
    // Handle RU format (e.g., "RU1", "RU2") -> "Ramp Up 1", "Ramp Up 2"
    const ruMatch = lesson.match(/^RU(\d+)$/i);
    if (ruMatch) return `Ramp Up ${ruMatch[1]}`;
    // Handle "Lesson RU1" or similar
    const lessonRuMatch = lesson.match(/^Lesson RU(\d+)$/i);
    if (lessonRuMatch) return `Ramp Up ${lessonRuMatch[1]}`;
    return lesson;
  };

  // Don't show section badge for far-behind/far-ahead zones
  const showSectionInHeader = !showSectionBadge && shortSectionName;

  return (
    <div className={`${classes.bg} border ${classes.border} rounded-lg overflow-hidden`}>
      {/* Header */}
      <div className={`flex items-center gap-2 px-3 py-2 border-b ${classes.divider}`}>
        <div className={`w-3 h-3 rounded-full ${classes.dot}`}></div>
        <h4 className={`font-semibold ${classes.titleText} text-sm`}>{title}</h4>
        {showSectionInHeader && (
          <span className={`ml-auto ${classes.badgeBg} ${classes.badgeText} text-[10px] px-1.5 py-0.5 rounded-full font-medium`}>
            {shortSectionName}
          </span>
        )}
      </div>
      {/* Content */}
      <div className="p-3">
        {students.length === 0 ? (
          <p className={`text-xs ${classes.emptyText} italic`}>None</p>
        ) : (
          <div>
            {groupedByLesson.map((group, groupIndex) => (
            <div key={group.lesson}>
              {groupIndex > 0 && (
                <div className={`border-t ${classes.divider} my-1.5`} />
              )}
              <div className={`text-xs ${classes.lessonText} mb-1`}>
                {formatLessonName(group.lesson)}
              </div>
              <div className="space-y-0.5">
                {group.students.map((student) => {
                  const totalLessons = student.totalLessonsInSection;
                  const progressPercent =
                    totalLessons > 0
                      ? Math.round(
                          (student.completedLessonsInSection / totalLessons) * 100
                        )
                      : 0;

                  // Check if student is fully complete (completed all lessons in their section)
                  const isFullyComplete = totalLessons > 0 && student.completedLessonsInSection >= totalLessons;

                  return (
                    <div key={student.studentId} className="flex items-center gap-1">
                      <span
                        className={`text-xs ${classes.nameText} truncate flex-1 min-w-0`}
                      >
                        {student.studentName}
                      </span>
                      {showSectionBadge ? (
                        // For far-behind/far-ahead: only show "Unit Complete" if fully complete, otherwise blank
                        isFullyComplete ? (
                          <span className={`text-[10px] ${classes.badgeBg} ${classes.badgeText} px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap`}>
                            Unit Complete
                          </span>
                        ) : null
                      ) : (
                        // For other zones: show progress bar
                        <div className="w-12 flex items-center gap-0.5">
                          <div
                            className={`relative h-1.5 ${classes.progressBg} rounded-full overflow-hidden flex-1`}
                          >
                            <div
                              className={`absolute h-full ${classes.progressFill} rounded-full`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <span
                            className={`text-[10px] ${classes.progressText} whitespace-nowrap`}
                          >
                            {student.completedLessonsInSection}/{totalLessons}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}
