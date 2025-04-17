import { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { textVariants, type TextVariants } from '@/lib/ui/sharedVariants'

interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
  children: ReactNode;
  as?: ElementType;
  size?: TextVariants['size'];
  weight?: TextVariants['weight'];
  color?: TextVariants['color'];
  className?: string;
}

export function Text({
  children,
  as: Component = 'p',
  size = 'base',
  weight = 'normal',
  color = 'default',
  className,
  ...props
}: TextProps) {
  const styles = textVariants({ size, weight, color });

  return (
    <Component
      className={cn(styles, className)}
      {...props}
    >
      {children}
    </Component>
  )
}