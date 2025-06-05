import type { ScheduleColumn, PeriodTime } from '@domain-types/schedule'
import { calculateGridPosition, calculateColumnWidths } from './grid-positioning'

/**
 * Configuration options for creating grid cells
 */
export interface GridCellOptions {
  hasPlannedColumn: boolean
  columnType: 'planned' | 'teacher'
  teacherIndex?: number
  screenSize?: 'mobile' | 'tablet' | 'desktop'
}

/**
 * Complete configuration for positioning and styling a grid cell
 */
export interface GridCellConfig {
  gridColumn: number
  gridRow: number
  className: string
  stickyStyle?: React.CSSProperties
  isPlannedColumn: boolean
  isTeacherColumn: boolean
}

/**
 * Base CSS classes for different cell types
 */
const CELL_BASE_CLASSES = {
  planned: 'sticky z-20 bg-white border-r-2 border-gray-300',
  teacher: 'relative bg-white',
  container: 'relative'
} as const

/**
 * Creates complete grid cell configuration including positioning and styling
 * Centralizes all grid cell setup logic to eliminate duplication
 */
export function createGridCellConfig(
  column: ScheduleColumn,
  columnIndex: number,
  periodIndex: number,
  options: GridCellOptions
): GridCellConfig {
  const { hasPlannedColumn, columnType, teacherIndex = 0, screenSize = 'desktop' } = options
  
  // Calculate grid positioning
  const position = calculateGridPosition(columnType, teacherIndex, hasPlannedColumn)
  
  // Determine cell type flags
  const isPlannedColumn = column.id === 'planned-visits'
  const isTeacherColumn = !isPlannedColumn
  
  // Get appropriate CSS classes
  const cellTypeClass = isPlannedColumn ? CELL_BASE_CLASSES.planned : CELL_BASE_CLASSES.teacher
  const className = `${CELL_BASE_CLASSES.container} ${cellTypeClass}`
  
  // Calculate sticky positioning for planned column
  let stickyStyle: React.CSSProperties | undefined
  if (isPlannedColumn && hasPlannedColumn) {
    const columnWidths = calculateColumnWidths(columnIndex + 1, hasPlannedColumn, screenSize)
    stickyStyle = { left: `${parseInt(columnWidths.periodColumn)}px` }
  }
  
  return {
    gridColumn: position.column,
    gridRow: periodIndex + 2, // +2 to account for header row
    className,
    stickyStyle,
    isPlannedColumn,
    isTeacherColumn
  }
}

/**
 * Cell renderer function type for the renderGridCells utility
 */
export type CellRenderer = (
  column: ScheduleColumn,
  columnIndex: number,
  periodTime: PeriodTime,
  periodIndex: number,
  config: GridCellConfig
) => React.ReactNode

/**
 * Shared iteration and cell creation logic for all schedule grids
 * Eliminates duplication of cell positioning and rendering loops
 */
export function renderGridCells(
  columns: ScheduleColumn[],
  periodTimes: PeriodTime[],
  cellRenderer: CellRenderer,
  options: Partial<GridCellOptions> = {}
): React.ReactNode[] {
  const hasPlannedColumn = columns.some(col => col.id === 'planned-visits')
  const defaultOptions: GridCellOptions = {
    hasPlannedColumn,
    columnType: 'teacher', // Default, will be overridden per column
    screenSize: 'desktop',
    ...options
  }
  
  return columns.flatMap((column, columnIndex) =>
    periodTimes.map((periodTime, periodIndex) => {
      // Determine column type and teacher index
      const isPlanned = column.id === 'planned-visits'
      const columnType: 'planned' | 'teacher' = isPlanned ? 'planned' : 'teacher'
      const teacherIndex = isPlanned ? 0 : columns.filter(col => col.id !== 'planned-visits').indexOf(column)
      
      // Create cell configuration
      const cellOptions: GridCellOptions = {
        ...defaultOptions,
        columnType,
        teacherIndex
      }
      
      const config = createGridCellConfig(column, columnIndex, periodIndex, cellOptions)
      
      // Render cell using provided renderer
      return cellRenderer(column, columnIndex, periodTime, periodIndex, config)
    })
  )
}

/**
 * Utility to check if a column index represents a planned visits column
 */
export function isPlannedVisitsColumn(column: ScheduleColumn): boolean {
  return column.id === 'planned-visits'
}

/**
 * Utility to get teacher index for teacher columns
 * Handles the offset calculation consistently
 */
export function getTeacherIndex(
  column: ScheduleColumn,
  columns: ScheduleColumn[]
): number {
  if (isPlannedVisitsColumn(column)) {
    return -1 // Not a teacher column
  }
  
  const teacherColumns = columns.filter(col => !isPlannedVisitsColumn(col))
  return teacherColumns.indexOf(column)
}

/**
 * Default cell key generator for React rendering
 */
export function generateCellKey(
  column: ScheduleColumn,
  periodIndex: number
): string {
  return `${column.id}-${periodIndex}`
} 