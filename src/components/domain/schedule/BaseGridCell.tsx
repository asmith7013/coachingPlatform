'use client'

import React from 'react'
import type { ScheduleColumn, PeriodTime } from '@domain-types/schedule'
import type { GridCellConfig } from '@/lib/domain/schedule/grid-cell-factory'

/**
 * Props for the BaseGridCell component
 */
export interface BaseGridCellProps {
  // Grid positioning data
  column: ScheduleColumn
  columnIndex: number
  periodTime: PeriodTime
  periodIndex: number
  config: GridCellConfig
  
  // Content and interaction
  children: React.ReactNode
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  onMouseEnter?: (event: React.MouseEvent<HTMLDivElement>) => void
  onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void
  
  // Additional styling and attributes
  className?: string
  'data-testid'?: string
  'aria-label'?: string
  role?: string
  tabIndex?: number
}

/**
 * BaseGridCell - Reusable wrapper component for all schedule grid cells
 * 
 * Provides consistent positioning, styling, and interaction handling
 * for both planned visits and teacher event cells across all schedule grids.
 * 
 * Features:
 * - Automatic grid positioning using GridCellConfig
 * - Consistent styling with accessibility support
 * - Event handling for clicks and hover states
 * - Responsive design with sticky positioning for planned columns
 * - Keyboard navigation support
 * 
 * @example
 * ```tsx
 * <BaseGridCell
 *   column={column}
 *   columnIndex={0}
 *   periodTime={period}
 *   periodIndex={0}
 *   config={cellConfig}
 *   onClick={handleCellClick}
 *   aria-label="Schedule cell for Period 1"
 * >
 *   <ScheduleEventCell events={events} />
 * </BaseGridCell>
 * ```
 */
export function BaseGridCell({
  column,
  columnIndex: _columnIndex,
  periodTime,
  periodIndex,
  config,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className = '',
  'data-testid': testId,
  'aria-label': ariaLabel,
  role = 'gridcell',
  tabIndex
}: BaseGridCellProps) {
  // Combine configuration classes with any additional className
  const combinedClassName = `${config.className} ${className}`.trim()
  
  // Create comprehensive style object
  const cellStyle: React.CSSProperties = {
    gridColumn: `${config.gridColumn}`,
    gridRow: `${config.gridRow}`,
    ...config.stickyStyle
  }
  
  // Generate accessible label if not provided
  const defaultAriaLabel = ariaLabel || generateDefaultAriaLabel(column, periodTime, config)
  
  // Generate test ID if not provided
  const defaultTestId = testId || `grid-cell-${column.id}-${periodIndex}`
  
  // Determine if cell should be focusable
  const cellTabIndex = tabIndex !== undefined ? tabIndex : (onClick ? 0 : -1)

  return (
    <div
      className={combinedClassName}
      style={cellStyle}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-testid={defaultTestId}
      aria-label={defaultAriaLabel}
      role={role}
      tabIndex={cellTabIndex}
      // Additional data attributes for testing and debugging
      data-column-id={column.id}
      data-column-type={config.isPlannedColumn ? 'planned' : 'teacher'}
      data-period-index={periodIndex}
      data-period-start={periodTime.start}
      data-period-end={periodTime.end}
    >
      {children}
    </div>
  )
}

/**
 * Generate a default accessible label for the grid cell
 */
function generateDefaultAriaLabel(
  column: ScheduleColumn,
  periodTime: PeriodTime,
  config: GridCellConfig
): string {
  const columnType = config.isPlannedColumn ? 'Planned visits' : column.title || 'Teacher'
  const timeRange = `${periodTime.start} to ${periodTime.end}`
  
  return `${columnType} cell for ${timeRange}`
}
