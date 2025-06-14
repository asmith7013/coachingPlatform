"use client";

import React from "react";
import Link from 'next/link';
import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Button } from '@/components/core/Button';
import { Badge } from '@/components/core/feedback/Badge';
import type { CoachingActionPlan } from '@zod-schema/core/cap';
import { 
  PencilIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { formatMediumDate } from '@data-processing/transformers/utils/date-utils';

interface ActionPlanCardProps {
  plan: CoachingActionPlan;
  onEdit: (planId: string) => void;
  onDuplicate: (planId: string) => void;
  onArchive?: (planId: string) => void;
  onDelete: (planId: string) => void;
  onExport: (planId: string) => void;
  isDeleting?: boolean;
}

export function ActionPlanCard({ 
  plan, 
  onEdit, 
  onDuplicate, 
  onArchive: _onArchive, 
  onDelete, 
  onExport,
  isDeleting 
}: ActionPlanCardProps) {
  // Calculate stage progress
  const stageProgress = formatStageProgress(plan);
  const progressPercentage = calculateProgressPercentage(plan);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (plan._id && onDelete) {
      if (window.confirm("Are you sure you want to delete this coaching action plan?")) {
        onDelete(plan._id);
      }
    }
  };

  return (
    <Card
      padding="md"
      radius="lg"
      className="relative hover:shadow-lg transition-shadow duration-200"
    >
      {/* Main content - clickable for navigation */}
      <Link href={`/dashboard/coaching-action-plans/${plan._id}`} className="block">
        <div className="cursor-pointer">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0">
              <Heading 
                level="h3" 
                color="default"
                className="text-primary font-medium"
              >
                {plan.title}
              </Heading>
              <Text 
                textSize="base" 
                color="muted"
                className="mt-1"
              >
                Academic Year: {plan.academicYear}
              </Text>
            </div>
            
            {/* Status Badge */}
            <Badge 
              intent={getStatusIntent(plan.status)}
              className="ml-2"
            >
              {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
            </Badge>
          </div>

          {/* Progress Indicator */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <Text textSize="sm" color="default" className="font-medium">
                Progress: {stageProgress}
              </Text>
              <Text textSize="sm" color="muted">
                {progressPercentage}%
              </Text>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Focus Area */}
          {plan.needsAndFocus && (
            <div className="mb-4">
              <Text textSize="sm" color="default" className="font-medium">
                Focus: {plan.needsAndFocus.ipgCoreAction} - {plan.needsAndFocus.ipgSubCategory}
              </Text>
            </div>
          )}

          {/* Dates */}
          <div className="flex justify-between items-center text-sm text-muted mb-4">
            <span>Started: {formatMediumDate(plan.startDate)}</span>
            {plan.endDate && <span>Ends: {formatMediumDate(plan.endDate)}</span>}
          </div>

          {/* Add padding bottom for absolute positioned buttons */}
          <div className="pb-16"></div>
        </div>
      </Link>

      {/* Action buttons positioned absolutely outside the Link */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center pt-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(plan._id);
            }}
            intent="secondary"
            appearance="outline"
            textSize="sm"
            padding="sm"
            className="flex items-center gap-2"
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </Button>
          
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDuplicate(plan._id);
            }}
            intent="secondary"
            appearance="outline"
            textSize="sm"
            padding="sm"
            className="flex items-center gap-2"
          >
            <DocumentDuplicateIcon className="h-4 w-4" />
            Duplicate
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onExport(plan._id);
            }}
            intent="secondary"
            appearance="outline"
            textSize="sm"
            padding="sm"
            className="flex items-center gap-2"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            Export
          </Button>
          
          <Button
            onClick={handleDelete}
            intent="danger"
            appearance="outline"
            textSize="sm"
            padding="sm"
            className="flex items-center gap-2"
            disabled={isDeleting}
          >
            <TrashIcon className="h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Helper functions
function formatStageProgress(plan: CoachingActionPlan): string {
  let completedStages = 0;
  
  if (plan.needsAndFocus) completedStages++;
  if (plan.goal) completedStages++;
  if (plan.weeklyPlans && plan.weeklyPlans.length > 0) completedStages++;
  if (plan.endOfCycleAnalysis) completedStages++;
  
  return `${completedStages}/4 stages completed`;
}

function calculateProgressPercentage(plan: CoachingActionPlan): number {
  let completedStages = 0;
  
  if (plan.needsAndFocus) completedStages++;
  if (plan.goal) completedStages++;
  if (plan.weeklyPlans && plan.weeklyPlans.length > 0) completedStages++;
  if (plan.endOfCycleAnalysis) completedStages++;
  
  return Math.round((completedStages / 4) * 100);
}

function getStatusIntent(status: string): 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'active':
      return 'info';
    case 'draft':
      return 'warning';
    case 'archived':
      return 'danger';
    default:
      return 'info';
  }
} 