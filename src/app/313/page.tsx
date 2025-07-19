'use client'

import React from 'react';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Card } from '@/components/composed/cards/Card';
import { Button } from '@/components/core/Button';
import { UserGroupIcon, ChartBarIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function SummerProgramHome() {
  return (
    <div className="p-8">
      <Heading 
        level="h1" 
        color="default"
        className="text-primary mb-2"
      >
        313 Summer Program Dashboard
      </Heading>
      <Text 
        textSize="lg"
        color="muted"
        className="mb-8"
      >
        Welcome to the 313 Summer Program management system. Monitor student progress, 
        analyze performance data, and manage curriculum across Districts 9 and 11.
      </Text>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card padding="lg" radius="lg" shadow="md">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <Text textSize="sm" color="muted">Total Students</Text>
              <Text textSize="2xl" className="font-bold">--</Text>
            </div>
          </div>
        </Card>
        
        <Card padding="lg" radius="lg" shadow="md">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <Text textSize="sm" color="muted">Active Sections</Text>
              <Text textSize="2xl" className="font-bold">7</Text>
            </div>
          </div>
        </Card>
        
        <Card padding="lg" radius="lg" shadow="md">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-purple-600 mr-4" />
            <div>
              <Text textSize="sm" color="muted">Districts</Text>
              <Text textSize="2xl" className="font-bold">2</Text>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card padding="lg" radius="lg" shadow="md">
          <Heading level="h3" className="mb-4">Student Management</Heading>
          <Text textSize="sm" color="muted" className="mb-4">
            View and manage all summer program students across districts and sections.
          </Text>
          <Link href="/313/students">
            <Button intent="primary" className="w-full">
              <UserGroupIcon className="h-5 w-5 mr-2" />
              View Students
            </Button>
          </Link>
        </Card>
        
        <Card padding="lg" radius="lg" shadow="md">
          <Heading level="h3" className="mb-4">Program Analytics</Heading>
          <Text textSize="sm" color="muted" className="mb-4">
            Analyze program performance, student progress, and district comparisons.
          </Text>
          <Link href="/313/analytics">
            <Button intent="secondary" className="w-full">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              View Analytics
            </Button>
          </Link>
        </Card>
      </div>

      {/* District Overview */}
      <div className="mt-8">
        <Heading level="h2" className="mb-4">District Overview</Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card padding="lg" radius="lg" shadow="sm" className="border-l-4 border-l-blue-500">
            <Heading level="h4" className="mb-2">District 9</Heading>
            <Text textSize="sm" color="muted" className="mb-3">
              Sections: SR1, SR2, SR3 | Teachers: BANIK, VIVAR
            </Text>
            <Link href="/313/students?district=D9">
              <Button intent="secondary" appearance="outline" textSize="sm">View D9 Students</Button>
            </Link>
          </Card>
          
          <Card padding="lg" radius="lg" shadow="sm" className="border-l-4 border-l-green-500">
            <Heading level="h4" className="mb-2">District 11</Heading>
            <Text textSize="sm" color="muted" className="mb-3">
              Sections: SRF, SR6, SR7, SR8 | Teachers: ISAAC, SCERRA
            </Text>
            <Link href="/313/students?district=D11">
              <Button intent="secondary" appearance="outline" textSize="sm">View D11 Students</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
