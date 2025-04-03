import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { typography, textColors, type TextSize, type FontWeight, type TextColor } from '@/lib/ui/tokens'

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode
  size?: TextSize
  weight?: FontWeight
  variant?: TextColor
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