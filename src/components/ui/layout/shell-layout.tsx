'use client'

import { type ReactNode } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { spacing } from '@/lib/ui/tokens'

const shellLayout = tv({
  slots: {
    root: 'min-h-screen bg-background',
    header: 'sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
    content: 'flex-1'
  },
  variants: {
    spacing: {
      xs: {
        content: spacing.xs
      },
      sm: {
        content: spacing.sm
      },
      md: {
        content: spacing.md
      },
      lg: {
        content: spacing.lg
      },
      xl: {
        content: spacing.xl
      },
      "2xl": {
        content: spacing["2xl"]
      }
    }
  },
  defaultVariants: {
    spacing: 'md'
  }
})

interface ShellLayoutProps extends VariantProps<typeof shellLayout> {
  children: ReactNode
  header?: ReactNode
  className?: string
}

export function ShellLayout({ children, header, spacing }: ShellLayoutProps) {
  const { root, header: headerSlot, content } = shellLayout({ spacing })

  return (
    <div className={root()}>
      {header && <header className={headerSlot()}>{header}</header>}
      <main className={content()}>{children}</main>
    </div>
  )
}
