/**
 * @fileoverview DEPRECATED - This file is deprecated and will be removed.
 * Migration: Use hooks from @/components/features/schedulesUpdated/hooks instead
 * @deprecated
 */

import { useMemo } from 'react'
import { useSchoolDailyView } from '@/hooks/domain/useSchoolDailyView'
import { useVisits } from '@/hooks/domain/useVisits'
import type { Visit } from '@zod-schema/visits/visit'

export interface UseScheduleDataProps {
  schoolId: string
  date: string
  mode?: 'create' | 'edit'
  visitId?: string
}

/**
 * @deprecated Use useScheduleData from @/components/features/schedulesUpdated/hooks instead.
 * This hook will be removed in a future version.
 * Migration: Replace with equivalent hook from schedulesUpdated feature.
 */
export function useScheduleData({ schoolId, date, mode = 'create', visitId }: UseScheduleDataProps) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('DEPRECATED: useScheduleData from schedulesNew is deprecated. Use schedulesUpdated instead.');
  }
  // ✅ PURE DELEGATION: Use domain hooks directly
  const schoolData = useSchoolDailyView(schoolId, date)
  
  // ✅ USE DOMAIN HOOK FILTERING: Let it handle date filtering
  const todayVisits = useVisits.list({
    filters: { 
      schoolId: schoolId, 
      date: new Date(date).toISOString().split('T')[0] 
    },
    enabled: mode === 'create'
  })

  const editVisit = useVisits.byId(visitId || '', { 
    enabled: mode === 'edit' && !!visitId
  })

  // ✅ SCHEMA-FIRST: Return ClassScheduleItem[] directly from bell schedule
  const timeSlots = useMemo(() => {
    // console.log('🔍 Bell Schedule Debug:', schoolData.bellSchedule)
    
    // Return classSchedule directly - it's already ClassScheduleItem[]
    const classSchedule = schoolData.bellSchedule?.timeBlocks || []
    
    // console.log('🕐 Time Slots (direct from schema):', classSchedule)
    return classSchedule
  }, [schoolData.bellSchedule])

  // ✅ SCHEMA-FIRST: Return TeacherSchedule[] directly
  const teacherSchedules = useMemo(() => {
    // console.log('👥 Teacher Schedules (direct from schema):', schoolData.schedules)
    return schoolData.schedules || []
  }, [schoolData.schedules])

  // ✅ MINIMAL PROCESSING: Just combine the data sources
  const visits = useMemo((): Visit[] => {
    if (mode === 'edit' && editVisit.data) {
      return [editVisit.data]
    }
    if (mode === 'create' && todayVisits.items) {
      return todayVisits.items
    }
    return []
  }, [mode, editVisit.data, todayVisits.items])

  // ✅ DEBUG LOGGING: Help identify data flow issues
  // console.log('📊 Schedule Data Summary (Schema Types):', {
  //   teachers: schoolData.staff?.length || 0,
  //   timeSlots: timeSlots.length,
  //   teacherSchedules: teacherSchedules.length,
  //   visits: visits.length,
  //   isLoading: schoolData.isLoading,
  //   bellScheduleExists: !!schoolData.bellSchedule,
  //   teacherSchedulesExists: !!schoolData.schedules
  // })

  // ✅ SCHEMA-FIRST: Return schema types directly
  return {
    // School data (direct from domain hook)
    teachers: schoolData.staff || [],
    timeSlots,                    // ClassScheduleItem[] - direct from schema
    teacherSchedules,             // TeacherSchedule[] - direct from schema
    school: schoolData.school,
    
    // Visit data (direct from domain hooks)
    visits,
    
    // Combined loading/error state
    isLoading: schoolData.isLoading || 
      (mode === 'create' && todayVisits.isLoading) ||
      (mode === 'edit' && editVisit.isLoading),
      
    error: schoolData.error || 
      (mode === 'create' && todayVisits.error) ||
      (mode === 'edit' && editVisit.error)
  }
} 