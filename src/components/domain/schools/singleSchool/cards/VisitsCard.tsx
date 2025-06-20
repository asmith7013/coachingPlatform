"use client";

import React, { useState, useEffect } from "react";
import { Card } from '@composed-components/cards/Card';
import { SectionHeading } from '@composed-components/sectionHeadings';
import { InfoCard } from '@composed-components/cards/InfoCard';
import { Dialog } from '@composed-components/dialogs/Dialog';
import { ScheduleGrid } from '@/components/features/schedules';
import { useScheduleDisplayData, useScheduleComponentsActions } from '@/components/features/schedules/hooks';
import { Text } from '@/components/core/typography/Text';
import { useVisits } from "@hooks/domain/useVisits";
import { ScheduleAssignmentType } from '@enums';
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
  
  // Add schedule state for edit dialog
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);

  const handleViewVisit = (visit: Visit) => {
    setSelectedVisit(visit);
    setIsViewDialogOpen(true);
  };

  const handleEditVisit = (visit: Visit) => {
    console.log('Opening edit dialog for visit:', visit._id);
    setSelectedVisit(visit);
    setIsEditDialogOpen(true);
    // Reset schedule selection when opening edit dialog
    setSelectedTeacher(null);
    setSelectedPeriod(null);
  };

  // Fix the visits filter - schoolId is correct for visits
  const { 
    items: visits = [],
    isLoading: visitsLoading, 
    error: visitsError 
  } = useVisits.list({
    filters: { schoolId: schoolId },
    limit: 5, // Show recent 5 visits
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Add this comprehensive debug block right after the hook call
  useEffect(() => {
    console.log('🔍 VISITS CARD DEBUG - Hook Results:', {
      hookCall: {
        schoolId,
        schoolIdType: typeof schoolId,
        filters: { schoolId: schoolId },
        hookParams: {
          limit: 5,
          sortBy: 'date',
          sortOrder: 'desc'
        }
      },
      hookResults: {
        visitsCount: visits.length,
        visitsLoading,
        visitsError: visitsError?.message || null,
        visitsErrorType: visitsError?.constructor.name || null,
        firstVisitSample: visits[0] ? {
          _id: visits[0]._id,
          date: visits[0].date,
          schoolId: visits[0].schoolId,
          coachId: visits[0].coachId,
          allowedPurpose: visits[0].allowedPurpose
        } : null
      },
      componentState: {
        hasRenderingError: false,
        componentMounted: true
      }
    });
  }, [visits, visitsLoading, visitsError, schoolId]);

  // Add this effect to track when schoolId changes
  useEffect(() => {
    console.log('🔍 VISITS CARD DEBUG - SchoolId Changed:', {
      newSchoolId: schoolId,
      schoolIdValid: !!schoolId && schoolId.length === 24, // MongoDB ObjectId length
      timestamp: new Date().toISOString()
    });
  }, [schoolId]);

  // Use existing schedulesComponents hooks for edit dialog
  const scheduleData = useScheduleDisplayData(
    schoolId, 
    selectedVisit?.date ? new Date(selectedVisit.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );

  const scheduleActions = useScheduleComponentsActions({
    schoolId,
    date: selectedVisit?.date || new Date().toISOString().split('T')[0],
    bellSchedule: scheduleData.bellSchedule || undefined
  });

  // Create visit info cards manually
  const visitInfoCards = visits.map((visit: Visit) => ({
    title: visit.date ? new Date(visit.date).toLocaleDateString() : 'No Date',
    subtitle: visit.allowedPurpose || 'No Purpose Set',
    description: `Coach: ${visit.coachId || 'Unknown'}`,
    details: [
      { label: 'Events', value: visit.sessionLinks?.length ? `${visit.sessionLinks.length}` : '0' },
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
    setSelectedTeacher(null);
    setSelectedPeriod(null);
  };

  const handlePortionSelect = async (teacherId: string, period: number, portion: ScheduleAssignmentType) => {
    console.log('Scheduling visit portion:', { teacherId, period, portion });
    try {
      const result = await scheduleActions.scheduleVisit(teacherId, period, portion);
      if (result.success) {
        console.log('Visit scheduled successfully');
      } else {
        console.error('Failed to schedule visit:', result.error);
      }
    } catch (error) {
      console.error('Error scheduling visit:', error);
    }
  };

  // console.log('🔍 VisitsCard Debug:', {
  //   schoolId,
  //   visitsLoading,
  //   visitsError,
  //   visitsCount: visits.length,
  //   filters: { schoolId: schoolId }
  // });

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
              Error loading visits: {String(visitsError)}
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

      {/* Edit Visit Dialog with ScheduleGrid */}
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
            
            {scheduleData.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Text textSize="sm" color="muted">Loading schedule data...</Text>
              </div>
            ) : scheduleData.error ? (
              <div className="flex items-center justify-center py-8">
                <Text textSize="base" color="danger">
                  Error loading schedule: {String(scheduleData.error)}
                </Text>
              </div>
            ) : (
              <ScheduleGrid
                teachers={scheduleData.staff}
                timeSlots={scheduleData.bellSchedule?.timeBlocks || []}
                visits={scheduleActions.currentVisitSchedule?.timeBlocks || []}
                onCellClick={(teacherId, period) => {
                  setSelectedTeacher(teacherId);
                  setSelectedPeriod(period);
                }}
                onPortionSelect={handlePortionSelect}
                selectedTeacher={selectedTeacher || undefined}
                selectedPeriod={selectedPeriod || undefined}
                scheduleStatus={scheduleActions.isLoading ? 'loading' : scheduleActions.error ? 'error' : 'ready'}
                scheduleStatusText={
                  scheduleActions.isLoading ? 'Updating schedule...' :
                  scheduleActions.error ? 'Schedule error' :
                  'Schedule ready'
                }
              />
            )}
          </div>
        )}
      </Dialog>
    </>
  );
} 