import React, { useState } from 'react';
import { Heading, Text } from '@/components/core/typography';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { TeacherSelectionPanel, VisitScheduleGrid } from './components';
import { useScheduleDisplayData } from './hooks/useScheduleDisplayData';
import { useVisitSchedules } from '@/hooks/domain/schedules/useVisitSchedules';
import { ScheduleAssignmentType } from '@/lib/schema/enum/shared-enums';
import { handleClientError } from '@error/handlers/client';
import { handleValidationError } from '@error/handlers/validation';
import { createScheduleErrorContext, createScheduleDataErrorContext } from './utils/schedule-error-utils';
import { ZodError } from 'zod';
import { 
  VisitSchedule,
  VisitScheduleInput 
} from '@zod-schema/schedules/schedule-documents';
import { VisitScheduleBlock } from '@zod-schema/schedules/schedule-events';

interface VisitScheduleTestPageProps {
  schoolId: string;
  date: string;
}

// Error fallback component for visit schedule errors
const VisitScheduleErrorFallback = (error: Error, resetError: () => void) => (
  <div className="p-8">
    <Heading level="h2">Unable to Load Visit Schedule</Heading>
    <Text className="mt-2 text-red-600">{error.message}</Text>
    <button
      onClick={resetError}
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Try Again
    </button>
  </div>
);

export const VisitScheduleTestPage: React.FC<VisitScheduleTestPageProps> = ({ 
  schoolId, 
  date 
}) => {
  return (
    <ErrorBoundary 
      context="VisitSchedule" 
      fallback={VisitScheduleErrorFallback}
    >
      <VisitScheduleTestPageContent schoolId={schoolId} date={date} />
    </ErrorBoundary>
  );
};

