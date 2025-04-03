import { cn } from '@/lib/utils'
import { textColors, backgroundColors, borderColors } from '@/lib/ui/tokens'

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
      backgroundColors.surface,
      borderColors.default,
      className
    )}>
      <div className="flex items-center">
        <p className={cn(
          'text-sm',
          textColors.muted
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
            textColors.primary,
            'hover:bg-gray-100',
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
            textColors.primary,
            'hover:bg-gray-100',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          Next
        </button>
      </div>
    </div>
  )
} 