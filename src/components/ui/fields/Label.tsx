import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { fontSizes } from '@/lib/ui/tokens'

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode
  className?: string
}

export function Label({ children, className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        fontSizes.base,
        'font-medium text-gray-900',
        className
      )}
      {...props}
    >
      {children}
    </label>
  )
}
