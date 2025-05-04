'use client'

import { Fragment, useState } from 'react'
import { Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { cn } from '@ui/utils/formatters'
import { tv, type VariantProps } from 'tailwind-variants'
import { shadows, textColors, textSize } from '@ui-tokens/tokens'

// Define Toast variants using tv()
const toast = tv({
  slots: {
    container: 'pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6',
    wrapper: 'flex w-full flex-col items-center space-y-4 sm:items-end',
    panel: [
      'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5',
      shadows.lg,
    ],
    content: 'p-4',
    flex: 'flex items-start',
    icon: 'shrink-0',
    iconSvg: 'size-6',
    body: 'ml-3 w-0 flex-1 pt-0.5',
    title: `${textSize.sm} font-medium`,
    description: `mt-1 ${textSize.sm}`,
    closeWrapper: 'ml-4 flex shrink-0',
    closeButton: 'inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden',
    closeIcon: 'size-5',
  },
  variants: {
    variant: {
      success: {
        iconSvg: 'text-green-400',
        title: textColors.default,
        description: textColors.muted,
      },
      error: {
        iconSvg: 'text-red-400',
        title: textColors.danger,
        description: textColors.muted,
      },
      warning: {
        iconSvg: 'text-amber-400',
        title: textColors.default,
        description: textColors.muted,
      },
      info: {
        iconSvg: 'text-blue-400',
        title: textColors.default,
        description: textColors.muted,
      },
    },
    position: {
      bottomRight: {
        container: 'items-end',
        wrapper: 'items-end',
      },
      topRight: {
        container: 'items-start',
        wrapper: 'items-end',
      },
      bottomLeft: {
        container: 'items-end',
        wrapper: 'items-start',
      },
      topLeft: {
        container: 'items-start',
        wrapper: 'items-start',
      },
      bottom: {
        container: 'items-end',
        wrapper: 'items-center',
      },
      top: {
        container: 'items-start',
        wrapper: 'items-center',
      },
    },
  },
  defaultVariants: {
    variant: 'success',
    position: 'bottomRight',
  },
})

// Export variant types for external use
export type ToastVariants = VariantProps<typeof toast>

export interface ToastProps extends Partial<ToastVariants> {
  show: boolean
  onClose: () => void
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}

export function Toast({
  show,
  onClose,
  title,
  description,
  icon: Icon,
  variant = 'success',
  position = 'bottomRight',
  className,
}: ToastProps) {
  const styles = toast({ variant, position })

  return (
    <div 
      aria-live="assertive"
      className={styles.container()}
    >
      <div className={styles.wrapper()}>
        <Transition
          show={show}
          as={Fragment}
          enter="transform transition ease-out duration-300"
          enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enterTo="translate-y-0 opacity-100 sm:translate-x-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={cn(styles.panel(), className)}>
            <div className={styles.content()}>
              <div className={styles.flex()}>
                {Icon && (
                  <div className={styles.icon()}>
                    <Icon className={styles.iconSvg()} aria-hidden="true" />
                  </div>
                )}
                <div className={styles.body()}>
                  <p className={styles.title()}>{title}</p>
                  {description && (
                    <p className={styles.description()}>{description}</p>
                  )}
                </div>
                <div className={styles.closeWrapper()}>
                  <button
                    type="button"
                    className={styles.closeButton()}
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className={styles.closeIcon()} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  )
}

// Example wrapper component to manage toast state
export function useToast() {
  const [isVisible, setIsVisible] = useState(false)
  const [toastProps, setToastProps] = useState<Omit<ToastProps, 'show' | 'onClose'>>({
    title: '',
    variant: 'success',
  })

  const showToast = (props: Omit<ToastProps, 'show' | 'onClose'>) => {
    setToastProps(props)
    setIsVisible(true)
  }

  const hideToast = () => {
    setIsVisible(false)
  }

  const ToastComponent = () => (
    <Toast
      show={isVisible}
      onClose={hideToast}
      {...toastProps}
    />
  )

  return {
    showToast,
    hideToast,
    ToastComponent,
  }
}
