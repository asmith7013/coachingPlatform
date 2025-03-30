import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode
  level?: 1 | 2 | 3 | 4
  className?: string
}

const levelClasses = {
  1: cn('text-4xl font-bold tracking-tight'),
  2: cn('text-3xl font-semibold tracking-tight'),
  3: cn('text-2xl font-semibold tracking-tight'),
  4: cn('text-xl font-semibold tracking-tight'),
}

export function Heading({ children, level = 1, className, ...props }: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4'
  return (
    <Tag className={cn(levelClasses[level], className)} {...props}>
      {children}
    </Tag>
  )
}
