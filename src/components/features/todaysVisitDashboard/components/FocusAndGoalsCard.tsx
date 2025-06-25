import React from 'react';
import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Badge } from '@/components/core/feedback/Badge';
import { FlagIcon, EyeIcon, HandRaisedIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { useTodaysVisitData } from '../context/TodaysVisitContext';

export function FocusAndGoalsCard() {
  const { todaysVisit, isLoading } = useTodaysVisitData();

  if (isLoading) {
    return (
      <Card padding="lg" className="animate-pulse">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!todaysVisit) {
    return (
      <Card padding="lg" className="text-center">
        <div className="space-y-4">
          <FlagIcon className="h-8 w-8 text-gray-400 mx-auto" />
          <Text color="muted">No focus data available</Text>
        </div>
      </Card>
    );
  }

  const { focus, weeklyPlan } = todaysVisit;

  return (
    <Card padding="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <FlagIcon className="h-6 w-6 text-blue-600" />
          <Heading level="h3" color="default">
            Focus & Goals
          </Heading>
        </div>

        {/* Overall Goal */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AcademicCapIcon className="h-5 w-5 text-green-600" />
            <Text textSize="sm" color="muted" className="font-medium uppercase tracking-wide">
              Overall Action Plan Goal
            </Text>
          </div>
          <Text color="default" className="pl-7">
            {focus.overallGoal || 'No overall goal defined'}
          </Text>
        </div>

        {/* IPG Focus */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge intent="secondary" className="text-xs">
              IPG FOCUS
            </Badge>
          </div>
          <div className="space-y-2 pl-2">
            <div className="flex items-center gap-2">
              <Text textSize="sm" color="muted" className="font-medium">
                Core Action:
              </Text>
              <Badge intent="primary">
                {focus.ipgCoreAction}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Text textSize="sm" color="muted" className="font-medium">
                Sub-Category:
              </Text>
              <Badge intent="info">
                {focus.ipgSubCategory}
              </Badge>
            </div>
          </div>
        </div>

        {/* Weekly Focus */}
        {focus.weeklyFocus && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <EyeIcon className="h-5 w-5 text-orange-600" />
              <Text textSize="sm" color="muted" className="font-medium uppercase tracking-wide">
                This Visit Focus
              </Text>
            </div>
            <Text color="default" className="pl-7">
              {focus.weeklyFocus}
            </Text>
          </div>
        )}

        {/* What to Look For */}
        {weeklyPlan?.lookFor && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <EyeIcon className="h-5 w-5 text-purple-600" />
              <Text textSize="sm" color="muted" className="font-medium uppercase tracking-wide">
                What to Look For
              </Text>
            </div>
            <Text color="default" className="pl-7">
              {weeklyPlan.lookFor}
            </Text>
          </div>
        )}

        {/* Actions */}
        {(weeklyPlan?.coachAction || weeklyPlan?.teacherAction) && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <HandRaisedIcon className="h-5 w-5 text-blue-600" />
              <Text textSize="sm" color="muted" className="font-medium uppercase tracking-wide">
                Planned Actions
              </Text>
            </div>
            
            <div className="space-y-3 pl-7">
              {weeklyPlan.coachAction && (
                <div className="space-y-1">
                  <Text textSize="sm" color="muted" className="font-medium">
                    Coach Actions:
                  </Text>
                  <Text color="default" textSize="sm">
                    {weeklyPlan.coachAction}
                  </Text>
                </div>
              )}
              
              {weeklyPlan.teacherAction && (
                <div className="space-y-1">
                  <Text textSize="sm" color="muted" className="font-medium">
                    Teacher Actions:
                  </Text>
                  <Text color="default" textSize="sm">
                    {weeklyPlan.teacherAction}
                  </Text>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 