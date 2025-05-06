'use client'

import { cn } from '@ui/utils/formatters';
import { paddingY } from '@/lib/tokens/tokens'

interface TableActionsProps {
  children: React.ReactNode
  className?: string
}

export function TableActions({ children, className }: TableActionsProps) {
  return (
    <div className={cn('mt-4 sm:mt-0 sm:ml-16 sm:flex-none', paddingY.md, className)}>
      {children}
    </div>
  )
}
