// src/components/ui/card.tsx

import React from 'react'
import { cn } from '@/lib/utils'
import { spacing, radii } from '@/lib/ui/tokens'

type CardProps = {
  className?: string
  children?: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  padding?: keyof typeof spacing
  radius?: keyof typeof radii
  border?: boolean
  variant?: 'default' | 'alt' // controls bg-surface or bg-alt
}

export const Card = ({
  className,
  children,
  header,
  footer,
  padding = 'md',
  radius = 'md',
  border = false,
  variant = 'default',
}: CardProps) => {
  const paddingClass = spacing[padding]
  const radiusClass = radii[radius]
  const borderClass = border ? 'border border-default' : undefined
  const bgClass = variant === 'alt' ? 'bg-alt' : 'bg-surface'

  return (
    <div className={cn('divide-y divide-border shadow-sm overflow-hidden', bgClass, paddingClass, radiusClass, borderClass, className)}>
      {header && <div className="px-md py-md sm:px-lg">{header}</div>}
      {children && <div className="px-md py-md sm:p-lg">{children}</div>}
      {footer && <div className="px-md py-sm sm:px-lg">{footer}</div>}
    </div>
  )
}