'use client';

import React from 'react';
import { Card } from '@/components/composed/cards';
import { Text } from '@/components/core/typography/Text';
import { Heading } from '@/components/core/typography/Heading';
import { ClassroomObservationNote } from '@/lib/schema/zod-schema/observations/classroom-observation';
import { ObservationCard } from './ObservationCard';

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
  
  if (error) {
    return (
      <Card>
        <Card.Body>
          <div className="text-center py-8">
            <Text color="danger">Error loading observations: {error}</Text>
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <Card.Header>
          <Heading level="h3">Existing Observations</Heading>
          <Text textSize="sm" color="muted">Loading...</Text>
        </Card.Header>
        <Card.Body>
          <div className="space-y-4">
            {/* Loading skeleton */}
            {[1, 2, 3].map(i => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
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
  );
} 