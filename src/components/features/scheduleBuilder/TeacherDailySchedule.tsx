'use client'

import { useState } from 'react'
import { useSchoolDailyView } from '@hooks/domain/useSchoolDailyView'
import { TeacherScheduleCalendar } from '@components/features/scheduleBuilder/TeacherScheduleCalendar'
import { Alert, Spinner } from '@core-components/feedback'
import { getTodayString, navigateDate } from '@transformers/utils/date-utils'
import type { BellScheduleEvent } from '@components/features/scheduleBuilder/transformers/schedule-transforms'

export interface TeacherDailyScheduleProps {
  schoolId: string
  initialDate?: string
  className?: string
}

export function TeacherDailySchedule({ 
  schoolId, 
  initialDate,
  className 
}: TeacherDailyScheduleProps) {
  // State for current date
  const [currentDate, setCurrentDate] = useState(
    initialDate || getTodayString()
  )
  
  // Fetch school daily view data using established hook
  const { 
    school, 
    staff, 
    schedules, 
    bellSchedule,
    isLoading, 
    error,
    hasData 
  } = useSchoolDailyView(schoolId, currentDate)

  // Date navigation handlers
  const handleNavigateDate = (direction: 'prev' | 'next' | 'today') => {
    setCurrentDate(navigateDate(currentDate, direction))
  }
  
  // Event click handler
  const handleEventClick = (event: BellScheduleEvent) => {
    console.log('Class clicked:', event)
    // TODO: Implement class detail view or editing
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <Spinner size="md" />
          <span className="text-gray-600">Loading teacher schedules...</span>
        </div>
      </div>
    )
  }
  
  // Error state
  if (error) {
    return (
      <Alert intent="error" className="m-4">
        <Alert.Title>Error Loading Schedule</Alert.Title>
        <Alert.Description>
          Failed to load teacher schedules: {String(error)}
        </Alert.Description>
      </Alert>
    )
  }
  
  // No data state
  if (!hasData) {
    return (
      <Alert intent="warning" className="m-4">
        <Alert.Title>No Schedule Data</Alert.Title>
        <Alert.Description>
          No teacher schedules found for {school?.schoolName || 'this school'} on the selected date.
        </Alert.Description>
      </Alert>
    )
  }
  
  return (
    <div className={className}>
      <TeacherScheduleCalendar
        schoolName={school?.schoolName || 'School'}
        date={currentDate}
        schedules={schedules || []}
        staff={staff || []}
        bellSchedule={bellSchedule}
        onEventClick={handleEventClick}
        onNavigateDate={handleNavigateDate}
      />
    </div>
  )
}

export default TeacherDailySchedule 