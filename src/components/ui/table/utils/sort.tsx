import { tv, type VariantProps } from 'tailwind-variants'

const tableSort = tv({
  slots: {
    root: 'flex items-center space-x-1 font-medium',
    icon: 'ml-1'
  },
  variants: {
    size: {
      sm: { root: 'text-xs' },
      md: { root: 'text-sm' },
      lg: { root: 'text-base' }
    },
    active: {
      true: { root: 'text-primary' },
      false: { root: 'text-muted hover:text-primary' }
    }
  },
  defaultVariants: {
    size: 'md',
    active: false
  }
})

export type TableSortVariants = VariantProps<typeof tableSort>
export const tableSortStyles = tableSort

interface TableSortProps extends TableSortVariants {
  column: string
  currentSort?: string
  sortDirection?: 'asc' | 'desc'
  onSort: (column: string) => void
  className?: string
}

export function TableSort({
  column,
  currentSort,
  sortDirection,
  onSort,
  className,
  size
}: TableSortProps) {
  const isActive = currentSort === column
  const styles = tableSort({ size, active: isActive })

  return (
    <button
      onClick={() => onSort(column)}
      className={styles.root({ className })}
    >
      <span>{column}</span>
      <span className={styles.icon()}>
        {isActive ? (
          sortDirection === 'asc' ? '↑' : '↓'
        ) : (
          '↕'
        )}
      </span>
    </button>
  )
} 