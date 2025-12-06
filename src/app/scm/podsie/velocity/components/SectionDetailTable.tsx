import React from "react";
import { Tooltip } from "@/components/core/feedback/Tooltip";

interface CompletedLesson {
  unitCode: string;
  lessonName: string;
  lessonType: 'lesson' | 'rampUp' | 'assessment';
  activityType: string;
}

interface StudentDailyData {
  studentId: number;
  studentName: string;
  email: string;
  dailyProgress: Record<string, {
    attendance: 'present' | 'late' | 'absent' | 'not-tracked' | null;
    rampUps: number;
    lessons: number;
    totalCompletions: number;
    completedLessons: CompletedLesson[];
  }>;
}

interface SectionDetailTableProps {
  sectionName: string;
  school: string;
  students: StudentDailyData[];
  dates: string[]; // Sorted array of dates in range
  blockTypes: Map<string, 'single' | 'double' | 'none'>; // Date -> block type
  daysOff: string[];
  showRampUps: boolean;
}

// Get background color class based on attendance status
function getAttendanceBackground(status: 'present' | 'late' | 'absent' | 'not-tracked' | null): string {
  if (!status) return '';

  const backgrounds = {
    present: 'bg-green-100',
    late: 'bg-yellow-100',
    absent: 'bg-red-100',
    'not-tracked': 'bg-gray-100',
  };

  return backgrounds[status];
}

// Activity badge component (same style as calendar)
function ActivityBadge({ count, type }: { count: number; type: 'rampUp' | 'lesson' }) {
  if (count === 0) return null;

  const colors = {
    rampUp: 'bg-orange-500 text-white',
    lesson: 'bg-blue-500 text-white',
  };

  return (
    <span className={`px-2 py-1 ${colors[type]} rounded font-bold text-xs leading-none`}>
      {count}
    </span>
  );
}

// Block type indicator
function BlockTypeIndicator({ blockType }: { blockType: 'single' | 'double' | 'none' }) {
  if (blockType === 'none') return null;

  return (
    <div className="flex items-center justify-center gap-0.5">
      <div className={`w-1.5 h-1.5 rounded-full ${blockType === 'single' || blockType === 'double' ? 'bg-indigo-600' : 'bg-gray-300'}`} />
      {blockType === 'double' && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
    </div>
  );
}

export function SectionDetailTable({
  sectionName,
  school,
  students,
  dates,
  blockTypes,
  daysOff,
  showRampUps,
}: SectionDetailTableProps) {
  // Helper to check if a date is a weekend
  const isWeekend = (dateStr: string): boolean => {
    // Parse date string directly to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  // Helper to check if a date is a school day
  const isSchoolDay = (dateStr: string): boolean => {
    return !isWeekend(dateStr) && !daysOff.includes(dateStr);
  };

  // Filter dates to only school days
  const schoolDays = dates.filter(isSchoolDay);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-bold text-gray-900">{sectionName}</h3>
        <p className="text-sm text-gray-600">{school}</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200"
              >
                Student
              </th>
              {schoolDays.map((date) => {
                const blockType = blockTypes.get(date) || 'none';

                // Parse date string to avoid timezone issues
                const [year, month, day] = date.split('-').map(Number);
                const dateObj = new Date(year, month - 1, day);

                return (
                  <th
                    key={date}
                    scope="col"
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px] border-l border-gray-100"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <BlockTypeIndicator blockType={blockType} />
                      <div className="text-gray-900 font-semibold">
                        {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.length === 0 ? (
              <tr>
                <td colSpan={schoolDays.length + 1} className="px-6 py-8 text-center text-sm text-gray-500">
                  No student data available
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.studentId} className="hover:bg-gray-50">
                  <td className="sticky left-0 z-10 bg-white px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                    {student.studentName}
                  </td>
                  {schoolDays.map((date) => {
                    const dayData = student.dailyProgress[date];

                    // Build tooltip text showing all completed lessons for this day
                    const tooltipText = dayData?.completedLessons && dayData.completedLessons.length > 0
                      ? dayData.completedLessons.map(lesson => {
                          // Format lesson type
                          const lessonTypeLabel = lesson.lessonType === 'rampUp' ? 'Ramp Up' :
                                                  lesson.lessonType === 'lesson' ? 'Lesson' : 'Assessment';

                          // Format activity type
                          const activityTypeLabel = lesson.activityType === 'mastery-check' ? 'Mastery Check' :
                                                    lesson.activityType === 'sidekick' ? 'Sidekick' :
                                                    lesson.activityType === 'ramp-up' ? 'Ramp-Up Activity' :
                                                    lesson.activityType;

                          return `Unit ${lesson.unitCode}: ${lesson.lessonName} (${lessonTypeLabel} - ${activityTypeLabel})`;
                        }).join('\n')
                      : '';

                    const attendanceBackground = getAttendanceBackground(dayData?.attendance || null);

                    return (
                      <td
                        key={date}
                        className={`px-2 py-3 whitespace-nowrap text-center border-l border-gray-100 ${attendanceBackground}`}
                      >
                        <Tooltip content={tooltipText || null} position="top" delay={100}>
                          <div className="flex justify-center gap-1 min-h-[24px]">
                            {dayData && dayData.lessons > 0 && (
                              <ActivityBadge count={dayData.lessons} type="lesson" />
                            )}
                            {showRampUps && dayData && dayData.rampUps > 0 && (
                              <ActivityBadge count={dayData.rampUps} type="rampUp" />
                            )}
                          </div>
                        </Tooltip>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
