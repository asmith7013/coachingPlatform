'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { spacing, fontSizes, textColors } from '@/lib/ui/tokens'
import { TableColumnSchema } from '@/lib/ui/table-schema'
import { TableHeader } from './table-header'
import { TableRow } from './table-row'
import { TableEmpty } from './table-empty'
import { TableActions } from './table-actions'

interface TableProps<T> {
  data: T[]
  columns: TableColumnSchema<T>[]
  className?: string
  title?: string
  description?: string
  actions?: React.ReactNode
  onEdit?: (item: T) => void
  emptyMessage?: string
}

export function Table<T extends { id?: string | number }>({
  data,
  columns,
  className,
  title,
  description,
  actions,
  onEdit,
  emptyMessage,
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string>()
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const containerPadding = spacing.lg
  const tableSpacing = spacing.lg
  const headerTextSize = fontSizes.base
  const headerTextColor = textColors.primary
  const descriptionTextSize = fontSizes.base

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnId)
      setSortDirection('asc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0

    const column = columns.find((col) => col.id === sortColumn)
    if (!column) return 0

    const aValue = column.accessor(a)
    const bValue = column.accessor(b)

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  return (
    <div className={cn(containerPadding, className)}>
      {(title || description || actions) && (
        <div className="sm:flex sm:items-center">
          {(title || description) && (
            <div className="sm:flex-auto">
              {title && (
                <h1 className={cn(headerTextSize, 'font-semibold', headerTextColor)}>
                  {title}
                </h1>
              )}
              {description && (
                <p className={cn('mt-2', descriptionTextSize, textColors.secondary)}>
                  {description}
                </p>
              )}
            </div>
          )}
          {actions && <TableActions>{actions}</TableActions>}
        </div>
      )}

      <div className={cn('mt-8 flow-root', tableSpacing)}>
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {data.length === 0 ? (
              <TableEmpty message={emptyMessage} />
            ) : (
              <table className="min-w-full">
                <TableHeader 
                  columns={columns} 
                  showEdit={!!onEdit}
                  onSort={handleSort}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                />
                <tbody className="bg-white">
                  {sortedData.map((item, i) => (
                    <TableRow
                      key={item.id ?? i}
                      item={item}
                      columns={columns}
                      onEdit={onEdit}
                      isFirst={i === 0}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
