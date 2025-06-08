"use client";

import React, { useState } from "react";
import { Card } from '@composed-components/cards/Card';
import { SectionHeading } from '@composed-components/sectionHeadings';
import { InfoCard } from '@composed-components/cards/InfoCard';
import { Dialog } from '@composed-components/dialogs/Dialog';
import { ScheduleBuilder } from '@/components/features/schedulesNew/ScheduleBuilder';
import { Text } from '@/components/core/typography/Text';
import { useVisits } from "@hooks/domain/useVisits";
import { cardGridVariant } from '@/lib/ui/variants';
import { 
  MapPinIcon, 
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import type { Visit } from '@zod-schema/visits/visit';

interface VisitsCardProps {
  schoolId: string;
  onViewAllVisits?: () => void;
  onScheduleVisit?: () => void;
  gridDensity?: 'compact' | 'comfortable' | 'spacious';
}

export function VisitsCard({ 
  schoolId, 
  onViewAllVisits, 
  onScheduleVisit,
  gridDensity = 'comfortable'
}: VisitsCardProps) {
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleViewVisit = (visit: Visit) => {
    setSelectedVisit(visit);
    setIsViewDialogOpen(true);
  };

  const handleEditVisit = (visit: Visit) => {
    console.log('Opening edit dialog for visit:', visit._id);
    setSelectedVisit(visit);
    setIsEditDialogOpen(true);
  };

  const { 
    items: visits = [],
    isLoading: visitsLoading, 
    error: visitsError 
  } = useVisits.list({
    filters: { school: schoolId },
    limit: 5, // Show recent 5 visits
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Create visit info cards manually
  const visitInfoCards = visits.map((visit: Visit) => ({
    title: visit.date ? new Date(visit.date).toLocaleDateString() : 'No Date',
    subtitle: visit.allowedPurpose || 'No Purpose Set',
    description: `Coach: ${visit.coach || 'Unknown'}`,
    details: [
      { label: 'Events', value: visit.events?.length ? `${visit.events.length}` : '0' },
      { label: 'Grade Levels', value: visit.gradeLevelsSupported?.join(', ') || 'None' }
    ],
    actions: [
      {
        label: 'View',
        icon: undefined,
        onClick: () => handleViewVisit(visit)
      },
      {
        label: 'Edit',
        icon: undefined,
        onClick: () => handleEditVisit(visit)
      }
    ]
  }));

  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
    setSelectedVisit(null);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedVisit(null);
  };

  return (
    <>
      <Card padding="lg" radius="lg">
        <SectionHeading
          title="Recent Visits"
          subtitle={`${visits.length} recent visits`}
          icon={MapPinIcon}
          iconVariant="colored"
          actions={[
            {
              type: 'button',
              variant: 'secondary',
              children: 'View All',
              onClick: onViewAllVisits || (() => console.log('View all visits'))
            },
            {
              type: 'button',
              variant: 'primary',
              children: 'Schedule Visit',
              onClick: onScheduleVisit || (() => console.log('Schedule new visit'))
            }
          ]}
        />
        
        {visitsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              <Text textSize="sm" color="muted">Loading visits...</Text>
            </div>
          </div>
        ) : visitsError ? (
          <div className="flex items-center justify-center py-8">
            <Text textSize="base" color="danger">
              Error loading visits: {visitsError.message}
            </Text>
          </div>
        ) : visits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CalendarDaysIcon className="h-12 w-12 text-gray-400 mb-4" />
            <Text textSize="base" color="muted" className="text-center">
              No visits found for this school.
            </Text>
            <Text textSize="sm" color="muted" className="text-center mt-2">
              Schedule a visit to get started with coaching activities.
            </Text>
          </div>
        ) : (
          <div className={cardGridVariant({ density: gridDensity })}>
            {visitInfoCards.map((cardProps, index) => (
              <InfoCard
                key={visits[index]._id}
                size="md"
                {...cardProps}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Visit Detail Dialog (View Only) */}
      <Dialog
        open={isViewDialogOpen}
        onClose={handleCloseViewDialog}
        title="Visit Details"
        size="full"
      >
        {selectedVisit && (
          <div className="h-full">
            <div className="p-6">
              <Text textSize="lg">Visit Details for {selectedVisit.date ? new Date(selectedVisit.date).toLocaleDateString() : 'Unknown Date'}</Text>
              <Text textSize="sm" color="muted">Read-only view - implementation pending</Text>
            </div>
          </div>
        )}
      </Dialog>

      {/* Edit Visit Dialog with Schedule Builder */}
      <Dialog
        open={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        title={`Edit Visit Schedule - ${selectedVisit?.date ? new Date(selectedVisit.date).toLocaleDateString() : ''}`}
        size="full"
      >
        {selectedVisit && (
          <div className="h-full p-6">
            <div className="mb-4">
              <Text textSize="base" color="muted">
                Use the schedule grid below to update the visit plan for this date.
              </Text>
            </div>
            
            <ScheduleBuilder 
              schoolId={schoolId}
              date={selectedVisit.date ? new Date(selectedVisit.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
              mode="edit"
              visitId={selectedVisit._id}
            />
          </div>
        )}
      </Dialog>
    </>
  );
} 