'use client'

import { useMemo } from 'react'
import { cn } from '@ui/utils/formatters';
import { tv, type VariantProps } from 'tailwind-variants'
import { textColors, textSize, weight, paddingX, paddingY } from '@/lib/tokens/tokens'
import type { TeacherSchedule, Period, BellSchedule } from '@/lib/schema/zod-schema/schedules/schedule'

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
  schedule: TeacherSchedule;
  bellSchedule?: BellSchedule;
  className?: string;
}

export function ScheduleTable({
  schedule,
  bellSchedule,
  className,
  textSize = 'base',
  compact = false,
  periodTypeColors = true,
}: ScheduleTableProps) {
  const styles = scheduleTable({ textSize, compact, periodTypeColors })

  // Get all unique period numbers from assignments
  const allPeriodNumbers = useMemo(() => {
    const periodSet = new Set<number>()
    schedule.assignments.forEach(period => {
      periodSet.add(period.periodNumber)
    })
    return Array.from(periodSet).sort((a, b) => a - b)
  }, [schedule.assignments])

  // Create a lookup map for periods by period number
  const periodMap = useMemo(() => {
    const map = new Map<number, Period>()
    schedule.assignments.forEach(period => {
      map.set(period.periodNumber, period)
    })
    return map
  }, [schedule.assignments])

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
            <th scope="col" className={styles.headerCell()}>Time</th>
            <th scope="col" className={styles.headerCell()}>Class</th>
            <th scope="col" className={styles.headerCell()}>Room</th>
            <th scope="col" className={styles.headerCell()}>Type</th>
          </tr>
        </thead>
        <tbody className={styles.body()}>
          {allPeriodNumbers.map(periodNum => {
            const period = periodMap.get(periodNum)
            const timeBlock = bellSchedule?.timeBlocks?.find(b => b.periodNumber === periodNum)
            return (
              <tr key={periodNum} className={styles.row()}>
                <td className={styles.cell()}>
                  <span className={styles.periodBadge()}>
                    {periodNum}
                  </span>
                </td>
                <td className={styles.cell()}>
                  {timeBlock ? (
                    <span className="text-sm">
                      {timeBlock.startTime} - {timeBlock.endTime}
                    </span>
                  ) : (
                    <span className="text-muted text-sm">-</span>
                  )}
                </td>
                <td className={styles.cell()}>
                  {period ? (
                    <span className={cn(weight.medium)}>{period.className}</span>
                  ) : (
                    <span className="text-muted text-sm">Free Period</span>
                  )}
                </td>
                <td className={styles.cell()}>
                  {period?.room ? (
                    <span className="text-sm">{period.room}</span>
                  ) : (
                    <span className="text-muted text-sm">-</span>
                  )}
                </td>
                <td className={styles.cell()}>
                  {period ? (
                    <span 
                      className={cn(
                        styles.periodType(),
                        getPeriodTypeClass(period.activityType)
                      )}
                    >
                      {period.activityType}
                    </span>
                  ) : null}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
} 