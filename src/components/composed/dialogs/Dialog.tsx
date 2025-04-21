'use client';

import { Fragment, ReactNode } from 'react';
import { Dialog as HDialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';
import { shadows, textSize, textColors } from '@/lib/ui/tokens';

// Size variants with predefined max-width values
const sizeClasses = {
  sm: 'max-w-md',    // 28rem (448px)
  md: 'max-w-xl',    // 36rem (576px)
  lg: 'max-w-3xl',   // 48rem (768px)
  xl: 'max-w-5xl',   // 64rem (1024px)
  full: 'max-w-full w-[calc(100%-2rem)]', // Full width minus margin
} as const;

type DialogSize = keyof typeof sizeClasses;

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string | ReactNode;
  children: ReactNode;
  /** Size of the dialog - sm, md, lg, xl, full */
  size?: DialogSize;
  /** Custom Tailwind max-width class (overrides size) */
  maxWidth?: string;
  /** Tailwind padding inside the panel – default `p-6` */
  innerPadding?: string;
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
  maxWidth,
  innerPadding = 'p-6',
  className,
  showCloseButton = true,
}: DialogProps) {
  // Use the custom maxWidth if provided, otherwise use the size class
  const widthClass = maxWidth || sizeClasses[size];

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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        {/* Centered scroll container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center px-4 py-10">
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
              <HDialog.Panel
                className={cn(
                  'bg-white rounded-lg',
                  innerPadding,
                  widthClass,
                  'w-full max-h-[90vh] overflow-y-auto',  // 5% top/bottom gap
                  shadows.lg,
                  className
                )}
              >
                {/* Close button */}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={cn("absolute right-4 top-4 focus:outline-none", textColors.muted, "hover:text-primary")}
                  >
                    <XMarkIcon className="h-6 w-6" />
                    <span className="sr-only">Close</span>
                  </button>
                )}

                {title && (
                  <HDialog.Title as="h3" className={cn("mb-4 font-semibold", textSize.lg)}>
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