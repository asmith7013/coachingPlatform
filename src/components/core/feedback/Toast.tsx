'use client'

import { Fragment, useState } from 'react'
import { Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { cn } from '@ui/utils/formatters'
import { tv, type VariantProps } from 'tailwind-variants'
import { 
  shadows, textSize, weight, radii, paddingX, paddingY, iconSizes, flex, spaceBetween
} from '@/lib/tokens/tokens'
import { 
  textColors, backgroundColors, hoverTextColors, ringColors
} from '@/lib/tokens/colors'
import { 
  TextSizeToken, 
  TextColorToken,
  ShadowToken
} from '@/lib/tokens/types'

// Define component-specific types
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'bottomRight' | 'topRight' | 'bottomLeft' | 'topLeft' | 'bottom' | 'top';

// Define Toast variants using tv() with full token migration
const toast = tv({
  slots: {
    // Keep structural classes, replace spacing tokens
    container: [
      'pointer-events-none fixed inset-0 flex items-end',
      paddingX.md,        // px-4 → paddingX.md
      paddingY.lg,        // py-6 → paddingY.lg
      'sm:items-start sm:p-6'  // Keep responsive as-is
    ],
    wrapper: ['flex w-full flex-col items-center sm:items-end', spaceBetween.y.md],
    panel: [
      // Keep structural classes
      'pointer-events-auto w-full max-w-sm overflow-hidden',
      // Replace with tokens
      radii.lg,                    // rounded-lg → radii.lg
      backgroundColors.white,       // bg-white → backgroundColors.white
      shadows.lg,                  // shadow-lg → shadows.lg (already tokenized)
      'ring-1 ring-black/5'        // Keep complex ring as-is for now
    ],
    content: [
      // Replace with tokens
      paddingX.md,        // p-4 → paddingX.md + paddingY.md
      paddingY.md
    ],
    flex: 'flex items-start',
    icon: flex.shrink,
    iconSvg: iconSizes.lg,
    body: ['ml-3 w-0', flex.grow, 'pt-0.5'],
    title: [
      textSize.sm,        // text-sm → textSize.sm
      weight.medium       // font-medium → weight.medium
    ],
    description: [
      'mt-1',            // Keep margin as-is
      textSize.sm        // text-sm → textSize.sm
    ],
    closeWrapper: ['ml-4 flex', flex.shrink],
    closeButton: [
      // Keep structural classes
      'inline-flex',
      // Replace with tokens
      radii.md,                    // rounded-md → radii.md
      backgroundColors.white,       // bg-white → backgroundColors.white
      textColors.muted,            // text-gray-400 → textColors.muted
      hoverTextColors.default,     // hover:text-gray-500 → hoverTextColors.default
      'focus:ring-2 focus:ring-offset-2 focus:outline-hidden',  // Keep focus as-is
      `focus:${ringColors.primary}` // focus:ring-indigo-500 → focus:ringColors.primary
    ],
    closeIcon: iconSizes.md,     // size-5 → iconSizes.md
  },
  variants: {
    variant: {
      success: {
        iconSvg: textColors.success,    // text-green-400 → textColors.success
        title: textColors.default,
        description: textColors.muted,
      },
      error: {
        iconSvg: textColors.danger,     // text-red-400 → textColors.danger
        title: textColors.danger,
        description: textColors.muted,
      },
      warning: {
        iconSvg: textColors.danger,     // text-amber-400 → textColors.danger (closest semantic)
        title: textColors.default,
        description: textColors.muted,
      },
      info: {
        iconSvg: textColors.primary,    // text-blue-400 → textColors.primary
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
  textSize?: TextSizeToken
  textColor?: TextColorToken
  shadow?: ShadowToken
  variant?: ToastVariant
  position?: ToastPosition
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
