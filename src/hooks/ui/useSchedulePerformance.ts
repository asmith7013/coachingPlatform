import { useMemo, useCallback } from 'react'
import type { BellScheduleEvent, ScheduleColumn } from '@domain-types/schedule'
import type { PeriodTime } from '@domain-types/schedule'

/**
 * Performance optimization hook for schedule components
 * Provides memoized calculations and optimized event handlers
 */

export interface UseSchedulePerformanceProps {
  events: BellScheduleEvent[]
  columns: ScheduleColumn[]
  periodTimes: PeriodTime[]
  onEventClick?: (event: BellScheduleEvent) => void
  isEventSelected?: (event: BellScheduleEvent) => boolean
}

export interface SchedulePerformanceHelpers {
  // Memoized calculations
  eventsByPeriod: Map<number, BellScheduleEvent[]>
  eventsByColumn: Map<number, BellScheduleEvent[]>
  totalPeriods: number
  totalColumns: number
  hasPlannedColumn: boolean
  
  // Optimized handlers
  getEventsForCell: (columnIndex: number, periodIndex: number) => BellScheduleEvent[]
  handleEventClick: (event: BellScheduleEvent) => void
  checkEventSelected: (event: BellScheduleEvent) => boolean
  
  // Performance metrics
  renderKey: string
}

export function useSchedulePerformance({
  events,
  columns,
  periodTimes,
  onEventClick,
  isEventSelected
}: UseSchedulePerformanceProps): SchedulePerformanceHelpers {

  // Memoized event groupings for fast lookup
  const eventsByPeriod = useMemo(() => {
    const map = new Map<number, BellScheduleEvent[]>()
    events.forEach(event => {
      const period = event.period
      if (!map.has(period)) {
        map.set(period, [])
      }
      map.get(period)!.push(event)
    })
    return map
  }, [events])

  const eventsByColumn = useMemo(() => {
    const map = new Map<number, BellScheduleEvent[]>()
    events.forEach(event => {
      const column = event.columnIndex
      if (!map.has(column)) {
        map.set(column, [])
      }
      map.get(column)!.push(event)
    })
    return map
  }, [events])

  // Memoized grid calculations
  const gridMetrics = useMemo(() => ({
    totalPeriods: periodTimes.length,
    totalColumns: columns.length,
    hasPlannedColumn: columns.some(col => col.id === 'planned-visits')
  }), [columns, periodTimes])

  // Optimized cell event lookup
  const getEventsForCell = useCallback((columnIndex: number, periodIndex: number): BellScheduleEvent[] => {
    const period = periodTimes[periodIndex]?.period
    if (!period) return []
    
    const periodEvents = eventsByPeriod.get(period) || []
    return periodEvents.filter(event => event.columnIndex === columnIndex)
  }, [eventsByPeriod, periodTimes])

  // Memoized event handlers to prevent prop drilling re-renders
  const handleEventClick = useCallback((event: BellScheduleEvent) => {
    onEventClick?.(event)
  }, [onEventClick])

  const checkEventSelected = useCallback((event: BellScheduleEvent): boolean => {
    return isEventSelected?.(event) || false
  }, [isEventSelected])

  // Render key for React optimization
  const renderKey = useMemo(() => {
    return `${events.length}-${columns.length}-${periodTimes.length}-${Date.now()}`
  }, [events.length, columns.length, periodTimes.length])

  return {
    // Memoized calculations
    eventsByPeriod,
    eventsByColumn,
    totalPeriods: gridMetrics.totalPeriods,
    totalColumns: gridMetrics.totalColumns,
    hasPlannedColumn: gridMetrics.hasPlannedColumn,
    
    // Optimized handlers
    getEventsForCell,
    handleEventClick,
    checkEventSelected,
    
    // Performance metrics
    renderKey
  }
} 