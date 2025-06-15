"use client";

import React from 'react';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/composed/cards';
import { Text } from '@/components/core/typography/Text';
import { Heading } from '@/components/core/typography/Heading';
import { Badge } from '@/components/core/feedback/Badge';
import { CoachingActionPlan } from '@zod-schema/core/cap';
import { EditIcon, TrashIcon, EyeIcon } from 'lucide-react';

interface CoachingActionPlanCardProps {
  plan: CoachingActionPlan;
  onEdit: (plan: CoachingActionPlan) => void;
  onDelete: (id: string) => void;
  onView?: (plan: CoachingActionPlan) => void;
  isDeleting?: boolean;
  disabled?: boolean;
}

export function CoachingActionPlanCard({
  plan,
  onEdit,
  onDelete,
  onView,
  isDeleting = false,
  disabled = false
}: CoachingActionPlanCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'paused': return 'warning';
      case 'draft': return 'neutral';
      default: return 'neutral';
    }
  };

  return (
    <Card className="relative">
      <Card.Body>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Heading level="h4" className="text-lg font-semibold">
                {plan.title}
              </Heading>
              <Text textSize="sm" color="muted">
                {plan.academicYear} • {Array.isArray(plan.teachers) ? plan.teachers.join(', ') : plan.teachers}
              </Text>
            </div>
            <Badge intent={getStatusColor(plan.status)} className="ml-2">
              {plan.status}
            </Badge>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <Text textSize="sm">
              <span className="font-medium">School:</span> {plan.school}
            </Text>
            {plan.startDate && (
              <Text textSize="sm">
                <span className="font-medium">Start Date:</span> {
                  new Date(plan.startDate).toLocaleDateString()
                }
              </Text>
            )}
            {plan.goalDescription && (
              <Text textSize="sm" className="line-clamp-2">
                <span className="font-medium">Goal:</span> {plan.goalDescription}
              </Text>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            {onView && (
              <Button
                appearance="outline"
                onClick={() => onView(plan)}
                disabled={disabled}
                className="flex items-center gap-1"
              >
                <EyeIcon className="h-4 w-4" />
                View
              </Button>
            )}
            
            <Button
              appearance="outline"
              onClick={() => onEdit(plan)}
              disabled={disabled}
              className="flex items-center gap-1"
            >
              <EditIcon className="h-4 w-4" />
              Edit
            </Button>
            
            <Button
              appearance="outline"
              intent="danger"
              onClick={() => onDelete(plan._id)}
              disabled={disabled || isDeleting}
              className="flex items-center gap-1"
            >
              <TrashIcon className="h-4 w-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
} 