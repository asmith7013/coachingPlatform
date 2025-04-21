'use client'

import { type ReactNode } from 'react'
import { tv } from 'tailwind-variants'
import { paddingX, paddingY } from '@/lib/ui/tokens'
import type { PaddingSize } from '@/lib/ui/tokens'

const shellLayout = tv({
  slots: {
    root: 'min-h-screen bg-background',
    header: 'sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
    content: 'flex-1'
  },
  variants: {
    padding: {
      none: { content: 'p-0' },
      xs: { content: `${paddingX.xs} ${paddingY.xs}` },
      sm: { content: `${paddingX.sm} ${paddingY.sm}` },
      md: { content: `${paddingX.md} ${paddingY.md}` },
      lg: { content: `${paddingX.lg} ${paddingY.lg}` },
      xl: { content: `${paddingX.xl} ${paddingY.xl}` },
    },
  },
  defaultVariants: {
    padding: 'md'
  }
})

interface ShellLayoutProps {
  children: ReactNode
  header?: ReactNode
  className?: string
  padding?: PaddingSize | 'none'
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
