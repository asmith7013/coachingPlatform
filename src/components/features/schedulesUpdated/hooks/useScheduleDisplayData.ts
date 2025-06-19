// src/components/features/schedulesUpdated/hooks/useScheduleDisplayData.ts

import { useMemo } from 'react';
import { useScheduleDailyView } from './useScheduleDailyView';
import { handleClientError } from '@error/handlers/client';
import { logError } from '@error/core/logging';
import { 
  createScheduleTransformErrorContext 
} from '../utils/schedule-error-utils';
import type { 
  ScheduleDisplayData, 
  TeacherWithSchedule, 
  BellScheduleDisplay,
  TimeSlotDisplay 
} from '../types';

/**
 * Hook for preparing schedule display data
 * Uses feature-specific daily view hook and transforms data for display
 */
export function useScheduleDisplayData(schoolId: string, date: string): {
  data: ScheduleDisplayData | null;
  isLoading: boolean;
  error: Error | null;
} {
  // Use feature-specific daily view hook
  const dailyView = useScheduleDailyView(schoolId, date);

  // Transform data for display with error handling
  const displayData = useMemo((): ScheduleDisplayData | null => {
    try {
      if (!dailyView.school || !dailyView.staff?.length) {
        logError(
          new Error('Insufficient data for schedule display'), 
          createScheduleTransformErrorContext('displayData', 'dailyView', {
            hasSchool: !!dailyView.school,
            staffCount: dailyView.staff?.length || 0,
            severity: 'info'
          })
        );
        return null;
      }

      // Get primary bell schedule for the school
      const bellSchedule = dailyView.bellSchedule;
      const bellScheduleDisplay: BellScheduleDisplay | null = bellSchedule ? {
        _id: bellSchedule._id,
        name: bellSchedule.name,
        timeBlocks: bellSchedule.timeBlocks?.map(block => ({
          periodNumber: block.periodNumber,
          periodName: block.periodName,
          startTime: block.startTime,
          endTime: block.endTime
        })) || []
      } : null;

      // Create time slots from bell schedule
      const timeSlots: TimeSlotDisplay[] = bellSchedule?.timeBlocks?.map(block => ({
        periodNumber: block.periodNumber,
        periodName: block.periodName,
        startTime: block.startTime,
        endTime: block.endTime
      })) || [];

      // Match teachers with their schedules with error handling
      const teachersWithSchedules: TeacherWithSchedule[] = dailyView.staff.map(teacher => {
        try {
          const teacherSchedule = dailyView.schedules?.find(
            schedule => schedule.teacherId === teacher._id
          );

          return {
            _id: teacher._id,
            staffName: teacher.staffName,
            schedule: teacherSchedule ? {
              _id: teacherSchedule._id,
              teacherId: teacherSchedule.teacherId,
              timeBlocks: teacherSchedule.timeBlocks?.map(block => ({
                periodNumber: block.periodNumber,
                className: block.className,
                room: block.room,
                activityType: block.activityType,
                subject: block.subject,
                gradeLevel: block.gradeLevel
              })) || []
            } : null
          };
        } catch (teacherError) {
          handleClientError(teacherError, createScheduleTransformErrorContext(
            'teacherScheduleMapping', 
            'dailyView',
            { teacherId: teacher._id, teacherName: teacher.staffName }
          ));
          
          // Return teacher without schedule on error
          return {
            _id: teacher._id,
            staffName: teacher.staffName,
            schedule: null
          };
        }
      });

      // // Log successful transformation in development
      // if (process.env.NODE_ENV === 'development') {
      //   console.log('✅ Schedule display transformation successful:', {
      //     schoolId,
      //     date,
      //     teachersCount: teachersWithSchedules.length,
      //     timeSlotsCount: timeSlots.length,
      //     scheduleDataQuality: {
      //       teachersWithSchedule: teachersWithSchedules.filter(t => t.schedule).length,
      //       teachersWithoutSchedule: teachersWithSchedules.filter(t => !t.schedule).length
      //     }
      //   });
      // }

      return {
        schoolId,
        date,
        teachers: teachersWithSchedules,
        bellSchedule: bellScheduleDisplay,
        timeSlots
      };

    } catch (transformError) {
      const errorMessage = handleClientError(
        transformError, 
        createScheduleTransformErrorContext('displayData', 'transformation', {
          schoolId,
          date,
          dataAvailable: {
            school: !!dailyView.school,
            staff: !!dailyView.staff?.length,
            bellSchedule: !!dailyView.bellSchedule,
            schedules: !!dailyView.schedules?.length
          }
        })
      );
      
      console.error('❌ Schedule display transformation failed:', errorMessage);
      return null;
    }
  }, [dailyView, schoolId, date]);

  return {
    data: displayData,
    isLoading: dailyView.isLoading,
    error: dailyView.error
  };
}
