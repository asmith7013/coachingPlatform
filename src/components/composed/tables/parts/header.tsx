'use client'

import { tv, type VariantProps } from 'tailwind-variants'
import { ChevronUpIcon } from '@heroicons/react/24/solid'
import { TableColumnSchema } from '@ui/table-schema'

const tableHeader = tv({
  slots: {
    root: 'bg-surface',
    cell: 'font-medium text-text',
    actionCell: 'text-right'
  },
  variants: {
    textSize: {
      sm: { cell: 'text-xs' },
      base: { cell: 'text-sm' },
      lg: { cell: 'text-base' }
    },
    padding: {
      sm: { 
        cell: 'px-3 py-2',
        actionCell: 'px-3 py-2'
      },
      md: { 
        cell: 'px-4 py-3',
        actionCell: 'px-4 py-3'
      },
      lg: { 
        cell: 'px-6 py-4',
        actionCell: 'px-6 py-4'
      }
    }
  },
  defaultVariants: {
    textSize: 'base',
    padding: 'md'
  }
})

export type TableHeaderVariants = VariantProps<typeof tableHeader>

export interface TableHeaderProps<T> {
  columns: TableColumnSchema<T>[]
  textSize?: TableHeaderVariants['textSize']
  padding?: TableHeaderVariants['padding']
  sortColumn?: string
  onSort?: (columnId: string) => void
  className?: string
  showEdit?: boolean
}

export function TableHeader<T>({
  columns,
  textSize = 'base',
  padding = 'md',
  sortColumn,
  onSort,
  showEdit
}: TableHeaderProps<T>) {
  const styles = tableHeader({ textSize, padding })

  return (
    <thead className={styles.root()}>
      <tr>
        {columns.map((column, index) => (
          <th
            key={index}
            className={styles.cell({
              className: column.sortable ? 'cursor-pointer hover:text-primary' : undefined,
              ...(sortColumn === column.id && { className: 'text-primary' })
            })}
            onClick={() => onSort?.(column.id)}
          >
            <div className="flex items-center gap-2">
              <span>{column.label}</span>
              {column.sortable && (
                <span className="flex-none">
                  {sortColumn === column.id && (
                    <ChevronUpIcon className="h-4 w-4 text-text-muted" aria-hidden="true" />
                  )}
                </span>
              )}
            </div>
          </th>
        ))}
        {showEdit && (
          <th className={styles.actionCell()}>
            Actions
          </th>
        )}
      </tr>
    </thead>
  )
}
