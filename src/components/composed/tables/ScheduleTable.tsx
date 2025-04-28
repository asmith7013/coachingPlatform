'use client'

import { useMemo } from 'react'
import { cn } from '@ui/utils/formatters';
import { tv, type VariantProps } from 'tailwind-variants'
import { textColors, textSize, weight, paddingX, paddingY } from '@ui-tokens/tokens'
import type { ScheduleByDay, Period } from '@/lib/data-schema/zod-schema/schedule/schedule'

const scheduleTable = tv({
  slots: {
    wrapper: 'w-full overflow-auto',
    table: 'min-w-full divide-y border-surface',
    header: 'bg-surface',
    headerCell: [
      'font-medium text-left',
      textColors.default,
      `${paddingX.md} ${paddingY.sm}`,
      'border-b border-surface'
    ],
    body: 'divide-y divide-surface',
    row: 'hover:bg-muted/20',
    cell: [
      'whitespace-nowrap',
      textColors.default,
      `${paddingX.md} ${paddingY.sm}`,
    ],
    periodBadge: [
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      'bg-blue-100 text-blue-800'
    ],
    periodType: [
      'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium',
    ]
  },
  variants: {
    textSize: {
      xs: { 
        table: textSize.xs,
        headerCell: textSize.xs,
        cell: textSize.xs
      },
      sm: { 
        table: textSize.sm,
        headerCell: textSize.sm,
        cell: textSize.sm
      },
      base: { 
        table: textSize.base,
        headerCell: textSize.base,
        cell: textSize.base
      },
      lg: { 
        table: textSize.lg,
        headerCell: textSize.lg,
        cell: textSize.lg
      },
      xl: { 
        table: textSize.xl,
        headerCell: textSize.xl,
        cell: textSize.xl
      }
    },
    compact: {
      true: { 
        headerCell: `${paddingX.sm} ${paddingY.xs}`,
        cell: `${paddingX.sm} ${paddingY.xs}`,
        table: 'text-sm leading-tight'
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

// Map of period types to color classes
const periodTypeColorMap: Record<string, string> = {
  'Academic': 'bg-blue-50 text-blue-700',
  'Lunch': 'bg-green-50 text-green-700',
  'Prep': 'bg-yellow-50 text-yellow-700',
  'Testing': 'bg-purple-50 text-purple-700',
  'Specialized': 'bg-indigo-50 text-indigo-700',
  'Other': 'bg-gray-50 text-gray-700',
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

  // Function to get the period type color class
  const getPeriodTypeClass = (periodType: string) => {
    if (!periodTypeColors) return 'bg-gray-50 text-gray-700'
    return periodTypeColorMap[periodType] || 'bg-gray-50 text-gray-700'
  }

  return (
    <div className={cn(styles.wrapper(), className)}>
      <table className={styles.table()}>
        <thead className={styles.header()}>
          <tr>
            <th scope="col" className={styles.headerCell()}>Period</th>
            {scheduleByDay.map(day => (
              <th key={day.day} scope="col" className={styles.headerCell()}>
                {day.day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.body()}>
          {allPeriodNumbers.map(periodNum => (
            <tr key={periodNum} className={styles.row()}>
              <td className={styles.cell()}>
                <span className={styles.periodBadge()}>
                  {periodNum}
                </span>
              </td>
              {scheduleByDay.map(day => {
                const period = periodMap.get(`${day.day}-${periodNum}`)
                return (
                  <td key={`${day.day}-${periodNum}`} className={styles.cell()}>
                    {period ? (
                      <div className="flex flex-col">
                        <span className={cn(weight.medium)}>{period.className}</span>
                        {period.room && (
                          <span className="text-muted text-sm">
                            Room: {period.room}
                          </span>
                        )}
                        <span 
                          className={cn(
                            styles.periodType(),
                            getPeriodTypeClass(period.periodType)
                          )}
                        >
                          {period.periodType}
                        </span>
                      </div>
                    ) : null}
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