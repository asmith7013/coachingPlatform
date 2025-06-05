'use client'

import { createContext, useContext } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@ui/utils/formatters'

// Drawer component variants using tv()
const drawerVariants = tv({
  slots: {
    overlay: 'fixed inset-0',
    container: 'fixed inset-0 overflow-hidden',
    backdrop: 'absolute inset-0 overflow-hidden',
    panelContainer: 'pointer-events-none fixed inset-y-0 flex max-w-full',
    panel: 'pointer-events-auto transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700',
    content: 'flex h-full flex-col overflow-y-scroll py-6 shadow-xl',
    header: 'px-4 sm:px-6',
    headerContent: 'flex items-start justify-between',
    title: 'text-base font-semibold',
    closeButton: 'ml-3 flex h-7 items-center',
    closeButtonInner: 'relative rounded-md text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-offset-2 focus:outline-hidden',
    closeIcon: 'size-6',
    body: 'relative mt-6 flex-1 px-4 sm:px-6',
  },
  variants: {
    position: {
      right: {
        panelContainer: 'right-0 pl-10 sm:pl-16',
        panel: 'data-closed:translate-x-full',
      },
      left: {
        panelContainer: 'left-0 pr-10 sm:pr-16',
        panel: 'data-closed:-translate-x-full',
      },
    },
    size: {
      sm: {
        panel: 'w-screen max-w-md',
      },
      md: {
        panel: 'w-screen max-w-2xl',
      },
      lg: {
        panel: 'w-screen max-w-4xl',
      },
      full: {
        panel: 'w-screen',
      },
    },
    background: {
      white: {
        content: 'bg-white',
        closeButtonInner: 'bg-white',
        title: 'text-gray-900',
      },
      gray: {
        content: 'bg-gray-50',
        closeButtonInner: 'bg-gray-50',
        title: 'text-gray-900',
      },
    },
    focusColor: {
      indigo: {
        closeButtonInner: 'focus:ring-indigo-500',
      },
      blue: {
        closeButtonInner: 'focus:ring-blue-500',
      },
      green: {
        closeButtonInner: 'focus:ring-green-500',
      },
    },
  },
  defaultVariants: {
    position: 'right',
    size: 'md',
    background: 'white',
    focusColor: 'indigo',
  },
})

export type DrawerVariants = VariantProps<typeof drawerVariants>

interface DrawerContextValue {
  onClose: () => void
  variants: ReturnType<typeof drawerVariants>
}

const DrawerContext = createContext<DrawerContextValue | null>(null)

function useDrawerContext() {
  const context = useContext(DrawerContext)
  if (!context) {
    throw new Error('Drawer components must be used within a Drawer')
  }
  return context
}

interface DrawerProps extends DrawerVariants {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

function DrawerRoot({ 
  open, 
  onClose, 
  children, 
  position,
  size,
  background,
  focusColor,
  className 
}: DrawerProps) {
  const styles = drawerVariants({ position, size, background, focusColor })
  
  const contextValue: DrawerContextValue = {
    onClose,
    variants: styles,
  }

  return (
    <DrawerContext.Provider value={contextValue}>
      <Dialog open={open} onClose={onClose} className="relative z-10">
        <div className={styles.overlay()} />
        <div className={styles.container()}>
          <div className={styles.backdrop()}>
            <div className={styles.panelContainer()}>
              <DialogPanel className={cn(styles.panel(), className)}>
                <div className={styles.content()}>
                  {children}
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </DrawerContext.Provider>
  )
}

interface DrawerHeaderProps {
  children?: React.ReactNode
  className?: string
  showCloseButton?: boolean
}

function DrawerHeader({ children, className, showCloseButton = true }: DrawerHeaderProps) {
  const { onClose, variants } = useDrawerContext()

  return (
    <div className={cn(variants.header(), className)}>
      <div className={variants.headerContent()}>
        <div className="flex-1">
          {children}
        </div>
        {showCloseButton && (
          <div className={variants.closeButton()}>
            <button
              type="button"
              onClick={onClose}
              className={variants.closeButtonInner()}
            >
              <span className="absolute -inset-2.5" />
              <span className="sr-only">Close panel</span>
              <XMarkIcon aria-hidden="true" className={variants.closeIcon()} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface DrawerTitleProps {
  children: React.ReactNode
  className?: string
}

function DrawerTitle({ children, className }: DrawerTitleProps) {
  const { variants } = useDrawerContext()

  return (
    <DialogTitle className={cn(variants.title(), className)}>
      {children}
    </DialogTitle>
  )
}

interface DrawerBodyProps {
  children: React.ReactNode
  className?: string
}

function DrawerBody({ children, className }: DrawerBodyProps) {
  const { variants } = useDrawerContext()

  return (
    <div className={cn(variants.body(), className)}>
      {children}
    </div>
  )
}

// Export compound component
export const Drawer = Object.assign(DrawerRoot, {
  Header: DrawerHeader,
  Title: DrawerTitle,
  Body: DrawerBody,
})

export type { DrawerProps, DrawerHeaderProps, DrawerTitleProps, DrawerBodyProps } 