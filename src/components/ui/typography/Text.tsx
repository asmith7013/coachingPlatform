import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { fontSizes } from '@/lib/ui/tokens'

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode
  size?: 'sm' | 'base' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'text-sm',
  base: fontSizes.base,
  lg: fontSizes.lg,
  xl: fontSizes.xl,
}

export function Text({ children, size = 'base', className, ...props }: TextProps) {
  return (
    <p className={cn(sizeClasses[size], 'leading-relaxed', className)} {...props}>
      {children}
    </p>
  )
}
