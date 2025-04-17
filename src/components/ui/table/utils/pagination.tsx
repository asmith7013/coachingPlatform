import { tv, type VariantProps } from 'tailwind-variants'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'

const tablePagination = tv({
  slots: {
    root: 'flex items-center justify-between bg-surface border-t border-surface',
    info: 'text-text-muted',
    nav: 'flex items-center space-x-2',
    button: [
      'inline-flex items-center justify-center rounded-md border',
      'border-surface bg-background',
      'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ],
    buttonIcon: 'text-text-muted'
  },
  variants: {
    size: {
      sm: {
        root: 'px-3 py-2',
        info: 'text-xs',
        button: 'p-1',
        buttonIcon: 'size-4'
      },
      md: {
        root: 'px-4 py-3',
        info: 'text-sm',
        button: 'p-1.5',
        buttonIcon: 'size-5'
      },
      lg: {
        root: 'px-5 py-4',
        info: 'text-base',
        button: 'p-2',
        buttonIcon: 'size-6'
      }
    }
  },
  defaultVariants: {
    size: 'md'
  }
})

export type TablePaginationVariants = VariantProps<typeof tablePagination>
export const tablePaginationStyles = tablePagination

interface TablePaginationProps extends TablePaginationVariants {
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
  size
}: TablePaginationProps) {
  const styles = tablePagination({ size })
  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages

  return (
    <div className={styles.root({ className })}>
      <div className={styles.info()}>
        Page {currentPage} of {totalPages}
      </div>
      <nav className={styles.nav()}>
        <button
          onClick={() => canGoPrev && onPageChange(currentPage - 1)}
          disabled={!canGoPrev}
          className={styles.button()}
          aria-label="Previous page"
        >
          <ChevronLeftIcon className={styles.buttonIcon()} aria-hidden="true" />
        </button>
        <button
          onClick={() => canGoNext && onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className={styles.button()}
          aria-label="Next page"
        >
          <ChevronRightIcon className={styles.buttonIcon()} aria-hidden="true" />
        </button>
      </nav>
    </div>
  )
} 