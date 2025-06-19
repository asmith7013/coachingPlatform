import React from 'react';
import { useScheduleDisplayData } from './hooks/useScheduleDisplayData';
import { ScheduleErrorBoundary } from './context/ScheduleErrorBoundary';
import { BellScheduleDisplayComponent, TeacherScheduleGrid } from './components';
import { Heading, Text } from '@/components/core/typography';

interface ScheduleDisplayTestPageProps {
  schoolId: string;
  date: string;
}

export const ScheduleDisplayTestPage: React.FC<ScheduleDisplayTestPageProps> = ({ 
  schoolId, 
  date 
}) => {
  return (
    <ScheduleErrorBoundary schoolId={schoolId} date={date}>
      <ScheduleDisplayTestPageContent schoolId={schoolId} date={date} />
    </ScheduleErrorBoundary>
  );
};

const ScheduleDisplayTestPageContent: React.FC<ScheduleDisplayTestPageProps> = ({ 
  schoolId, 
  date 
}) => {
  const { data, isLoading, error } = useScheduleDisplayData(schoolId, date);

  if (isLoading) {
    return (
      <div className="p-8">
        <Text>Loading schedule...</Text>
      </div>
    );
  }
  
  if (error) {
    throw new Error(`Schedule data error: ${error.message}`);
  }
  
  if (!data) {
    return (
      <div className="p-8">
        <Heading level="h2">No Schedule Data Available</Heading>
        <Text>This could be because:</Text>
        <ul className="mt-2 ml-4 space-y-1">
          <li>• School not found in database</li>
          <li>• No staff assigned to this school</li>
          <li>• No schedules configured</li>
        </ul>
        <Text className="mt-4 text-sm text-gray-600">
          School ID: {schoolId} | Date: {date}
        </Text>
      </div>
    );
  }
  
  if (!data.bellSchedule) {
    return (
      <div className="p-8">
        <Heading level="h2">No Bell Schedule Found</Heading>
        <Text>A bell schedule is required to display the schedule grid.</Text>
        <Text className="mt-2">Found {data.teachers.length} teachers but no bell schedule.</Text>
      </div>
    );
  }
  
  if (!data.teachers.length) {
    return (
      <div className="p-8">
        <Heading level="h2">No Teachers Found</Heading>
        <Text>No teachers found for this school.</Text>
        <Text className="mt-2">Bell schedule: {data.bellSchedule.name}</Text>
      </div>
    );
  }

  const { bellSchedule, teachers, timeSlots } = data;

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div>
        <Heading level="h1">Schedule Display Test Page</Heading>
        <Text className="text-gray-600">School: {schoolId} | Date: {date}</Text>
      </div>

      {/* Schedule Components */}
      <div className="grid gap-4">
        <BellScheduleDisplayComponent bellSchedule={bellSchedule} />
        
        <TeacherScheduleGrid 
          teachers={teachers} 
          timeSlots={timeSlots} 
        />

        {/* Debug Information */}
        <div className="mt-8 p-4 bg-gray-50 rounded">
          <Heading level="h3">Debug Information</Heading>
          <div className="mt-2 space-y-1 text-sm">
            <div>Total Teachers: {teachers.length}</div>
            <div>Teachers with Schedules: {teachers.filter(t => t.schedule).length}</div>
            <div>Teachers without Schedules: {teachers.filter(t => !t.schedule).length}</div>
            <div>Total Periods: {timeSlots.length}</div>
            <div>Bell Schedule: {bellSchedule.name}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDisplayTestPage; 