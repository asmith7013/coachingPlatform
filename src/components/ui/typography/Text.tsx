import { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { textVariants } from '@/lib/ui/sharedVariants'
import type { TextVariantType } from '@/lib/ui/sharedVariants'

interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
  children: ReactNode;
  as?: ElementType;
  textSize?: TextVariantType['textSize'];
  weight?: TextVariantType['weight'];
  color?: TextVariantType['color'];
  className?: string;
}

export function Text({
  children,
  as: Component = 'p',
  textSize = 'base',
  weight = 'normal',
  color = 'default',
  className,
  ...props
}: TextProps) {
  const styles = textVariants({ textSize, weight, color });

  return (
    <Component
      className={cn(styles, className)}
      {...props}
    >
      {children}
    </Component>
  )
}