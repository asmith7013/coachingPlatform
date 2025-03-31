import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { fontSizes, textColors } from '@/lib/ui/tokens'

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode
  size?: keyof typeof fontSizes
  variant?: keyof typeof textColors
  className?: string
}

export function Text({
  children,
  size = 'base',
  variant = 'primary',
  className,
  ...props
}: TextProps) {
  return (
    <p
      className={cn(
        fontSizes[size],
        textColors[variant],
        'leading-relaxed',
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}