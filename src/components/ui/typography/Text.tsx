import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { typography, type TextSize, type FontWeight } from '@/lib/ui/tokens'
import { designTokens } from '@/lib/ui/designTokens'

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode
  size?: TextSize
  weight?: FontWeight
  variant?: keyof typeof designTokens.textColors
  className?: string
}

export function Text({
  children,
  size = 'base',
  weight = 'normal',
  variant = 'primary',
  className,
  ...props
}: TextProps) {
  return (
    <p
      className={cn(
        typography.text[size],
        typography.weight[weight],
        'leading-relaxed',
        className
      )}
      style={{ color: designTokens.textColors[variant] }}
      {...props}
    >
      {children}
    </p>
  )
}