'use client'

import { Table } from '../table'
import { cn } from '@/lib/utils'
import { TableColumnSchema } from '@/lib/ui/table-schema'
import { spacing, fontSizes, textColors } from '@/lib/ui/tokens'

interface PaginatedTableProps<T> {
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

export function PaginatedTable<T extends { id?: string | number }>({
  data,
  columns,
  className,
  currentPage = 1,
  totalPages = 1,
//   onPageChange,
  ...props
}: PaginatedTableProps<T>) {
  return (
    <div className={cn('relative', className)}>
      <Table
        data={data}
        columns={columns}
        {...props}
      />

      {/* You can replace this with real pagination UI later */}
      <div className={cn(
        'mt-4 text-center',
        spacing.md,
        fontSizes.base,
        textColors.secondary
      )}>
        Page {currentPage} of {totalPages}
      </div>
    </div>
  )
}
