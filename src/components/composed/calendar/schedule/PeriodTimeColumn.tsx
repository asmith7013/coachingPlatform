'use client'

import { tv } from 'tailwind-variants'

// IMPORT: Use existing PeriodTime type instead of redefining
import type { PeriodTime } from '@domain-types/schedule'

const periodColumn = tv({
  slots: {
    container: 'sticky left-0 z-10 bg-white border-r border-gray-200',
    cell: 'border-b border-gray-100 h-20 flex flex-col justify-between py-1 px-2',
    time: 'text-xs text-gray-500 text-center font-medium',
    periodNumber: 'text-sm font-semibold text-gray-700 text-center'
  }
})

export interface PeriodTimeColumnProps {
  periodTimes: PeriodTime[]
  className?: string
}

export function PeriodTimeColumn({ periodTimes, className }: PeriodTimeColumnProps) {
  const styles = periodColumn()
  
  return (
    <div className={styles.container({ className })}>
      {periodTimes.map((periodTime, index) => (
        <div 
          key={index} 
          className={styles.cell({
            className: index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
          })}
        >
          <div className={styles.time()}>
            {periodTime.start}
          </div>
          <div className={styles.periodNumber()}>
            Period {periodTime.period}
          </div>
          <div className={styles.time()}>
            {periodTime.end}
          </div>
        </div>
      ))}
    </div>
  )
} 