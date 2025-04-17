import { cn } from '@/lib/utils'
import { tv, type VariantProps } from 'tailwind-variants'
import { textColors } from '@/lib/ui/tokens'
import { textSizeVariant } from '@/lib/ui/sharedVariants'

const label = tv({
  base: [
    'font-medium',
    textColors.default,
  ],
  variants: {
    textSize: textSizeVariant.variants.textSize,
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
