import { cn } from '@/lib/utils'
import { textColors } from '@/lib/ui/tokens'

interface TableSortProps {
  column: string
  currentSort: string | null
  sortDirection: 'asc' | 'desc' | null
  onSort: (column: string) => void
  className?: string
}

export function TableSort({
  column,
  currentSort,
  sortDirection,
  onSort,
  className,
}: TableSortProps) {
  const isActive = currentSort === column

  return (
    <button
      onClick={() => onSort(column)}
      className={cn(
        'flex items-center space-x-1 text-sm font-medium',
        textColors.muted,
        'hover:text-primary',
        isActive && textColors.primary,
        className
      )}
    >
      <span>{column}</span>
      <span className="ml-1">
        {isActive ? (
          sortDirection === 'asc' ? '↑' : '↓'
        ) : (
          '↕'
        )}
      </span>
    </button>
  )
} 