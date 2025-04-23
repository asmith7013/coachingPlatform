import { cn } from '@/lib/utils'
import { tv, type VariantProps } from 'tailwind-variants'
import { textColors } from '@ui-tokens/tokens'

const label = tv({
  base: [
    'font-medium',
    textColors.default,
  ],
  variants: {
    textSize: {
      xs: { icon: 'size-4', input: 'text-xs' },
      sm: { icon: 'size-4', input: 'text-sm' },
      base: { icon: 'size-5', input: 'text-base' },
      lg: { icon: 'size-6', input: 'text-lg' },
      xl: { icon: 'size-6', input: 'text-xl' },
      '2xl': { icon: 'size-6', input: 'text-2xl' }
    },
  },
  defaultVariants: {
    textSize: 'base',
  },
})

export type LabelVariants = VariantProps<typeof label>

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement>, LabelVariants {
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
