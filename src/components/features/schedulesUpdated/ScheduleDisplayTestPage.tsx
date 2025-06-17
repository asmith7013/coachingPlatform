import React from 'react';
import { useScheduleDisplayData } from './hooks/useScheduleDisplayData';
import { Heading, Text } from '@/components/core/typography';
import { cn } from '@ui/utils/formatters';
import type { TeacherWithSchedule, TeacherPeriodDisplay, TimeSlotDisplay } from './types';
// If you have a Table component, import it here
// import { Table, TableRow, TableCell, TableHead } from '@/components/composed/tables/Table';

interface ScheduleDisplayTestPageProps {
  schoolId: string;
  date: string;
}

// Color mapping utility
function getActivityColor(activity: string) {
  if (/prep/i.test(activity)) return 'text-gray-500';
  if (/lunch/i.test(activity)) return 'text-red-600';
  if (/math|ela|science|history|social|reading|writing|academic/i.test(activity)) return 'text-blue-600';
  return 'text-primary';
}

export const ScheduleDisplayTestPage: React.FC<ScheduleDisplayTestPageProps> = ({ schoolId, date }) => {
  const { data, isLoading, error } = useScheduleDisplayData(schoolId, date);

  // Loading/Error/Empty states
  if (isLoading) {
    return <div className="p-8"><Text>Loading schedule...</Text></div>;
  }
  if (error) {
    return <div className="p-8"><Text className="text-red-600">Error loading schedule: {String(error)}</Text></div>;
  }
  if (!data || !data.bellSchedule || !data.teachers.length) {
    return <div className="p-8"><Text>No schedule data available.</Text></div>;
  }

  const { bellSchedule, teachers } = data;
  const periods = bellSchedule.timeBlocks;

  // Build grid: first column is periods, then one column per teacher
  return (
    <div className="overflow-x-auto p-6">
      <Heading level="h2" className="mb-4">Schedule Display Test</Heading>
      <div className="grid" style={{ gridTemplateColumns: `200px repeat(${teachers.length}, 1fr)` }}>
        {/* Header Row */}
        <div className="font-semibold py-2 px-3 border-b border-gray-200 bg-gray-50">Period</div>
        {teachers.map((teacher: TeacherWithSchedule) => (
          <div key={teacher._id} className="font-semibold py-2 px-3 border-b border-gray-200 bg-gray-50 text-center">
            {teacher.staffName}
          </div>
        ))}
        {/* Period Rows */}
        {periods.map((period: TimeSlotDisplay) => (
          <React.Fragment key={period.periodNumber}>
            {/* Left column: period time */}
            <div className="py-2 px-3 border-b border-gray-100">
              <div className="font-medium">{period.periodName || `Period ${period.periodNumber}`}</div>
              <div className="text-xs text-gray-500">{period.startTime} - {period.endTime}</div>
            </div>
            {/* Teacher columns */}
            {teachers.map((teacher: TeacherWithSchedule) => {
              if (!teacher.schedule) {
                return (
                  <div key={teacher._id} className="py-2 px-3 border-b border-gray-100 text-center text-gray-400 italic">
                    No Schedule
                  </div>
                );
              }
              const block = teacher.schedule.timeBlocks.find((b: TeacherPeriodDisplay) => b.periodNumber === period.periodNumber);
              if (!block) {
                return (
                  <div key={teacher._id} className="py-2 px-3 border-b border-gray-100 text-center text-gray-400 italic">
                    —
                  </div>
                );
              }
              // Color coding
              const colorClass = getActivityColor(block.activityType || block.className || '');
              return (
                <div key={teacher._id} className={cn('py-2 px-3 border-b border-gray-100 text-center', colorClass)}>
                  <div className="font-medium">{block.className || block.activityType || '—'}</div>
                  <div className="text-xs text-gray-400">Full</div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ScheduleDisplayTestPage; 