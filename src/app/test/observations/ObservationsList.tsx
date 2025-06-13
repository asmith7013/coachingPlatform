'use client';

import React from 'react';
import { Card } from '@/components/composed/cards';
import { Text } from '@/components/core/typography/Text';
import { Heading } from '@/components/core/typography/Heading';
import { ClassroomObservationNote } from '@/lib/schema/zod-schema/observations/classroom-observation';
import { ObservationCard } from './ObservationCard';
import { SkeletonContainer } from '@/components/composed/feedback/SkeletonContainer';
import { ObservationListSkeleton } from '@/components/domain/observations/ObservationListSkeleton';

interface ObservationsListProps {
  observations: ClassroomObservationNote[];
  isLoading: boolean;
  error?: string;
  onEdit: (observation: ClassroomObservationNote) => void;
  onDelete: (id: string) => void;
  onView?: (observation: ClassroomObservationNote) => void;
  deletingIds?: string[];
}

export function ObservationsList({
  observations,
  isLoading,
  error,
  onEdit,
  onDelete,
  onView,
  deletingIds = []
}: ObservationsListProps) {
  return (
    <SkeletonContainer
      isLoading={isLoading}
      error={error}
      skeleton={<ObservationListSkeleton count={3} />}
      errorComponent={
        <Card>
          <Card.Body>
            <div className="text-center py-8">
              <Text color="danger">Error loading observations: {error}</Text>
            </div>
          </Card.Body>
        </Card>
      }
    >
      <Card>
        <Card.Header>
          <Heading level="h3">Existing Observations</Heading>
          <Text textSize="sm" color="muted">
            {observations.length} observation{observations.length !== 1 ? 's' : ''}
          </Text>
        </Card.Header>
        
        <Card.Body>
          {observations.length === 0 ? (
            <div className="text-center py-8">
              <Text color="muted">
                No observations found. Create your first observation using the form above.
              </Text>
            </div>
          ) : (
            <div className="space-y-4">
              {observations.map((observation) => (
                <ObservationCard
                  key={observation._id}
                  observation={observation}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                  isDeleting={deletingIds.includes(observation._id)}
                  disabled={deletingIds.length > 0}
                />
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </SkeletonContainer>
  );
} 