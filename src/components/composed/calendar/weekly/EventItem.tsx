'use client'

import type { VariantProps } from 'tailwind-variants'
import type { CalendarEvent } from './WeeklyCalendar'
import { eventItem, formatEventTime } from '@/lib/ui/styles/event-styles'

export interface EventItemProps extends VariantProps<typeof eventItem> {
  event: CalendarEvent
  onClick?: (event: CalendarEvent) => void
}

export function EventItem({ event, onClick }: EventItemProps) {
  const styles = eventItem({ color: event.color })

  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault()
        onClick?.(event)
      }}
      className={styles.container()}
    >
      <p className={styles.title()}>{event.title}</p>
      <p className={styles.subtitle()}>
        <time dateTime={event.startTime}>{formatEventTime(event.startTime)}</time>
      </p>
    </a>
  )
} 