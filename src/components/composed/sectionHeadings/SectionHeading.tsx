'use client'

import { forwardRef } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { MagnifyingGlassIcon, BarsArrowUpIcon } from '@heroicons/react/16/solid'
import { Button } from '@/components/core'
import type { SectionHeadingProps, ButtonAction, SearchAction, SectionAction } from './types'

const sectionHeadingVariants = tv({
  slots: {
    container: 'border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between',
    titleContainer: 'flex items-center gap-3',
    iconWrapper: 'flex items-center justify-center rounded-lg flex-shrink-0',
    textContainer: 'flex flex-col',
    title: 'text-base font-semibold text-gray-900 sm:text-lg',
    subtitle: 'text-sm text-gray-500 mt-1',
    actions: 'mt-3 flex gap-3 sm:ml-4 sm:mt-0 sm:flex-shrink-0',
    searchContainer: '-mr-px grid grow grid-cols-1 focus-within:relative',
    searchInput: [
      'col-start-1 row-start-1 block w-full rounded-l-md bg-white py-1.5 pr-3 pl-10',
      'text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300',
      'placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600',
      'sm:pl-9 sm:text-sm/6'
    ],
    searchIcon: 'pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-gray-400 sm:size-4',
    sortButton: [
      'flex shrink-0 items-center gap-x-1.5 rounded-r-md bg-white px-3 py-2',
      'text-sm font-semibold text-gray-900 outline-1 -outline-offset-1 outline-gray-300',
      'hover:bg-gray-50 focus:relative focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600'
    ],
    sortIcon: '-ml-0.5 size-4 text-gray-400'
  },
  variants: {
    variant: {
      default: {},
      compact: {
        container: 'pb-3',
        title: 'text-sm font-medium',
        subtitle: 'text-xs',
        actions: 'mt-2 gap-2 sm:mt-0'
      }
    },
    iconVariant: {
      colored: {
        iconWrapper: 'size-12 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-sm'
      },
      neutral: {
        iconWrapper: 'size-12 bg-gray-100 text-gray-600 border border-gray-200'
      }
    }
  },
  defaultVariants: {
    variant: 'default',
    iconVariant: 'colored'
  },
  compoundVariants: [
    {
      variant: 'compact',
      iconVariant: 'colored',
      class: {
        iconWrapper: 'size-8 from-purple-500 to-purple-600'
      }
    },
    {
      variant: 'compact', 
      iconVariant: 'neutral',
      class: {
        iconWrapper: 'size-8 bg-gray-100'
      }
    }
  ]
})

type SectionHeadingVariants = VariantProps<typeof sectionHeadingVariants>

const SectionHeading = forwardRef<HTMLDivElement, SectionHeadingProps & SectionHeadingVariants>(
  function SectionHeading({ 
    title, 
    subtitle, 
    icon: Icon, 
    actions = [], 
    variant, 
    iconVariant, 
    className, 
    ...props 
  }, ref) {
    const styles = sectionHeadingVariants({ variant, iconVariant })

    const renderButtonAction = (action: ButtonAction, index: number) => (
      <Button
        key={index}
        intent={action.variant === 'primary' ? 'primary' : 'secondary'}
        textSize="sm"
        onClick={action.onClick}
        disabled={action.disabled}
      >
        {action.children}
      </Button>
    )

    const renderSearchAction = (action: SearchAction, index: number) => (
      <div key={index} className="flex">
        <div className={styles.searchContainer()}>
          <input
            type="text"
            placeholder={action.placeholder || 'Search...'}
            value={action.value}
            onChange={(e) => action.onChange?.(e.target.value)}
            className={styles.searchInput()}
            aria-label={action.placeholder || 'Search'}
            disabled={action.disabled}
          />
          <MagnifyingGlassIcon
            aria-hidden="true"
            className={styles.searchIcon()}
          />
        </div>
        {action.onSort && (
          <button
            type="button"
            onClick={action.onSort}
            className={styles.sortButton()}
            disabled={action.disabled}
          >
            <BarsArrowUpIcon 
              aria-hidden="true" 
              className={styles.sortIcon()} 
            />
            {action.sortLabel || 'Sort'}
          </button>
        )}
      </div>
    )

    const renderAction = (action: SectionAction, index: number) => {
      switch (action.type) {
        case 'button':
          return renderButtonAction(action, index)
        case 'search':
          return renderSearchAction(action, index)
        default:
          return null
      }
    }

    return (
      <div
        ref={ref}
        className={`${styles.container()} ${className || ''}`}
        {...props}
      >
        <div className={styles.titleContainer()}>
          {Icon && (
            <div className={styles.iconWrapper()}>
              <Icon 
                className="size-6" 
                aria-hidden={true} 
              />
            </div>
          )}
          <div className={styles.textContainer()}>
            <h3 className={styles.title()}>
              {title}
            </h3>
            {subtitle && (
              <p className={styles.subtitle()}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions.length > 0 && (
          <div className={styles.actions()}>
            {actions.map(renderAction)}
          </div>
        )}
      </div>
    )
  }
)

export { SectionHeading, sectionHeadingVariants }
export type { SectionHeadingProps, SectionHeadingVariants } 