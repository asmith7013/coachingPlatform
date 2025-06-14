'use client';

import React from 'react';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/composed/cards';
import { Text } from '@/components/core/typography/Text';
import { Heading } from '@/components/core/typography/Heading';
import { ClassroomObservationV2 } from '@zod-schema/observations/classroom-observation-v2';
import { toDateString } from '@/lib/data-processing/transformers/utils/date-utils';

interface ObservationCardProps {
  observation: ClassroomObservationV2;
  onEdit: (observation: ClassroomObservationV2) => void;
  onDelete: (id: string) => void;
  onView?: (observation: ClassroomObservationV2) => void;
  isDeleting?: boolean;
  disabled?: boolean;
}

export function ObservationCard({ 
  observation, 
  onEdit, 
  onDelete, 
  onView,
  isDeleting = false,
  disabled = false 
}: ObservationCardProps) {
  
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the observation "${observation.cycle} - ${observation.session}"?`)) {
      onDelete(observation._id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <Card.Body>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Heading level="h4" className="mb-2">
              {observation.cycle} - {observation.session}
            </Heading>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div>
                <Text textSize="sm" color="muted">
                  Date: {toDateString(new Date(observation.date))}
                </Text>
              </div>
              
              <div>
                <Text textSize="sm" color="muted">
                  Status: <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    observation.status === 'completed' ? 'bg-green-100 text-green-800' :
                    observation.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    observation.status === 'reviewed' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {observation.status}
                  </span>
                </Text>
              </div>
              
              {observation.lessonTitle && (
                <div>
                  <Text textSize="sm" color="muted">
                    Lesson: {observation.lessonTitle}
                  </Text>
                </div>
              )}
              
              {observation.lessonCourse && (
                <div>
                  <Text textSize="sm" color="muted">
                    Course: {observation.lessonCourse}
                  </Text>
                </div>
              )}
              
              {observation.otherContext && (
                <div>
                  <Text textSize="sm" color="muted">
                    Context: {observation.otherContext.length > 100 
                      ? `${observation.otherContext.substring(0, 100)}...` 
                      : observation.otherContext}
                  </Text>
                </div>
              )}
              
              <div>
                <Text textSize="sm" color="muted">
                  Shared with Teacher: {observation.isSharedWithTeacher ? 'Yes' : 'No'}
                </Text>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 ml-4">
            {onView && (
              <Button
                appearance="outline"
                onClick={() => onView(observation)}
                disabled={disabled}
                className="flex items-center gap-1 text-sm"
              >
                👁️ View
              </Button>
            )}
            
            <Button
              appearance="outline"
              onClick={() => onEdit(observation)}
              disabled={disabled}
              className="flex items-center gap-1 text-sm"
            >
              ✏️ Edit
            </Button>
            
            <Button
              appearance="outline"
              intent="danger"
              onClick={handleDelete}
              disabled={disabled || isDeleting}
              className="flex items-center gap-1 text-sm"
            >
              {isDeleting ? '⏳' : '🗑️'} Delete
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
} 