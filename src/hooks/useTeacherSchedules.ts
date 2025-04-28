import { useState, useCallback, useMemo } from "react";
import { 
  fetchTeacherSchedulesBySchool,
  createTeacherSchedule, 
  updateTeacherSchedule, 
  deleteTeacherSchedule,
} from "@/app/actions/schedule/schedule";
import type { TeacherScheduleInput } from "@/lib/data-schema/zod-schema/schedule/schedule";
import useSWR from "swr";

// Interface for UI-specific period data
interface ScheduleUIItem {
  id: number;
  name: string;
  timeSlot: string;
  startTime: string;
  endTime: string;
  what: string;
  who: string[];
  grade: string;
  classInfo: string;
  roomInfo: string;
}

// Interface for teacher schedule mapping
interface TeacherScheduleUI {
  teacherId: string;
  scheduleData: ScheduleUIItem[];
}

// For type safety when working with schedule data
interface SchedulePeriod {
  periodNum: number;
  startTime?: string;
  endTime?: string;
  className?: string;
  room?: string;
}

export function useTeacherSchedules(schoolId?: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Create a key for SWR
  const fetchKey = schoolId ? `teacher-schedules-by-school-${schoolId}` : null;
  
  // Define fetcher outside of useSWR to avoid type issues
  const fetcher = async () => {
    if (schoolId) {
      return fetchTeacherSchedulesBySchool(schoolId);
    }
    return null;
  };
  
  // Fetch all schedules or schedules by school
  const { data, error, isLoading, mutate } = useSWR(fetchKey, fetcher);

  // Transform schedule data to format needed by UI
  const schedulesForUI = useMemo(() => {
    if (!data?.items) return [];
    
    return data.items.map((schedule: Record<string, unknown>): TeacherScheduleUI => {
      // Get required properties with type safety
      const teacher = schedule.teacher as string || '';
      const scheduleByDay = schedule.scheduleByDay as { day: string; periods: SchedulePeriod[] }[] || [];
      
      // Transform scheduleByDay data into UI format
      const scheduleData = scheduleByDay.flatMap((day) => {
        return day.periods.map((period): ScheduleUIItem => {
          // Safely get time values
          const startTime = period.startTime || '';
          const endTime = period.endTime || '';
          
          return {
            id: period.periodNum,
            name: `Period ${period.periodNum}`,
            timeSlot: `${startTime}-${endTime}`,
            startTime,
            endTime,
            what: period.className || '',
            who: [teacher], // Teacher ID
            grade: '',
            classInfo: period.className || '',
            roomInfo: period.room || ''
          };
        });
      });
      
      return {
        teacherId: teacher,
        scheduleData
      };
    });
  }, [data]);
  
  // Create a new schedule
  const createSchedule = useCallback(async (scheduleData: TeacherScheduleInput) => {
    setIsSubmitting(true);
    try {
      const result = await createTeacherSchedule(scheduleData);
      mutate();
      return result;
    } catch (error) {
      console.error("Error creating schedule:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [mutate]);
  
  // Update a schedule
  const updateSchedule = useCallback(async (id: string, scheduleData: Partial<TeacherScheduleInput>) => {
    setIsSubmitting(true);
    try {
      const result = await updateTeacherSchedule(id, scheduleData);
      mutate();
      return result;
    } catch (error) {
      console.error("Error updating schedule:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [mutate]);
  
  // Delete a schedule
  const deleteSchedule = useCallback(async (id: string) => {
    setIsSubmitting(true);
    try {
      const result = await deleteTeacherSchedule(id);
      mutate();
      return result;
    } catch (error) {
      console.error("Error deleting schedule:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [mutate]);
  
  return {
    schedules: data?.items || [],
    schedulesForUI: schedulesForUI,
    isLoading,
    error,
    isSubmitting,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    mutate
  };
} 