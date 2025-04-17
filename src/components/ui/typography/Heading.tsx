import { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { headingVariants } from '@/lib/ui/sharedVariants'
import type { HeadingVariantType } from '@/lib/ui/sharedVariants'

type HeadingLevel = NonNullable<HeadingVariantType['level']>

interface HeadingProps extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'color'> {
  children: ReactNode;
  level?: HeadingVariantType['level'];
  color?: HeadingVariantType['color'];
  className?: string;
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
  level = 'h3',
  color = 'default',
  className,
  ...props
}: HeadingProps) {
  const Component = headingElements[level];
  const styles = headingVariants({ level, color });

  return (
    <Component
      className={cn(styles, className)}
      {...props}
    >
      {children}
    </Component>
  )
}
