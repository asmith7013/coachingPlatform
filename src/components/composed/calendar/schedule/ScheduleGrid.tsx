'use client'

import { useMemo } from 'react'
import { tv } from 'tailwind-variants'
import { 
  generateGridTemplate, 
  calculateColumnWidths
} from '@/lib/domain/schedule/grid-positioning'
import type { ScheduleColumn, PeriodTime } from '@domain-types/schedule'

const scheduleGrid = tv({
  slots: {
    container: 'flex h-full flex-col',
    content: 'flex flex-auto overflow-x-auto',
    contentGrid: 'grid flex-auto',
    
    // Sticky column styles
    periodColumn: 'sticky left-0 z-20 bg-white border-r-2 border-gray-300',
    plannedColumn: 'sticky z-20 bg-white border-r-2 border-gray-300',
    teacherColumn: 'relative bg-white',
    
    // Header styles
    headerCell: 'sticky top-0 left-0 z-40 bg-gray-50 border-b border-r border-gray-200 py-3 text-center text-xs font-medium',
    plannedHeaderCell: 'sticky top-0 z-40 bg-gray-50 border-b border-r border-gray-200 py-3 text-center text-xs font-medium',
    teacherHeaderCell: 'sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200 py-3 text-center text-xs font-medium',
    
    columnTitle: 'font-bold text-center text-sm text-gray-900',
    
    // Period cell styles
    periodCell: 'border-b border-gray-200 h-20 flex flex-col justify-between py-1 px-2',
    periodTimeStart: 'text-xs text-gray-500 text-center font-medium',
    periodLabel: 'text-sm font-semibold text-gray-700 text-center',
    periodTimeEnd: 'text-xs text-gray-500 text-center font-medium'
  },
  variants: {
    striped: {
      true: {},
      false: {}
    }
  },
  defaultVariants: {
    striped: true
  }
})


export interface ScheduleGridProps {
  columns: ScheduleColumn[]
  periodTimes: PeriodTime[]
  children: React.ReactNode
  className?: string
  striped?: boolean
}

/**
 * Pure ScheduleGrid component - handles only layout and positioning
 * Separated from interactive and data concerns for better composition
 */
export function ScheduleGrid({
  columns,
  periodTimes,
  children,
  className,
  striped = true
}: ScheduleGridProps) {
  const styles = scheduleGrid({ striped })
  
  // Calculate grid layout using centralized utilities
  const { gridTemplate, columnWidths, totalWidth } = useMemo(() => {
    const columnCount = columns.length
    const hasPlannedColumn = columns.some(col => col.id === 'planned-visits')
    
    const widths = calculateColumnWidths(columnCount, hasPlannedColumn, 'desktop')
    const template = generateGridTemplate(columnCount, hasPlannedColumn, 'desktop')
    
    return {
      gridTemplate: template,
      columnWidths: {
        period: parseInt(widths.periodColumn),
        planned: parseInt(widths.plannedColumn),
        teacher: parseInt(widths.teacherColumns)
      },
      totalWidth: widths.totalWidth
    }
  }, [columns])
  
  const gridTemplateRows = `auto repeat(${periodTimes.length}, minmax(60px, 80px))`

  return (
    <div className={styles.container({ className })}>
      <div className={styles.content()}>
        <div 
          className={styles.contentGrid()}
          style={{ 
            gridTemplateColumns: gridTemplate,
            gridTemplateRows,
            minWidth: `${totalWidth}px`
          }}
        >
          {/* Header row - Period cell sticky in both directions */}
          <div className={styles.headerCell()}>
            Period
          </div>
          
          {/* Column headers with proper sticky positioning */}
          {columns.map((column) => {
            const isPlanned = column.id === 'planned-visits'
            const headerCellClass = isPlanned 
              ? styles.plannedHeaderCell() 
              : styles.teacherHeaderCell()
            
            const stickyStyle = isPlanned 
              ? { left: `${columnWidths.period}px` }
              : undefined
            
            return (
              <div 
                key={`header-${column.id}`} 
                className={headerCellClass}
                style={stickyStyle}
              >
                <div>
                  <div className={styles.columnTitle()}>
                    {column.title}
                  </div>
                  {column.subtitle && (
                    <div className="text-xs text-gray-500 text-center">
                      {column.subtitle}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Period time column with sticky positioning */}
          {periodTimes.map((periodTime, index) => (
            <div 
              key={`period-${index}`}
              className={`${styles.periodColumn()} ${styles.periodCell()} ${
                striped && index % 2 === 0 ? 'bg-white' : striped ? 'bg-gray-50' : 'bg-white'
              }`}
              style={{ gridColumn: '1', gridRow: `${index + 2}` }}
            >
              <div className={styles.periodTimeStart()}>
                {periodTime.start}
              </div>
              <div className={styles.periodLabel()}>
                Period {periodTime.period}
              </div>
              <div className={styles.periodTimeEnd()}>
                {periodTime.end}
              </div>
            </div>
          ))}

          {/* Content cells - rendered by children */}
          {children}
        </div>
      </div>
    </div>
  )
} 