'use client'

import { useMemo } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import type { ScheduleByDay, Period } from '@zod-schema/schedule/schedule'
import { getEventColorClasses, type EventColor } from '@/lib/ui/styles/event-styles'

const scheduleTable = tv({
  slots: {
    container: 'overflow-hidden shadow ring-1 ring-black ring-opacity-5',
    table: 'min-w-full divide-y divide-gray-300',
    thead: 'bg-gray-50',
    headerRow: '',
    headerCell: 'px-3 py-3.5 text-left text-sm font-semibold text-gray-900',
    tbody: 'divide-y divide-gray-200 bg-white',
    row: 'hover:bg-gray-50',
    cell: 'whitespace-nowrap px-3 py-4 text-sm text-gray-500',
    periodCell: 'font-medium text-gray-900',
    classCell: 'max-w-0 truncate',
    className: 'text-gray-900 truncate',
    room: 'text-gray-500 text-xs mt-1',
    periodBadge: 'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset'
  },
  variants: {
    textSize: {
      xs: {
        headerCell: 'text-xs',
        cell: 'text-xs',
        className: 'text-xs',
        room: 'text-xs'
      },
      sm: {
        headerCell: 'text-sm',
        cell: 'text-sm',
        className: 'text-sm',
        room: 'text-xs'
      },
      base: {
        headerCell: 'text-sm',
        cell: 'text-sm',
        className: 'text-sm',
        room: 'text-xs'
      },
      lg: {
        headerCell: 'text-base',
        cell: 'text-base',
        className: 'text-base',
        room: 'text-sm'
      }
    },
    compact: {
      true: {
        headerCell: 'px-2 py-2',
        cell: 'px-2 py-3'
      },
      false: {}
    },
    periodTypeColors: {
      true: {},
      false: {}
    }
  },
  defaultVariants: {
    textSize: 'base',
    compact: false,
    periodTypeColors: true
  }
})

// Map period types to unified color system
const getPeriodTypeColor = (periodType: string): EventColor => {
  const type = periodType.toLowerCase()
  if (type.includes('academic') || type.includes('class')) return 'blue'
  if (type.includes('lunch')) return 'green'
  if (type.includes('prep')) return 'yellow'
  if (type.includes('testing')) return 'purple'
  if (type.includes('specialized')) return 'purple'
  return 'gray' // Default for 'Other' and unknown types
}

export type ScheduleTableVariants = VariantProps<typeof scheduleTable>

export interface ScheduleTableProps extends ScheduleTableVariants {
  scheduleByDay: ScheduleByDay[]
  className?: string
}

export function ScheduleTable({
  scheduleByDay,
  className,
  textSize = 'base',
  compact = false,
  periodTypeColors = true,
}: ScheduleTableProps) {
  const styles = scheduleTable({ textSize, compact, periodTypeColors })

  // Get all unique period numbers across all days
  const allPeriodNumbers = useMemo(() => {
    const periodSet = new Set<number>()
    scheduleByDay.forEach(day => {
      day.periods.forEach(period => {
        periodSet.add(period.periodNum)
      })
    })
    return Array.from(periodSet).sort((a, b) => a - b)
  }, [scheduleByDay])

  // Create a lookup map for periods by day and period number
  const periodMap = useMemo(() => {
    const map = new Map<string, Period>()
    scheduleByDay.forEach(day => {
      day.periods.forEach(period => {
        map.set(`${day.day}-${period.periodNum}`, period)
      })
    })
    return map
  }, [scheduleByDay])

  // Function to get the period type color class using unified system
  const getPeriodTypeClass = (periodType: string) => {
    if (!periodTypeColors) return 'bg-gray-50 text-gray-700'
    
    const color = getPeriodTypeColor(periodType)
    const colorClasses = getEventColorClasses(color)
    return `${colorClasses.container} ${colorClasses.text}`
  }

  return (
    <div className={styles.container({ className })}>
      <table className={styles.table()}>
        <thead className={styles.thead()}>
          <tr className={styles.headerRow()}>
            <th scope="col" className={styles.headerCell()}>
              Period
            </th>
            {scheduleByDay.map((day) => (
              <th key={day.day} scope="col" className={styles.headerCell()}>
                {day.day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tbody()}>
          {allPeriodNumbers.map((periodNum) => (
            <tr key={periodNum} className={styles.row()}>
              <td className={`${styles.cell()} ${styles.periodCell()}`}>
                Period {periodNum}
              </td>
              {scheduleByDay.map((day) => {
                const period = periodMap.get(`${day.day}-${periodNum}`)
                return (
                  <td key={day.day} className={`${styles.cell()} ${styles.classCell()}`}>
                    {period ? (
                      <div>
                        <div className={styles.className()}>{period.className}</div>
                        {period.room && (
                          <div className={styles.room()}>Room {period.room}</div>
                        )}
                        {periodTypeColors && period.periodType && (
                          <span className={`${styles.periodBadge()} ${getPeriodTypeClass(period.periodType)}`}>
                            {period.periodType}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No class</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 