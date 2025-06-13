import React from 'react';
import { Card } from '@/components/composed/cards';
import { Skeleton, SkeletonGroup } from '@/components/core/feedback/Skeleton';
import { ObservationSkeleton } from '@/components/composed/feedback/SkeletonCard';

/**
 * Simple skeleton for Observation List
 * Used with SkeletonContainer for clean separation of concerns
 */
interface ObservationListSkeletonProps {
  count?: number;
  showHeader?: boolean;
}

export function ObservationListSkeleton({ 
  count = 3, 
  showHeader = true 
}: ObservationListSkeletonProps) {
  return (
    <Card>
      {showHeader && (
        <Card.Header>
          <Skeleton height="lg" width="1/3" className="mb-2" />
          <Skeleton height="sm" width="1/4" />
        </Card.Header>
      )}
      
      <Card.Body>
        <SkeletonGroup spacing="lg">
          {Array.from({ length: count }, (_, i) => (
            <ObservationSkeleton key={i} />
          ))}
        </SkeletonGroup>
      </Card.Body>
    </Card>
  );
} 