'use client'

import { cn } from '@/lib/utils'
import { spacing } from '@/lib/ui/tokens'

interface TableActionsProps {
  children: React.ReactNode
  className?: string
}

export function TableActions({ children, className }: TableActionsProps) {
  return (
    <div className={cn('mt-4 sm:mt-0 sm:ml-16 sm:flex-none', spacing.md, className)}>
      {children}
    </div>
  )
}
