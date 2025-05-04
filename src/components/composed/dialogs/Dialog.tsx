'use client';

import { Fragment, ReactNode } from 'react';
import { Dialog as HDialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { cn } from '@ui/utils/formatters';
import { tv, type VariantProps } from 'tailwind-variants';
import { shadows, textSize, textColors } from '@ui-tokens/tokens';

// Create dialog variants using tv()
const dialog = tv({
  slots: {
    backdrop: 'fixed inset-0 bg-black/40 backdrop-blur-sm',
    container: 'fixed inset-0 overflow-y-auto',
    wrapper: 'flex min-h-full items-start justify-center px-4 py-10',
    panel: 'bg-white rounded-lg w-full max-h-[90vh] overflow-y-auto',
    closeButton: 'absolute right-4 top-4 focus:outline-none',
    closeIcon: 'h-6 w-6',
    title: 'mb-4 font-semibold',
  },
  variants: {
    size: {
      sm: { panel: 'max-w-md' },               // 28rem (448px)
      md: { panel: 'max-w-xl' },               // 36rem (576px) 
      lg: { panel: 'max-w-3xl' },              // 48rem (768px)
      xl: { panel: 'max-w-5xl' },              // 64rem (1024px)
      full: { panel: 'max-w-full w-[calc(100%-2rem)]' }, // Full width minus margin
    },
    padding: {
      none: { panel: 'p-0' },
      sm: { panel: 'p-4' },
      md: { panel: 'p-6' },
      lg: { panel: 'p-8' },
    },
    shadow: {
      sm: { panel: shadows.sm },
      md: { panel: shadows.md },
      lg: { panel: shadows.lg },
      xl: { panel: shadows.xl },
    },
    titleSize: {
      sm: { title: textSize.base },
      md: { title: textSize.lg },
      lg: { title: textSize.xl },
    },
    closeButtonColor: {
      default: { closeButton: textColors.muted + ' hover:text-primary' },
      muted: { closeButton: textColors.muted + ' hover:text-default' },
      danger: { closeButton: textColors.muted + ' hover:text-danger' },
    }
  },
  defaultVariants: {
    size: 'md',
    padding: 'md',
    shadow: 'lg',
    titleSize: 'md',
    closeButtonColor: 'default',
  }
});

// Export variant types for external use
export type DialogVariants = VariantProps<typeof dialog>;

interface DialogProps extends Partial<DialogVariants> {
  open: boolean;
  onClose: () => void;
  title?: string | ReactNode;
  children: ReactNode;
  /** Custom Tailwind max-width class (overrides size) */
  maxWidth?: string;
  /** Additional classes for the dialog panel */
  className?: string;
  /** Show close button - default true */
  showCloseButton?: boolean;
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  size = 'md',
  padding = 'md',
  shadow = 'lg',
  titleSize = 'md',
  closeButtonColor = 'default',
  maxWidth,
  className,
  showCloseButton = true,
}: DialogProps) {
  const styles = dialog({ size, padding, shadow, titleSize, closeButtonColor });
  
  // Use the custom maxWidth if provided, otherwise use the size variant
  const panelClasses = maxWidth 
    ? cn(styles.panel(), className, maxWidth)
    : cn(styles.panel(), className);

  return (
    <Transition show={open} as={Fragment}>
      <HDialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={styles.backdrop()} />
        </Transition.Child>

        {/* Centered scroll container */}
        <div className={styles.container()}>
          <div className={styles.wrapper()}>
            {/* Panel */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <HDialog.Panel className={panelClasses}>
                {/* Close button */}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={styles.closeButton()}
                  >
                    <XMarkIcon className={styles.closeIcon()} />
                    <span className="sr-only">Close</span>
                  </button>
                )}

                {title && (
                  <HDialog.Title as="h3" className={styles.title()}>
                    {title}
                  </HDialog.Title>
                )}

                {children}
              </HDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HDialog>
    </Transition>
  );
}