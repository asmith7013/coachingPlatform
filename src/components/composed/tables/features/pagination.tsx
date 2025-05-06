import { tv, type VariantProps } from 'tailwind-variants'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { textColors } from '@/lib/tokens/tokens'

const tablePagination = tv({
  slots: {
    root: 'flex items-center justify-between bg-surface border-t border-surface',
    info: textColors.muted,
    nav: 'flex items-center space-x-2',
    button: [
      'inline-flex items-center justify-center rounded-md border',
      'border-surface bg-background',
      'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ],
    buttonIcon: textColors.muted
  },
  variants: {
    textSize: {
      xs: {
        root: 'px-3 py-2',
        button: 'p-1',
        buttonIcon: 'size-4',
        info: 'text-xs'
      },
      sm: {
        root: 'px-3 py-2',
        button: 'p-1',
        buttonIcon: 'size-4',
        info: 'text-sm'
      },
      base: {
        root: 'px-4 py-3',
        button: 'p-1.5',
        buttonIcon: 'size-5',
        info: 'text-base'
      },
      lg: {
        root: 'px-5 py-4',
        button: 'p-2',
        buttonIcon: 'size-6',
        info: 'text-lg'
      },
      xl: {
        root: 'px-5 py-4',
        button: 'p-2',
        buttonIcon: 'size-6',
        info: 'text-xl'
      },
      '2xl': {
        root: 'px-5 py-4',
        button: 'p-2',
        buttonIcon: 'size-6',
        info: 'text-2xl'
      }
    }
  },
  defaultVariants: {
    textSize: 'base'
  }
})

export type TablePaginationVariants = VariantProps<typeof tablePagination>
export const tablePaginationStyles = tablePagination

interface TablePaginationProps extends Omit<TablePaginationVariants, 'textSize'> {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  textSize?: TablePaginationVariants['textSize']
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  textSize = 'base'
}: TablePaginationProps) {
  const styles = tablePagination({ textSize })
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