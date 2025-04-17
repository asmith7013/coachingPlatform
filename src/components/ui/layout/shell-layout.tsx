'use client'

import { type ReactNode } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { paddingVariant } from '@/lib/ui/sharedVariants'

const shellLayout = tv({
  slots: {
    root: 'min-h-screen bg-background',
    header: 'sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
    content: 'flex-1'
  },
  variants: {
    padding: paddingVariant.variants.padding,
  },
  defaultVariants: {
    padding: 'md'
  }
})

interface ShellLayoutProps extends VariantProps<typeof shellLayout> {
  children: ReactNode
  header?: ReactNode
  className?: string
}

export function ShellLayout({ children, header, padding }: ShellLayoutProps) {
  const { root, header: headerSlot, content } = shellLayout({ padding })

  return (
    <div className={root()}>
      {header && <header className={headerSlot()}>{header}</header>}
      <main className={content()}>{children}</main>
    </div>
  )
}
