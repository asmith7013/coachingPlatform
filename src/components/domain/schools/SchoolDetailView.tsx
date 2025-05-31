"use client";

import React from "react";
import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Button } from '@/components/core/Button';
import { useSchoolById } from "@hooks/domain/useSchools";
import { cn } from '@ui/utils/formatters';
import { SimpleCard } from '@/components/core/cards/SimpleCard';

interface SchoolDetailViewProps {
  schoolId: string;
}

export function SchoolDetailView({ schoolId }: SchoolDetailViewProps) {
  const { data: school, isLoading: schoolLoading, error: schoolError } = useSchoolById(schoolId);

  // Mock data for metrics and visits
  const mockMetrics = {
    totalSubscribers: "71,897",
    avgOpenRate: "58.16%",
    avgClickRate: "24.57%"
  };

  const mockVisits = [
    { id: "1", name: "Tuple", lastInvoice: "December 13, 2022", amount: "$2,000.00", status: "Overdue" },
    { id: "2", name: "SavvyCal", lastInvoice: "January 22, 2023", amount: "$14,000.00", status: "Paid" },
    { id: "3", name: "Reform", lastInvoice: "January 23, 2023", amount: "$7,600.00", status: "Paid" }
  ];

  const mockStaff = [
    { id: "1", name: "John Smith", role: "Teacher", subjects: "Math, Science" },
    { id: "2", name: "Jane Doe", role: "Principal", subjects: "Administration" },
    { id: "3", name: "Bob Johnson", role: "Teacher", subjects: "English, History" },
    { id: "4", name: "Alice Brown", role: "Teacher", subjects: "Art, Music" }
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockVisits.map((visit) => (
            <div key={visit.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-sm">
                  {visit.name.charAt(0)}
                </div>
                <Text className="font-medium">{visit.name}</Text>
              </div>
              <Text textSize="sm" color="muted">Last invoice: {visit.lastInvoice}</Text>
              <div className="flex justify-between items-center mt-2">
                <Text className="font-semibold">{visit.amount}</Text>
                <span className={cn(
                  "px-2 py-1 rounded text-xs",
                  visit.status === "Paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {visit.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Teachers Section */}
      <Card padding="lg" radius="lg">
        <Heading level="h2" className="text-xl font-semibold bg-blue-500 text-white px-4 py-2 rounded mb-6">
          Teachers
        </Heading>
        <ul role="list" className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {mockStaff.map((teacher, index) => {
            const teacherColors = ['pink', 'purple', 'yellow', 'green', 'blue', 'red'] as const;
            const initials = teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2);
            
            return (
              <SimpleCard
                key={teacher.id}
                initials={initials}
                title={teacher.name}
                subtitle={teacher.subjects}
                colorVariant={teacherColors[index % teacherColors.length]}
                clickable
                showAction
                onClick={() => {
                  console.log('Navigate to teacher:', teacher.name);
                  // Navigate to teacher detail page
                  // router.push(`/dashboard/staff/${teacher.id}`);
                }}
                onActionClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  console.log('Show teacher options for', teacher.name);
                  // Show teacher options menu
                }}
              />
            );
          })}
        </ul>
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