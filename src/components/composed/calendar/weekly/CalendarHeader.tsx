'use client'

import { tv, type VariantProps } from 'tailwind-variants'
import { WeekNavigation } from './WeekNavigation'
import { ViewSelector } from './ViewSelector'
import { formatMediumDate, toDateString } from '@/lib/data-processing/transformers/utils/date-utils'

const calendarHeader = tv({
  slots: {
    header: 'flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4',
    title: 'text-base font-semibold text-gray-900',
    controls: 'flex items-center',
    desktopControls: 'hidden md:ml-4 md:flex md:items-center',
    divider: 'ml-6 h-6 w-px bg-gray-300',
    addButton: 'ml-6 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
  },
  variants: {
    variant: {
      default: {},
      minimal: {
        header: 'px-4 py-3',
        title: 'text-sm font-medium'
      }
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

export interface CalendarHeaderProps extends VariantProps<typeof calendarHeader> {
  currentDate: Date
  onNavigate?: (direction: 'prev' | 'next' | 'today') => void
  onViewChange?: (view: 'day' | 'week' | 'month' | 'year') => void
  onAddEvent?: () => void
}

export function CalendarHeader({
  currentDate,
  onNavigate,
  onViewChange,
  onAddEvent,
  variant
}: CalendarHeaderProps) {
  const styles = calendarHeader({ variant })
  
  const monthYear = formatMediumDate(toDateString(currentDate))

  return (
    <header className={styles.header()}>
      <h1 className={styles.title()}>
        <time dateTime={currentDate.toISOString()}>
          {monthYear}
        </time>
      </h1>
      
      <div className={styles.controls()}>
        <WeekNavigation onNavigate={onNavigate} />
        
        <div className={styles.desktopControls()}>
          <ViewSelector onViewChange={onViewChange} />
          <div className={styles.divider()} />
          <button
            type="button"
            onClick={onAddEvent}
            className={styles.addButton()}
          >
            Add event
          </button>
        </div>
      </div>
    </header>
  )
} 