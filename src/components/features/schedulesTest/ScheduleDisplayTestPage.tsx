import React from "react";
import { useScheduleDisplayData } from "./hooks/useScheduleDisplayData";
import { ErrorBoundary } from "@components/error/ErrorBoundary";
import {
  BellScheduleDisplayComponent,
  TeacherScheduleGrid,
} from "./components";
import { Heading, Text } from "@/components/core/typography";

interface ScheduleDisplayTestPageProps {
  schoolId: string;
  date: string;
}

// Error fallback component for when critical errors occur
const ScheduleErrorFallback = (error: Error, resetError: () => void) => (
  <div className="p-8">
    <Heading level="h2">Unable to Load Schedule</Heading>
    <Text className="mt-2 text-red-600">{error.message}</Text>
    <button
      onClick={resetError}
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Try Again
    </button>
  </div>
);

export const ScheduleDisplayTestPage: React.FC<
  ScheduleDisplayTestPageProps
> = ({ schoolId, date }) => {
  return (
    <ErrorBoundary context="ScheduleDisplay" fallback={ScheduleErrorFallback}>
      <ScheduleDisplayTestPageContent schoolId={schoolId} date={date} />
    </ErrorBoundary>
  );
};

const ScheduleDisplayTestPageContent: React.FC<
  ScheduleDisplayTestPageProps
> = ({ schoolId, date }) => {
  // Use simplified hook with standard error pattern
  const { school, staff, bellSchedule, teacherSchedules, isLoading, error } =
    useScheduleDisplayData(schoolId, date);

  if (isLoading) {
    return (
      <div className="p-8">
        <Text>Loading schedule data...</Text>
      </div>
    );
  }

  // Let ErrorBoundary handle errors
  if (error) {
    throw error;
  }

  if (!school || !staff.length) {
    return (
      <div className="p-8">
        <Heading level="h2">No Schedule Data Available</Heading>
        <Text>
          School ID: {schoolId} | Date: {date}
        </Text>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div>
        <Heading level="h1">Schedule Display Test Page</Heading>
        <Text className="text-gray-600">
          School: {school.schoolName} | Date: {date}
        </Text>
      </div>

      {/* Schedule Components - Using domain types directly */}
      <div className="grid gap-4">
        {bellSchedule ? (
          <BellScheduleDisplayComponent bellSchedule={bellSchedule} />
        ) : (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded">
            <Text className="text-gray-600">No bell schedule available</Text>
          </div>
        )}

        <TeacherScheduleGrid
          teachers={staff}
          teacherSchedules={teacherSchedules}
          bellSchedule={bellSchedule}
        />
      </div>

      {/* Debug Information */}
      <div className="mt-8 p-4 bg-gray-50 rounded">
        <Heading level="h3">Debug Information</Heading>
        <div className="mt-2 space-y-1 text-sm">
          <div>School: {school.schoolName}</div>
          <div>Total Teachers: {staff.length}</div>
          <div>Teacher Schedules: {teacherSchedules.length}</div>
          <div>Bell Schedule: {bellSchedule?.name || "None"}</div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDisplayTestPage;
