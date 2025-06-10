import React from 'react';
import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Button } from '@/components/core/Button';
import { Badge } from '@/components/core/feedback/Badge';
import { cn } from '@ui/utils/formatters';
import { formatDistance } from 'date-fns';
import { Edit2, Copy, Archive, Trash2, FileText } from 'lucide-react';
import type { CoachingActionPlan } from '@zod-schema/core/cap';
import { calculatePlanProgress } from '@/lib/data-processing/transformers/utils/coaching-action-plan-utils';

// Types for the component
interface ActionPlanCardProps {
  plan: CoachingActionPlan & { _id: string; createdAt?: string; updatedAt?: string };
  onEdit?: (planId: string) => void;
  onDuplicate?: (planId: string) => void;
  onArchive?: (planId: string) => void;
  onDelete?: (planId: string) => void;
  onExport?: (planId: string) => void;
  className?: string;
}

// Stage completion indicator component
interface StageIndicatorProps {
  stageName: string;
  isComplete: boolean;
  stageNumber: number;
}

function StageIndicator({ stageName, isComplete, stageNumber }: StageIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold",
          isComplete
            ? "bg-success border-success text-white"
            : "bg-white border-muted text-muted"
        )}
      >
        {stageNumber}
      </div>
      <Text
        textSize="sm"
        color={isComplete ? "success" : "muted"}
        className="font-medium"
      >
        {stageName}
      </Text>
    </div>
  );
}

// Status badge component following existing patterns
function StatusBadge({ status }: { status: string }) {
  const getStatusIntent = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'neutral';
      case 'active':
        return 'primary';
      case 'completed':
        return 'success';
      case 'archived':
        return 'secondary';
      default:
        return 'neutral';
    }
  };

  return (
    <Badge intent={getStatusIntent(status)} size="sm">
      {status}
    </Badge>
  );
}

export function ActionPlanCard({
  plan,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  onExport,
  className
}: ActionPlanCardProps) {
  const progress = calculatePlanProgress(plan);
  
  // Extract key information for display (using correct field names)
  const teacherNames = plan.teachers?.join(', ') || 'Unknown Teacher';
  const schoolName = plan.school || 'Unknown School';
  const coreAction = plan.needsAndFocus?.ipgCoreAction || 'Not Set';
  const status = plan.status || 'draft';
  
  // Format dates
  const createdDate = formatDistance(plan.createdAt || new Date(), new Date(), { addSuffix: true });
  const updatedDate = formatDistance(plan.updatedAt || new Date(), new Date(), { addSuffix: true });

  // Define stages for progress indicators
  const stages = [
    { name: 'Needs & Focus', key: 'needsAndFocus', number: 1 },
    { name: 'Goal & Metrics', key: 'goal', number: 2 },
    { name: 'Implementation', key: 'implementationRecords', number: 3 },
    { name: 'Analysis', key: 'endOfCycleAnalysis', number: 4 }
  ];

  return (
    <Card 
      padding="md" 
      radius="lg" 
      border 
      shadow="sm" 
      className={cn("hover:shadow-md transition-shadow", className)}
    >
      <Card.Header>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Heading level="h3" className="text-lg font-semibold">
                {teacherNames}
              </Heading>
              <StatusBadge status={status} />
            </div>
            <Text textSize="sm" color="muted">
              {schoolName} • Focus: {coreAction}
            </Text>
          </div>
          
          {/* Progress Circle */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-12 h-12 rounded-full border-4 flex items-center justify-center",
                progress.progressPercentage >= 80
                  ? "border-success bg-success-50"
                  : progress.progressPercentage >= 50
                  ? "border-primary bg-primary-50"
                  : "border-muted bg-muted-50"
              )}
            >
              <Text
                textSize="sm"
                weight="bold"
                color={progress.progressPercentage >= 80 ? "success" : "default"}
              >
                {progress.progressPercentage}%
              </Text>
            </div>
            <Text textSize="xs" color="muted" className="mt-1">
              {progress.completedStages}/{progress.totalStages} stages
            </Text>
          </div>
        </div>
      </Card.Header>

      <Card.Body>
        {/* Stage Progress Indicators */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {stages.map((stage) => {
            const stageProgress = progress.stageDetails.find(s => s.stage === stage.key);
            return (
              <StageIndicator
                key={stage.key}
                stageName={stage.name}
                isComplete={stageProgress?.isValid || false}
                stageNumber={stage.number}
              />
            );
          })}
        </div>

        {/* Metadata */}
        <div className="flex justify-between items-center text-xs text-muted">
          <span>Created {createdDate}</span>
          <span>Updated {updatedDate}</span>
        </div>
      </Card.Body>

      <Card.Footer>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {onEdit && (
              <Button
                intent="secondary"
                appearance="outline"
                padding="sm"
                onClick={() => onEdit(plan._id)}
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
            )}
            
            {onDuplicate && (
              <Button
                intent="secondary"
                appearance="outline"
                padding="sm"
                onClick={() => onDuplicate(plan._id)}
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {onExport && (
              <Button
                intent="secondary"
                appearance="outline"
                padding="sm"
                onClick={() => onExport(plan._id)}
              >
                <FileText className="h-4 w-4" />
                Export
              </Button>
            )}
            
            {onArchive && (
              <Button
                intent="secondary"
                appearance="outline"
                padding="sm"
                onClick={() => onArchive(plan._id)}
              >
                <Archive className="h-4 w-4" />
                Archive
              </Button>
            )}
            
            {onDelete && (
              <Button
                intent="danger"
                appearance="outline"
                padding="sm"
                className="text-danger hover:text-danger"
                onClick={() => onDelete(plan._id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </Card.Footer>
    </Card>
  );
} 