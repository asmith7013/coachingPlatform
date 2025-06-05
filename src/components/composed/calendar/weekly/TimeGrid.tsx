'use client'

import { tv, type VariantProps } from 'tailwind-variants'
import { EventItem } from './EventItem'
import type { CalendarEvent } from './WeeklyCalendar'

const timeGrid = tv({
  slots: {
    container: 'flex flex-auto',
    sideBar: 'sticky left-0 z-10 w-14 flex-none bg-white ring-1 ring-gray-100',
    gridContainer: 'grid flex-auto grid-cols-1 grid-rows-1',
    timeSlots: 'col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100',
    offsetDiv: 'row-end-1 h-7',
    timeLabel: 'sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400',
    verticalLines: 'col-start-1 col-end-2 row-start-1 hidden grid-cols-7 grid-rows-1 divide-x divide-gray-100 sm:grid sm:grid-cols-7',
    verticalLine: 'row-span-full',
    verticalLineEnd: 'col-start-8 row-span-full w-8',
    eventsContainer: 'col-start-1 col-end-2 row-start-1 grid grid-cols-1 sm:grid-cols-7 sm:pr-8'
  },
  variants: {
    variant: {
      default: {},
      compact: {
        timeLabel: 'text-xs/4'
      }
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

export interface TimeGridProps extends VariantProps<typeof timeGrid> {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  containerRefs: {
    container: React.RefObject<HTMLDivElement | null>
    containerOffset: React.RefObject<HTMLDivElement | null>
  }
}

export function TimeGrid({ events, onEventClick, variant, containerRefs }: TimeGridProps) {
  const styles = timeGrid({ variant })

  // Generate 24 hours worth of time slots
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i === 0 ? 12 : i > 12 ? i - 12 : i
    const ampm = i < 12 ? 'AM' : 'PM'
    return `${hour}${ampm}`
  })

  // Convert event data to grid positions
  const getEventStyle = (event: CalendarEvent) => {
    const [hours, minutes] = event.startTime.split(':').map(Number)
    const startRow = (hours * 60 + minutes) / 5 + 1 // Each row is 5 minutes
    const spanRows = event.duration
    
    return {
      gridRow: `${startRow} / span ${spanRows}`,
      gridColumn: `${event.day + 1}`
    }
  }

  return (
    <div className={styles.container()}>
      <div className={styles.sideBar()} />
      <div className={styles.gridContainer()}>
        {/* Time slots with labels */}
        <div
          className={styles.timeSlots()}
          style={{ gridTemplateRows: 'repeat(48, minmax(3.5rem, 1fr))' }}
        >
          <div ref={containerRefs.containerOffset} className={styles.offsetDiv()} />
          {timeSlots.map((time, index) => (
            <div key={index}>
              {index % 2 === 0 && (
                <div className={styles.timeLabel()}>
                  {time}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Vertical day dividers */}
        <div className={styles.verticalLines()}>
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className={`col-start-${i + 1} ${styles.verticalLine()}`} />
          ))}
          <div className={styles.verticalLineEnd()} />
        </div>

        {/* Events overlay */}
        <ol
          className={styles.eventsContainer()}
          style={{ gridTemplateRows: '1.75rem repeat(288, minmax(0, 1fr)) auto' }}
        >
          {events.map((event) => (
            <li
              key={event.id}
              className={`relative mt-px flex col-start-${event.day + 1}`}
              style={getEventStyle(event)}
            >
              <EventItem event={event} onClick={onEventClick} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
} 