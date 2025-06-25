import React from 'react';
import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Badge } from '@/components/core/feedback/Badge';
import { CalendarIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline';
import { useTodaysVisitData, useTodaysVisitStatus } from '../context/TodaysVisitContext';
import { formatMediumDate } from '@/lib/data-processing/transformers/utils/date-utils';

export function VisitOverviewCard() {
  const { todaysVisit, isLoading } = useTodaysVisitData();
  const { hasVisitToday, isVisitInPast, isVisitInFuture } = useTodaysVisitStatus();

  if (isLoading) {
    return (
      <Card padding="lg" className="animate-pulse">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  if (!hasVisitToday || !todaysVisit) {
    return (
      <Card padding="lg" className="text-center">
        <div className="space-y-4">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto" />
          <Heading level="h3" color="muted">
            No Visits Scheduled
          </Heading>
          <Text color="muted">
            There are no coaching visits scheduled for today.
          </Text>
        </div>
      </Card>
    );
  }

  const getStatusBadge = () => {
    if (isVisitInPast) {
      return <Badge intent="success">Completed</Badge>;
    }
    if (isVisitInFuture) {
      return <Badge intent="info">Upcoming</Badge>;
    }
    return <Badge intent="primary">Today</Badge>;
  };

  const getStatusText = () => {
    if (isVisitInPast) {
      return `${Math.abs(todaysVisit.daysFromToday)} day${Math.abs(todaysVisit.daysFromToday) === 1 ? '' : 's'} ago`;
    }
    if (isVisitInFuture) {
      return `In ${todaysVisit.daysFromToday} day${todaysVisit.daysFromToday === 1 ? '' : 's'}`;
    }
    return 'Today';
  };

  return (
    <Card padding="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Heading level="h2" color="default">
                {todaysVisit.actionPlan.title}
              </Heading>
              {getStatusBadge()}
            </div>
            <Text color="muted" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {formatMediumDate(todaysVisit.schedule.date)} • {getStatusText()}
            </Text>
          </div>
        </div>

        {/* Visit Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Text textSize="sm" color="muted" className="font-medium uppercase tracking-wide">
              School
            </Text>
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-gray-400" />
              <Text color="default">
                {todaysVisit.visit.schoolId} {/* TODO: Replace with school name when available */}
              </Text>
            </div>
          </div>

          <div className="space-y-2">
            <Text textSize="sm" color="muted" className="font-medium uppercase tracking-wide">
              Coach
            </Text>
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-gray-400" />
              <Text color="default">
                {todaysVisit.visit.coachId} {/* TODO: Replace with coach name when available */}
              </Text>
            </div>
          </div>

          <div className="space-y-2">
            <Text textSize="sm" color="muted" className="font-medium uppercase tracking-wide">
              Visit Type
            </Text>
            <Text color="default">
              {todaysVisit.visit.allowedPurpose || 'Regular Visit'}
            </Text>
          </div>
        </div>

        {/* Weekly Plan Summary */}
        {todaysVisit.weeklyPlan && (
          <div className="border-t pt-4">
            <div className="space-y-2">
              <Text textSize="sm" color="muted" className="font-medium uppercase tracking-wide">
                This Visit Plan
              </Text>
              <Text color="default">
                Cycle {todaysVisit.weeklyPlan.cycleNumber}, Visit {todaysVisit.weeklyPlan.visitNumber}
              </Text>
                             {todaysVisit.weeklyPlan.focus && (
                 <Text color="muted" className="italic">
                   &ldquo;{todaysVisit.weeklyPlan.focus}&rdquo;
                 </Text>
               )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 