import type { PeriodTime } from '@domain-types/schedule'

export interface GridPosition {
  column: number
  row: number
  columnSpan?: number
  rowSpan?: number
}

export interface ColumnWidths {
  periodColumn: string
  plannedColumn: string
  teacherColumns: string
  totalColumns: number
  totalWidth: number // Total calculated width in pixels for horizontal scroll
}

export type ColumnType = 'period' | 'planned' | 'teacher'
export type ScreenSize = 'mobile' | 'tablet' | 'desktop'

/**
 * Calculate grid position for any schedule item
 * Eliminates duplicate positioning logic across components
 */
export function calculateGridPosition(
  columnType: ColumnType,
  columnIndex: number,
  hasPlannedColumn: boolean = true
): GridPosition {
  let column: number

  switch (columnType) {
    case 'period':
      column = 1 // Period column is always first
      break
    case 'planned':
      column = 2 // Planned column is always second (when present)
      break
    case 'teacher':
      // Teacher columns start after period and planned columns
      const offset = hasPlannedColumn ? 2 : 1
      column = offset + columnIndex + 1
      break
    default:
      throw new Error(`Unknown column type: ${columnType}`)
  }

  return {
    column,
    row: 1, // Default row - can be overridden for specific use cases
    columnSpan: 1,
    rowSpan: 1
  }
}

/**
 * Calculate responsive column widths based on content and screen size
 * Provides consistent column sizing across all schedule grids
 */
export function calculateColumnWidths(
  columnCount: number,
  hasPlannedColumn: boolean = true,
  screenSize: ScreenSize = 'desktop'
): ColumnWidths {
  const baseColumns = hasPlannedColumn ? 2 : 1 // period + planned (optional)
  const teacherColumnCount = Math.max(0, columnCount - baseColumns)
  const totalColumns = baseColumns + teacherColumnCount

  // Responsive width calculations
  const widths = getResponsiveWidths(screenSize, teacherColumnCount)

  // Calculate total width in pixels for horizontal scroll
  const periodWidth = parseInt(widths.period)
  const plannedWidth = hasPlannedColumn ? parseInt(widths.planned) : 0
  const teacherWidth = parseInt(widths.teacher)
  const totalWidth = periodWidth + plannedWidth + (teacherWidth * teacherColumnCount)

  return {
    periodColumn: widths.period,
    plannedColumn: hasPlannedColumn ? widths.planned : '0px',
    teacherColumns: widths.teacher,
    totalColumns,
    totalWidth
  }
}

/**
 * Generate CSS grid template columns string
 * Provides consistent grid layouts across components
 */
export function generateGridTemplate(
  columnCount: number,
  hasPlannedColumn: boolean = true,
  screenSize: ScreenSize = 'desktop'
): string {
  const widths = calculateColumnWidths(columnCount, hasPlannedColumn, screenSize)
  const teacherColumnCount = Math.max(0, columnCount - (hasPlannedColumn ? 2 : 1))
  
  const columns: string[] = []
  
  // Period column
  columns.push(widths.periodColumn)
  
  // Planned column (if present)
  if (hasPlannedColumn) {
    columns.push(widths.plannedColumn)
  }
  
  // Teacher columns
  for (let i = 0; i < teacherColumnCount; i++) {
    columns.push(widths.teacherColumns)
  }
  
  return columns.join(' ')
}

/**
 * Calculate period-specific grid row positioning
 * Handles period timing and vertical alignment
 */
export function calculatePeriodGridPosition(
  periodIndex: number,
  _periodTime?: PeriodTime,
  _startTime?: string
): GridPosition {
  // Basic row calculation - can be enhanced with time-based positioning
  const row = periodIndex + 2 // +2 to account for header row
  
  return {
    column: 1,
    row,
    columnSpan: 1,
    rowSpan: 1
  }
}

/**
 * Get column index for teacher columns
 * Handles the offset calculation consistently
 */
export function getTeacherColumnIndex(
  teacherIndex: number,
  hasPlannedColumn: boolean = true
): number {
  const offset = hasPlannedColumn ? 2 : 1
  return offset + teacherIndex
}

/**
 * Check if a column index represents a teacher column
 * Useful for event handling and styling
 */
export function isTeacherColumn(
  columnIndex: number,
  hasPlannedColumn: boolean = true
): boolean {
  const minTeacherColumn = hasPlannedColumn ? 3 : 2
  return columnIndex >= minTeacherColumn
}

/**
 * Get responsive width configurations based on screen size
 * Uses fixed widths to ensure consistent column sizing across all teacher columns
 */
function getResponsiveWidths(
  screenSize: ScreenSize,
  teacherColumnCount: number
): { period: string; planned: string; teacher: string } {
  switch (screenSize) {
    case 'mobile':
      return {
        period: '80px',
        planned: '100px',
        teacher: '120px' // Fixed width instead of minmax(120px, 1fr)
      }
    case 'tablet':
      return {
        period: '100px',
        planned: '120px',
        teacher: '140px' // Fixed width instead of minmax(140px, 1fr)
      }
    case 'desktop':
    default:
      // Dynamic sizing based on number of teacher columns
      const hasMany = teacherColumnCount > 6
      return {
        period: '120px',
        planned: '140px',
        teacher: hasMany ? '160px' : '180px' // Fixed widths for consistent sizing
      }
  }
} 