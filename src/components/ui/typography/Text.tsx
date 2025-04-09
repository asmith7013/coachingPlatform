import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { typography, type TextSize, type FontWeight } from '@/lib/ui/tokens'

type TextVariant = 'text' | 'muted' | 'primary' | 'secondary' | 'success' | 'danger'

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode
  size?: TextSize
  weight?: FontWeight
  variant?: TextVariant
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
        `text-${variant}`,
        'leading-relaxed',
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}