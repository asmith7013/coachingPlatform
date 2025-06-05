'use client'

import { useState, useMemo } from 'react'
import { XMarkIcon, CalendarDaysIcon, BuildingLibraryIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import type { Visit } from '@zod-schema/visits/visit'
import { useSchoolDailyView } from '@hooks/domain/useSchoolDailyView'
import { BellScheduleGrid } from '@composed-components/calendar/schedule'
import { VisitSidebar } from './VisitSidebar'
import { toDateString, formatLongDate } from '@transformers/utils/date-utils'
import type { BellScheduleEvent } from '@composed-components/calendar/schedule/types'

// Import shared utilities
import { useScheduleDisplay } from '@hooks/domain/useScheduleDisplay'
import { createVisitColumns } from '@/lib/domain/schedule/column-builders'

export interface VisitViewProps {
  visit: Visit
  className?: string
  showCloseButton?: boolean
  onClose?: () => void
}

export function VisitView({ 
  visit, 
  className,
  showCloseButton = false,
  onClose
}: VisitViewProps) {
  // Convert visit date to string format for consistency
  const visitDate = visit.date ? toDateString(new Date(visit.date)) : toDateString(new Date())
  const [currentDate] = useState(visitDate)
  
  // Fetch schedule data for the visit
  const { 
    school,
    staff,
    schedules, 
    bellSchedule,
    isLoading, 
    error 
  } = useSchoolDailyView(visit.school, currentDate)

  // Use shared hook for all transformation logic
  const { validatedSchedules, staffMap, periodTimes, events, hasBellSchedule, error: scheduleError } = useScheduleDisplay(
    schedules || [], 
    staff || [], 
    currentDate, 
    bellSchedule
  )
  
  // Create visit-specific columns using domain factory
  const visitColumns = useMemo(() => {
    return createVisitColumns(validatedSchedules, staffMap, 6)
  }, [validatedSchedules, staffMap])

  // Visit-specific event handler
  const handleEventClick = (event: BellScheduleEvent) => {
    console.log('Visit schedule event clicked:', event)
    // TODO: Implement visit-specific interaction (notes, observations, etc.)
  }

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading visit details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-red-600 mb-2">Error loading visit</p>
            <p className="text-xs text-gray-500">{String(error)}</p>
          </div>
        </div>
      </div>
    )
  }

  // Handle missing bell schedule
  if (!hasBellSchedule || scheduleError) {
    return (
      <div className="flex h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bell Schedule Required</h3>
            <p className="text-sm text-gray-600 mb-4">
              {scheduleError || 'This school needs a bell schedule to display class periods and times.'}
            </p>
            <button
              type="button"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Upload Bell Schedule
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex h-full flex-col ${className}`}>
      {/* Close button for dialog usage */}
      {showCloseButton && onClose && (
        <div className="flex justify-end p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}
      
      {/* Visit-specific header */}
      <header className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4 bg-white">
        <div className="flex items-center space-x-3">
          <CalendarDaysIcon className="h-6 w-6 text-indigo-600" />
          <div className="flex flex-col">
            <h1 className="text-base font-semibold text-gray-900">
              Visit - {school?.schoolName || 'School'}
            </h1>
            <p className="text-sm text-gray-500">
              {formatLongDate(currentDate)} • {visit.modeDone || 'In-person'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <BuildingLibraryIcon className="h-4 w-4" />
            <span>{school?.district || 'District'}</span>
          </div>
          
          <button
            type="button"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Edit Visit
          </button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden bg-white">
        {/* Schedule grid - now uses BellScheduleGrid directly */}
        <div className="w-1/4 overflow-hidden">
          <BellScheduleGrid
            columns={visitColumns}
            events={events}
            periodTimes={periodTimes}
            onEventClick={handleEventClick}
          />
        </div>
        
        {/* Wide sidebar for visit information */}
        <div className="flex-1 border-l border-gray-100">
          <VisitSidebar visit={visit} />
        </div>
      </div>
    </div>
  )
} 