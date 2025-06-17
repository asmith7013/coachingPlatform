// src/components/features/schedulesUpdated/hooks/useScheduleDisplayData.ts

import { useMemo } from 'react';
import { useSchoolDailyView } from '@/hooks/domain/useSchoolDailyView';
import { useBellSchedules } from '@/hooks/domain/schedules/useBellSchedules';
import { useTeacherSchedules } from '@/hooks/domain/schedules/useTeacherSchedules';
import type { 
  ScheduleDisplayData, 
  TeacherWithSchedule, 
  BellScheduleDisplay,
  TimeSlotDisplay 
} from '../types';

/**
 * Hook for preparing schedule display data
 * Uses existing domain hooks and transforms data for display
 */
export function useScheduleDisplayData(schoolId: string, date: string): {
  data: ScheduleDisplayData | null;
  isLoading: boolean;
  error: Error | null;
} {
  // Use existing domain hooks
  const schoolView = useSchoolDailyView(schoolId, date);
  
  const bellSchedules = useBellSchedules.list({
    filters: { schoolId }
  });
  
  const teacherSchedules = useTeacherSchedules.list({
    filters: { schoolId }
  });

  // Transform data for display
  const displayData = useMemo((): ScheduleDisplayData | null => {
    if (!schoolView.school || !schoolView.staff?.length) {
      return null;
    }

    // Get primary bell schedule for the school
    const bellSchedule = bellSchedules.items?.[0];
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

    // Match teachers with their schedules
    const teachersWithSchedules: TeacherWithSchedule[] = schoolView.staff.map(teacher => {
      const teacherSchedule = teacherSchedules.items?.find(
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
    });

    return {
      schoolId,
      date,
      teachers: teachersWithSchedules,
      bellSchedule: bellScheduleDisplay,
      timeSlots
    };
  }, [schoolView, bellSchedules.items, teacherSchedules.items, schoolId, date]);

  return {
    data: displayData,
    isLoading: schoolView.isLoading || bellSchedules.isLoading || teacherSchedules.isLoading,
    error: schoolView.error || bellSchedules.error || teacherSchedules.error
  };
}
