'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { tv, type VariantProps } from 'tailwind-variants'

const weekNavigation = tv({
  slots: {
    container: 'relative flex items-center rounded-md bg-white shadow-xs md:items-stretch',
    prevButton: 'flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50',
    todayButton: 'hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block',
    divider: 'relative -mx-px h-5 w-px bg-gray-300 md:hidden',
    nextButton: 'flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50',
    icon: 'size-5'
  },
  variants: {
    size: {
      default: {},
      compact: {
        prevButton: 'h-8 w-10 md:w-8',
        nextButton: 'h-8 w-10 md:w-8',
        todayButton: 'px-2.5 text-xs'
      }
    }
  },
  defaultVariants: {
    size: 'default'
  }
})

export interface WeekNavigationProps extends VariantProps<typeof weekNavigation> {
  onNavigate?: (direction: 'prev' | 'next' | 'today') => void
}

export function WeekNavigation({ onNavigate, size }: WeekNavigationProps) {
  const styles = weekNavigation({ size })

  return (
    <div className={styles.container()}>
      <button
        type="button"
        onClick={() => onNavigate?.('prev')}
        className={styles.prevButton()}
      >
        <span className="sr-only">Previous week</span>
        <ChevronLeftIcon className={styles.icon()} aria-hidden="true" />
      </button>
      
      <button
        type="button"
        onClick={() => onNavigate?.('today')}
        className={styles.todayButton()}
      >
        Today
      </button>
      
      <span className={styles.divider()} />
      
      <button
        type="button"
        onClick={() => onNavigate?.('next')}
        className={styles.nextButton()}
      >
        <span className="sr-only">Next week</span>
        <ChevronRightIcon className={styles.icon()} aria-hidden="true" />
      </button>
    </div>
  )
} 