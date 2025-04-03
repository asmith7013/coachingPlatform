import { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { typography, textColors, type HeadingLevel, type TextColor } from '@/lib/ui/tokens'

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode
  level?: HeadingLevel
  variant?: TextColor
  className?: string
}

const headingElements: Record<HeadingLevel, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
};

export function Heading({
  children,
  level = 'h1',
  variant = 'primary',
  className,
  ...props
}: HeadingProps) {
  const Component = headingElements[level];
  const headingClass = typography.heading[level];

  return (
    <Component
      className={cn(
        headingClass,
        textColors[variant],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
