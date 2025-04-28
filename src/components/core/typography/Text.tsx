import { ElementType, ReactNode } from 'react'
import { cn } from '@ui/utils/formatters';
import { tv, type VariantProps } from 'tailwind-variants'
import { textSize, weight, textColors } from '@ui-tokens/tokens'
import type { TextSize, FontWeight, TextColor } from '@ui-tokens/tokens'

const text = tv({
  base: 'font-body leading-normal',
  variants: {
    textSize: {
      xs: textSize.xs,
      sm: textSize.sm,
      base: textSize.base,
      lg: textSize.lg,
      xl: textSize.xl,
      '2xl': textSize['2xl'],
    },
    weight: {
      normal: weight.normal,
      medium: weight.medium,
      semibold: weight.semibold,
      bold: weight.bold,
    },
    color: {
      default: textColors.default,
      muted: textColors.muted,
      accent: textColors.accent,
      danger: textColors.danger,
    },
  },
  defaultVariants: {
    textSize: 'base',
    weight: 'normal',
    color: 'default',
  },
});

export type TextVariants = VariantProps<typeof text>;

interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
  children: ReactNode;
  as?: ElementType;
  textSize?: TextSize;
  weight?: FontWeight;
  color?: TextColor;
  className?: string;
}

export function Text({
  children,
  as: Component = 'p',
  textSize,
  weight,
  color,
  className,
  ...props
}: TextProps) {
  return (
    <Component
      className={cn(text({ textSize, weight, color }), className)}
      {...props}
    >
      {children}
    </Component>
  )
}