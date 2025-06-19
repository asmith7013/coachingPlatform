import React from 'react';
import { Heading } from '@/components/core/typography';
import { cn } from '@ui/utils/formatters';
import type { 
  TeacherWithSchedule, 
  TeacherPeriodDisplay, 
  TimeSlotDisplay 
} from '../types';

interface TeacherScheduleGridProps {
  teachers: TeacherWithSchedule[];
  timeSlots: TimeSlotDisplay[];
  className?: string;
}

/**
 * Displays teacher schedules in a grid/table format
 */
export function TeacherScheduleGrid({ 
  teachers, 
  timeSlots, 
  className 
}: TeacherScheduleGridProps) {
  
  /**
   * Renders teacher period information for a specific period
   */
  const renderTeacherPeriod = (
    teacher: TeacherWithSchedule, 
    periodNumber: number
  ): TeacherPeriodDisplay => {
    const timeBlock = teacher.schedule?.timeBlocks?.find(
      block => block.periodNumber === periodNumber
    );
    
    return {
      periodNumber,
      className: timeBlock?.className || 'Free',
      room: timeBlock?.room || '',
      subject: timeBlock?.subject || '',
      gradeLevel: timeBlock?.gradeLevel || '',
      activityType: timeBlock?.activityType || 'free'
    };
  };

  /**
   * Renders the content of a teacher period cell
   */
  const renderPeriodCell = (teacher: TeacherWithSchedule, period: TimeSlotDisplay) => {
    const teacherPeriod = renderTeacherPeriod(teacher, period.periodNumber);
    const isScheduled = teacherPeriod.className !== 'Free';
    
    return (
      <td 
        key={period.periodNumber} 
        className={cn(
          "border border-gray-300 p-2 text-center text-sm",
          isScheduled ? "bg-blue-50" : "bg-gray-50"
        )}
      >
        <div className={cn(
          "font-medium", 
          isScheduled ? "text-blue-900" : "text-gray-500"
        )}>
          {teacherPeriod.className}
        </div>
        {isScheduled && (
          <div className="text-xs text-gray-600 mt-1">
            {teacherPeriod.room && <div>Room: {teacherPeriod.room}</div>}
            {teacherPeriod.subject && <div>{teacherPeriod.subject}</div>}
            {teacherPeriod.gradeLevel && <div>Grade {teacherPeriod.gradeLevel}</div>}
          </div>
        )}
      </td>
    );
  };

  return (
    <div className={className}>
      <Heading level="h2">Teacher Schedules ({teachers.length} teachers)</Heading>
      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 p-2 text-left">Teacher</th>
              {timeSlots.map(period => (
                <th key={period.periodNumber} className="border border-gray-300 p-2 text-center min-w-[120px]">
                  P{period.periodNumber}<br />
                  <span className="text-xs text-gray-500">{period.startTime}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teachers.map(teacher => (
              <tr key={teacher._id}>
                <td className="border border-gray-300 p-2 font-medium">
                  {teacher.staffName}
                </td>
                {timeSlots.map(period => renderPeriodCell(teacher, period))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 