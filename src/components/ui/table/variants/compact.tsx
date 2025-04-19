'use client'

import { Table, type TableVariants } from '../table'
import { tv, type VariantProps } from 'tailwind-variants'
import { TableColumnSchema } from '@/lib/ui/table-schema'

const compactTable = tv({
  base: 'text-sm leading-tight',
  variants: {
    spacing: {
      sm: 'space-y-2',
      md: 'space-y-3',
      lg: 'space-y-4'
    }
  },
  defaultVariants: {
    spacing: 'md'
  }
})

export type CompactTableVariants = VariantProps<typeof compactTable>
export const compactTableStyles = compactTable

interface CompactTableProps<T> extends TableVariants, CompactTableVariants {
  data: T[]
  columns: TableColumnSchema<T>[]
  className?: string
  title?: string
  description?: string
  actions?: React.ReactNode
  onEdit?: (item: T) => void
  emptyMessage?: string
}

export function CompactTable<T>({
  data,
  columns,
  className,
  spacing,
  ...props
}: CompactTableProps<T>) {
  return (
    <Table
      className={compactTable({ spacing, className })}
      data={data}
      columns={columns}
      textSize="sm"
      {...props}
    />
  )
}