const VisitScheduleTestPageContent: React.FC<VisitScheduleTestPageProps> = ({ 
  schoolId, 
  date 
}) => {
  // Local state
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  
  // Use simplified data hooks with standard error pattern
  const scheduleData = useScheduleDisplayData(schoolId, date);
  const visitSchedules = useVisitSchedules.list({ filters: { schoolId } });
  const visitScheduleMutations = useVisitSchedules.mutations();

  // Use first available schedule or create new one
  const currentVisitSchedule = visitSchedules.items?.[0];

  const _createTestVisitSchedule = async () => {
    if (!scheduleData.bellSchedule) {
      const errorContext = createScheduleDataErrorContext('createTestSchedule', schoolId, date);
      handleClientError(new Error('Bell schedule not available'), errorContext);
      return;
    }
    
    const testVisitSchedule: VisitScheduleInput = {
      scheduleType: "visitSchedule",
      schoolId,
      dayIndices: [0], // Monday
      cycleId: "test-cycle-id", 
      date: date,
      coachingActionPlanId: "test-cap-id", 
      coachId: "test-coach-id", 
      bellScheduleId: scheduleData.bellSchedule._id,
      timeBlocks: [], 
      ownerIds: []
    };

    try {
      if (!visitScheduleMutations.createAsync) {
        const errorContext = createScheduleErrorContext('mutationAccess', {
          availableMethods: Object.keys(visitScheduleMutations)
        });
        handleClientError(new Error('createAsync mutation not available'), errorContext);
        return;
      }
      
      const result = await visitScheduleMutations.createAsync(testVisitSchedule as VisitSchedule);
      if (!result || !result.data || !result.data._id) {
        const errorContext = createScheduleDataErrorContext('createTestSchedule', schoolId, date, {
          result
        });
        handleClientError(new Error('Failed to create test visit schedule'), errorContext);
      }
    } catch (error) {
      const errorContext = createScheduleDataErrorContext('createTestSchedule', schoolId, date, {
        testVisitSchedule
      });
      handleClientError(error, errorContext);
    }
  };

  const handleTeacherSelect = (teacherId: string) => {
    setSelectedTeacher(selectedTeacher === teacherId ? null : teacherId);
  };

  const handlePeriodSchedule = async (
    periodNumber: number, 
    portion: ScheduleAssignmentType
  ) => {
    console.log('🎯 handlePeriodSchedule called:', { periodNumber, portion, selectedTeacher, currentVisitScheduleId: currentVisitSchedule?._id });
    
    if (!selectedTeacher || !currentVisitSchedule || !scheduleData.bellSchedule) {
      const errorContext = createScheduleErrorContext('scheduleVisit', {
        selectedTeacher: !!selectedTeacher,
        currentVisitSchedule: !!currentVisitSchedule,
        bellSchedule: !!scheduleData.bellSchedule
      });
      handleClientError(new Error('Missing required data for scheduling'), errorContext);
      return;
    }

    // Find the time slot for this period from bell schedule
    const timeSlot = scheduleData.bellSchedule.timeBlocks?.find(slot => slot.periodNumber === periodNumber);
    if (!timeSlot) {
      const errorContext = createScheduleErrorContext('findTimeSlot', { periodNumber });
      handleClientError(new Error(`No time slot found for period ${periodNumber}`), errorContext);
      return;
    }

    // Create new visit schedule block
    const newTimeBlock: VisitScheduleBlock = {
      blockType: "visitScheduleBlock",
      periodNumber,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      orderIndex: 1,
      eventType: "Observation",
      staffIds: [selectedTeacher],
      portion,
    };

    console.log('🎯 Creating time block:', newTimeBlock);
    
    try {
      if (!visitScheduleMutations.updateAsync) {
        const errorContext = createScheduleErrorContext('mutationAccess', {
          availableMethods: Object.keys(visitScheduleMutations)
        });
        handleClientError(new Error('updateAsync mutation not available'), errorContext);
        return;
      }

      // Update with new time block
      const updatedTimeBlocks = [...(currentVisitSchedule.timeBlocks || []), newTimeBlock];
      console.log('🎯 Updating with blocks:', updatedTimeBlocks.length);
      
      const updateResult = await visitScheduleMutations.updateAsync(currentVisitSchedule._id, {
        timeBlocks: updatedTimeBlocks
      });
      
      console.log('✅ Update result:', updateResult);
      
      // Check for validation errors in response
      if (updateResult && !updateResult.success) {
        // Handle 422 validation errors specifically
        if (updateResult.error?.includes('[422]')) {
          const errorContext = createScheduleErrorContext('validation', {
            timeBlock: newTimeBlock,
            periodNumber,
            portion,
            selectedTeacher
          });
          const formattedError = handleValidationError(
            new ZodError([{ 
              code: 'custom', 
              message: updateResult.error || 'Validation failed',
              path: ['timeBlocks']
            }]), 
            errorContext
          );
          console.error('❌ Validation Error:', formattedError);
          return;
        }
        
        // Handle other API errors
        const errorContext = createScheduleErrorContext('updateSchedule', {
          updateResult,
          timeBlocksCount: updatedTimeBlocks.length
        });
        handleClientError(new Error(updateResult.error || 'Update failed'), errorContext);
        return;
      }
      
      // Refresh data
      console.log('🔄 Refetching visit schedules...');
      await visitSchedules.refetch();
      console.log('✅ Refetch complete');
      
    } catch (error) {
      const errorContext = createScheduleDataErrorContext('scheduleVisit', schoolId, date, {
        periodNumber,
        portion,
        selectedTeacher,
        timeBlockData: newTimeBlock
      });
      handleClientError(error, errorContext);
    }
  };

  if (scheduleData.isLoading) {
    return (
      <div className="p-8">
        <Text>Loading schedule data...</Text>
      </div>
    );
  }

  // Let ErrorBoundary handle errors
  if (scheduleData.error) {
    throw scheduleData.error;
  }

  if (!scheduleData.school || !scheduleData.staff.length) {
    return (
      <div className="p-8">
        <Heading level="h2">No Schedule Data Available</Heading>
        <Text>School ID: {schoolId} | Date: {date}</Text>
      </div>
    );
  }

  if (!scheduleData.bellSchedule) {
    return (
      <div className="p-8">
        <Heading level="h2">No Bell Schedule Found</Heading>
        <Text>A bell schedule is required for visit scheduling.</Text>
      </div>
    );
  }

  const { staff, bellSchedule, teacherSchedules } = scheduleData;

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div>
        <Heading level="h1">Visit Schedule Test Page</Heading>
        <Text className="text-gray-600">School: {scheduleData.school?.schoolName} | Date: {date}</Text>
        {currentVisitSchedule && (
          <Text className="text-sm text-green-600">
            Current Visit Schedule ID: {currentVisitSchedule._id}
          </Text>
        )}
      </div>

      {/* Teacher Selection */}
      <TeacherSelectionPanel
        teachers={staff}
        teacherSchedules={teacherSchedules}
        selectedTeacher={selectedTeacher}
        onTeacherSelect={handleTeacherSelect}
      />

      {/* Visit Schedule Grid */}
      {selectedTeacher && (
        <VisitScheduleGrid
          bellSchedule={bellSchedule}
          selectedTeacher={selectedTeacher}
          visitSchedule={currentVisitSchedule}
          onPeriodSchedule={handlePeriodSchedule}
        />
      )}

      {/* Debug Information */}
      <div className="mt-8 p-4 bg-gray-50 rounded">
        <Heading level="h3">Debug Information</Heading>
        <div className="mt-2 space-y-1 text-sm">
          <div>Total Teachers: {staff.length}</div>
          <div>Selected Teacher: {selectedTeacher || 'None'}</div>
          <div>Visit Schedules: {visitSchedules.items.length}</div>
          <div>Current Schedule Time Blocks: {currentVisitSchedule?.timeBlocks?.length || 0}</div>
          <div>Bell Schedule: {bellSchedule?.name}</div>
        </div>
      </div>
    </div>
  );
};

export default VisitScheduleTestPage; 