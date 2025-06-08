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
 * Pure delegation to domain hooks - no transformations
 * Let domain hooks handle filtering, sorting, caching
 */
export function useScheduleData({ schoolId, date, mode = 'create', visitId }: UseScheduleDataProps) {
  // ✅ PURE DELEGATION: Use domain hooks directly
  const schoolData = useSchoolDailyView(schoolId, date)
  
  // ✅ USE DOMAIN HOOK FILTERING: Let it handle date filtering
  const todayVisits = useVisits.list({
    filters: { 
      school: schoolId, 
      date: new Date(date).toISOString().split('T')[0] 
    },
    enabled: mode === 'create'
  })

  const editVisit = useVisits.byId(visitId || '', { 
    enabled: mode === 'edit' && !!visitId
  })

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

  // ✅ DIRECT PASSTHROUGH: No unnecessary transformations
  return {
    // School data (direct from domain hook)
    teachers: schoolData.staff || [],
    timeSlots: schoolData.bellSchedule?.classSchedule || [],
    teacherSchedules: schoolData.schedules || [],
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