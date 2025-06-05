"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";
import { Card } from '@components/composed/cards/Card';
import { Heading, Text } from '@components/core/typography';
import { typography, paddingY, stack } from '@lib/tokens/tokens';
import { cn } from '@ui/utils/formatters';
import { useSchoolById } from "@hooks/domain/useSchools";
import { useNYCPSStaff } from "@hooks/domain/useNYCPSStaff";
import { Alert, Spinner, Badge } from '@components/core/feedback';
import { formatMediumDate, toDateString } from '@transformers/utils/date-utils';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

type LookFor = string;
type Period = { period: string; time: string };

// Mock data for schedules and lookFors - would be replaced with actual API data
const scheduleData: Record<string,Period[]> = {
  "1": [
    { period: "1", time: "8:00 - 8:45 AM" },
    { period: "2", time: "8:50 - 9:35 AM" },
  ],
  "2": [
    { period: "1", time: "7:30 - 8:15 AM" },
    { period: "2", time: "8:20 - 9:05 AM" },
  ],
};

const lookForsData: Record<string, LookFor[]> = {
  "1": ["Clear Learning Target", "Multiple Representations", "Student Discourse"],
  "2": ["Checking for Understanding", "Explicit Modeling", "Academic Language Use"],
};

interface SchoolDetailClientProps {
  schoolId: string;
}

export default function SchoolDetailClient({ schoolId }: SchoolDetailClientProps) {
  // Use the React Query hook to fetch school by ID
  const { 
    data: school, 
    isLoading: schoolLoading, 
    error: schoolError 
  } = useSchoolById(schoolId);
  
  // Fetch staff for this school
  const { 
    items: nycpsStaff, 
    isLoading: staffLoading,
    error: staffError 
  } = useNYCPSStaff({ schools: [schoolId] });

  // Combined loading state
  const loading = schoolLoading || staffLoading;
  
  // Combined error handling
  const error = schoolError ? 
    schoolError.message : 
    staffError ? 
      staffError.message : 
      null;

  if (loading) return (
    <div className="flex justify-center items-center h-40">
      <Spinner size="lg" />
      <Text textSize="base" className="ml-3">Loading school details...</Text>
    </div>
  );

  if (error || !school) return (
    <Alert>
      <Alert.Title>Error Loading School</Alert.Title>
      <Alert.Description>{error || "Failed to load school"}</Alert.Description>
    </Alert>
  );

  const lookFors = lookForsData[school._id] ?? [];
  const schedule = scheduleData[school._id] ?? [];

  const lookForsTrendsData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "LookFors Engagement",
        data: [2, 4, 6, 8],
        borderColor: "blue",
        backgroundColor: "lightblue",
      },
    ],
  };

  return (
    <>
      <Card className="p-6 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-3xl">{school.emoji || '🏫'}</div>
          <div>
            <Heading level="h2">{school.schoolName}</Heading>
            <Text textSize="base" color="muted" className="mt-1">
              District: {school.district}
            </Text>
            {school.address && (
              <Text textSize="base" color="muted" className="mt-1">
                {school.address}
              </Text>
            )}
            {school.createdAt && (
              <Text textSize="sm" color="muted" className="mt-1">
                Created: {formatMediumDate(toDateString(school.createdAt))}
              </Text>
            )}
          </div>
        </div>
        
        <Heading level="h3" className="mt-6 mb-2">Grade Levels</Heading>
        <div className="flex flex-wrap gap-2">
          {school.gradeLevelsSupported?.map((grade, index) => (
            <Badge key={index}>{grade}</Badge>
          ))}
        </div>
      </Card>
      
      <Heading level="h3" className="mt-8 mb-4">Staff</Heading>
      {nycpsStaff && nycpsStaff.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {nycpsStaff.map((person) => (
            <Badge key={person._id}>{person.staffName}</Badge>
          ))}
        </div>
      ) : (
        <Text>No staff members associated with this school yet.</Text>
      )}

      <Card className={stack.md} padding="md" radius="lg">
        <Heading level="h2" className={cn(typography.weight.medium, 'text-primary', stack.md)}>
          Look Fors
        </Heading>
        <div className="flex flex-wrap gap-2">
          {lookFors.map((lookFor : LookFor, index : number) => (
            <span 
              key={index} 
              className={cn(
                paddingY.sm,
                'bg-primary',
                'text-white',
                'rounded-full text-sm px-3'
              )}
            >
              {lookFor}
            </span>
          ))}
        </div>
      </Card>

      <Card className={stack.md} padding="md" radius="lg">
        <Heading level="h2" className={cn(typography.weight.medium, 'text-primary', stack.md)}>
          Schedule
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface">
                <th className={`${paddingY.sm} text-left text-text`}>Period</th>
                <th className={`${paddingY.sm} text-left text-text`}>Time</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((entry : Period, index : number) => (
                <tr key={index} className="border-b border-surface">
                  <td className={cn(paddingY.sm, 'text-text')}>{entry.period}</td>
                  <td className={cn(paddingY.sm, 'text-text')}>{entry.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className={stack.md} padding="md" radius="lg">
        <Heading level="h2" className={cn(typography.weight.medium, 'text-primary', stack.md)}>
          LookFors Trends
        </Heading>
        <div className="w-full h-64">
          <Line data={lookForsTrendsData} />
        </div>
      </Card>
    </>
  );
} 