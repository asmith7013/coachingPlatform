"use client";

import React from "react";
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
// import { Button } from '@/components/core/Button';
import { useSchoolById } from "@hooks/domain/useSchools";
import MasterScheduleCard from './cards/MasterScheduleCard';
import { VisitsCard } from './cards/VisitsCard';
import { TeachersCard } from './cards/TeachersCard';
import { CAPCard } from './cards/CAPCard';
import { formatMediumDate } from '@/lib/data-processing/transformers/utils/date-utils';

interface SingleSchoolProps {
  schoolId: string;
}

export function SingleSchool({ schoolId }: SingleSchoolProps) {
  const { data: school, isLoading: schoolLoading, error: schoolError } = useSchoolById(schoolId);

  // Event handlers
  const handleViewAllVisits = () => {
    console.log('Navigate to all visits for school:', schoolId);
    // TODO: Navigate to visits page
    // router.push(`/dashboard/schools/${schoolId}/visits`);
  };

  const handleScheduleVisit = () => {
    console.log('Schedule new visit for school:', schoolId);
    // TODO: Open visit scheduling dialog
  };

  const handleAddTeacher = () => {
    console.log('Add new teacher to school:', schoolId);
    // TODO: Open teacher creation dialog
  };

  const handleTeacherClick = (teacherId: string, teacherName: string) => {
    console.log('Navigate to teacher:', teacherName);
    // TODO: Navigate to teacher detail page
    // router.push(`/dashboard/staff/${teacherId}`);
  };

  const handleTeacherActionClick = (teacherId: string, teacherName: string) => {
    console.log('Show teacher options for:', teacherName);
    // TODO: Show teacher options menu
  };

  const handleExportMetrics = () => {
    console.log('Export metrics data for school:', schoolId);
    // TODO: Export metrics functionality
  };

  const handleViewMetricsReport = () => {
    console.log('View full metrics report for school:', schoolId);
    // TODO: Navigate to metrics report
    // router.push(`/dashboard/schools/${schoolId}/metrics`);
  };

  const _handleDeleteSchool = () => {
    console.log('Delete school:', schoolId);
    // TODO: Show confirmation dialog and delete functionality
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
              Created: {formatMediumDate(school.createdAt as unknown as string)}
            </Text>
          )}
        </div>
        {/* <Button 
          className="bg-red-500 text-white hover:bg-red-600"
          padding="md"
          onClick={handleDeleteSchool}
        >
          Delete
        </Button> */}
      </div>

      {/* Master Schedule Section */}
      <MasterScheduleCard 
        schoolId={schoolId}
        schoolName={school.schoolName}
      />

      {/* Visits Section */}
      <VisitsCard
        schoolId={schoolId}
        onViewAllVisits={handleViewAllVisits}
        onScheduleVisit={handleScheduleVisit}
      />

      {/* Teachers Section */}
      <TeachersCard
        schoolId={schoolId}
        onAddTeacher={handleAddTeacher}
        onTeacherClick={handleTeacherClick}
        onTeacherActionClick={handleTeacherActionClick}
      />

      {/* Metrics Section */}
      <CAPCard
        onExportData={handleExportMetrics}
        onViewReport={handleViewMetricsReport}
      />
    </div>
  );
} 