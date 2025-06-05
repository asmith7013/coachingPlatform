'use client'

import { forwardRef } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { isSameDay, toDateString, addDays, fromDateString } from '@transformers/utils/date-utils'

const dayColumns = tv({
  slots: {
    container: 'sticky top-0 z-30 flex-none bg-white shadow-sm ring-1 ring-black/5 sm:pr-8',
    mobileGrid: 'grid grid-cols-7 text-sm/6 text-gray-500 sm:hidden',
    mobileButton: 'flex flex-col items-center pt-2 pb-3',
    mobileDay: 'mt-1 flex size-8 items-center justify-center font-semibold text-gray-900',
    mobileDayActive: 'mt-1 flex size-8 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white',
    desktopGrid: '-mr-px hidden grid-cols-7 divide-x divide-gray-100 border-r border-gray-100 text-sm/6 text-gray-500 sm:grid',
    desktopColumn: 'flex items-center justify-center py-3',
    desktopColumnFirst: 'col-end-1 w-14',
    desktopDay: 'items-center justify-center font-semibold text-gray-900',
    desktopDayActive: 'ml-1.5 flex size-8 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white'
  },
  variants: {
    size: {
      default: {},
      compact: {
        mobileButton: 'pt-1.5 pb-2',
        desktopColumn: 'py-2'
      }
    }
  },
  defaultVariants: {
    size: 'default'
  }
})

export interface DayColumnsProps extends VariantProps<typeof dayColumns> {
  currentDate: Date
}

export const DayColumns = forwardRef<HTMLDivElement, DayColumnsProps>(
  function DayColumns({ currentDate, size }, ref) {
    const styles = dayColumns({ size })
    const today = new Date()
    
    // Get start of week (Monday)
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      return fromDateString(addDays(toDateString(startOfWeek), i))
    })

    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    const fullDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    const isToday = (date: Date) => {
      return isSameDay(toDateString(date), toDateString(today))
    }

    return (
      <div ref={ref} className={styles.container()}>
        {/* Mobile view */}
        <div className={styles.mobileGrid()}>
          {weekDays.map((date, index) => (
            <button key={index} type="button" className={styles.mobileButton()}>
              {dayLabels[index]}{' '}
              <span className={isToday(date) ? styles.mobileDayActive() : styles.mobileDay()}>
                {date.getDate()}
              </span>
            </button>
          ))}
        </div>

        {/* Desktop view */}
        <div className={styles.desktopGrid()}>
          <div className={styles.desktopColumnFirst()} />
          {weekDays.map((date, index) => (
            <div key={index} className={styles.desktopColumn()}>
              <span className={isToday(date) ? 'flex items-baseline' : ''}>
                {fullDayLabels[index]}{' '}
                <span className={isToday(date) ? styles.desktopDayActive() : styles.desktopDay()}>
                  {date.getDate()}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
) 