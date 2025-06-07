"use client";

import React, { useState } from "react";
import { Card } from '@composed-components/cards/Card';
import { SectionHeading } from '@composed-components/sectionHeadings';
import { InfoCard } from '@composed-components/cards/InfoCard';
import { Dialog } from '@composed-components/dialogs/Dialog';
// import { VisitView } from '@feature-components/visits/VisitView';
import { Text } from '@/components/core/typography/Text';
import { useSchoolVisitCards } from "@hooks/domain/useVisitsWithTransforms";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewVisit = (visit: Visit) => {
    setSelectedVisit(visit);
    setIsDialogOpen(true);
  };

  const handleEditVisit = (visit: Visit) => {
    console.log('Edit visit:', visit._id);
  };

  // ✨ SIMPLIFIED: Use enhanced hook with transformers
  const { 
    visits,
    visitInfoCards,
    isLoading: visitsLoading, 
    error: visitsError 
  } = useSchoolVisitCards(schoolId, {
    onView: handleViewVisit,
    onEdit: handleEditVisit
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
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

      {/* Visit Detail Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        title="Visit Details"
        size="full"
      >
        {selectedVisit && (
          <div className="h-full">
            {/* <VisitView  */}
              {/* visit={selectedVisit}
              className="h-full"
            /> */}
          </div>
        )}
      </Dialog>
    </>
  );
} 