import { useMemo, useCallback } from 'react';
import { Eye, MessageCircle, Brain, BookOpen } from 'lucide-react';
import { useSchoolDailyView } from '@/hooks/domain/useSchoolDailyView';
import { useVisitScheduling } from './useVisitScheduling';
import { useScheduleBuilderUI } from './useScheduleBuilderUI';

// Import utilities for data transformation
import {
  transformStaffToTeachers,
  generateTimeSlotsFromBellSchedule,
  transformTeacherSchedules,
  getTimeSlotForPeriod
} from '../utils/schedule-data-utils';

// Import consolidated types
import type {
  EventTypeOption,
  UseScheduleBuilderProps
} from '../types';

/**
 * Simplified useScheduleBuilder hook
 * Single responsibility: compose data from other hooks
 * No complex transformations, no duplicate logic, no over-engineering
 */
export const useScheduleBuilder = ({ schoolId, date }: UseScheduleBuilderProps) => {
  // Data composition - delegate to specialized hooks
  const schoolData = useSchoolDailyView(schoolId, date);
  const visitScheduling = useVisitScheduling({ schoolId, date });
  const ui = useScheduleBuilderUI();

  // Simple transformations using utilities (memoized for performance)
  const teachers = useMemo(() => 
    schoolData.staff ? transformStaffToTeachers(schoolData.staff) : [],
    [schoolData.staff]
  );

  const timeSlots = useMemo(() => 
    generateTimeSlotsFromBellSchedule(schoolData.bellSchedule),
    [schoolData.bellSchedule]
  );

  const teacherSchedules = useMemo(() => 
    transformTeacherSchedules(schoolData.schedules),
    [schoolData.schedules]
  );

  // Static configuration (no complex logic)
  const eventTypes: readonly EventTypeOption[] = [
    { value: 'observation', label: 'Observation', icon: Eye },
    { value: 'debrief', label: 'Debrief', icon: MessageCircle },
    { value: 'co-planning', label: 'Co-planning', icon: Brain },
    { value: 'professional-learning', label: 'Professional Learning', icon: BookOpen }
  ] as const;

  // Helper function using utility
  const getTimeSlotForPeriodHelper = (periodNumber: number | string) => 
    getTimeSlotForPeriod(timeSlots, periodNumber);

  // Add missing methods for context compatibility
  const getDropZoneItems = useCallback((period: number | string) => {
    return visitScheduling.visits.filter(visit => visit.periodNumber === period) || [];
  }, [visitScheduling.visits]);

  const isHalfAvailable = useCallback((period: number | string, half: 'first' | 'second') => {
    const items = getDropZoneItems(period);
    if (half === 'first') {
      return !items.some(item => item.portion === 'first_half' || item.portion === 'full_period');
    } else {
      return !items.some(item => item.portion === 'second_half' || item.portion === 'full_period');
    }
  }, [getDropZoneItems]);

  const handlePeriodPortionSelect = useCallback((portion: 'first_half' | 'second_half' | 'full_period') => {
    if (!ui.selectedTeacher || !ui.selectedPeriod) return;
    
    const teacher = teachers.find(t => t._id === ui.selectedTeacher);
    if (!teacher) return;

    visitScheduling.scheduleVisit({
      schoolId,
      teacherId: ui.selectedTeacher,
      teacherName: teacher.staffName,
      periodNumber: typeof ui.selectedPeriod === 'number' ? ui.selectedPeriod : parseInt(String(ui.selectedPeriod)),
      portion,
      date
    });
  }, [ui.selectedTeacher, ui.selectedPeriod, teachers, visitScheduling, schoolId, date]);

  const updateEventType = useCallback((period: number | string, portion: string, eventType: string) => {
    const visit = visitScheduling.visits.find(v => v.periodNumber === period && v.portion === portion);
    if (visit) {
      visitScheduling.updateVisit(visit.id, { purpose: eventType });
    }
  }, [visitScheduling]);

  const removeDropZoneItem = useCallback((period: number | string, portion: string) => {
    const visit = visitScheduling.visits.find(v => v.periodNumber === period && v.portion === portion);
    if (visit) {
      visitScheduling.deleteVisit(visit.id);
    }
  }, [visitScheduling]);

  const getTeacherPlanning = useCallback((teacherId: string) => {
    const teacherVisits = visitScheduling.visits.filter(v => v.teacherId === teacherId);
    return {
      observation: teacherVisits.some(v => v.purpose === 'observation'),
      meeting: teacherVisits.some(v => v.purpose === 'debrief' || v.purpose === 'co-planning')
    };
  }, [visitScheduling.visits]);

  const getVisit = useCallback((teacherId: string, period: number | string) => {
    return visitScheduling.visits.find(v => v.teacherId === teacherId && v.periodNumber === period);
  }, [visitScheduling.visits]);

  const hasVisit = useCallback((teacherId: string, period: number | string) => {
    return !!getVisit(teacherId, period);
  }, [getVisit]);

  const isDropZoneFullyScheduled = useCallback((period: number | string) => {
    const items = getDropZoneItems(period);
    return items.some(item => item.portion === 'full_period');
  }, [getDropZoneItems]);

  const isTeacherScheduledInDropZone = useCallback((teacherId: string, period: number | string) => {
    return visitScheduling.visits.some(v => v.teacherId === teacherId && v.periodNumber === period);
  }, [visitScheduling.visits]);

  // Simple composition - no complex logic
  return {
    // Raw data (minimal transformation)
    teachers,
    timeSlots,
    teacherSchedules,
    eventTypes,
    
    // School data (pass through)
    school: schoolData.school,
    bellSchedule: schoolData.bellSchedule,
    hasData: schoolData.hasData,
    teacherCount: schoolData.teacherCount,
    staffCount: schoolData.staffCount,
    
    // Visit scheduling (pass through)
    visits: visitScheduling.visits,
    scheduleVisit: visitScheduling.scheduleVisit,
    updateVisit: visitScheduling.updateVisit,
    deleteVisit: visitScheduling.deleteVisit,
    
    // UI state (pass through)
    selectedTeacher: ui.selectedTeacher,
    selectedPeriod: ui.selectedPeriod,
    selectedPortion: ui.selectedPortion,
    openDropdown: ui.openDropdown,
    setOpenDropdown: ui.setOpenDropdown,
    handleTeacherPeriodSelect: ui.handleTeacherPeriodSelect,
    clearSelections: ui.clearSelections,
    hasTeacherSelected: ui.hasTeacherSelected,
    hasPeriodSelected: ui.hasPeriodSelected,
    canScheduleVisit: ui.canScheduleVisit,
    
    // Loading/error states (simple composition)
    isLoading: schoolData.isLoading || visitScheduling.isLoading,
    error: schoolData.error || visitScheduling.error,
    
    // Utilities
    getTimeSlotForPeriod: getTimeSlotForPeriodHelper,
    
    // Add missing properties for context compatibility
    getDropZoneItems,
    isHalfAvailable,
    handlePeriodPortionSelect,
    updateEventType,
    removeDropZoneItem,
    getTeacherPlanning,
    scheduledVisits: visitScheduling.visits,
    getVisit,
    hasVisit,
    isDropZoneFullyScheduled,
    isTeacherScheduledInDropZone,
    saveStatus: 'saved' as const,
    
    // Expose underlying hooks for advanced usage
    visitScheduling,
    schoolDailyView: {
      school: schoolData.school,
      schedules: schoolData.schedules,
      staff: schoolData.staff,
      bellSchedule: schoolData.bellSchedule,
      teacherCount: schoolData.teacherCount,
      staffCount: schoolData.staffCount
    }
  };
}; 