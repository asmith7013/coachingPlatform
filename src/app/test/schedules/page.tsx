"use client";

import { ScheduleDisplayTestPage } from "@/components/features/schedulesTest/ScheduleDisplayTestPage";
import { useSchools } from "@/hooks/domain/useSchools";
import { Text, Heading } from "@/components/core/typography";

export default function SchedulesTestPage() {
  const { items: schools, isLoading, error } = useSchools.list({ limit: 1 });

  if (isLoading) {
    return (
      <div className="p-8">
        <Text>Loading schools...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Heading level="h2">Error Loading Schools</Heading>
        <Text>Error: {error.message}</Text>
        <Text className="mt-4">
          Please ensure you have schools in your database.
        </Text>
      </div>
    );
  }

  if (!schools || schools.length === 0) {
    return (
      <div className="p-8">
        <Heading level="h2">No Schools Found</Heading>
        <Text>Please add schools to your database first.</Text>
        <Text className="mt-2">
          You can add schools at:{" "}
          <a href="/dashboard/schoolList" className="text-blue-600 underline">
            /dashboard/schoolList
          </a>
        </Text>
      </div>
    );
  }

  const firstSchool = schools[0];

  return (
    <div>
      <div className="p-4 bg-blue-50 border-b">
        <Text className="text-sm text-blue-700">
          Using first available school: {firstSchool.schoolName} (ID:{" "}
          {firstSchool._id})
        </Text>
      </div>
      <ScheduleDisplayTestPage schoolId={firstSchool._id} date="2025-06-17" />
    </div>
  );
}
