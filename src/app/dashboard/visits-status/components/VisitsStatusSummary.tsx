import React from 'react';
import { Card } from '@/components/composed/cards/Card';

import { CheckCircleIcon, ExclamationCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Visit } from '@zod-schema/visits/visit';
import { Text } from '@/components/core/typography/Text';
import { Heading } from '@/components/core/typography/Heading';

interface VisitsStatusSummaryProps {
  visits: Visit[];
  isLoading: boolean;
}

export function VisitsStatusSummary({ visits, isLoading }: VisitsStatusSummaryProps) {
  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <Card.Body>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </Card.Body>
        </Card>
      ))}
    </div>;
  }

  const completeCount = visits.filter(v => v.coachingLogSubmitted === true).length;
  const incompleteCount = visits.filter(v => v.coachingLogSubmitted === false).length;
  const scheduledCount = visits.filter(v => !!v.visitScheduleId).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <Card.Body className="flex items-center">
          <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
          <div>
            <Heading level="h3" className="text-green-700">{completeCount}</Heading>
            <Text color="muted">Coaching Logs Complete</Text>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="flex items-center">
          <ExclamationCircleIcon className="h-8 w-8 text-red-500 mr-3" />
          <div>
            <Heading level="h3" className="text-red-700">{incompleteCount}</Heading>
            <Text color="muted">Coaching Logs Pending</Text>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="flex items-center">
          <ClockIcon className="h-8 w-8 text-blue-500 mr-3" />
          <div>
            <Heading level="h3" className="text-blue-700">{scheduledCount}</Heading>
            <Text color="muted">Visits with Schedules</Text>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
} 