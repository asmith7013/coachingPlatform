import { cn } from '@ui/utils/formatters';
import { tv, type VariantProps } from 'tailwind-variants'
import { textColors, iconSizes } from '@/lib/tokens/tokens'

const label = tv({
  base: [
    'font-medium',
    textColors.default,
  ],
  variants: {
    textSize: {
      xs: { icon: iconSizes.sm, input: 'text-xs' },
      sm: { icon: iconSizes.sm, input: 'text-sm' },
      base: { icon: iconSizes.md, input: 'text-base' },
      lg: { icon: iconSizes.lg, input: 'text-lg' },
      xl: { icon: iconSizes.lg, input: 'text-xl' },
      '2xl': { icon: iconSizes.lg, input: 'text-2xl' }
    },
  },
  defaultVariants: {
    textSize: 'base',
  },
})

export type LabelVariants = VariantProps<typeof label>

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement>, LabelVariants {
  children: React.ReactNode
  className?: string
}

export function Label({ 
  children, 
  className, 
  textSize,
  ...props 
}: LabelProps) {
  return (
    <label
      className={cn(label({ textSize }), className)}
      {...props}
    >
      {children}
    </label>
  )
}
