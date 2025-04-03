// src/components/ui/card.tsx

import React from 'react'
import { cn } from '@/lib/utils'
import { spacing, radii, textColors, backgroundColors, borderColors } from '@/lib/ui/tokens'

type CardProps = {
  className?: string
  children?: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  padding?: keyof typeof spacing
  radius?: keyof typeof radii
  border?: boolean
  variant?: 'default' | 'alt' // controls bg-surface or bg-alt
  contentClassName?: string // allows overriding inner content wrapper padding
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
  contentClassName,
}: CardProps) => {
  const paddingClass = spacing[padding]
  const radiusClass = radii[radius]
  const borderClass = border ? cn('border', borderColors.default) : undefined
  const bgClass = variant === 'alt' ? backgroundColors.surfaceHover : backgroundColors.surface

  return (
    <div className={cn(
      'divide-y',
      borderColors.default,
      'shadow-sm',
      bgClass,
      paddingClass,
      radiusClass,
      borderClass,
      className
    )}>
      {header && (
        <div className={cn(
          'px-md py-md sm:px-lg',
          textColors.primary
        )}>
          {header}
        </div>
      )}
      {children && (
        <div className={cn(
          'px-md py-md sm:p-lg',
          textColors.secondary,
          contentClassName
        )}>
          {children}
        </div>
      )}
      {footer && (
        <div className={cn(
          'px-md py-sm sm:px-lg',
          textColors.muted
        )}>
          {footer}
        </div>
      )}
    </div>
  )
}