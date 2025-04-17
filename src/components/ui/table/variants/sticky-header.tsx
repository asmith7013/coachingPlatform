'use client'

import { Table, type TableVariants } from '../table'
import { tv, type VariantProps } from 'tailwind-variants'
import { TableColumnSchema } from '@/lib/ui/table-schema'

const stickyHeaderTable = tv({
  slots: {
    root: 'overflow-auto',
    header: [
      'sticky top-0 z-10',
      'bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/60'
    ]
  },
  variants: {
    maxHeight: {
      sm: { root: 'max-h-[300px]' },
      md: { root: 'max-h-[500px]' },
      lg: { root: 'max-h-[700px]' }
    },
    shadow: {
      true: { header: 'shadow-sm' }
    }
  },
  defaultVariants: {
    maxHeight: 'md',
    shadow: true
  }
})

export type StickyHeaderTableVariants = VariantProps<typeof stickyHeaderTable>
export const stickyHeaderTableStyles = stickyHeaderTable

interface StickyHeaderTableProps<T> extends TableVariants, StickyHeaderTableVariants {
  data: T[]
  columns: TableColumnSchema<T>[]
  className?: string
  title?: string
  description?: string
  actions?: React.ReactNode
  onEdit?: (item: T) => void
  emptyMessage?: string
}

export function StickyHeaderTable<T>({
  data,
  columns,
  className,
  maxHeight,
  shadow,
  ...props
}: StickyHeaderTableProps<T>) {
  const styles = stickyHeaderTable({ maxHeight, shadow })

  return (
    <div className={styles.root({ className })}>
      <Table
        data={data}
        columns={columns}
        headerClassName={styles.header()}
        {...props}
      />
    </div>
  )
}
