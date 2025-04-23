'use client'

import { Table, type TableVariants } from '../Table'
import { tv, type VariantProps } from 'tailwind-variants'
import { TableColumnSchema } from '@ui/table-schema'
import { TablePagination } from '../features/pagination'

const paginatedTable = tv({
  slots: {
    root: 'relative',
    pagination: 'mt-4'
  },
  variants: {
    spacing: {
      sm: { pagination: 'mt-2' },
      md: { pagination: 'mt-4' },
      lg: { pagination: 'mt-6' }
    },
    sticky: {
      true: { pagination: 'sticky bottom-0 bg-background/80 backdrop-blur' }
    }
  },
  defaultVariants: {
    spacing: 'md',
    sticky: false
  }
})

export type PaginatedTableVariants = VariantProps<typeof paginatedTable>
export const paginatedTableStyles = paginatedTable

interface PaginatedTableProps<T> extends TableVariants, PaginatedTableVariants {
  data: T[]
  columns: TableColumnSchema<T>[]
  className?: string
  title?: string
  description?: string
  actions?: React.ReactNode
  onEdit?: (item: T) => void
  emptyMessage?: string
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

export function PaginatedTable<T>({
  data,
  columns,
  className,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  spacing,
  sticky,
  ...props
}: PaginatedTableProps<T>) {
  const styles = paginatedTable({ spacing, sticky })

  return (
    <div className={styles.root({ className })}>
      <Table
        data={data}
        columns={columns}
        {...props}
      />
      {totalPages > 1 && (
        <div className={styles.pagination()}>
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange!}
          />
        </div>
      )}
    </div>
  )
}
