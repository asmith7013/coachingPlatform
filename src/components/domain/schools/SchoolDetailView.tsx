"use client";

import React, { useMemo } from "react";
import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Button } from '@/components/core/Button';
import { useSchoolById } from "@hooks/domain/useSchools";
import { useVisitsList } from "@hooks/domain/useVisits";
import { useNYCPSStaffList } from "@hooks/domain/useNYCPSStaff";
import { cn } from '@ui/utils/formatters';
import { SimpleCard } from '@/components/core/cards/SimpleCard';

interface SchoolDetailViewProps {
  schoolId: string;
}

export function SchoolDetailView({ schoolId }: SchoolDetailViewProps) {
  const { data: school, isLoading: schoolLoading, error: schoolError } = useSchoolById(schoolId);

  // Fetch real visits data for this school
  const { 
    items: visits, 
    isLoading: visitsLoading, 
    error: visitsError 
  } = useVisitsList({
    filters: { school: schoolId },
    limit: 3,
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Fetch real staff data
  const { 
    items: allStaff, 
    isLoading: staffLoading, 
    error: staffError 
  } = useNYCPSStaffList({
    limit: 50, // Get more staff to filter locally
    sortBy: 'staffName',
    sortOrder: 'asc'
  });

  // Filter staff for this specific school
  const schoolStaff = useMemo(() => {
    if (!allStaff || !schoolId) return [];
    return allStaff.filter(staff => 
      staff.schools && staff.schools.includes(schoolId)
    );
  }, [allStaff, schoolId]);

  // Mock data for metrics
  const mockMetrics = {
    totalSubscribers: "71,897",
    avgOpenRate: "58.16%",
    avgClickRate: "24.57%"
  };

  if (schoolLoading) return <Text textSize="base">Loading school details...</Text>;
  if (schoolError) return <Text textSize="base" color="danger">Error loading school: {schoolError.message}</Text>;
  if (!school) return <Text textSize="base">School not found</Text>;

  return (
    <div className="space-y-6">
      {/* School Header */}
      <div className="flex justify-between items-start">
        <div>
          <Heading level="h1" className="text-3xl font-bold">
            {school.emoji || '🏫'} {school.schoolName}
          </Heading>
          <Text textSize="lg" color="muted" className="mt-2">
            District: {school.district}
          </Text>
          {school.address && (
            <Text textSize="base" color="muted" className="mt-1">
              {school.address}
            </Text>
          )}
          {school.createdAt && (
            <Text textSize="sm" color="muted" className="mt-1">
              Created: {school.createdAt.toLocaleDateString()}
            </Text>
          )}
        </div>
        <Button 
          className="bg-red-500 text-white hover:bg-red-600"
          padding="md"
        >
          Delete
        </Button>
      </div>

      {/* Grade Levels */}
      <Card padding="lg" radius="lg">
        <Heading level="h2" className="text-xl font-semibold bg-blue-500 text-white px-4 py-2 rounded mb-6">
          Grade Levels
        </Heading>
        <div className="flex flex-wrap gap-2">
          {school.gradeLevelsSupported && school.gradeLevelsSupported.map((grade: string, index: number) => (
            <span 
              key={index} 
              className={cn(
                'rounded-full px-3 py-1',
                'text-sm',
                'text-white',
                'bg-primary'
              )}
            >
              {grade}
            </span>
          ))}
        </div>
      </Card>

      {/* Visits Section */}
      <Card padding="lg" radius="lg">
        <div className="flex justify-between items-center mb-6">
          <Heading level="h2" className="text-xl font-semibold bg-blue-500 text-white px-4 py-2 rounded">
            Visits
          </Heading>
          <Text color="primary" className="cursor-pointer hover:underline">
            View all
          </Text>
        </div>
        
        {visitsLoading ? (
          <Text textSize="base">Loading visits...</Text>
        ) : visitsError ? (
          <Text textSize="base" color="danger">Error loading visits: {visitsError.message}</Text>
        ) : visits.length === 0 ? (
          <Text textSize="base" color="muted">No visits found for this school.</Text>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {visits.map((visit) => (
              <div key={visit._id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white text-sm">
                    📅
                  </div>
                  <Text className="font-medium">
                    {visit.date ? new Date(visit.date).toLocaleDateString() : 'No date'}
                  </Text>
                </div>
                <Text textSize="sm" color="muted">
                  Coach: {visit.coach || 'Unknown'}
                </Text>
                {visit.allowedPurpose && (
                  <Text textSize="sm" color="muted">
                    Purpose: {visit.allowedPurpose}
                  </Text>
                )}
                {visit.modeDone && (
                  <Text textSize="sm" color="muted">
                    Mode: {visit.modeDone}
                  </Text>
                )}
                <div className="flex justify-between items-center mt-2">
                  <Text className="font-semibold">
                    {visit.events?.length || 0} events
                  </Text>
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                    {visit.allowedPurpose || 'Visit'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Teachers Section */}
      <Card padding="lg" radius="lg">
        <Heading level="h2" className="text-xl font-semibold bg-blue-500 text-white px-4 py-2 rounded mb-6">
          Teachers ({schoolStaff.length})
        </Heading>
        
        {staffLoading ? (
          <Text textSize="base">Loading staff...</Text>
        ) : staffError ? (
          <Text textSize="base" color="danger">Error loading staff: {staffError.message}</Text>
        ) : schoolStaff.length === 0 ? (
          <Text textSize="base" color="muted">No staff found for this school.</Text>
        ) : (
          <ul role="list" className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {schoolStaff.map((teacher, index) => {
              const teacherColors = ['pink', 'purple', 'yellow', 'green', 'blue', 'red'] as const;
              const initials = teacher.staffName
                ? teacher.staffName.split(' ')
                    .map(n => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : '??';
              
              // Get primary role and subjects
              const primaryRole = teacher.rolesNYCPS && teacher.rolesNYCPS.length > 0 
                ? teacher.rolesNYCPS[0] 
                : 'Staff';
              
              const subjects = teacher.subjects && teacher.subjects.length > 0
                ? teacher.subjects.join(', ')
                : 'No subjects assigned';
              
              return (
                <SimpleCard
                  key={teacher._id}
                  initials={initials}
                  title={teacher.staffName || 'Unknown Staff'}
                  subtitle={`${primaryRole} • ${subjects}`}
                  colorVariant={teacherColors[index % teacherColors.length]}
                  clickable
                  showAction
                  onClick={() => {
                    console.log('Navigate to teacher:', teacher.staffName);
                    // Navigate to teacher detail page
                    // router.push(`/dashboard/staff/${teacher._id}`);
                  }}
                  onActionClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    console.log('Show teacher options for', teacher.staffName);
                    // Show teacher options menu
                  }}
                />
              );
            })}
          </ul>
        )}
      </Card>

      {/* Metrics Section */}
      <Card padding="lg" radius="lg">
        <Heading level="h2" className="text-xl font-semibold bg-blue-500 text-white px-4 py-2 rounded mb-6">
          Metrics
        </Heading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Text textSize="sm" color="muted" className="mb-2">Total Subscribers</Text>
            <Text className="text-3xl font-bold">{mockMetrics.totalSubscribers}</Text>
          </div>
          <div className="text-center">
            <Text textSize="sm" color="muted" className="mb-2">Avg. Open Rate</Text>
            <Text className="text-3xl font-bold">{mockMetrics.avgOpenRate}</Text>
          </div>
          <div className="text-center">
            <Text textSize="sm" color="muted" className="mb-2">Avg. Click Rate</Text>
            <Text className="text-3xl font-bold">{mockMetrics.avgClickRate}</Text>
          </div>
        </div>
      </Card>
    </div>
  );
} 