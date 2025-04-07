import { cn } from '@/lib/utils'

interface TablePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: TablePaginationProps) {
  return (
    <div className={cn(
      'flex items-center justify-between px-4 py-3',
      'bg-surface',
      'border-surface',
      className
    )}>
      <div className="flex items-center">
        <p className={cn(
          'text-sm',
          'text-muted'
        )}>
          Showing page {currentPage} of {totalPages}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'px-3 py-1 text-sm rounded-md',
            'text-primary',
            'hover:bg-surface-hover',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'px-3 py-1 text-sm rounded-md',
            'text-primary',
            'hover:bg-surface-hover',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          Next
        </button>
      </div>
    </div>
  )
} 